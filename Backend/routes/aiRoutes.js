import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import Property from "../models/Property.js";

dotenv.config();

const router = express.Router();

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const PROVIDER_OPTIONS = {
  openai: Boolean(process.env.OPENAI_API_KEY),
  gemini: Boolean(process.env.GEMINI_API_KEY),
};

const COZY_STAY_INTENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    trip_mode: {
      type: "string",
      enum: ["beach", "cold", "weekend", "family", "romantic", "luxury", "budget", "generic"],
    },
    query_summary: { type: "string" },
    location: { type: "string" },
    city: { type: "string" },
    state: { type: "string" },
    country: { type: "string" },
    budget_max: { type: "number" },
    property_type: { type: "string" },
    purpose: { type: "string" },
    amenities: {
      type: "array",
      items: { type: "string" },
    },
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    follow_up_needed: { type: "boolean" },
    follow_up_question: { type: "string" },
  },
  required: [
    "trip_mode",
    "query_summary",
    "location",
    "city",
    "state",
    "country",
    "property_type",
    "purpose",
    "amenities",
    "keywords",
    "follow_up_needed",
    "follow_up_question",
  ],
};

const COZY_STAY_REPLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    understanding: { type: "string" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          property_name: { type: "string" },
          location: { type: "string" },
          price_range: { type: "string" },
          key_features: {
            type: "array",
            items: { type: "string" },
          },
          why_it_matches: { type: "string" },
        },
        required: ["property_name", "location", "price_range", "key_features", "why_it_matches"],
      },
    },
    alternative_suggestions: {
      type: "array",
      items: { type: "string" },
    },
    smart_tips: {
      type: "array",
      items: { type: "string" },
    },
    follow_up_question: { type: "string" },
  },
  required: [
    "understanding",
    "recommendations",
    "alternative_suggestions",
    "smart_tips",
    "follow_up_question",
  ],
};

const DESTINATION_HINTS = {
  beach: ["Goa", "Alibaug", "Kovalam", "Varkala", "Puri", "Gokarna"],
  cold: ["Manali", "Shimla", "Auli", "Mussoorie", "Darjeeling", "Munnar"],
  weekend: ["Lonavala", "Goa", "Udaipur", "Mahabaleshwar", "Rishikesh", "Coorg"],
  family: ["Ooty", "Mysore", "Nainital", "Coorg", "Lonavala", "Mahabaleshwar"],
  romantic: ["Udaipur", "Goa", "Coorg", "Alleppey", "Munnar"],
  luxury: ["Goa", "Alibaug", "Jaipur", "Udaipur", "Rishikesh"],
  budget: ["Munnar", "Mahabaleshwar", "Rishikesh", "Ooty", "Lonavala"],
  generic: ["Goa", "Manali", "Udaipur", "Ooty", "Rishikesh"],
};

const REGION_HINTS = {
  "south india": ["Goa", "Coorg", "Ooty", "Munnar", "Kodaikanal", "Alleppey", "Varkala", "Kovalam", "Wayanad", "Chikmagalur"],
  "north india": ["Manali", "Shimla", "Auli", "Mussoorie", "Nainital", "Rishikesh", "Dharamshala"],
  "west india": ["Goa", "Alibaug", "Lonavala", "Mahabaleshwar", "Udaipur"],
  "east india": ["Puri", "Darjeeling", "Shillong", "Gangtok"],
};

const TRIP_MODE_KEYWORDS = {
  beach: ["beach", "sea", "coast", "coastal", "ocean", "waterfront", "shore", "seaside"],
  cold: ["cold", "snow", "winter", "hill", "mountain", "misty", "chilly"],
  weekend: ["weekend", "short trip", "quick trip", "weekdays", "weekday", "getaway", "chill", "relax"],
  family: ["family", "kids", "parents", "relatives", "group"],
  romantic: ["romantic", "couple", "honeymoon", "date", "private", "quiet"],
  luxury: ["luxury", "premium", "high-end", "elite", "villa", "resort", "best"],
  budget: ["budget", "cheap", "affordable", "low cost", "low-budget", "under", "economy"],
};

const PROPERTY_TYPE_KEYWORDS = [
  "villa",
  "apartment",
  "studio",
  "home",
  "house",
  "flat",
  "room",
  "resort",
  "cottage",
  "bungalow",
  "penthouse",
];

const AMENITY_KEYWORDS = [
  "wifi",
  "parking",
  "pool",
  "beach",
  "sea view",
  "ocean view",
  "mountain view",
  "ac",
  "air conditioning",
  "kitchen",
  "breakfast",
  "breakfast included",
  "family rooms",
  "pet friendly",
  "gym",
  "balcony",
  "private pool",
  "sea-facing",
];

const DESCRIPTION_WORD_TARGET = {
  min: 180,
  max: 200,
};

const normalizeBudget = (budget) => {
  if (!budget && budget !== 0) return null;
  if (typeof budget === "number") return budget;
  const parsed = Number(String(budget).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const tokenize = (input) =>
  String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, " ")
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

const uniqueValues = (values) => [...new Set((values || []).filter(Boolean))];

const containsAnyPhrase = (text, phrases) => {
  const haystack = String(text || "").toLowerCase();
  return phrases.some((phrase) => haystack.includes(String(phrase).toLowerCase()));
};

const detectTripMode = (text) => {
  const haystack = String(text || "").toLowerCase();

  for (const [mode, phrases] of Object.entries(TRIP_MODE_KEYWORDS)) {
    if (containsAnyPhrase(haystack, phrases)) {
      return mode;
    }
  }

  return "generic";
};

const detectPropertyType = (text) => {
  const haystack = String(text || "").toLowerCase();
  return PROPERTY_TYPE_KEYWORDS.find((keyword) => haystack.includes(keyword)) || "";
};

const detectAmenities = (text) => {
  const haystack = String(text || "").toLowerCase();
  return AMENITY_KEYWORDS.filter((keyword) => haystack.includes(keyword));
};

const detectBudget = (text) => {
  const haystack = String(text || "").toLowerCase();
  const parsed = normalizeBudget(text);
  if (parsed) return parsed;

  if (containsAnyPhrase(haystack, ["luxury", "premium", "high-end", "expensive", "best"])) return null;
  if (containsAnyPhrase(haystack, ["budget", "cheap", "affordable", "low cost", "low-budget", "under"])) return null;

  return null;
};

const detectRegionalKeywords = (text) => {
  const haystack = String(text || "").toLowerCase();
  const keywords = [];

  for (const [region, places] of Object.entries(REGION_HINTS)) {
    if (haystack.includes(region)) {
      keywords.push(region, ...places);
    }
  }

  return keywords;
};

const inferLocalIntent = (message, locationHint = "") => {
  const combinedText = [message, locationHint].filter(Boolean).join(" ").trim();
  const tripMode = detectTripMode(combinedText);
  const propertyType = detectPropertyType(combinedText);
  const amenities = detectAmenities(combinedText);
  const budgetMax = detectBudget(combinedText);
  const regionalKeywords = detectRegionalKeywords(combinedText);
  const messageTokens = tokenize(combinedText).filter((token) => token.length > 2);
  const locationTokens = tokenize(locationHint).filter((token) => token.length > 2);

  const keywords = uniqueValues([
    ...messageTokens.slice(0, 8),
    ...regionalKeywords,
    ...(tripMode !== "generic" ? DESTINATION_HINTS[tripMode] || [] : []),
    ...(propertyType ? [propertyType] : []),
    ...amenities,
  ]).slice(0, 12);

  const location = locationHint || combinedText.match(/(?:in|around|near|at)\s+([a-zA-Z\s]+)$/i)?.[1]?.trim() || "";

  return {
    trip_mode: tripMode,
    query_summary: combinedText || locationHint || "Cozy Stay search",
    location,
    city: locationTokens[0] || "",
    state: "",
    country: "",
    budget_max: budgetMax,
    property_type: propertyType,
    purpose: tripMode === "weekend" ? "vacation" : tripMode === "family" ? "family stay" : tripMode === "romantic" ? "romantic stay" : "",
    amenities,
    keywords,
    follow_up_needed: false,
    follow_up_question: "",
  };
};

const buildProviders = () => {
  const providers = [];

  if (PROVIDER_OPTIONS.gemini) {
    providers.push({
      name: "gemini",
      client: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
    });
  }

  if (PROVIDER_OPTIONS.openai) {
    providers.push({
      name: "openai",
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    });
  }

  return providers;
};

const providers = buildProviders();

const extractIntentWithOpenAI = async (message, client) => {
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    instructions:
      "You extract Cozy Stay search intent from user text. Return only structured JSON that matches the schema. Classify beach, cold, weekend, family, romantic, luxury, budget, or generic. Set follow_up_needed true if the user did not give enough detail to search well.",
    input: message,
    text: {
      format: {
        type: "json_schema",
        name: "cozy_stay_intent",
        schema: COZY_STAY_INTENT_SCHEMA,
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text);
};

const extractIntentWithGemini = async (message, client) => {
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents:
      "You extract Cozy Stay search intent from user text. Return only JSON matching the provided schema. Classify beach, cold, weekend, family, romantic, luxury, budget, or generic. Set follow_up_needed true if the user did not give enough detail to search well. User text: " +
      message,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: COZY_STAY_INTENT_SCHEMA,
    },
  });

  const raw = response.text || "{}";
  return JSON.parse(raw);
};

const extractIntent = async (message, locationHint = "") => {
  if (!providers.length) {
    return {
      intent: inferLocalIntent(message, locationHint),
      source: "local",
    };
  }

  const lastErrors = [];
  for (const provider of providers) {
    try {
      if (provider.name === "gemini") {
        return {
          intent: await extractIntentWithGemini(message, provider.client),
          source: provider.name,
        };
      }

      return {
        intent: await extractIntentWithOpenAI(message, provider.client),
        source: provider.name,
      };
    } catch (error) {
      lastErrors.push(`${provider.name}: ${error?.message || String(error)}`);
    }
  }

  console.warn("AI providers failed, falling back to local intent detection:", lastErrors.join(" | "));
  return {
    intent: inferLocalIntent(message, locationHint),
    source: "local",
  };
};

const scoreProperty = (property, intent) => {
  const haystack = [
    property.title,
    property.description,
    property.city,
    property.state,
    property.country,
    property.address,
    ...(Array.isArray(property.amenities) ? property.amenities : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;

  const locationTokens = tokenize(
    [intent.location, intent.city, intent.state, intent.country, intent.query_summary, ...(intent.keywords || [])]
      .filter(Boolean)
      .join(" ")
  ).filter((token) => token.length > 2);

  if (locationTokens.length) {
    const matched = locationTokens.some((token) => haystack.includes(token));
    if (matched) score += 5;
  }

  if (intent.budget_max) {
    const price = Number(property.price) || 0;
    if (price <= intent.budget_max) score += 4;
    else if (price <= intent.budget_max * 1.25) score += 2;
    else if (price <= intent.budget_max * 1.5) score += 1;
  }

  if (intent.property_type) {
    const propertyType = String(intent.property_type).toLowerCase();
    if (haystack.includes(propertyType)) score += 3;
  }

  if (Array.isArray(intent.amenities) && intent.amenities.length) {
    const amenityHits = intent.amenities.filter((amenity) => haystack.includes(String(amenity).toLowerCase()));
    score += amenityHits.length * 2;
  }

  if (intent.trip_mode && DESTINATION_HINTS[intent.trip_mode]) {
    const destinationMatch = DESTINATION_HINTS[intent.trip_mode].some((destination) =>
      haystack.includes(destination.toLowerCase())
    );
    if (destinationMatch) score += 4;
  }

  if (intent.purpose) {
    const purpose = String(intent.purpose).toLowerCase();
    if (purpose.includes("family") && /family|kids|spacious|multiple rooms/.test(haystack)) score += 2;
    if (purpose.includes("romantic") && /private|quiet|lake|view|couple/.test(haystack)) score += 2;
    if (purpose.includes("vacation") && /resort|retreat|stay|view|beach|mountain|river/.test(haystack)) score += 1;
  }

  return score;
};

const rankProperties = (properties, intent) => {
  return properties
    .map((property) => ({ ...property, score: scoreProperty(property, intent) }))
    .sort((a, b) => b.score - a.score || Number(a.price) - Number(b.price) || new Date(b.createdAt) - new Date(a.createdAt));
};

const buildPropertyContext = (properties) => {
  if (!properties.length) return "No matching properties were found in the current inventory.";

  return properties
    .map((property, index) => {
      const location = [property.city, property.state, property.country]
        .filter(Boolean)
        .join(", ");
      const amenities = Array.isArray(property.amenities) && property.amenities.length
        ? property.amenities.slice(0, 8).join(", ")
        : "No amenities listed";

      return [
        `${index + 1}. ${property.title}`,
        `Location: ${location || property.address}`,
        `Price: INR ${property.price} per night`,
        `Amenities: ${amenities}`,
        `Description: ${property.description}`,
      ].join("\n");
    })
    .join("\n\n");
};

const buildMongoQuery = (intent) => {
  const filters = [];
  const tripModeKeywords = intent.trip_mode && intent.trip_mode !== "generic" ? DESTINATION_HINTS[intent.trip_mode] || [] : [];
  const tokens = buildSearchTerms({
    ...intent,
    keywords: [...(intent.keywords || []), ...tripModeKeywords],
  });

  if (tokens.length) {
    const locationRegex = new RegExp(tokens.slice(0, 6).join("|"), "i");
    filters.push({
      $or: [
        { title: { $regex: locationRegex } },
        { description: { $regex: locationRegex } },
        { city: { $regex: locationRegex } },
        { state: { $regex: locationRegex } },
        { country: { $regex: locationRegex } },
        { address: { $regex: locationRegex } },
        { amenities: { $elemMatch: { $regex: locationRegex } } },
      ],
    });
  }

  if (intent.budget_max) {
    filters.push({ price: { $lte: intent.budget_max } });
  }

  return filters.length ? { $and: filters } : {};
};

const buildSearchTerms = (intent) => {
  const baseTerms = [
    intent.location,
    intent.city,
    intent.state,
    intent.country,
    intent.query_summary,
    intent.property_type,
    ...(intent.keywords || []),
    ...(Array.isArray(intent.amenities) ? intent.amenities : []),
    ...(intent.trip_mode && intent.trip_mode !== "generic" ? DESTINATION_HINTS[intent.trip_mode] || [] : []),
  ];

  return uniqueValues(
    tokenize(baseTerms.filter(Boolean).join(" "))
      .concat((intent.keywords || []).filter(Boolean).map((value) => String(value).toLowerCase()))
      .filter((token) => token.length > 2)
  );
};

const buildSuggestedDestinations = (tripMode) => {
  const pool = DESTINATION_HINTS[tripMode] || DESTINATION_HINTS.generic;
  return pool.slice(0, 3);
};

const buildLocalUnderstanding = (intent, properties) => {
  const pieces = [];
  if (intent.query_summary) pieces.push(`You are looking for ${intent.query_summary}`);
  if (intent.location && intent.location !== intent.query_summary) pieces.push(`around ${intent.location}`);
  if (intent.property_type) pieces.push(`with a ${intent.property_type} preference`);
  if (intent.trip_mode && intent.trip_mode !== "generic") pieces.push(`for a ${intent.trip_mode} trip`);

  const extra = properties.length ? `I found ${properties.length} matching property option${properties.length > 1 ? "s" : ""}.` : "I did not find an exact inventory match, so I’m suggesting the closest destinations.";

  return `${pieces.join(" ")}. ${extra}`.replace(/\s+/g, " ").trim();
};

const buildMatchReason = (property, intent, score) => {
  const reasons = [];
  const haystack = [
    property.title,
    property.description,
    property.city,
    property.state,
    property.country,
    property.address,
    ...(Array.isArray(property.amenities) ? property.amenities : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (intent.trip_mode && intent.trip_mode !== "generic") {
    const tripHints = DESTINATION_HINTS[intent.trip_mode] || [];
    if (tripHints.some((hint) => haystack.includes(hint.toLowerCase()))) {
      reasons.push(`it matches the ${intent.trip_mode} travel vibe`);
    }
  }

  if (intent.property_type && haystack.includes(String(intent.property_type).toLowerCase())) {
    reasons.push(`it matches your ${intent.property_type} preference`);
  }

  if (Array.isArray(intent.amenities) && intent.amenities.length) {
    const hits = intent.amenities.filter((amenity) => haystack.includes(String(amenity).toLowerCase()));
    if (hits.length) {
      reasons.push(`it includes ${hits.slice(0, 3).join(", ")}`);
    }
  }

  if (intent.budget_max && Number(property.price) <= intent.budget_max) {
    reasons.push(`it stays within your budget`);
  }

  if (reasons.length) return reasons.join("; ");
  if (score > 0) return "it is one of the closest live matches in MongoDB";
  return "it is a reasonable nearby option from the current inventory";
};

const buildLocalReply = ({ intent, properties, destinations }) => {
  const recommendations = properties.slice(0, 3).map((property, index) => {
    const location = [property.city, property.state, property.country]
      .filter(Boolean)
      .join(", ");
    const amenities = Array.isArray(property.amenities) ? property.amenities.slice(0, 6) : [];
    return {
      property_name: property.title || `Property ${index + 1}`,
      location: location || property.address || "Location not listed",
      price_range: `INR ${property.price} per night`,
      key_features: amenities.length ? amenities : ["Live inventory match from MongoDB"],
      why_it_matches: buildMatchReason(property, intent, property.score || 0),
    };
  });

  const smartTips = [];
  if (!intent.location && !intent.city) {
    smartTips.push("Add a city or region next time so I can narrow the map faster.");
  }
  if (!intent.budget_max) {
    smartTips.push("If you mention a budget, I can sort the results much more accurately.");
  }
  if (intent.trip_mode === "beach") {
    smartTips.push("For beach trips, coastal cities such as Goa, Varkala, or Kovalam usually work better than hill stations.");
  } else if (intent.trip_mode === "cold") {
    smartTips.push("For colder getaways, mountain destinations and higher-altitude towns give better results.");
  } else if (intent.trip_mode === "weekend") {
    smartTips.push("Weekend trips work best when you share your departure city and maximum travel time.");
  }
  if (intent.property_type) {
    smartTips.push(`Mention must-have ${intent.property_type} features like wifi, parking, or pool to improve the ranking.`);
  }
  if (!smartTips.length) {
    smartTips.push("A location plus one preference is usually enough for a strong first search.");
  }

  return {
    understanding: buildLocalUnderstanding(intent, properties),
    recommendations,
    alternative_suggestions: uniqueValues(destinations.length ? destinations : buildSuggestedDestinations(intent.trip_mode)),
    smart_tips: smartTips.slice(0, 3),
    follow_up_question:
      !intent.location && !intent.city
        ? "Which city or region should I search first?"
        : !intent.budget_max
          ? "What budget range should I use for the next search?"
          : "Tell me one more detail and I can narrow this down further.",
  };
};

const buildDescriptionContext = (data = {}) => {
  const amenities = Array.isArray(data.amenities) ? data.amenities.filter(Boolean) : [];
  const rules = String(data.rules || "").trim();
  const location = [data.city, data.state, data.country].filter(Boolean).join(", ");

  return {
    title: String(data.title || "this property").trim(),
    location: location || String(data.address || "a convenient location").trim(),
    price: String(data.price || "").trim(),
    totalRooms: String(data.totalRooms || "").trim(),
    amenities,
    rules,
  };
};

const buildLocalDescription = (data = {}) => {
  const context = buildDescriptionContext(data);
  const amenityLine = context.amenities.length
    ? context.amenities.slice(0, 8).join(", ")
    : "comfortable essentials";
  const ruleLine = context.rules
    ? `Guests should note these house rules: ${context.rules}.`
    : "Guests can enjoy a smooth stay with simple, flexible planning.";

  return [
    `Discover ${context.title} in ${context.location}, a thoughtfully prepared stay that blends comfort, convenience, and a welcoming atmosphere for travelers who want a reliable home base.`,
    `With ${context.totalRooms || "well-planned"} rooms and a nightly price of INR ${context.price || "available on request"}, this property is designed to suit guests looking for a practical stay without losing charm or comfort.`,
    `The home highlights amenities such as ${amenityLine}, helping guests settle in with ease whether they are arriving for a weekend escape, a family visit, or a longer work-and-leisure trip.`,
    `Its setting makes it easy to enjoy local attractions, nearby dining, and everyday essentials while still giving you a calm space to come back to after exploring.`,
    ruleLine,
    `Overall, ${context.title} offers a balanced stay experience with useful amenities, a convenient address, and a warm feel that makes it a strong choice for modern travelers.`,
  ].join(" ");
};

const countWords = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;

const trimDescriptionToRange = (text, min = DESCRIPTION_WORD_TARGET.min, max = DESCRIPTION_WORD_TARGET.max) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";

  if (words.length > max) {
    return `${words.slice(0, max).join(" ")}.`;
  }

  if (words.length < min) {
    const padding = [
      "This makes it a practical option for guests who value a smooth, comfortable, and well-organized stay experience.",
      "It is especially appealing for travelers who want a welcoming atmosphere with useful features and a dependable location.",
    ].join(" ");
    return trimDescriptionToRange(`${words.join(" ")} ${padding}`, min, max);
  }

  return words.join(" ");
};

const generateDescriptionWithOpenAI = async (payload, client) => {
  const context = buildDescriptionContext(payload);
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    instructions:
      "You are a hospitality copywriter for Cozy Stay. Write a warm, realistic property description using only the provided details. Do not invent amenities, awards, views, or nearby attractions that are not supported by the input. Keep the final description between 180 and 200 words.",
    input: [
      {
        role: "developer",
        content: "Return only the final property description as plain text.",
      },
      {
        role: "user",
        content: [
          `Property title: ${context.title}`,
          `Location: ${context.location}`,
          `Price: INR ${context.price || "not specified"} per night`,
          `Total rooms: ${context.totalRooms || "not specified"}`,
          `Amenities: ${context.amenities.length ? context.amenities.join(", ") : "not specified"}`,
          `Rules: ${context.rules || "not specified"}`,
        ].join("\n"),
      },
    ],
  });

  const text = String(response.output_text || "").trim();
  return trimDescriptionToRange(text || buildLocalDescription(payload));
};

const generateDescriptionWithGemini = async (payload, client) => {
  const context = buildDescriptionContext(payload);
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are a hospitality copywriter for Cozy Stay.",
              "Write a warm, realistic property description using only the provided details.",
              "Do not invent amenities, awards, views, or nearby attractions that are not supported by the input.",
              "Keep the final description between 180 and 200 words.",
              `Property title: ${context.title}`,
              `Location: ${context.location}`,
              `Price: INR ${context.price || "not specified"} per night`,
              `Total rooms: ${context.totalRooms || "not specified"}`,
              `Amenities: ${context.amenities.length ? context.amenities.join(", ") : "not specified"}`,
              `Rules: ${context.rules || "not specified"}`,
            ].join("\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "text/plain",
    },
  });

  const text = String(response.text || "").trim();
  return trimDescriptionToRange(text || buildLocalDescription(payload));
};

const formatReplyText = (reply) => {
  const recs = (reply.recommendations || [])
    .map((item) => [
      `- Property Name: ${item.property_name}`,
      `  Location: ${item.location}`,
      `  Price Range: ${item.price_range}`,
      `  Key Features: ${Array.isArray(item.key_features) ? item.key_features.join(", ") : ""}`,
      `  Why it matches: ${item.why_it_matches}`,
    ].join("\n"))
    .join("\n\n");

  return [
    "1. Understanding:",
    `- ${reply.understanding}`,
    "",
    "2. Recommendations:",
    recs || "- No exact property match found yet.",
    "",
    "3. Alternative Suggestions:",
    (reply.alternative_suggestions || []).map((item) => `- ${item}`).join("\n") || "- Share one more detail and I can suggest similar destinations.",
    "",
    "4. Smart Tips:",
    (reply.smart_tips || []).map((item) => `- ${item}`).join("\n") || "- Add a budget or location for more accurate results.",
    reply.follow_up_question ? "" : "",
    reply.follow_up_question ? `Follow-up: ${reply.follow_up_question}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const generateReplyWithOpenAI = async ({ intent, properties, destinations }, client) => {
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    instructions:
      "You are the Cozy Stay AI real-estate assistant. Respond in a friendly, practical way. Use only the provided property inventory. Do not invent listings, prices, or availability. If there is no exact match, ask a focused follow-up question and suggest nearby destinations from the supplied list only. Keep the response concise and structured.",
    input: [
      {
        role: "developer",
        content: `Return JSON that matches this schema exactly. Suggested destinations you may use: ${destinations.join(", ") || "none"}.`,
      },
      {
        role: "user",
        content: [
          `User request: ${intent.query_summary}`,
          `Intent: ${JSON.stringify(intent)}`,
          `Inventory:\n${buildPropertyContext(properties)}`,
        ].join("\n\n"),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "cozy_stay_reply",
        schema: COZY_STAY_REPLY_SCHEMA,
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text);
};

const generateReplyWithGemini = async ({ intent, properties, destinations }, client) => {
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are the Cozy Stay AI real-estate assistant.",
              "Return JSON that matches the provided schema exactly.",
              "Do not invent properties, prices, or availability.",
              `Suggested destinations you may use: ${destinations.join(", ") || "none"}.`,
              `User request: ${intent.query_summary}`,
              `Intent: ${JSON.stringify(intent)}`,
              `Inventory:\n${buildPropertyContext(properties)}`,
            ].join("\n\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: COZY_STAY_REPLY_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}");
};

const generateReply = async (payload) => {
  const destinations = buildSuggestedDestinations(payload.intent.trip_mode);
  const lastErrors = [];

  if (!providers.length) {
    return {
      reply: buildLocalReply({ ...payload, destinations }),
      source: "local",
    };
  }

  for (const provider of providers) {
    try {
      if (provider.name === "gemini") {
        return {
          reply: await generateReplyWithGemini({ ...payload, destinations }, provider.client),
          source: provider.name,
        };
      }

      return {
        reply: await generateReplyWithOpenAI({ ...payload, destinations }, provider.client),
        source: provider.name,
      };
    } catch (error) {
      lastErrors.push(`${provider.name}: ${error?.message || String(error)}`);
    }
  }

  console.warn("AI providers failed, falling back to local assistant:", lastErrors.join(" | "));
  return {
    reply: buildLocalReply({ ...payload, destinations }),
    source: "local",
  };
};

router.post("/assistant", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    const location = String(req.body?.location || req.body?.city || "").trim();

    if (!message && !location) {
      return res.status(400).json({
        error: "Please provide a question or at least a location.",
      });
    }

    const intentResult = await extractIntent(message || location, location);
    const intent = intentResult.intent || intentResult;
    const query = buildMongoQuery(intent);
    const properties = await Property.find(query)
      .select("title description city state country address price totalRooms amenities location images createdAt")
      .lean();

    const ranked = rankProperties(properties, intent).slice(0, 6);
    const finalReply = await generateReply({
      intent,
      properties: ranked,
    });

    res.json({
      reply: formatReplyText(finalReply.reply || finalReply),
      properties: ranked,
      intent,
      mode: finalReply.source || intentResult.source || providers[0]?.name || "local",
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    const fallbackIntent = inferLocalIntent(req.body?.message || "", req.body?.location || req.body?.city || "");
    const query = buildMongoQuery(fallbackIntent);
    const properties = await Property.find(query)
      .select("title description city state country address price totalRooms amenities location images createdAt")
      .lean();
    const ranked = rankProperties(properties, fallbackIntent).slice(0, 6);
    const fallbackReply = buildLocalReply({
      intent: fallbackIntent,
      properties: ranked,
      destinations: buildSuggestedDestinations(fallbackIntent.trip_mode),
    });

    res.json({
      reply: formatReplyText(fallbackReply),
      properties: ranked,
      intent: fallbackIntent,
      mode: "local",
    });
  }
});

router.post("/generate-description", async (req, res) => {
  try {
    const data = req.body;
    if (!data?.title && !data?.address && !data?.city) {
      return res.status(400).json({
        error: "Please provide the property details before generating a description.",
      });
    }

    if (providers.length) {
      const lastErrors = [];

      for (const provider of providers) {
        try {
          if (provider.name === "gemini") {
            const description = await generateDescriptionWithGemini(data, provider.client);
            return res.json({
              description,
              mode: provider.name,
              wordCount: countWords(description),
            });
          }

          const description = await generateDescriptionWithOpenAI(data, provider.client);
          return res.json({
            description,
            mode: provider.name,
            wordCount: countWords(description),
          });
        } catch (error) {
          lastErrors.push(`${provider.name}: ${error?.message || String(error)}`);
        }
      }

      console.warn("Description providers failed, using local generator:", lastErrors.join(" | "));
    }

    const description = trimDescriptionToRange(buildLocalDescription(data));

    res.json({
      description,
      mode: "local",
      wordCount: countWords(description),
    });
  } catch (error) {
    console.error(error);
    const description = trimDescriptionToRange(buildLocalDescription(req.body || {}));
    res.json({
      description,
      mode: "local",
      wordCount: countWords(description),
    });
  }
});

export default router;
