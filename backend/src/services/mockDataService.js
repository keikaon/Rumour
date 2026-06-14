/**
 * Mock Data Service
 *
 * In-memory storage for demo/testing without Firestore
 */

const mockDb = require("./mockDatabase");

// In-memory storage for mock mode
const mockVotes = new Map(); // buzzId -> { userId -> 'up'|'down' }
const mockFlags = new Map(); // buzzId -> Set(userId)
const mockBuzzStats = new Map(); // buzzId -> { upvotes, downvotes, flags }

/**
 * Initialize stats for a buzz
 */
function ensureBuzzStats(buzzId) {
  if (!mockBuzzStats.has(buzzId)) {
    mockBuzzStats.set(buzzId, { upvotes: 0, downvotes: 0, flags: 0 });
  }
  return mockBuzzStats.get(buzzId);
}

/**
 * Vote on a buzz (mock implementation)
 */
function mockVoteOnBuzz(buzzId, userId, type) {
  if (!["up", "down"].includes(type)) {
    throw new Error("Invalid vote type");
  }

  // Get buzz to find creator
  const buzz = mockDb.getMockBuzzById(buzzId);
  const creatorId = buzz?.creatorId || buzz?.createdBy;

  // Initialize storage for this buzz if needed
  if (!mockVotes.has(buzzId)) {
    mockVotes.set(buzzId, new Map());
  }

  const buzzVotes = mockVotes.get(buzzId);
  const previousVote = buzzVotes.get(userId);
  const stats = ensureBuzzStats(buzzId);

  // Update reputation based on vote changes
  if (creatorId) {
    if (previousVote === "up") {
      stats.upvotes--;
      mockDb.updateMockUserReputation(creatorId, -1); // Remove upvote rep
    }
    if (previousVote === "down") {
      stats.downvotes--;
      mockDb.updateMockUserReputation(creatorId, 1); // Remove downvote penalty
    }

    // Add new vote reputation
    if (type === "up") {
      stats.upvotes++;
      mockDb.updateMockUserReputation(creatorId, 1); // Add upvote rep
    }
    if (type === "down") {
      stats.downvotes++;
      mockDb.updateMockUserReputation(creatorId, -1); // Add downvote penalty
    }
  } else {
    // No creator tracking, just update stats
    if (previousVote === "up") stats.upvotes--;
    if (previousVote === "down") stats.downvotes--;
    buzzVotes.set(userId, type);
    if (type === "up") stats.upvotes++;
    if (type === "down") stats.downvotes++;
  }

  buzzVotes.set(userId, type);

  return {
    action: previousVote ? "switched" : "added",
    previousVote,
    currentVote: type,
    upvotes: stats.upvotes,
    downvotes: stats.downvotes,
  };
}

/**
 * Remove vote from a buzz (mock implementation)
 */
function mockRemoveVote(buzzId, userId) {
  if (!mockVotes.has(buzzId)) {
    return { action: "none", upvotes: 0, downvotes: 0 };
  }

  // Get buzz to find creator
  const buzz = mockDb.getMockBuzzById(buzzId);
  const creatorId = buzz?.creatorId || buzz?.createdBy;

  const buzzVotes = mockVotes.get(buzzId);
  const previousVote = buzzVotes.get(userId);
  const stats = ensureBuzzStats(buzzId);

  if (!previousVote) {
    return {
      action: "none",
      upvotes: stats.upvotes,
      downvotes: stats.downvotes,
    };
  }

  // Remove vote and update reputation
  buzzVotes.delete(userId);

  if (creatorId) {
    if (previousVote === "up") {
      stats.upvotes--;
      mockDb.updateMockUserReputation(creatorId, -1); // Remove upvote rep
    }
    if (previousVote === "down") {
      stats.downvotes--;
      mockDb.updateMockUserReputation(creatorId, 1); // Remove downvote penalty
    }
  } else {
    if (previousVote === "up") stats.upvotes--;
    if (previousVote === "down") stats.downvotes--;
  }

  return {
    action: "removed",
    previousVote,
    upvotes: stats.upvotes,
    downvotes: stats.downvotes,
  };
}

/**
 * Flag a buzz (mock implementation)
 */
function mockFlagBuzz(buzzId, userId) {
  // Initialize storage for this buzz if needed
  if (!mockFlags.has(buzzId)) {
    mockFlags.set(buzzId, new Set());
  }

  const buzzFlags = mockFlags.get(buzzId);
  const stats = ensureBuzzStats(buzzId);

  // Check if already flagged
  if (buzzFlags.has(userId)) {
    return {
      action: "already_flagged",
      flags: stats.flags,
      removed: false,
    };
  }

  // Add flag
  buzzFlags.add(userId);
  stats.flags++;

  // Check for auto-removal (3 flags)
  const removed = stats.flags >= 3;

  return {
    action: "flagged",
    flags: stats.flags,
    removed,
  };
}

/**
 * Get current stats for a buzz
 */
function getBuzzStats(buzzId) {
  return ensureBuzzStats(buzzId);
}

/**
 * Get user's vote on a buzz
 */
function getUserVote(buzzId, userId) {
  if (!mockVotes.has(buzzId)) return null;
  return mockVotes.get(buzzId).get(userId) || null;
}

/**
 * Check if user has flagged a buzz
 */
function hasUserFlagged(buzzId, userId) {
  if (!mockFlags.has(buzzId)) return false;
  return mockFlags.get(buzzId).has(userId);
}

/**
 * Clear all mock data (for testing)
 */
function clearMockData() {
  mockVotes.clear();
  mockFlags.clear();
  mockBuzzStats.clear();
}

/**
 * Apply stats to buzz objects
 */
function applyStatsToBuzzes(buzzes) {
  return buzzes.map((buzz) => ({
    ...buzz,
    upvotes: mockBuzzStats.get(buzz.id)?.upvotes || buzz.upvotes || 0,
    downvotes: mockBuzzStats.get(buzz.id)?.downvotes || buzz.downvotes || 0,
    flags: mockBuzzStats.get(buzz.id)?.flags || buzz.flags || 0,
  }));
}

module.exports = {
  mockVoteOnBuzz,
  mockRemoveVote,
  mockFlagBuzz,
  getBuzzStats,
  getUserVote,
  hasUserFlagged,
  clearMockData,
  applyStatsToBuzzes,
};
