const { GoogleGenerativeAI } = require('@google/generative-ai');
const { recordAttempt, snapshot } = require('../metrics/moderationMetrics');
const { initFirestore } = require('../firestore');

const POLICY_CATEGORIES = [
  'vulgar_language',
  'slurs',
  'hate_speech',
  'racism',
  'harassment',
  'pii',
  'commercial_spam',
];

async function moderateBuzzContent(fields) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.warn('[RUMOUR] GOOGLE_AI_API_KEY missing — marking for manual moderation');
    // log a moderation placeholder
    try {
      const db = initFirestore();
      if (db) await db.collection('moderation_logs').add({ type: 'disabled', textBlock, createdAt: Date.now() });
    } catch (e) {
      /* ignore logging errors */
    }
    return { approved: 'pending', categories: ['moderation_disabled'], reason: 'AI moderation unavailable; pending manual review' };
  }

  const textBlock = [
    fields.title && `Title: ${fields.title}`,
    fields.teaser && `Teaser: ${fields.teaser}`,
    fields.description && `Description: ${fields.description}`,
    fields.zone && `Zone: ${fields.zone}`,
    fields.host && `Host: ${fields.host}`,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `You are a content safety moderator for a hyper-local events app called Rumour.
Scan the following user-submitted event text for policy violations.

Policies (reject if ANY apply):
- Vulgar or obscene language (English or Turkish)
- Slurs, hate speech, racism, or discriminatory content
- Harassment or threats
- Personal identifiable information (phone numbers, emails, home addresses)
- Commercial spam or unsolicited advertising

Respond with ONLY valid JSON (no markdown):
{"approved": true or false, "categories": ["category_id", ...], "reason": "short user-safe explanation if rejected"}

Allowed category ids: ${POLICY_CATEGORIES.join(', ')}

Content to scan:
"""
${textBlock}
"""`;

  // Retry with exponential backoff for transient failures (timeouts, network)
  const maxRetries = parseInt(process.env.MODERATION_RETRIES || '2', 10);
  const baseDelay = parseInt(process.env.MODERATION_BASE_DELAY_MS || '500', 10);
  const timeoutMs = parseInt(process.env.MODERATION_TIMEOUT_MS || '8000', 10);

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const start = Date.now();
    try {
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error('Moderation timeout')), timeoutMs));
      const result = await Promise.race([generatePromise, timeoutPromise]);

      const raw = (result && result.response && result.response.text && result.response.text())
        ? result.response.text().trim()
        : String(result).trim();

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      } catch (pe) {
        const duration = Date.now() - start;
        recordAttempt({ success: false, durationMs: duration, attemptNumber: attempt + 1, error: `parse:${pe.message}` });
        console.warn('[RUMOUR] Moderation parse failed, marking pending:', pe.message);
        // store raw output for manual review
        try {
          const db = initFirestore();
          if (db) await db.collection('moderation_logs').add({ type: 'parse_error', textBlock, raw: raw.slice(0, 2000), createdAt: Date.now(), error: pe.message });
        } catch (e) {
          /* ignore */
        }
        return { approved: 'pending', categories: ['moderation_parse_error'], reason: 'Moderation result could not be parsed; pending manual review' };
      }

      const approved = parsed.approved === true || parsed.approved === 'true' || parsed.approved === 1;
      const duration = Date.now() - start;
      recordAttempt({ success: approved, durationMs: duration, attemptNumber: attempt + 1 });
      console.info('[RUMOUR] Moderation result', { approved, durationMs: duration, attempt: attempt + 1, metrics: snapshot() });

      return {
        approved: approved,
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        reason: parsed.reason || (approved ? null : 'Content violates community guidelines.'),
      };
    } catch (err) {
      const duration = Date.now() - start;
      const isLast = attempt === maxRetries;
      recordAttempt({ success: false, durationMs: duration, attemptNumber: attempt + 1, error: err.message });
      console.warn(`[RUMOUR] Moderation attempt ${attempt + 1} failed:`, err.message, { durationMs: duration });
      if (isLast) {
        console.error('[RUMOUR] Moderation final failure:', err.message, { metrics: snapshot() });
        const isParse = String(err.message || '').toLowerCase().includes('parse');
        // store last raw output if available
        try {
          const db = initFirestore();
          if (db) await db.collection('moderation_logs').add({ type: 'service_error', textBlock, error: err.message, createdAt: Date.now() });
        } catch (e) {
          /* ignore */
        }
        return { approved: 'pending', categories: [isParse ? 'moderation_parse_error' : 'moderation_error'], reason: 'Moderation service error; pending manual review' };
      }

      const jitter = Math.floor(Math.random() * 300);
      const delay = baseDelay * Math.pow(2, attempt) + jitter;
      await sleep(delay);
      continue;
    }
  }
}

module.exports = { moderateBuzzContent, POLICY_CATEGORIES };
