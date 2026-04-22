import express from "express";
import { GoogleGenAI } from "@google/genai";
import Property from "../models/Property.js";

const router = express.Router();

const cozyStaySystemPrompt = `
You are an intelligent AI Real Estate Assistant for a platform called "Cozy Stay".

Your goal is to help users discover the best homes, rentals, and travel destinations based on their needs.

CORE RESPONSIBILITIES:
1. Understand user intent: buy, rent, stay, vacation, investment, budget, and preferences
2. Recommend relevant homes, properties, and destinations using only the provided property inventory
3. Ask smart follow-up questions if input is unclear
4. Provide structured, practical, and realistic suggestions
5. Avoid hallucination — if exact matches are unavailable, clearly say so and suggest alternatives

USER INPUT YOU HANDLE:
- Location: city, area, state, country
- Budget: low, medium, luxury, or exact amount
- Property type or travel style
- Purpose: stay, vacation, work trip, family trip, investment
- Amenities: wifi, pool, parking, kitchen, pet-friendly, etc.

RESPONSE FORMAT:
1. Understanding:
- Summarize what the user wants

2. Recommendations:
- Property Name
- Location
- Price Range
- Key Features
- Why it matches user needs

3. Alternative Suggestions:
- Suggest 1 to 2 similar locations or destinations

4. Smart Tips:
- Give practical advice such as best areas, pricing expectations, seasonality, or suitability

BEHAVIOR RULES:
- Be concise but helpful
- Do NOT invent properties, prices, reviews, or availability
- Use only the supplied inventory for property recommendations
- If location is missing, ask for it first
- If the request is vague, ask focused follow-up questions
- Friendly, helpful, smart tone
`;

const buildInventoryContext = (properties) => {
  if (!properties.length) {
    return "No matching properties were found in the current Cozy Stay inventory.";
  }

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
        `Address: ${property.address}`,
        `Price per night: INR ${property.price}`,
        `Rooms: ${property.totalRooms}`,
        `Amenities: ${amenities}`,
      ].join("\n");
    })
    .join("\n\n");
};

const normalizeBudget = (budget) => {
  if (!budget) return null;
  if (typeof budget === "number") return budget;
  const parsed = Number(String(budget).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatAmenityList = (amenities) => {
  if (!Array.isArray(amenities) || !amenities.length) {
    return "No amenities listed";
  }

  return amenities.slice(0, 6).join(", ");
};

const buildPropertySummary = (property) => {
  const location = [property.city, property.state, property.country]
    .filter(Boolean)
    .join(", ");

  return [
    `- Property Name: ${property.title}`,
    `  Location: ${location || property.address}`,
    `  Price Range: INR ${property.price} per night`,
    `  Key Features: ${formatAmenityList(property.amenities)}`,
    `  Why it matches: It is a current Cozy Stay listing that fits the search filters.`,
  ].join("\n");
};

const buildFallbackReply = ({
  message,
  location,
  city,
  state,
  country,
  budget,
  purpose,
  propertyType,
  amenities,
  properties,
}) => {
  const messageText = String(message || "").toLowerCase();
  const locationLabel = [location, city, state, country].filter(Boolean).join(", ");
  const budgetLabel = budget ? ` with a ${budget} budget` : "";
  const purposeLabel = purpose ? ` for ${purpose}` : "";
  const propertyLabel = propertyType ? ` ${propertyType}` : " stay";
  const userIntent =
    message?.trim() ||
    `a${budgetLabel}${purposeLabel}${propertyLabel}${
      locationLabel ? ` in ${locationLabel}` : ""
    }`;

  const isColdTrip =
    /cold|cool|chill|winter|snow|snowfall|snowy|misty/.test(messageText);
  const isWeekendTrip = /weekend|short trip|2 day|2-day|3 day|3-day/.test(
    messageText
  );
  const isFamilyTrip = /family|kids|children/.test(messageText);
  const isRomanticTrip = /romantic|couple|honeymoon|anniversary/.test(messageText);
  const isBudgetTrip = /budget|cheap|affordable|low cost|low-cost/.test(
    messageText
  );
  const isLuxuryTrip = /luxury|premium|high end|high-end|villa/.test(messageText);

  const destinationPool = isColdTrip
    ? [
        "Manali",
        "Shimla",
        "Auli",
        "Mussoorie",
        "Darjeeling",
        "Munnar",
      ]
    : isRomanticTrip
      ? ["Udaipur", "Goa", "Munnar", "Coorg", "Alleppey", "Jaipur"]
      : isFamilyTrip
        ? ["Lonavala", "Mahabaleshwar", "Ooty", "Nainital", "Mysore", "Coorg"]
        : isLuxuryTrip
          ? ["Udaipur", "Goa", "Jaipur", "Alibaug", "Kodaikanal", "Rishikesh"]
          : ["Goa", "Manali", "Udaipur", "Ooty", "Jaipur", "Munnar"];

  const chosenDestinations = destinationPool.slice(0, 3);
  const coldTripNote = isColdTrip
    ? "- For a cold weekend, higher altitude places are usually the safest bet."
    : "- Share your ideal climate and I can narrow this down further.";
  const tripTypeNote = isWeekendTrip
    ? "- For a weekend trip, focus on places with good road or flight access."
    : "- Tell me if this is a weekend break, family trip, or romantic trip for sharper suggestions.";

  const recommendations = properties.length
    ? properties.slice(0, 3).map(buildPropertySummary).join("\n\n")
    : isColdTrip
      ? [
          `- ${chosenDestinations[0]}: a strong choice for cool weather and scenic stays.`,
          `- ${chosenDestinations[1]}: good for a short mountain break with comfortable stays.`,
          `- ${chosenDestinations[2]}: ideal if you want a quieter, colder escape.`,
        ].join("\n")
      : locationLabel
        ? `- I could not find an exact match in the current inventory.\n- Share your budget, property type, or must-have amenities so I can narrow it down further.`
        : `- Please share a city, area, or country first so I can suggest the right homes and destinations.`;

  const alternativeSuggestions = properties.length
    ? Array.from(
        new Set(
          properties
            .map((property) => property.city)
            .filter(Boolean)
            .filter((cityName) => cityName.toLowerCase() !== String(city || "").toLowerCase())
        )
      )
        .slice(0, 2)
        .map((cityName) => `- ${cityName}`)
        .join("\n") || "- Share one more detail and I can suggest similar destinations."
    : chosenDestinations
        .slice(1, 3)
        .filter((destination) => !locationLabel || destination.toLowerCase() !== locationLabel.toLowerCase())
        .slice(0, 2)
        .map((destination) => `- ${destination}`)
        .join("\n") || "- Share one more detail and I can suggest similar destinations.";

  const smartTips = [
    budget ? `- Keep an eye on ${budget} and nearby areas for better value.` : (isBudgetTrip ? "- Budget trips work best when you compare stays a little outside the main tourist zone." : "- Add a budget so I can narrow down realistic options faster."),
    amenities ? "- Mention must-have amenities next time, such as wifi, parking, or pool." : "- Mention must-have amenities like wifi, parking, or pool for sharper matches.",
    locationLabel ? `- In ${locationLabel}, compare places close to transport and local attractions.` : (isColdTrip ? "- Look for stays near valleys or viewpoints if you want the best cold-weather experience." : "- Start with a location first for the most helpful recommendations."),
    coldTripNote,
    tripTypeNote,
    isFamilyTrip ? "- Family stays are usually better near calm neighborhoods and easy-access markets." : null,
    isRomanticTrip ? "- For couples, smaller scenic stays often feel better than crowded tourist hubs." : null,
  ].filter(Boolean).join("\n");

  return [
    "1. Understanding:",
    `- You are looking for ${userIntent}.`,
    "",
    "2. Recommendations:",
    recommendations,
    "",
    "3. Alternative Suggestions:",
    alternativeSuggestions,
    "",
    "4. Smart Tips:",
    smartTips,
  ].join("\n");
};

const buildFilters = ({ message, location, city, state, country, budget }) => {
  const filters = [];
  const locationText = [location, city, state, country, message]
    .filter(Boolean)
    .join(" ");

  if (locationText.trim()) {
    const regex = new RegExp(locationText.split(/\s+/).join("|"), "i");
    filters.push({
      $or: [
        { title: { $regex: regex } },
        { address: { $regex: regex } },
        { city: { $regex: regex } },
        { state: { $regex: regex } },
        { country: { $regex: regex } },
      ],
    });
  }

  const numericBudget = normalizeBudget(budget);
  if (numericBudget) {
    filters.push({ price: { $lte: numericBudget } });
  }

  return filters.length ? { $and: filters } : {};
};

router.post("/assistant", async (req, res) => {
  try {
    const {
      message,
      location,
      city,
      state,
      country,
      budget,
      purpose,
      propertyType,
      amenities,
    } = req.body || {};

    if (!message?.trim() && !location?.trim() && !city?.trim()) {
      return res.status(400).json({
        error: "Please provide a user message or at least a location.",
      });
    }
    const filters = buildFilters({
      message,
      location,
      city,
      state,
      country,
      budget,
    });

    const properties = await Property.find(filters)
      .select("title city state country address price totalRooms amenities")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: buildFallbackReply({
          message,
          location,
          city,
          state,
          country,
          budget,
          purpose,
          propertyType,
          amenities,
          properties,
        }),
        properties,
        mode: "fallback",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const inventoryContext = buildInventoryContext(properties);
    const userNeed = [
      `User message: ${message || "Not provided"}`,
      `Location: ${location || city || state || country || "Not provided"}`,
      `Budget: ${budget || "Not provided"}`,
      `Purpose: ${purpose || "Not provided"}`,
      `Property type: ${propertyType || "Not provided"}`,
      `Amenities: ${Array.isArray(amenities) ? amenities.join(", ") : amenities || "Not provided"}`,
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${cozyStaySystemPrompt}

CURRENT PROPERTY INVENTORY:
${inventoryContext}

USER REQUIREMENTS:
${userNeed}

Return a helpful answer in the exact Cozy Stay response format.`,
    });

    res.json({
      reply: response.text,
      properties,
      mode: "ai",
    });
  } catch (err) {
    console.error("AI assistant error:", err);
    res.json({
      reply: buildFallbackReply({
        message: req.body?.message,
        location: req.body?.location,
        city: req.body?.city,
        state: req.body?.state,
        country: req.body?.country,
        budget: req.body?.budget,
        purpose: req.body?.purpose,
        propertyType: req.body?.propertyType,
        amenities: req.body?.amenities,
        properties: [],
      }),
      mode: "fallback",
    });
  }
});

router.post("/generate-description", async (req, res) => {
  try {
    const data = req.body;

    const templates = [
      `Experience a comfortable stay at this ${data.title} located in ${data.address}. Perfectly priced at INR ${data.price} per night, this property offers ${data.totalRooms} rooms with modern amenities like ${data.amenities.join(", ")}. Ideal for families and travelers seeking convenience and comfort.`,
      `Welcome to your perfect getaway in ${data.address}. This ${data.title} features ${data.totalRooms} rooms and essential amenities including ${data.amenities.join(", ")}. At just INR ${data.price} per night, it is a great choice for a relaxing stay.`,
      `Discover a cozy stay at this ${data.title} in ${data.address}. With ${data.totalRooms} rooms and facilities like ${data.amenities.join(", ")}, this property offers a pleasant experience at INR ${data.price} per night.`,
    ];

    const description =
      templates[Math.floor(Math.random() * templates.length)];

    res.json({ description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate description" });
  }
});

export default router;
