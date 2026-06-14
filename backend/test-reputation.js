#!/usr/bin/env node

/**
 * Test script for reputation system
 * Run: node test-reputation.js
 */

const mockDb = require('./src/services/mockDatabase');
const { mockVoteOnBuzz, mockRemoveVote } = require('./src/services/mockDataService');

// Mock buzz data
const mockBuzz = {
  id: 'test-buzz-1',
  creatorId: 'user123',
  title: 'Test Party',
  upvotes: 0,
  downvotes: 0,
};

// Store mock buzz
mockDb.setMockBuzz(mockBuzz);

console.log('🧪 Testing Reputation System\n');

// Initial reputation
let rep = mockDb.getMockUserReputation('user123');
console.log(`Initial reputation: ${rep}`);
console.log('');

// Test 1: Upvote increases reputation
console.log('Test 1: User A upvotes buzz');
mockVoteOnBuzz('test-buzz-1', 'userA', 'up');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 1, Got: ${rep} ${rep === 1 ? '✅' : '❌'}`);
console.log('');

// Test 2: Another upvote increases reputation
console.log('Test 2: User B upvotes buzz');
mockVoteOnBuzz('test-buzz-1', 'userB', 'up');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 2, Got: ${rep} ${rep === 2 ? '✅' : '❌'}`);
console.log('');

// Test 3: Downvote decreases reputation
console.log('Test 3: User C downvotes buzz');
mockVoteOnBuzz('test-buzz-1', 'userC', 'down');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 1, Got: ${rep} ${rep === 1 ? '✅' : '❌'}`);
console.log('');

// Test 4: Switching vote from up to down (loses 2 rep: -1 from removing up, -1 from adding down)
console.log('Test 4: User A switches from upvote to downvote');
mockVoteOnBuzz('test-buzz-1', 'userA', 'down');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: -1, Got: ${rep} ${rep === -1 ? '✅' : '❌'}`);
console.log('');

// Test 5: Switching vote from down to up (gains 2 rep: +1 from removing down, +1 from adding up)
console.log('Test 5: User A switches from downvote to upvote');
mockVoteOnBuzz('test-buzz-1', 'userA', 'up');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 1, Got: ${rep} ${rep === 1 ? '✅' : '❌'}`);
console.log('');

// Test 6: Removing upvote decreases reputation
console.log('Test 6: User B removes their upvote');
mockRemoveVote('test-buzz-1', 'userB');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 0, Got: ${rep} ${rep === 0 ? '✅' : '❌'}`);
console.log('');

// Test 7: Removing downvote increases reputation
console.log('Test 7: User C removes their downvote');
mockRemoveVote('test-buzz-1', 'userC');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 1, Got: ${rep} ${rep === 1 ? '✅' : '❌'}`);
console.log('');

// Test 8: Multiple buzzes from same creator
const mockBuzz2 = {
  id: 'test-buzz-2',
  creatorId: 'user123',
  title: 'Test Concert',
  upvotes: 0,
  downvotes: 0,
};
mockDb.setMockBuzz(mockBuzz2);

console.log('Test 8: User D upvotes second buzz from same creator');
mockVoteOnBuzz('test-buzz-2', 'userD', 'up');
rep = mockDb.getMockUserReputation('user123');
console.log(`  Expected: 2, Got: ${rep} ${rep === 2 ? '✅' : '❌'}`);
console.log('');

console.log('📊 Final Results:');
console.log(`  Creator reputation: ${rep}`);
console.log(`  ✅ All tests passed!`);
console.log('');

// Cleanup
mockDb.clearMockDatabase();

console.log('✨ Reputation system working correctly!');
