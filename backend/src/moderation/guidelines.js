/**
 * Community Guidelines Configuration for AI Moderation
 *
 * This file structures the guidelines in a format that AI moderators can easily reference.
 * Based on COMMUNITY_GUIDELINES.md v1.0
 */

const MODERATION_CONFIG = {
  version: "1.0",
  lastUpdated: "2026-06-14",

  // Categories that trigger AUTO-REJECT
  autoRejectCategories: [
    "hate_speech",
    "harassment",
    "threats",
    "illegal_activity",
    "sexual_content",
    "violence",
    "pii",
    "spam",
    "misinformation",
    "profanity", // Added for explicit profanity and sexual harassment
  ],

  // Detailed rules for each category
  rules: {
    hate_speech: {
      severity: "critical",
      action: "auto_reject",
      patterns: [
        "racial or ethnic slurs",
        "sexist language or gender-based attacks",
        "homophobic or transphobic content",
        "ableist slurs or mockery",
        "religious intolerance or attacks",
        "dehumanizing language against protected groups",
        "symbols or imagery of hate groups",
        "calls for exclusion based on protected characteristics",
      ],
      examples: [
        "No [ethnicity] allowed",
        "Use of racial slurs",
        "Gender-based exclusions",
        "Religious stereotyping",
      ],
    },

    harassment: {
      severity: "critical",
      action: "auto_reject",
      patterns: [
        "threats of violence or physical harm",
        "doxxing (sharing private addresses, phone numbers)",
        "targeted attacks on individuals",
        "bullying or intimidation",
        "encouraging self-harm or suicide",
        "stalking or unwanted contact patterns",
      ],
      examples: [
        '"I will hurt you"',
        "Sharing someone's home address",
        "Repeated targeting of specific person",
        "Encouraging dangerous behavior",
      ],
    },

    threats: {
      severity: "critical",
      action: "auto_reject",
      patterns: [
        "explicit threats of violence",
        "implied threats of harm",
        "threats to property",
        "blackmail or extortion",
        "threats to safety",
      ],
      examples: [
        '"I\'m going to find and hurt you"',
        '"Watch your back"',
        '"I know where you live"',
      ],
    },

    illegal_activity: {
      severity: "critical",
      action: "auto_reject",
      patterns: [
        "drug sales or distribution",
        "weapons sales (firearms, explosives)",
        "human trafficking references",
        "underage drinking events",
        "prostitution or sexual services",
        "stolen goods sales",
        "counterfeit items",
        "illegal gambling",
        "fraud or scam schemes",
        "pyramid schemes or MLM recruitment",
      ],
      examples: [
        '"Selling [illegal drug]"',
        '"Need fake ID"',
        '"Unauthorized event at government property"',
        '"Join my MLM team"',
      ],
    },

    sexual_content: {
      severity: "critical",
      action: "auto_reject",
      patterns: [
        "sexual or nude imagery references",
        "sexual services or solicitation",
        "content sexualizing minors",
        "pornographic descriptions",
        "explicit sexual language",
        "unwanted sexual advances",
        "hookup solicitations",
      ],
      examples: [
        '"18+ strip show"',
        '"Looking for hookups"',
        "Sexually explicit descriptions",
        "Inappropriate sexual emojis",
      ],
    },

    violence: {
      severity: "critical",
      action: "auto_reject",
      patterns: [
        "graphic violence descriptions",
        "glorification of violence",
        "weapon-making instructions",
        "unlicensed fighting events",
        "animal abuse or cruelty",
        "dangerous stunts encouraging harm",
        "vandalism planning",
      ],
      examples: [
        '"Street fight at midnight"',
        '"Rooftop jumping challenge"',
        '"Vandalism meetup"',
        '"Reckless driving event"',
      ],
    },

    pii: {
      severity: "high",
      action: "auto_reject",
      patterns: [
        "full names (first + last) with contact info",
        "home addresses",
        "phone numbers in format XXX-XXX-XXXX or similar",
        "email addresses",
        "social security numbers",
        "credit card numbers",
        "medical records",
        "personal ID numbers",
      ],
      examples: [
        '"Contact John Smith at 555-1234"',
        '"My apartment at 123 Main St, Apt 4B"',
        '"Email me at user@example.com"',
      ],
      exceptions: [
        "Venue addresses for public events",
        "Business contact info from verified accounts",
        "Usernames or handles (e.g., @username)",
      ],
    },

    spam: {
      severity: "high",
      action: "auto_reject",
      patterns: [
        "MLM recruitment language",
        "crypto pump-and-dump schemes",
        "get rich quick schemes",
        "external link farms",
        "fake engagement schemes",
        "affiliate marketing spam",
        "excessive repetition",
        "clickbait titles",
      ],
      examples: [
        '"Join my team and earn $$$"',
        '"Buy followers guaranteed"',
        '"Click for free iPhone"',
        '"Limited time offer act now"',
      ],
      exceptions: [
        "Legitimate business events at specific locations",
        "Verified pop-up shops or food trucks",
        "Ticketed shows with real venues",
      ],
    },

    misinformation: {
      severity: "high",
      action: "auto_reject",
      patterns: [
        "impersonation of others",
        "fake emergency alerts",
        "false venue claims",
        "misleading event details",
        "fake celebrity appearances",
        "fake verification claims",
      ],
      examples: [
        '"Government shutdown alert" (false)',
        '"Free concert by [famous artist]" (not real)',
        "Pretending to be venue owner",
      ],
    },

    profanity: {
      severity: "high",
      action: "auto_reject",
      patterns: [
        "f-word and variants (fuck, fucking, fucked)",
        "explicit sexual terms (dick, pussy, cock, bitch in sexual context)",
        "aggressive profanity directed at people",
        "profanity combined with harassment or threats",
        "excessive or gratuitous cursing",
      ],
      exceptions: [
        "Band names or artistic titles (e.g., 'The F***ing Champs')",
        "Official venue names",
        "Song titles in quotes",
        "Very mild profanity in appropriate event context (damn, hell)",
      ],
      examples: [
        '"F*** this party" → REJECT',
        '"Come get f***ed up" → REJECT',
        '"Bitch-ass event" → REJECT',
        '"Band name: The F***ing Champs" → APPROVE (artistic context)',
      ],
    },
  },

  // Approved content patterns
  approvedPatterns: {
    legitimate_events: [
      "art exhibitions, galleries, shows",
      "music performances, DJ sets, concerts",
      "food events, restaurants, tastings",
      "gaming tournaments, LAN parties",
      "sports meetups, fitness classes",
      "networking events, social mixers",
      "educational workshops, talks",
    ],
    required_elements: [
      "specific location information",
      "event timing and duration",
      "appropriate language",
      "accurate descriptions",
    ],
  },

  // Special context rules
  contextRules: {
    profanityAcceptable: {
      when: [
        "Band or artist names",
        "Art exhibition titles",
        "Official venue names",
        "Song or performance titles",
      ],
      notWhen: [
        "Directed at individuals",
        "Excessive or gratuitous",
        "Combined with threats or harassment",
      ],
    },
    businessContentAcceptable: {
      when: [
        "Verified business account",
        "Legitimate event at specific location",
        "Pop-up shops or food trucks with real venues",
        "Ticketed shows with venue info",
      ],
      notWhen: [
        "MLM or pyramid scheme recruitment",
        "Crypto schemes",
        "No physical location",
        "Spam or clickbait",
      ],
    },
  },

  // Action mappings
  actions: {
    auto_reject: {
      approved: false,
      status: "rejected",
      accountAction: "warning",
      escalate: true,
    },
    flag_for_review: {
      approved: "pending",
      status: "pending",
      accountAction: "none",
      escalate: false,
    },
    approve: {
      approved: true,
      status: "active",
      accountAction: "none",
      escalate: false,
    },
  },
};

/**
 * Build the AI moderation prompt with structured guidelines
 * Optimized for minimal token usage while maintaining accuracy
 */
function buildModerationPrompt() {
  return `Moderate event content for Rumour app. Respond ONLY with valid JSON.

## AUTO-REJECT (approved: false)

1. HATE_SPEECH: Slurs, discrimination by race/gender/religion/sexuality/disability, dehumanizing language
2. HARASSMENT: Threats, doxxing, bullying, intimidation, encouraging self-harm
3. SEXUAL_CONTENT: Explicit sexual language, hookup solicitation, pornographic content, sexual services, sexual harassment
4. ILLEGAL_ACTIVITY: Drug/weapon sales, underage drinking, prostitution, fraud, MLM/pyramid schemes
5. VIOLENCE: Graphic violence, fighting events, dangerous stunts, animal cruelty
6. PII: Home addresses, phone numbers (XXX-XXX-XXXX), emails, SSN, credit cards
7. SPAM: No physical location, "get rich quick", excessive clickbait
8. PROFANITY: F-word, explicit sexual terms, aggressive profanity directed at people

## APPROVE (approved: true)
- Legitimate local events (concerts, art, food, parties, gaming)
- Specific location & time
- Appropriate language
- No violations above

## EDGE CASES (approved: "pending")
- Mild profanity in band/art names (OK in context)
- Ambiguous intent

## OUTPUT
{"approved": true|false|"pending", "categories": ["category"], "reason": "brief"}

Categories: ${MODERATION_CONFIG.autoRejectCategories.join(", ")}, profanity`;
}

module.exports = {
  MODERATION_CONFIG,
  buildModerationPrompt,
};
