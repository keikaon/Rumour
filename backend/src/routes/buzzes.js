const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  createBuzz,
  getMockUserBuzzes,
  ValidationError,
  ModerationError,
} = require("../services/buzzService");
const {
  fetchBuzzesFromFirestore,
  voteOnBuzz,
  removeVote,
  flagBuzz,
  deleteBuzzFromFirestore,
} = require("../firestore");
const mockDb = require("../services/mockDatabase");
const {
  mockVoteOnBuzz,
  mockRemoveVote,
  mockFlagBuzz,
  applyStatsToBuzzes,
} = require("../services/mockDataService");

const router = express.Router();
const USE_MOCK = process.env.USE_MOCK !== "false";

// Simple in-memory token bucket rate limiter per UID
const rateBuckets = new Map();
const MAX_TOKENS = parseInt(process.env.VOTE_MAX_TOKENS || "60", 10);
const REFILL_INTERVAL_MS = 60000; // refill period

function allowVote(uid) {
  if (!uid) return false;
  let b = rateBuckets.get(uid);
  const now = Date.now();
  if (!b) {
    b = { tokens: MAX_TOKENS - 1, last: now };
    rateBuckets.set(uid, b);
    return true;
  }
  const elapsed = now - b.last;
  const refill = Math.floor((elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS);
  if (refill > 0) {
    b.tokens = Math.min(MAX_TOKENS, b.tokens + refill);
    b.last = now;
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}

// Dynamic demo dataset showcasing all 5 proximity tiers
// Distances are calibrated to demonstrate Ghost, Pulse, Echo, Hook, and Reveal modes
function generateDynamicMockData(lat, lng) {
  const now = Date.now();
  const ONE_HOUR = 3600000;

  // Distance offsets (approximate degrees for demo):
  // 1 degree latitude ≈ 111km
  // Tier 1 (Ghost): > 5km = ~0.045°
  // Tier 2 (Pulse/Aura): 3-5km = ~0.027-0.045°
  // Tier 3 (Echo): 1-3km = ~0.009-0.027°
  // Tier 4 (Hook): 200m-1km = ~0.0018-0.009°
  // Tier 5 (Reveal): < 200m = ~0.0018°

  const buzzes = [
    // TIER 1: GHOST MODE (> 5km) - Completely hidden
    {
      id: "ghost-1",
      type: "Music",
      icon: "🎸",
      title: "Secret Underground Rave",
      zone: "Far District",
      teaser: "Bassline echoes from the industrial sector",
      description:
        "Warehouse transformed into sonic cathedral. Techno, house, and experimental beats until sunrise.",
      host: "@dj_phantom",
      lat: lat + 0.055,
      lng: lng + 0.055,
      expiresAt: now + ONE_HOUR * 6,
      upvotes: 89,
      downvotes: 4,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
    {
      id: "ghost-2",
      type: "Art",
      icon: "🎨",
      title: "Midnight Gallery Opening",
      zone: "Arts Quarter",
      teaser: "Canvas whispers from across the city",
      description:
        "Provocative new exhibition exploring digital identity through street art and projection mapping.",
      host: "@gallery_noir",
      lat: lat - 0.06,
      lng: lng + 0.01,
      expiresAt: now + ONE_HOUR * 5,
      upvotes: 34,
      downvotes: 1,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },

    // TIER 2: PULSE/AURA (3-5km) - Massive glowing aura, category only
    {
      id: "aura-1",
      type: "Party",
      icon: "🎉",
      title: "Rooftop Sunset Session",
      zone: "Downtown Heights",
      teaser: "Golden hour vibes with panoramic skyline views",
      description:
        "DJ sets, craft cocktails, and summer energy. Dress code: creative casual. RSVP for location.",
      host: "@skyline_social",
      lat: lat + 0.035,
      lng: lng - 0.02,
      expiresAt: now + ONE_HOUR * 4,
      upvotes: 156,
      downvotes: 8,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
    {
      id: "aura-2",
      type: "Food",
      icon: "🍽️",
      title: "Pop-Up Night Market",
      zone: "Riverside Commons",
      teaser: "Street food fusion from 12 local vendors",
      description:
        "Asian-Latin fusion, vegan tacos, artisan ice cream, live music. Cash and digital payments accepted.",
      host: "@night_bites",
      lat: lat - 0.03,
      lng: lng - 0.03,
      expiresAt: now + ONE_HOUR * 3.5,
      upvotes: 203,
      downvotes: 5,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },

    // TIER 3: ECHO (1-3km) - Zone/neighborhood revealed
    {
      id: "echo-1",
      type: "Gaming",
      icon: "🎮",
      title: "Retro Arcade Tournament",
      zone: "Tech District",
      teaser: "8-bit battles and pixel glory await",
      description:
        "Street Fighter, Pac-Man, Galaga competitions. $5 entry, winner takes all. Free play until 10pm.",
      host: "@pixel_palace",
      lat: lat + 0.015,
      lng: lng + 0.015,
      expiresAt: now + ONE_HOUR * 4,
      upvotes: 78,
      downvotes: 3,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
    {
      id: "echo-2",
      type: "Art",
      icon: "🎨",
      title: "Live Graffiti Session",
      zone: "Warehouse District",
      teaser: "Aerosol artists transform blank walls",
      description:
        "Watch local street artists create murals in real-time. Bring your sketchbook, collaborative piece at midnight.",
      host: "@spray_collective",
      lat: lat - 0.018,
      lng: lng + 0.012,
      expiresAt: now + ONE_HOUR * 5,
      upvotes: 92,
      downvotes: 2,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },

    // TIER 4: HOOK (200m-1km) - Cryptic teaser revealed
    {
      id: "hook-1",
      type: "Music",
      icon: "🎸",
      title: "Acoustic Jam Session",
      zone: "Old Town Square",
      teaser:
        "Bring your instrument or just your ears — all skill levels welcome",
      description:
        "Open mic poetry slam followed by collaborative jam. Guitars, drums, vocals, spoken word. First-timers encouraged.",
      host: "@open_strings",
      lat: lat + 0.006,
      lng: lng - 0.004,
      expiresAt: now + ONE_HOUR * 3,
      upvotes: 45,
      downvotes: 1,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
    {
      id: "hook-2",
      type: "Party",
      icon: "🎉",
      title: "Silent Disco in the Park",
      zone: "Greenway Park",
      teaser:
        "Three DJs, wireless headphones, choose your vibe — house, hip-hop, or indie",
      description:
        "Headphones provided. Dance under the stars with friends while the city sleeps. Eco-friendly event.",
      host: "@silent_movement",
      lat: lat - 0.005,
      lng: lng + 0.007,
      expiresAt: now + ONE_HOUR * 4,
      upvotes: 134,
      downvotes: 6,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },

    // TIER 5: REVEAL (< 200m) - Full details unlocked
    {
      id: "reveal-1",
      type: "Food",
      icon: "🍽️",
      title: "Taco Tuesday Takeover",
      zone: "Corner of 5th & Main",
      teaser: "$2 tacos, $3 margs, live mariachi — no reservations needed",
      description:
        "Family-owned taqueria hosting weekly street party. Carnitas, al pastor, veggie options. BYOB welcome. Cash preferred.",
      host: "@tacos_locos",
      lat: lat + 0.0015,
      lng: lng + 0.0012,
      expiresAt: now + ONE_HOUR * 2,
      upvotes: 267,
      downvotes: 3,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
    {
      id: "reveal-2",
      type: "Gaming",
      icon: "🎮",
      title: "Smash Bros Ultimate Bracket",
      zone: "Campus Student Center",
      teaser:
        "32-player double elimination — sign up at the door, starts in 45min",
      description:
        "Nintendo Switch tournament with projector setup. $10 buy-in, 60/30/10 payout. Snacks and energy drinks available.",
      host: "@smash_local",
      lat: lat - 0.0008,
      lng: lng - 0.001,
      expiresAt: now + ONE_HOUR * 2.5,
      upvotes: 88,
      downvotes: 4,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
    {
      id: "reveal-3",
      type: "Party",
      icon: "🎉",
      title: "Secret Cinema Screening",
      zone: "Underground Theater",
      teaser: "Password-protected film & discussion — Kubrick devotees only",
      description:
        "Eyes Wide Shut movie watch and discussion. Intimate screening followed by analysis of themes, symbolism, and Kubrick's final vision. BYOB, password required.",
      host: "@film_society",
      isSecret: true,
      password: "Fidelio",
      lat: lat + 0.0005,
      lng: lng - 0.0006,
      expiresAt: now + ONE_HOUR * 3,
      upvotes: 41,
      downvotes: 0,
      flags: 0,
      status: "active",
      moderationStatus: "approved",
    },
  ];
  return buzzes;
}

// GET /api/buzzes - Fetch all buzzes
router.get("/", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (USE_MOCK) {
      const userLat = parseFloat(lat) || 37.7749;
      const userLng = parseFloat(lng) || -122.4194;

      // Get dynamic mock data
      let buzzes = generateDynamicMockData(userLat, userLng);

      // Apply any accumulated mock stats to the buzzes
      buzzes = applyStatsToBuzzes(buzzes);

      // Add buzzes from mockDb that users have created
      const userCreatedBuzzes = mockDb.getAllMockBuzzes();
      const userCreatedWithStats = applyStatsToBuzzes(userCreatedBuzzes);

      buzzes = [...buzzes, ...userCreatedWithStats];

      return res.json(buzzes);
    }

    // Production mode: fetch from Firestore
    const buzzes = await fetchBuzzesFromFirestore();
    return res.json(buzzes);
  } catch (error) {
    console.error("Error fetching buzzes:", error);
    return res.status(500).json({ error: "Failed to fetch buzzes" });
  }
});

// GET /api/buzzes/mine - Get current user's buzzes
router.get("/mine", requireAuth, async (req, res) => {
  try {
    if (USE_MOCK) {
      const buzzes = getMockUserBuzzes(req.user.uid);
      return res.json(buzzes);
    }

    // Production mode: fetch user buzzes from Firestore
    const buzzes = await fetchBuzzesFromFirestore({ userId: req.user.uid });
    return res.json(buzzes);
  } catch (error) {
    console.error("Error fetching user buzzes:", error);
    return res.status(500).json({ error: "Failed to fetch user buzzes" });
  }
});

// POST /api/buzzes - Create a new buzz
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("[RUMOUR] Creating buzz:", {
      type: req.body.type,
      title: req.body.title,
      userId: req.user.uid,
    });
    const buzz = await createBuzz(req.body, req.user, { useMock: USE_MOCK });
    console.log("[RUMOUR] Buzz created successfully:", buzz.id);
    return res.status(201).json(buzz);
  } catch (err) {
    console.error("[RUMOUR] Create buzz error:", {
      message: err.message,
      stack: err.stack,
      type: err.constructor.name,
      body: req.body,
    });

    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof ModerationError) {
      return res.status(403).json({ error: err.message });
    }
    return res
      .status(500)
      .json({ error: err.message || "Failed to create buzz" });
  }
});

// POST /api/buzzes/:id/vote - Vote on a buzz
router.post("/:id/vote", requireAuth, async (req, res) => {
  try {
    const buzzId = req.params.id;
    const { type } = req.body;

    // Validate vote type
    if (!["up", "down"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid vote type. Must be 'up' or 'down'" });
    }

    // Rate limiting
    if (!allowVote(req.user.uid)) {
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
    }

    if (USE_MOCK) {
      const result = mockVoteOnBuzz(buzzId, req.user.uid, type);
      return res.status(200).json({ vote: result });
    }

    // Production mode: vote in Firestore
    const result = await voteOnBuzz(buzzId, req.user.uid, type);
    return res.status(200).json({ vote: result });
  } catch (error) {
    console.error("Error voting on buzz:", error);
    return res.status(500).json({ error: "Failed to vote on buzz" });
  }
});

// DELETE /api/buzzes/:id/vote - Remove vote from a buzz
router.delete("/:id/vote", requireAuth, async (req, res) => {
  try {
    const buzzId = req.params.id;

    if (USE_MOCK) {
      const result = mockRemoveVote(buzzId, req.user.uid);
      return res.status(200).json({ vote: result });
    }

    // Production mode: remove vote in Firestore
    const result = await removeVote(buzzId, req.user.uid);
    return res.status(200).json({ vote: result });
  } catch (error) {
    console.error("Error removing vote:", error);
    return res.status(500).json({ error: "Failed to remove vote" });
  }
});

// POST /api/buzzes/:id/flag - Flag a buzz for moderation
router.post("/:id/flag", requireAuth, async (req, res) => {
  try {
    const buzzId = req.params.id;

    if (USE_MOCK) {
      const result = mockFlagBuzz(buzzId, req.user.uid);

      // If auto-removed, remove from mockDb
      if (result.removed) {
        mockDb.deleteMockBuzz(buzzId);
      }

      return res.status(200).json({ flag: result });
    }

    // Production mode: flag in Firestore
    const result = await flagBuzz(buzzId, req.user.uid);
    return res.status(200).json({ flag: result });
  } catch (error) {
    console.error("Error flagging buzz:", error);
    return res.status(500).json({ error: "Failed to flag buzz" });
  }
});

// DELETE /api/buzzes/:id - Delete a buzz (only if user owns it)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const buzzId = req.params.id;
    const userId = req.user.uid;

    if (USE_MOCK) {
      // Get the buzz from mockDb
      const buzz = mockDb.getMockBuzzById(buzzId);

      if (!buzz) {
        return res.status(404).json({ error: "Buzz not found" });
      }

      // Check if user owns the buzz
      if (buzz.createdBy !== userId && buzz.creatorId !== userId) {
        return res
          .status(403)
          .json({ error: "You can only delete your own buzzes" });
      }

      // Delete the buzz
      mockDb.deleteMockBuzz(buzzId);
      return res.status(200).json({ message: "Buzz deleted successfully" });
    }

    // Production mode: delete from Firestore
    const result = await deleteBuzzFromFirestore(buzzId, userId);

    if (!result.success) {
      if (result.error === "not_found") {
        return res.status(404).json({ error: "Buzz not found" });
      }
      if (result.error === "unauthorized") {
        return res
          .status(403)
          .json({ error: "You can only delete your own buzzes" });
      }
      return res.status(500).json({ error: "Failed to delete buzz" });
    }

    return res.status(200).json({ message: "Buzz deleted successfully" });
  } catch (error) {
    console.error("Error deleting buzz:", error);
    return res.status(500).json({ error: "Failed to delete buzz" });
  }
});

module.exports = router;
