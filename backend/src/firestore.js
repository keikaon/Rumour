const admin = require("firebase-admin");
const { getDistanceInMeters } = require("./services/proximity");

let db = null;
let initAttempted = false;

function initFirestore() {
  if (initAttempted) return db;
  initAttempted = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn("[RUMOUR] FIREBASE_PROJECT_ID not set; Firestore disabled.");
    return null;
  }

  try {
    if (!admin.apps.length) {
      let credential;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          credential = admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
          );
        } catch (parseError) {
          console.error(
            "[RUMOUR] Invalid Firebase service account JSON:",
            parseError,
          );
          return null;
        }
      } else {
        credential = admin.credential.applicationDefault();
      }

      admin.initializeApp({
        credential,
        projectId,
      });
    }
    db = admin.firestore();
    console.log("[RUMOUR] Firestore connected");
  } catch (err) {
    console.error("[RUMOUR] Firestore init failed:", err.message);
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
    creatorId: data.creatorId,
    upvotes: Number(data.upvotes || 0),
    downvotes: Number(data.downvotes || 0),
    flags: Number(data.flags || 0),
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt,
    status: data.status,
    moderationStatus: data.moderationStatus,
    expiresAt,
  };
}

function isActiveBuzz(data) {
  if (data.status && data.status !== "active") return false;
  if (data.moderationStatus === "rejected") return false;
  return true;
}

async function fetchBuzzesFromFirestore() {
  const firestore = initFirestore();
  if (!firestore) return null;

  const now = Date.now();
  const snapshot = await firestore
    .collection("buzzes")
    .where("expiresAt", ">", admin.firestore.Timestamp.fromMillis(now))
    .limit(100)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.filter((doc) => isActiveBuzz(doc.data())).map(docToBuzz);
}

async function createBuzzInFirestore(buzzData) {
  const firestore = initFirestore();
  if (!firestore) return null;

  const { durationHours, ...rest } = buzzData;
  const docRef = await firestore.collection("buzzes").add({
    ...rest,
    upvotes: 0,
    downvotes: 0,
    flags: 0,
    expiresAt: admin.firestore.Timestamp.fromMillis(rest.expiresAt),
    createdAt: admin.firestore.Timestamp.fromMillis(rest.createdAt),
  });

  return { id: docRef.id, ...buzzData };
}

async function getBuzzById(buzzId) {
  const firestore = initFirestore();
  if (!firestore) return null;
  const doc = await firestore.collection("buzzes").doc(buzzId).get();
  if (!doc.exists) return null;
  return docToBuzz(doc);
}

async function voteOnBuzz(buzzId, userId, type) {
  const firestore = initFirestore();
  if (!firestore) throw new Error("Firestore not initialized");
  if (!["up", "down"].includes(type)) throw new Error("Invalid vote type");

  const buzzRef = firestore.collection("buzzes").doc(buzzId);
  const voteRef = buzzRef.collection("votes").doc(userId);
  const result = await firestore.runTransaction(async (tx) => {
    const buzzSnap = await tx.get(buzzRef);
    if (!buzzSnap.exists) throw new Error("Buzz not found");

    const buzzData = buzzSnap.data();
    const nowMs = Date.now();
    const expires =
      buzzData.expiresAt && buzzData.expiresAt.toMillis
        ? buzzData.expiresAt.toMillis()
        : buzzData.expiresAt || 0;
    if (expires <= nowMs) throw new Error("Cannot vote on expired buzz");
    if (buzzData.status && buzzData.status !== "active")
      throw new Error("Cannot vote on inactive buzz");
    if (buzzData.moderationStatus && buzzData.moderationStatus !== "approved")
      throw new Error("Cannot vote on unapproved buzz");

    const creatorId = buzzSnap.get("creatorId");
    if (creatorId === userId) {
      const e = new Error("Creators cannot vote on their own buzzes");
      e.status = 403;
      throw e;
    }

    const existingVoteSnap = await tx.get(voteRef);
    const now = admin.firestore.Timestamp.fromMillis(Date.now());

    if (!existingVoteSnap.exists) {
      // New vote
      tx.set(voteRef, { type, createdAt: now });
      tx.update(buzzRef, {
        upvotes: admin.firestore.FieldValue.increment(type === "up" ? 1 : 0),
        downvotes: admin.firestore.FieldValue.increment(
          type === "down" ? 1 : 0,
        ),
      });

      if (creatorId) {
        tx.set(
          firestore.collection("users").doc(creatorId),
          {
            reputation: admin.firestore.FieldValue.increment(
              type === "up" ? 1 : -1,
            ),
          },
          { merge: true },
        );
      }

      return { ok: true, action: "voted", type };
    }

    // Existing vote -> allow switch or forbid same-type
    const prevType = existingVoteSnap.get("type");
    if (prevType === type) {
      const e = new Error("User has already voted with this type");
      e.status = 400;
      throw e;
    }

    // Switch vote: update vote doc and adjust counts and reputation
    tx.update(voteRef, { type, updatedAt: now });
    // adjust buzz counts
    tx.update(buzzRef, {
      upvotes: admin.firestore.FieldValue.increment(type === "up" ? 1 : -1),
      downvotes: admin.firestore.FieldValue.increment(type === "down" ? 1 : -1),
    });

    // adjust reputation by delta: up=1, down=-1
    if (creatorId) {
      const oldVal = prevType === "up" ? 1 : -1;
      const newVal = type === "up" ? 1 : -1;
      const delta = newVal - oldVal; // could be +/-2
      tx.set(
        firestore.collection("users").doc(creatorId),
        { reputation: admin.firestore.FieldValue.increment(delta) },
        { merge: true },
      );
    }

    return { ok: true, action: "switched", from: prevType, to: type };
  });

  return result;
}

async function flagBuzz(buzzId, userId, userLat, userLng) {
  const firestore = initFirestore();
  if (!firestore) throw new Error("Firestore not initialized");

  const buzzRef = firestore.collection("buzzes").doc(buzzId);
  const flagRef = buzzRef.collection("flags").doc(userId);

  const result = await firestore.runTransaction(async (tx) => {
    const buzzSnap = await tx.get(buzzRef);
    if (!buzzSnap.exists) throw new Error("Buzz not found");

    const buzzData = buzzSnap.data();
    const nowMs = Date.now();
    const expires =
      buzzData.expiresAt && buzzData.expiresAt.toMillis
        ? buzzData.expiresAt.toMillis()
        : buzzData.expiresAt || 0;
    if (expires <= nowMs) throw new Error("Cannot flag expired buzz");
    if (buzzData.status && buzzData.status !== "active")
      throw new Error("Cannot flag inactive buzz");
    if (buzzData.moderationStatus && buzzData.moderationStatus !== "approved")
      throw new Error("Cannot flag unapproved buzz");

    const creatorId = buzzSnap.get("creatorId");
    if (creatorId === userId) {
      const e = new Error("Creators cannot flag their own buzzes");
      e.status = 403;
      throw e;
    }

    const distance = getDistanceInMeters(
      userLat,
      userLng,
      buzzData.lat,
      buzzData.lng,
    );
    if (distance > 100) {
      const e = new Error(
        "You must be within 100m of this signal to report it.",
      );
      e.status = 400;
      throw e;
    }

    const existingFlag = await tx.get(flagRef);
    if (existingFlag.exists) {
      const e = new Error("You have already reported this signal.");
      e.status = 400;
      throw e;
    }

    const currentFlags = Number(buzzData.flags || 0);
    const updatedFlags = currentFlags + 1;

    tx.set(flagRef, {
      createdAt: admin.firestore.Timestamp.fromMillis(Date.now()),
    });
    tx.update(buzzRef, {
      flags: admin.firestore.FieldValue.increment(1),
    });

    if (updatedFlags >= 3) {
      tx.update(buzzRef, {
        status: "removed",
        moderationStatus: "rejected",
      });
    }

    return {
      ok: true,
      action: "reported",
      flags: updatedFlags,
      removed: updatedFlags >= 3,
    };
  });

  return result;
}

async function removeVote(buzzId, userId) {
  const firestore = initFirestore();
  if (!firestore) throw new Error("Firestore not initialized");

  const buzzRef = firestore.collection("buzzes").doc(buzzId);
  const voteRef = buzzRef.collection("votes").doc(userId);

  const result = await firestore.runTransaction(async (tx) => {
    const buzzSnap = await tx.get(buzzRef);
    if (!buzzSnap.exists) throw new Error("Buzz not found");

    const existingVoteSnap = await tx.get(voteRef);
    if (!existingVoteSnap.exists) {
      const e = new Error("No existing vote to remove");
      e.status = 404;
      throw e;
    }

    const prevType = existingVoteSnap.get("type");
    tx.delete(voteRef);
    tx.update(buzzRef, {
      upvotes: admin.firestore.FieldValue.increment(prevType === "up" ? -1 : 0),
      downvotes: admin.firestore.FieldValue.increment(
        prevType === "down" ? -1 : 0,
      ),
    });

    const creatorId = buzzSnap.get("creatorId");
    if (creatorId) {
      tx.set(
        firestore.collection("users").doc(creatorId),
        {
          reputation: admin.firestore.FieldValue.increment(
            prevType === "up" ? -1 : 1,
          ),
        },
        { merge: true },
      );
    }

    return { ok: true, action: "removed", type: prevType };
  });

  return result;
}

async function recomputeUserReputation(userId) {
  const firestore = initFirestore();
  if (!firestore) throw new Error("Firestore not initialized");
  if (!userId) throw new Error("Invalid user id");

  const now = Date.now();
  const snapshot = await firestore
    .collection("buzzes")
    .where("creatorId", "==", userId)
    .where("expiresAt", ">", admin.firestore.Timestamp.fromMillis(now))
    .where("moderationStatus", "==", "approved")
    .where("status", "==", "active")
    .get();

  let up = 0;
  let down = 0;
  snapshot.forEach((doc) => {
    const d = doc.data();
    up += Number(d.upvotes || 0);
    down += Number(d.downvotes || 0);
  });

  const score = up - down;
  await firestore
    .collection("users")
    .doc(userId)
    .set({ reputation: score }, { merge: true });
  return score;
}

module.exports = {
  fetchBuzzesFromFirestore,
  createBuzzInFirestore,
  initFirestore,
  getBuzzById,
  voteOnBuzz,
  removeVote,
  flagBuzz,
  recomputeUserReputation,
};
