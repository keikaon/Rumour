const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    console.warn('[RUMOUR] GOOGLE_AI_API_KEY missing — skipping AI moderation (dev only)');
    return { approved: true, categories: [], reason: null };
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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    return {
      approved: Boolean(parsed.approved),
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      reason: parsed.reason || 'Content violates community guidelines.',
    };
  } catch (err) {
    console.error('[RUMOUR] Moderation API error:', err.message);
    return {
      approved: false,
      categories: ['moderation_error'],
      reason: 'Unable to verify content safety. Please try again later.',
    };
  }
}

module.exports = { moderateBuzzContent, POLICY_CATEGORIES };
