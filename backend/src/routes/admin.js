const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const { snapshot } = require('../metrics/moderationMetrics');
const { initFirestore, recomputeUserReputation } = require('../firestore');

const router = express.Router();

router.use(adminAuth);

router.get('/moderation/metrics', (req, res) => {
  return res.json({ metrics: snapshot() });
});

router.get('/buzzes/pending', async (req, res) => {
  const firestore = initFirestore();
  if (!firestore) return res.status(500).json({ error: 'Firestore not initialized' });
  try {
    const snapshotDocs = await firestore.collection('buzzes').where('moderationStatus', '==', 'pending').limit(200).get();
    const items = snapshotDocs.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/buzzes/:id/approve', async (req, res) => {
  const id = req.params.id;
  const firestore = initFirestore();
  if (!firestore) return res.status(500).json({ error: 'Firestore not initialized' });
  try {
    const buzzRef = firestore.collection('buzzes').doc(id);
    const buzzSnap = await buzzRef.get();
    if (!buzzSnap.exists) return res.status(404).json({ error: 'Not found' });
    await buzzRef.update({ moderationStatus: 'approved', moderationReason: null, status: 'active' });
    const creatorId = buzzSnap.get('creatorId');
    if (creatorId) await recomputeUserReputation(creatorId);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/buzzes/:id/reject', async (req, res) => {
  const id = req.params.id;
  const { reason } = req.body || {};
  const firestore = initFirestore();
  if (!firestore) return res.status(500).json({ error: 'Firestore not initialized' });
  try {
    const buzzRef = firestore.collection('buzzes').doc(id);
    const buzzSnap = await buzzRef.get();
    if (!buzzSnap.exists) return res.status(404).json({ error: 'Not found' });
    await buzzRef.update({ moderationStatus: 'rejected', moderationReason: reason || 'Rejected by moderator', status: 'rejected' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
