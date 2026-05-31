const { createBuzzInFirestore } = require('../firestore');
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

  if (!moderation.approved) {
    throw new ModerationError(
      moderation.reason || 'Content violates community guidelines.',
      moderation.categories
    );
  }

  const now = Date.now();
  const expiresAt = now + payload.durationHours * 3600000;

  const doc = {
    ...payload,
    host,
    creatorId: user.uid,
    createdAt: now,
    expiresAt,
    status: 'active',
    moderationStatus: 'approved',
    moderationReason: null,
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

module.exports = {
  createBuzz,
  getMockUserBuzzes,
  ValidationError,
  ModerationError,
  VALID_TYPES,
};
