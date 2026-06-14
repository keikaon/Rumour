/**
 * Mock Database for Demo Mode
 *
 * Provides in-memory storage for buzzes, votes, and flags when USE_MOCK=true
 * This ensures the demo works perfectly without Firestore
 */

// In-memory storage
const mockBuzzes = new Map();
const mockVotes = new Map(); // key: `${buzzId}:${userId}`, value: { type: 'up' | 'down' }
const mockFlags = new Map(); // key: `${buzzId}:${userId}`, value: { timestamp, userLat, userLng }
const mockUserReputation = new Map(); // key: userId, value: reputation score

/**
 * Initialize mock buzz (for static demo data)
 */
function initMockBuzz(buzz) {
  if (!mockBuzzes.has(buzz.id)) {
    mockBuzzes.set(buzz.id, {
      ...buzz,
      upvotes: buzz.upvotes || 0,
      downvotes: buzz.downvotes || 0,
      flags: buzz.flags || 0,
    });
  }
}

/**
 * Get all mock buzzes
 */
function getAllMockBuzzes() {
  return Array.from(mockBuzzes.values());
}

/**
 * Get mock buzz by ID
 */
function getMockBuzzById(buzzId) {
  return mockBuzzes.get(buzzId);
}

/**
 * Add/Update mock buzz
 */
function setMockBuzz(buzz) {
  mockBuzzes.set(buzz.id, buzz);
}

/**
 * Delete mock buzz
 */
function deleteMockBuzz(buzzId) {
  mockBuzzes.delete(buzzId);
  // Clean up associated votes and flags
  const votesToDelete = [];
  const flagsToDelete = [];

  mockVotes.forEach((_, key) => {
    if (key.startsWith(`${buzzId}:`)) votesToDelete.push(key);
  });

  mockFlags.forEach((_, key) => {
    if (key.startsWith(`${buzzId}:`)) flagsToDelete.push(key);
  });

  votesToDelete.forEach(key => mockVotes.delete(key));
  flagsToDelete.forEach(key => mockFlags.delete(key));
}

/**
 * Vote on a mock buzz
 */
function voteMockBuzz(buzzId, userId, type) {
  const buzz = mockBuzzes.get(buzzId);
  if (!buzz) throw new Error('Buzz not found');

  const voteKey = `${buzzId}:${userId}`;
  const existingVote = mockVotes.get(voteKey);

  // Remove old vote counts
  if (existingVote) {
    if (existingVote.type === 'up') {
      buzz.upvotes = Math.max(0, (buzz.upvotes || 0) - 1);
    } else if (existingVote.type === 'down') {
      buzz.downvotes = Math.max(0, (buzz.downvotes || 0) - 1);
    }
  }

  // Add new vote
  mockVotes.set(voteKey, { type, timestamp: Date.now() });

  if (type === 'up') {
    buzz.upvotes = (buzz.upvotes || 0) + 1;
  } else if (type === 'down') {
    buzz.downvotes = (buzz.downvotes || 0) + 1;
  }

  mockBuzzes.set(buzzId, buzz);

  return {
    upvotes: buzz.upvotes,
    downvotes: buzz.downvotes,
    userVote: type,
  };
}

/**
 * Remove vote from mock buzz
 */
function removeMockVote(buzzId, userId) {
  const buzz = mockBuzzes.get(buzzId);
  if (!buzz) throw new Error('Buzz not found');

  const voteKey = `${buzzId}:${userId}`;
  const existingVote = mockVotes.get(voteKey);

  if (existingVote) {
    if (existingVote.type === 'up') {
      buzz.upvotes = Math.max(0, (buzz.upvotes || 0) - 1);
    } else if (existingVote.type === 'down') {
      buzz.downvotes = Math.max(0, (buzz.downvotes || 0) - 1);
    }

    mockVotes.delete(voteKey);
    mockBuzzes.set(buzzId, buzz);
  }

  return {
    upvotes: buzz.upvotes,
    downvotes: buzz.downvotes,
    userVote: null,
  };
}

/**
 * Flag a mock buzz
 */
function flagMockBuzz(buzzId, userId, userLat, userLng) {
  const buzz = mockBuzzes.get(buzzId);
  if (!buzz) throw new Error('Buzz not found');

  const flagKey = `${buzzId}:${userId}`;

  // Check if already flagged
  if (mockFlags.has(flagKey)) {
    throw new Error('You have already flagged this buzz');
  }

  // Add flag
  mockFlags.set(flagKey, {
    timestamp: Date.now(),
    userLat,
    userLng,
  });

  buzz.flags = (buzz.flags || 0) + 1;

  // Auto-remove if 3+ flags
  if (buzz.flags >= 3) {
    buzz.status = 'removed';
    buzz.moderationStatus = 'community_flagged';
  }

  mockBuzzes.set(buzzId, buzz);

  return {
    flags: buzz.flags,
    autoRemoved: buzz.flags >= 3,
  };
}

/**
 * Get user's vote on a buzz
 */
function getUserMockVote(buzzId, userId) {
  const voteKey = `${buzzId}:${userId}`;
  const vote = mockVotes.get(voteKey);
  return vote ? vote.type : null;
}

/**
 * Check if user has flagged a buzz
 */
function hasUserMockFlagged(buzzId, userId) {
  const flagKey = `${buzzId}:${userId}`;
  return mockFlags.has(flagKey);
}

/**
 * Get user reputation
 */
function getMockUserReputation(userId) {
  return mockUserReputation.get(userId) || 0;
}

/**
 * Update user reputation
 */
function updateMockUserReputation(userId, change) {
  const current = mockUserReputation.get(userId) || 0;
  mockUserReputation.set(userId, current + change);
  return current + change;
}

/**
 * Clear all mock data (for testing)
 */
function clearMockDatabase() {
  mockBuzzes.clear();
  mockVotes.clear();
  mockFlags.clear();
  mockUserReputation.clear();
}

/**
 * Get statistics
 */
function getMockStats() {
  return {
    buzzes: mockBuzzes.size,
    votes: mockVotes.size,
    flags: mockFlags.size,
    users: mockUserReputation.size,
  };
}

module.exports = {
  initMockBuzz,
  getAllMockBuzzes,
  getMockBuzzById,
  setMockBuzz,
  deleteMockBuzz,
  voteMockBuzz,
  removeMockVote,
  flagMockBuzz,
  getUserMockVote,
  hasUserMockFlagged,
  getMockUserReputation,
  updateMockUserReputation,
  clearMockDatabase,
  getMockStats,
};
