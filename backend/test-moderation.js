#!/usr/bin/env node

/**
 * Test script for AI content moderation
 * Run: node test-moderation.js
 */

require("dotenv").config();
const { moderateBuzzContent } = require("./src/moderation/gemini");

const testCases = [
  {
    name: "✅ GOOD: Legitimate party event",
    fields: {
      title: "Rooftop Sunset Party",
      teaser: "DJ sets and craft cocktails",
      description: "Join us for an evening of music and fun",
      zone: "Downtown",
      host: "@party_people",
    },
    expected: true,
  },
  {
    name: "❌ BAD: F-word profanity",
    fields: {
      title: "F*** this party",
      teaser: "Come get f***ed up",
      description: "Party time",
      zone: "Downtown",
      host: "@user",
    },
    expected: false,
  },
  {
    name: "❌ BAD: Sexual harassment",
    fields: {
      title: "Party Tonight",
      teaser: "Looking for hot chicks to hook up",
      description: "Sexual harassment time, bring your p***y",
      zone: "Downtown",
      host: "@creep",
    },
    expected: false,
  },
  {
    name: "❌ BAD: Explicit sexual content",
    fields: {
      title: "Adult Party",
      teaser: "Get laid tonight",
      description: "Looking for hookups and sexual encounters",
      zone: "Downtown",
      host: "@user",
    },
    expected: false,
  },
  {
    name: "❌ BAD: Hate speech",
    fields: {
      title: "Exclusive Party",
      teaser: "No foreigners allowed",
      description: "Whites only event",
      zone: "Downtown",
      host: "@racist",
    },
    expected: false,
  },
  {
    name: "❌ BAD: PII violation",
    fields: {
      title: "Private Party",
      teaser: "Contact for details",
      description: "Call John Smith at 555-123-4567",
      zone: "Downtown",
      host: "@user",
    },
    expected: false,
  },
  {
    name: "✅ GOOD: Band name with mild profanity",
    fields: {
      title: "The Damn Seagulls Live",
      teaser: "Rock concert tonight",
      description: "Local band performing at The Venue",
      zone: "Music District",
      host: "@venue",
    },
    expected: true,
  },
];

async function runTests() {
  console.log("🧪 Testing AI Moderation\n");
  console.log("API Key configured:", !!process.env.GOOGLE_AI_API_KEY);
  console.log("Model: gemini-2.0-flash-lite (optimized for quota)\n");

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`Testing: ${test.name}`);

    try {
      const result = await moderateBuzzContent(test.fields);
      const approved = result.approved === true;
      const success = approved === test.expected;

      if (success) {
        console.log(
          `  ✅ PASS - approved: ${approved}, categories: ${result.categories?.join(", ") || "none"}`,
        );
        passed++;
      } else {
        console.log(`  ❌ FAIL - Expected: ${test.expected}, Got: ${approved}`);
        console.log(`     Reason: ${result.reason}`);
        console.log(
          `     Categories: ${result.categories?.join(", ") || "none"}`,
        );
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
      failed++;
    }

    console.log("");

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n📊 Test Results:");
  console.log(`   Passed: ${passed}/${testCases.length}`);
  console.log(`   Failed: ${failed}/${testCases.length}`);
  console.log(
    `   Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%`,
  );

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
