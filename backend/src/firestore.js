const admin = require('firebase-admin');

let db = null;
let initAttempted = false;

function initFirestore() {
  if (initAttempted) return db;
  initAttempted = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  try {
    if (!admin.apps.length) {
      const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
        : admin.credential.applicationDefault();

      admin.initializeApp({
        credential,
        projectId,
      });
    }
    db = admin.firestore();
    console.log('[RUMOUR] Firestore connected');
  } catch (err) {
    console.warn('[RUMOUR] Firestore init skipped:', err.message);
    db = null;
  }

  return db;
}

function docToBuzz(doc) {
  const data = doc.data();
  const expiresAt = data.expiresAt?.toMillis?.() ?? data.expiresAt ?? 0;
  return {
    id: doc.id,
    type: data.type,
    title: data.title,
    lat: data.lat,
    lng: data.lng,
    zone: data.zone,
    teaser: data.teaser,
    description: data.description,
    host: data.host,
    icon: data.icon,
    image: data.image,
    isSecret: data.isSecret ?? false,
    password: data.password,
    isVerifiedSource: data.isVerifiedSource ?? false,
    expiresAt,
  };
}

async function fetchBuzzesFromFirestore() {
  const firestore = initFirestore();
  if (!firestore) return null;

  const now = Date.now();
  const snapshot = await firestore
    .collection('buzzes')
    .where('expiresAt', '>', admin.firestore.Timestamp.fromMillis(now))
    .limit(100)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(docToBuzz);
}

module.exports = { fetchBuzzesFromFirestore, initFirestore };
