const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createBuzz, ValidationError, ModerationError, vote: voteService, removeVote: removeVoteService, flag: flagService } = require('../services/buzzService');

const router = express.Router();
const USE_MOCK = process.env.USE_MOCK !== 'false';

// Simple in-memory token bucket rate limiter per UID
const rateBuckets = new Map();
const MAX_TOKENS = parseInt(process.env.VOTE_MAX_TOKENS || '60', 10);
const REFILL_INTERVAL_MS = 60000; // refill period

function allowVote(uid) {
  if (!uid) return false;
  let b = rateBuckets.get(uid);
  const now = Date.now();
  if (!b) {
    b = { tokens: MAX_TOKENS - 1, last: now };
    rateBuckets.set(uid, b);
    return true;
  }
  const elapsed = now - b.last;
  const refill = Math.floor((elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS);
  if (refill > 0) {
    b.tokens = Math.min(MAX_TOKENS, b.tokens + refill);
    b.last = now;
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const buzz = await createBuzz(req.body, req.user, { useMock: USE_MOCK });
    return res.status(201).json({ buzz });
  } catch (err) {
    if (err instanceof ModerationError) {
      return res.status(400).json({
        error: err.message,
        moderationReason: err.message,
        categories: err.categories,
      });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[RUMOUR] Create buzz error:', err);
    return res.status(500).json({ error: 'Failed to create signal.' });
  }
});

// Vote on a buzz: body.type = 'up' or 'down'
router.post('/:id/vote', requireAuth, async (req, res) => {
  const buzzId = req.params.id;
  const { type } = req.body || {};
  if (!buzzId || !['up', 'down'].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote payload.' });
  }

  try {
    if (!allowVote(req.user.uid)) return res.status(429).json({ error: 'Rate limit exceeded' });
    const result = await voteService(buzzId, req.user.uid, type);
    return res.status(200).json({ vote: result });
  } catch (err) {
    console.error('[RUMOUR] Vote error:', err.message || err);
    return res.status(err.status || 500).json({ error: err.message || 'Failed to record vote.' });
  }
});

// Remove a user's vote (unvote)
router.delete('/:id/vote', requireAuth, async (req, res) => {
  const buzzId = req.params.id;
  if (!buzzId) return res.status(400).json({ error: 'Invalid buzz id.' });

  try {
    if (!allowVote(req.user.uid)) return res.status(429).json({ error: 'Rate limit exceeded' });
    const result = await removeVoteService(buzzId, req.user.uid);
    return res.status(200).json({ result });
  } catch (err) {
    console.error('[RUMOUR] Remove vote error:', err.message || err);
    return res.status(err.status || 500).json({ error: err.message || 'Failed to remove vote.' });
  }
});

// Report / flag a buzz. Requires user location within 100m.
router.post('/:id/flag', requireAuth, async (req, res) => {
  const buzzId = req.params.id;
  const { userLat, userLng } = req.body || {};
  if (!buzzId || Number.isNaN(parseFloat(userLat)) || Number.isNaN(parseFloat(userLng))) {
    return res.status(400).json({ error: 'Invalid flag request. Coordinates required.' });
  }

  try {
    if (!allowVote(req.user.uid)) return res.status(429).json({ error: 'Rate limit exceeded' });
    const result = await flagService(buzzId, req.user.uid, parseFloat(userLat), parseFloat(userLng));
    return res.status(200).json({ report: result });
  } catch (err) {
    console.error('[RUMOUR] Flag error:', err.message || err);
    return res.status(err.status || 500).json({ error: err.message || 'Failed to report signal.' });
  }
});

module.exports = router;
