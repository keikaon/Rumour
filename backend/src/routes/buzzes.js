const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createBuzz, ValidationError, ModerationError } = require('../services/buzzService');

const router = express.Router();
const USE_MOCK = process.env.USE_MOCK !== 'false';

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

module.exports = router;
