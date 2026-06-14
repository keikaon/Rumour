# AI Moderation Quick Start Guide

## Overview

The Rumour app uses Google Gemini AI to automatically moderate user-generated content (buzzes/signals) before they are published. This prevents profanity, hate speech, sexual harassment, and other inappropriate content from appearing on the platform.

## How It Works

Every time a user creates a buzz, the content goes through AI moderation:

```
User Creates Buzz → AI Scans Content → Approved/Rejected/Pending
```

**Auto-Rejected Categories:**
- 🚫 Hate Speech (racial slurs, discrimination)
- 🚫 Harassment (threats, bullying, doxxing)
- 🚫 Sexual Content (explicit language, hookup solicitation)
- 🚫 Profanity (f-word, aggressive cursing, sexual terms)
- 🚫 Illegal Activity (drug sales, weapons, fraud)
- 🚫 Violence (graphic content, fighting events)
- 🚫 PII (personal phone numbers, home addresses, emails)
- 🚫 Spam (MLM, "get rich quick", no location)

## Configuration

### Environment Variables

Required in `backend/.env`:

```bash
# Google AI API Key (required)
GOOGLE_AI_API_KEY=your_api_key_here

# Optional: Moderation tuning
MODERATION_RETRIES=2                 # Retry attempts on failure
MODERATION_BASE_DELAY_MS=500         # Delay between retries
MODERATION_TIMEOUT_MS=8000           # Timeout per request
```

### Get API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy to `.env` file

## Model Used

**Current Model**: `gemini-2.0-flash-lite`

**Why This Model?**
- ✅ Higher free tier quota (more requests per day)
- ✅ Fast inference (~200-500ms)
- ✅ Optimized for classification tasks
- ✅ Low cost per request
- ✅ Low temperature (0.1) for consistent decisions

## Testing Moderation

### Run Test Suite

```bash
cd backend
node test-moderation.js
```

Expected output:
```
🧪 Testing AI Moderation

API Key configured: true
Model: gemini-2.0-flash-lite (optimized for quota)

Testing: ✅ GOOD: Legitimate party event
  ✅ PASS - approved: true, categories: none

Testing: ❌ BAD: F-word profanity
  ✅ PASS - approved: false, categories: profanity

...

📊 Test Results:
   Passed: 7/7
   Failed: 0/7
   Success rate: 100.0%
```

### Manual Testing via Frontend

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Try creating a buzz with profanity:
   - Title: "F*** this party"
   - Expected: ❌ Error message shown

4. Try creating a legitimate buzz:
   - Title: "Art Gallery Opening Tonight"
   - Expected: ✅ Buzz created successfully

## Common Issues & Solutions

### Issue: "Quota exceeded" error

**Cause**: You've exceeded the free tier quota for the current model.

**Solution**:
1. Wait for quota to reset (daily/per-minute limits)
2. Upgrade to paid tier if needed
3. Model already optimized for free tier (`gemini-2.0-flash-lite`)

### Issue: Moderation returns "pending" for all content

**Cause**: `GOOGLE_AI_API_KEY` is missing or invalid.

**Solution**:
1. Check `backend/.env` has valid API key
2. Verify key works: https://makersuite.google.com/app/apikey
3. Restart backend server

### Issue: Legitimate content being blocked

**Cause**: AI may be overly cautious.

**Solution**: 
- Check moderation logs in Firestore `moderation_logs` collection
- Review the `reason` field to understand why it was blocked
- If it's a false positive (e.g., band name with profanity), contact admin

### Issue: Inappropriate content not being blocked

**Cause**: AI might miss some edge cases.

**Solution**:
- Report via community flagging (3 flags = auto-remove)
- Admin review in Firestore
- Update guidelines if pattern is common

## Monitoring

### Backend Logs

Look for moderation logs:

```bash
[RUMOUR] Moderation result { approved: false, durationMs: 234, attempt: 1 }
```

**Fields**:
- `approved`: true/false/"pending"
- `durationMs`: How long AI took to respond
- `attempt`: Retry attempt number (1-3)

### Firestore Logs

Collection: `moderation_logs`

Logged when:
- Moderation disabled (no API key)
- Parse errors (AI returned invalid JSON)
- Service errors (timeouts, network issues)

**Document Structure**:
```javascript
{
  type: "parse_error" | "service_error" | "disabled",
  textBlock: "Content that was scanned...",
  error: "Error message",
  createdAt: 1781453097814
}
```

### Metrics

Moderation tracks:
- Total attempts
- Successes/failures
- Average duration
- Last attempt timestamp

Access via:
```javascript
const { snapshot } = require('./src/metrics/moderationMetrics');
console.log(snapshot());
```

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Response Time | < 1s | 200-500ms |
| Success Rate | > 95% | 98%+ |
| Token Usage | < 200 | ~150 tokens |
| Quota Usage | Stay in free tier | ✅ Optimized |

## Best Practices

### 1. **Don't Bypass Moderation**
- Never skip moderation for "trusted" users
- Security risk + legal liability

### 2. **Handle Errors Gracefully**
- If moderation fails → mark as "pending" (manual review)
- Never auto-approve on error

### 3. **Monitor Logs**
- Check `moderation_logs` collection weekly
- Look for patterns in false positives/negatives

### 4. **Tune Temperature**
- Current: 0.1 (consistent decisions)
- Don't go above 0.3 for moderation tasks

### 5. **Optimize Prompt**
- Current prompt is optimized (~150 tokens)
- Don't add unnecessary examples
- Keep instructions concise

## API Reference

### `moderateBuzzContent(fields)`

Moderates buzz content using AI.

**Parameters**:
```javascript
{
  title: string,        // Buzz title
  teaser: string,       // Short description
  description: string,  // Full description
  zone: string,         // Location/zone
  host: string          // Host username (@user)
}
```

**Returns**:
```javascript
{
  approved: true | false | "pending",
  categories: ["profanity", "hate_speech", ...],
  reason: "Brief explanation" | null
}
```

**Usage**:
```javascript
const { moderateBuzzContent } = require('./src/moderation/gemini');

const result = await moderateBuzzContent({
  title: "Party Tonight",
  teaser: "Come join us",
  description: "Music and fun",
  zone: "Downtown",
  host: "@party_people"
});

if (result.approved === false) {
  throw new ModerationError(result.reason, result.categories);
}
```

## Support

- **Documentation**: See `AI_MODERATION_FIX.md` for detailed technical info
- **Community Guidelines**: See `COMMUNITY_GUIDELINES.md`
- **Test Suite**: `backend/test-moderation.js`
- **Issues**: Check backend console logs and Firestore `moderation_logs`

---

**Last Updated**: 2026-06-14  
**Version**: 1.0 (Optimized)
