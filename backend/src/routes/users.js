const express = require('express');
const { initFirestore } = require('../firestore');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', requireAuth, async (req, res) => {
  const userId = req.params.id;
  const firestore = initFirestore();
  if (!firestore) return res.status(500).json({ error: 'Firestore not initialized' });
  try {
    const doc = await firestore.collection('users').doc(userId).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const data = doc.data();
    return res.json({ id: doc.id, reputation: data.reputation || 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
