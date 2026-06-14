const { GoogleGenerativeAI } = require("@google/generative-ai");
const { recordAttempt, snapshot } = require("../metrics/moderationMetrics");
const { initFirestore } = require("../firestore");
const { buildModerationPrompt, MODERATION_CONFIG } = require("./guidelines");

const POLICY_CATEGORIES = MODERATION_CONFIG.autoRejectCategories;

async function moderateBuzzContent(fields) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  // Build textBlock FIRST (before any usage)
  const textBlock = [
    fields.title && `Title: ${fields.title}`,
    fields.teaser && `Teaser: ${fields.teaser}`,
    fields.description && `Description: ${fields.description}`,
    fields.zone && `Zone: ${fields.zone}`,
    fields.host && `Host: ${fields.host}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!apiKey) {
    console.warn(
      "[RUMOUR] GOOGLE_AI_API_KEY missing — marking for manual moderation",
    );
    // log a moderation placeholder
    try {
      const db = initFirestore();
      if (db)
        await db
          .collection("moderation_logs")
          .add({ type: "disabled", textBlock, createdAt: Date.now() });
    } catch (e) {
      /* ignore logging errors */
    }
    return {
      approved: "pending",
      categories: ["moderation_disabled"],
      reason: "AI moderation unavailable; pending manual review",
    };
  }

  // Build the prompt using structured community guidelines
  const basePrompt = buildModerationPrompt();
  const prompt = `${basePrompt}

## CONTENT TO SCAN

"""
${textBlock}
"""`;

  // Retry with exponential backoff for transient failures (timeouts, network)
  const maxRetries = parseInt(process.env.MODERATION_RETRIES || "2", 10);
  const baseDelay = parseInt(process.env.MODERATION_BASE_DELAY_MS || "500", 10);
  const timeoutMs = parseInt(process.env.MODERATION_TIMEOUT_MS || "8000", 10);

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-2.0-flash-lite for efficient, cost-effective content moderation
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: {
      temperature: 0.1, // Low temperature for consistent moderation
      maxOutputTokens: 200, // Limit output to save tokens
    },
  });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const start = Date.now();
    try {
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, rej) =>
        setTimeout(() => rej(new Error("Moderation timeout")), timeoutMs),
      );
      const result = await Promise.race([generatePromise, timeoutPromise]);

      const raw = result?.response?.text?.() ?? String(result);
      const trimmed = raw.trim();

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = trimmed.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error(`No JSON found in response: ${trimmed.slice(0, 100)}`);
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (pe) {
        const duration = Date.now() - start;
        recordAttempt({
          success: false,
          durationMs: duration,
          attemptNumber: attempt + 1,
          error: `parse:${pe.message}`,
        });
        console.warn(
          "[RUMOUR] Moderation parse failed, marking pending:",
          pe.message,
        );
        // store raw output for manual review
        try {
          const db = initFirestore();
          if (db)
            await db.collection("moderation_logs").add({
              type: "parse_error",
              textBlock,
              raw: raw.slice(0, 2000),
              createdAt: Date.now(),
              error: pe.message,
            });
        } catch (e) {
          /* ignore */
        }
        return {
          approved: "pending",
          categories: ["moderation_parse_error"],
          reason:
            "Moderation result could not be parsed; pending manual review",
        };
      }

      const approved =
        parsed.approved === true ||
        parsed.approved === "true" ||
        parsed.approved === 1;
      const duration = Date.now() - start;
      recordAttempt({
        success: approved,
        durationMs: duration,
        attemptNumber: attempt + 1,
      });
      console.info("[RUMOUR] Moderation result", {
        approved,
        durationMs: duration,
        attempt: attempt + 1,
        metrics: snapshot(),
      });

      return {
        approved: approved,
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        reason:
          parsed.reason ||
          (approved ? null : "Content violates community guidelines."),
      };
    } catch (err) {
      const duration = Date.now() - start;
      const isLast = attempt === maxRetries;
      recordAttempt({
        success: false,
        durationMs: duration,
        attemptNumber: attempt + 1,
        error: err.message,
      });
      console.warn(
        `[RUMOUR] Moderation attempt ${attempt + 1} failed:`,
        err.message,
        { durationMs: duration },
      );
      if (isLast) {
        console.error("[RUMOUR] Moderation final failure:", err.message, {
          metrics: snapshot(),
        });
        const isParse = String(err.message || "")
          .toLowerCase()
          .includes("parse");
        // store last raw output if available
        try {
          const db = initFirestore();
          if (db)
            await db.collection("moderation_logs").add({
              type: "service_error",
              textBlock,
              error: err.message,
              createdAt: Date.now(),
            });
        } catch (e) {
          /* ignore */
        }
        return {
          approved: "pending",
          categories: [isParse ? "moderation_parse_error" : "moderation_error"],
          reason: "Moderation service error; pending manual review",
        };
      }

      const jitter = Math.floor(Math.random() * 300);
      const delay = baseDelay * Math.pow(2, attempt) + jitter;
      await sleep(delay);
      continue;
    }
  }
}

module.exports = { moderateBuzzContent, POLICY_CATEGORIES };
