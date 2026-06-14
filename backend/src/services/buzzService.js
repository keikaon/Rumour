const { createBuzzInFirestore, voteOnBuzz, removeVote, flagBuzz } = require('../firestore');
const { moderateBuzzContent } = require('../moderation/gemini');
const { isWithinMeters } = require('./proximity');

const TYPE_ICONS = {
  Party: '🎉',
  Art: '🎨',
  Music: '🎸',
  Gaming: '🎮',
  Food: '🍽️',
};

const MAX = { title: 80, teaser: 120, description: 500, zone: 80, password: 32 };
const VALID_TYPES = Object.keys(TYPE_ICONS);

let mockUserBuzzes = [];
let mockIdCounter = 1000;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

class ModerationError extends Error {
  constructor(message, categories = []) {
    super(message);
    this.name = 'ModerationError';
    this.status = 400;
    this.categories = categories;
  }
}

function trimStr(value, max) {
  if (value == null || value === '') return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  if (s.length > max) throw new ValidationError(`Text exceeds ${max} characters.`);
  return s;
}

function validateCreatePayload(body) {
  const type = String(body.type || '').trim();
  if (!VALID_TYPES.includes(type)) {
    throw new ValidationError(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  const title = trimStr(body.title, MAX.title);
  if (!title) throw new ValidationError('Title is required.');

  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);
  const userLat = parseFloat(body.userLat);
  const userLng = parseFloat(body.userLng);

  if ([lat, lng, userLat, userLng].some(Number.isNaN)) {
    throw new ValidationError('Valid location coordinates are required.');
  }

  if (!isWithinMeters(userLat, userLng, lat, lng, 50)) {
    throw new ValidationError('You must be within 50m of the signal location to post.');
  }

  let durationHours = parseFloat(body.durationHours);
  if (Number.isNaN(durationHours)) durationHours = 4;
  durationHours = Math.min(6, Math.max(1, durationHours));

  const isSecret = Boolean(body.isSecret);
  const password = isSecret ? trimStr(body.password, MAX.password) : undefined;
  if (isSecret && !password) {
    throw new ValidationError('Secret signals require a password.');
  }

  return {
    type,
    title,
    teaser: trimStr(body.teaser, MAX.teaser),
    description: trimStr(body.description, MAX.description),
    zone: trimStr(body.zone, MAX.zone),
    lat,
    lng,
    durationHours,
    isSecret,
    password: password || null,
    image: trimStr(body.image, 500) || null,
    icon: TYPE_ICONS[type],
  };
}

function hostFromUser(user) {
  const base = (user.email?.split('@')[0] || user.name || 'agent')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 24);
  return `@${base}`;
}

async function createBuzz(body, user, { useMock }) {
  const payload = validateCreatePayload(body);
  const host = hostFromUser(user);

  const moderation = await moderateBuzzContent({
    title: payload.title,
    teaser: payload.teaser,
    description: payload.description,
    zone: payload.zone,
    host,
  });

  // Handle moderation outcomes:
  // - approved === true -> proceed
  // - approved === false -> reject with ModerationError
  // - approved === 'pending' (or other non-boolean) -> save but mark moderation pending
  let moderationStatus = 'approved';
  let moderationReason = null;
  if (moderation.approved === true) {
    moderationStatus = 'approved';
  } else if (moderation.approved === false) {
    throw new ModerationError(moderation.reason || 'Content violates community guidelines.', moderation.categories);
  } else {
    moderationStatus = 'pending';
    moderationReason = moderation.reason || 'Pending manual moderation';
  }

  const now = Date.now();
  const expiresAt = now + payload.durationHours * 3600000;

  const doc = {
    ...payload,
    host,
    creatorId: user.uid,
    createdAt: now,
    expiresAt,
    status: moderationStatus === 'approved' ? 'active' : 'pending',
    moderationStatus,
    moderationReason,
    isVerifiedSource: false,
  };

  if (useMock) {
    const id = `mock-${mockIdCounter++}`;
    const buzz = { id, ...doc };
    mockUserBuzzes.push(buzz);
    return buzz;
  }

  const saved = await createBuzzInFirestore(doc);
  if (!saved) {
    throw new ValidationError('Unable to save signal. Check Firestore configuration.');
  }
  return saved;
}

function getMockUserBuzzes() {
  const now = Date.now();
  mockUserBuzzes = mockUserBuzzes.filter(b => b.expiresAt > now);
  return [...mockUserBuzzes];
}

// Seed demo user buzzes for local/mock mode. Idempotent.
function seedDemoBuzzes() {
  if (mockUserBuzzes.length > 0) return;
  const now = Date.now();
  const ONE_HOUR = 3600000;
  mockUserBuzzes.push(
    {
      id: `mock-user-1`,
      type: 'Party',
      icon: '🕺',
      title: 'Demo Rooftop Mixer',
      zone: 'Demo District',
      teaser: 'Sunset mixer — demo content',
      host: '@demo_host',
      description: 'Demonstration event to showcase Rumour features.',
      image: null,
      lat: 0.0,
      lng: 0.0,
      creatorId: 'demo-user',
      createdAt: now,
      expiresAt: now + ONE_HOUR * 12,
      status: 'active',
      moderationStatus: 'approved',
    },
    {
      id: `mock-user-2`,
      type: 'Art',
      icon: '🎨',
      title: 'Demo Street Mural',
      zone: 'Demo Alley',
      teaser: 'Live painting — demo',
      host: '@demo_artist',
      description: 'A short demo description for showcase.',
      image: null,
      lat: 0.0,
      lng: 0.001,
      creatorId: 'demo-user',
      createdAt: now,
      expiresAt: now + ONE_HOUR * 6,
      status: 'active',
      moderationStatus: 'approved',
    }
  );
}

module.exports = {
  createBuzz,
  getMockUserBuzzes,
  ValidationError,
  ModerationError,
  VALID_TYPES,
  vote: async (buzzId, userId, type) => {
    try {
      return await voteOnBuzz(buzzId, userId, type);
    } catch (err) {
      const e = new Error(err.message || 'Vote failed');
      e.status = 400;
      throw e;
    }
  },
  removeVote: async (buzzId, userId) => {
    try {
      return await removeVote(buzzId, userId);
    } catch (err) {
      const e = new Error(err.message || 'Remove vote failed');
      e.status = err.status || 400;
      throw e;
    }
  },
  flag: async (buzzId, userId, userLat, userLng) => {
    try {
      return await flagBuzz(buzzId, userId, userLat, userLng);
    } catch (err) {
      const e = new Error(err.message || 'Flag failed');
      e.status = err.status || 400;
      throw e;
    }
  },
};
