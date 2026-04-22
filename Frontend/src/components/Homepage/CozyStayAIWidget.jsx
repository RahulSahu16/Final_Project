import { useEffect, useState } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { getProperties } from "../../services/propertyService";

const starterMessages = [
  {
    role: "assistant",
    content:
      "Hi, I am your Cozy Stay AI assistant. Ask me about homes, rentals, budgets, amenities, or travel destinations, and I will help you narrow down the best options.",
  },
];

const quickPrompts = [
  "Find me a budget apartment in Goa",
  "Suggest a family stay with wifi and parking",
  "Best luxury villas for a weekend trip",
];

const destinationLibrary = {
  cold: [
    {
      name: "Manali",
      location: "Himachal Pradesh, India",
      price: "Budget to mid-range",
      features: "Snowy views, mountain stays, cafes, and scenic drives",
      why: "Best when you want a classic cold-weather weekend with easy stay options.",
    },
    {
      name: "Shimla",
      location: "Himachal Pradesh, India",
      price: "Budget to mid-range",
      features: "Cool weather, walkable mall road, family-friendly stays",
      why: "Good for a short trip with predictable climate and comfortable hotels.",
    },
    {
      name: "Auli",
      location: "Uttarakhand, India",
      price: "Mid-range to premium",
      features: "High-altitude chill, mountain views, quiet atmosphere",
      why: "Ideal if you want a colder and more scenic escape than a city break.",
    },
  ],
  weekend: [
    {
      name: "Lonavala",
      location: "Maharashtra, India",
      price: "Budget to premium",
      features: "Quick road trip, green views, villas and homestays",
      why: "Great for a relaxed weekend without complicated travel planning.",
    },
    {
      name: "Goa",
      location: "India",
      price: "Budget to luxury",
      features: "Beach stays, cafes, nightlife, and plenty of rental options",
      why: "Works well if you want a flexible weekend with many stay styles.",
    },
    {
      name: "Udaipur",
      location: "Rajasthan, India",
      price: "Mid-range to luxury",
      features: "Lake views, heritage stays, romantic atmosphere",
      why: "Strong choice for a short trip with a polished travel experience.",
    },
  ],
  family: [
    {
      name: "Ooty",
      location: "Tamil Nadu, India",
      price: "Budget to mid-range",
      features: "Pleasant weather, family stays, sightseeing spots",
      why: "Works well for families that want a calm and comfortable hill station.",
    },
    {
      name: "Mysore",
      location: "Karnataka, India",
      price: "Budget to mid-range",
      features: "Easy transport, family attractions, relaxed pace",
      why: "Good for families who want value, convenience, and simple planning.",
    },
    {
      name: "Nainital",
      location: "Uttarakhand, India",
      price: "Budget to premium",
      features: "Lake views, family-friendly hotels, scenic walks",
      why: "Nice if you want a classic family hill-station break.",
    },
  ],
  romantic: [
    {
      name: "Udaipur",
      location: "Rajasthan, India",
      price: "Mid-range to luxury",
      features: "Lake views, heritage stays, intimate atmosphere",
      why: "A strong pick for romantic getaways and special occasions.",
    },
    {
      name: "Coorg",
      location: "Karnataka, India",
      price: "Mid-range",
      features: "Coffee estates, quiet stays, scenic weather",
      why: "Best if you want a peaceful couple-friendly escape.",
    },
    {
      name: "Alleppey",
      location: "Kerala, India",
      price: "Mid-range to premium",
      features: "Backwaters, houseboats, calm vibe",
      why: "A memorable choice when you want a slower, more private trip.",
    },
  ],
  luxury: [
    {
      name: "Goa",
      location: "India",
      price: "Premium to luxury",
      features: "Beach villas, private pools, high-end dining",
      why: "Best if you want plenty of luxury stay choices and nightlife.",
    },
    {
      name: "Alibaug",
      location: "Maharashtra, India",
      price: "Premium to luxury",
      features: "Private villas, beach access, quick weekend access",
      why: "Great for upscale short breaks close to major cities.",
    },
    {
      name: "Jaipur",
      location: "Rajasthan, India",
      price: "Mid-range to luxury",
      features: "Heritage hotels, curated experiences, upscale stays",
      why: "Good when you want a polished, premium trip with culture.",
    },
  ],
  budget: [
    {
      name: "Munnar",
      location: "Kerala, India",
      price: "Budget to mid-range",
      features: "Tea gardens, peaceful stays, cool climate",
      why: "Strong value for travelers who want scenery without luxury pricing.",
    },
    {
      name: "Mahabaleshwar",
      location: "Maharashtra, India",
      price: "Budget to mid-range",
      features: "Weekend-friendly, scenic viewpoints, plenty of stays",
      why: "Good when you want a low-stress trip at a reasonable budget.",
    },
    {
      name: "Rishikesh",
      location: "Uttarakhand, India",
      price: "Budget to mid-range",
      features: "River views, adventure, yoga stays",
      why: "A flexible option for budget travelers who want an active trip.",
    },
  ],
  generic: [
    {
      name: "Goa",
      location: "India",
      price: "Budget to luxury",
      features: "Beach stays, rentals, and a wide choice of homes",
      why: "Useful when you want a flexible destination with many stay types.",
    },
    {
      name: "Manali",
      location: "Himachal Pradesh, India",
      price: "Budget to mid-range",
      features: "Hill-station stays, scenic weather, weekend-friendly options",
      why: "Good for users who want mountains or cooler weather.",
    },
    {
      name: "Udaipur",
      location: "Rajasthan, India",
      price: "Mid-range to luxury",
      features: "Lake-side stays, heritage homes, romantic atmosphere",
      why: "A versatile pick for both leisure and premium travel.",
    },
  ],
};

const parseQuestion = (question) => {
  const text = String(question || "").toLowerCase();
  return {
    text,
    wantsCold: /cold|cool|chill|winter|snow|snowy|misty/.test(text),
    wantsWeekend: /weekend|short trip|2 day|2-day|3 day|3-day/.test(text),
    wantsFamily: /family|kids|children/.test(text),
    wantsRomantic: /romantic|couple|honeymoon|anniversary/.test(text),
    wantsLuxury: /luxury|premium|high end|high-end|villa/.test(text),
    wantsBudget: /budget|cheap|affordable|low cost|low-cost/.test(text),
    wantsTravel: /trip|travel|vacation|holiday|stay|destination/.test(text),
  };
};

const pickDestinationGroup = (flags) => {
  if (flags.wantsCold) return destinationLibrary.cold;
  if (flags.wantsRomantic) return destinationLibrary.romantic;
  if (flags.wantsFamily) return destinationLibrary.family;
  if (flags.wantsLuxury) return destinationLibrary.luxury;
  if (flags.wantsBudget) return destinationLibrary.budget;
  if (flags.wantsWeekend) return destinationLibrary.weekend;
  return destinationLibrary.generic;
};

const formatHomes = (homes) => {
  if (!homes.length) return "";

  return homes.slice(0, 3).map((home) => {
    const location = [home.city, home.state, home.country].filter(Boolean).join(", ");
    const amenities = Array.isArray(home.amenities) && home.amenities.length
      ? home.amenities.slice(0, 5).join(", ")
      : "No amenities listed";

    return [
      `- Property Name: ${home.title}`,
      `  Location: ${location || home.address}`,
      `  Price Range: INR ${home.price} per night`,
      `  Key Features: ${amenities}`,
      `  Why it matches: It is a live Cozy Stay listing that fits your search.`,
    ].join("\n");
  }).join("\n\n");
};

const buildLocalReply = (question, homes) => {
  const flags = parseQuestion(question);
  const destinations = pickDestinationGroup(flags);
  const locationHint = question.match(/\bin\s+([a-zA-Z\s]+)/i)?.[1]?.trim();
  const understanding = locationHint
    ? `- You are looking for a stay or destination in ${locationHint}.`
    : flags.wantsCold
      ? "- You want a cold place for a weekend trip."
      : flags.wantsFamily
        ? "- You want a family-friendly stay."
        : flags.wantsRomantic
          ? "- You want a romantic getaway."
          : flags.wantsLuxury
            ? "- You want a luxury stay."
            : flags.wantsBudget
              ? "- You want a budget-friendly option."
              : "- You want travel or stay suggestions from Cozy Stay.";

  const liveHomes = formatHomes(
    homes.filter((home) => {
      const haystack = [
        home.title,
        home.city,
        home.state,
        home.country,
        home.address,
        ...(Array.isArray(home.amenities) ? home.amenities : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (locationHint && !haystack.includes(locationHint.toLowerCase())) {
        return false;
      }

      if (flags.wantsBudget && Number(home.price) > 15000) {
        return false;
      }

      return true;
    })
  );

  const recommendations = liveHomes || destinations.slice(0, 3).map((destination) => [
    `- Property Name: ${destination.name}`,
    `  Location: ${destination.location}`,
    `  Price Range: ${destination.price}`,
    `  Key Features: ${destination.features}`,
    `  Why it matches: ${destination.why}`,
  ].join("\n")).join("\n\n");

  const alternatives = destinations.slice(1, 3).map((destination) => `- ${destination.name} (${destination.location})`).join("\n");
  const smartTips = [
    flags.wantsCold ? "- For cold trips, choose higher-altitude areas and check road access before booking." : "- If you give me a location, I can narrow the answer much faster.",
    flags.wantsWeekend ? "- Weekend trips work best when travel time is short and check-in is flexible." : "- Tell me the budget and purpose for sharper recommendations.",
    flags.wantsBudget ? "- For budget stays, compare places slightly outside the main tourist zone." : "- Mention must-have amenities like wifi, parking, or pool if they matter.",
  ].join("\n");

  return [
    "1. Understanding:",
    understanding,
    "",
    "2. Recommendations:",
    recommendations,
    "",
    "3. Alternative Suggestions:",
    alternatives || "- Share one more detail and I can suggest similar destinations.",
    "",
    "4. Smart Tips:",
    smartTips,
  ].join("\n");
};

function CozyStayAIWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(starterMessages);
  const [loading, setLoading] = useState(false);
  const [homes, setHomes] = useState([]);

  useEffect(() => {
    let mounted = true;

    getProperties()
      .then((items) => {
        if (mounted) setHomes(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (mounted) setHomes([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sendQuestion = async (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);

    setTimeout(() => {
      const reply = buildLocalReply(trimmed, homes);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
      setLoading(false);
    }, 250);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f2937] text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105"
        aria-label="Open Cozy Stay AI assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed bottom-20 right-4 z-50 w-[320px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/60 bg-[#fbf8f1] shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:w-[340px]">
          <div className="flex items-center justify-between bg-[#b5ae9d] px-4 py-3 text-black">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-none">Cozy Stay AI</p>
                <p className="text-[11px] text-black/70">
                  Real estate helper and travel guide
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-black transition hover:bg-black/10"
              aria-label="Close Cozy Stay AI assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[38vh] space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-5 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-[#e8e2d4] text-black"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#e8e2d4] px-3 py-2 text-[13px] text-black/70">
                  Thinking about the best Cozy Stay options...
                </div>
              </div>
            ) : null}

          </div>

          <div className="border-t border-black/10 px-3 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-black transition hover:border-black/20 hover:bg-[#f5f1e8]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendQuestion();
                  }
                }}
                rows={2}
                placeholder="Ask a short question..."
                className="min-h-[48px] flex-1 resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 text-[13px] text-black outline-none transition focus:border-black/30"
              />
              <button
                type="button"
                onClick={() => sendQuestion()}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#836f39] text-white transition hover:bg-[#493a0f]"
                aria-label="Send question to Cozy Stay AI"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CozyStayAIWidget;
