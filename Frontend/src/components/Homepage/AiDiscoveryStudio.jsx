import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { askCozyStayAssistant } from "../../services/aiService";

const starterMessages = [
  {
    role: "assistant",
    content:
      "Ask me like a travel concierge. Tell me your city, budget, stay type, or mood and I will turn it into filters and show matching homes.",
  },
];

const quickPrompts = [
  "Find me a budget apartment in Goa",
  "Show cold weekend stays",
  "Suggest a family villa with wifi and parking",
];

const getImageUrl = (home) => {
  if (home?.images?.length > 0) {
    return home.images[0].startsWith("http")
      ? home.images[0]
      : `${import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000/uploads"}/${home.images[0]}`;
  }

  return "https://via.placeholder.com/640x480?text=House";
};

function AiDiscoveryStudio() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);

  const sendQuery = async (value = query) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuery("");
    setLoading(true);

    try {
      const data = await askCozyStayAssistant({ message: trimmed });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data?.reply ||
            "1. Understanding:\n- I could not generate a result right now.\n\n2. Recommendations:\n- Try adding a city or budget.\n\n3. Alternative Suggestions:\n- I can search again with more detail.\n\n4. Smart Tips:\n- Better filters mean better results.",
        },
      ]);

      setProperties(Array.isArray(data?.properties) ? data.properties.slice(0, 3) : []);
    } catch (error) {
      const serverMessage =
        error?.response?.data?.error ||
        "Set OPENAI_API_KEY or GEMINI_API_KEY on the backend to enable the AI assistant.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            `1. Understanding:\n- ${serverMessage}\n\n2. Recommendations:\n- Share a city, budget, or property type.\n\n3. Alternative Suggestions:\n- I will try again once you add more detail.\n\n4. Smart Tips:\n- Location + budget gives the best results.`,
        },
      ]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
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
        <div className="fixed bottom-18 right-3 z-50 w-[290px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-white/60 bg-[#fbf8f1] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between bg-[#b5ae9d] px-3 py-2.5 text-black">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-none">Cozy Stay AI</p>
                <p className="text-[10px] text-black/70">Chat and search</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-black transition hover:bg-black/10"
              aria-label="Close Cozy Stay AI assistant"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-[30vh] space-y-2.5 overflow-y-auto px-2.5 py-2.5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-2.5 py-2 text-[12px] leading-4.5 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-[#e8e2d4] text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#e8e2d4] px-2.5 py-2 text-[12px] text-black/70">
                  Searching MongoDB and mapping matches...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-black/10 px-2.5 py-2.5">
            {properties.length ? (
              <div className="mb-2.5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50">
                  Top Matches
                </p>
                <div className="space-y-2">
                  {properties.slice(0, 2).map((property) => (
                    <button
                      key={property._id}
                      type="button"
                      onClick={() => navigate(`/homes/${property._id}`)}
                      className="flex w-full items-center gap-2 rounded-xl border border-black/10 bg-white p-1.5 text-left transition hover:bg-[#f5f1e8]"
                    >
                      <img
                        src={getImageUrl(property)}
                        alt={property.title}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/640x480?text=House";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-black">
                          {property.title}
                        </p>
                        <p className="truncate text-[10px] text-black/55">
                          {property.city}, {property.state}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mb-2 flex flex-wrap gap-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[10px] font-medium text-black transition hover:bg-[#f5f1e8]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery();
                  }
                }}
                rows={2}
                placeholder="Ask a short question..."
                className="min-h-[42px] flex-1 resize-none rounded-2xl border border-black/10 bg-white px-2.5 py-2 text-[12px] text-black outline-none transition focus:border-black/30"
              />
              <button
                type="button"
                onClick={() => sendQuery()}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#836f39] text-white transition hover:bg-[#493a0f]"
                aria-label="Send question to Cozy Stay AI"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AiDiscoveryStudio;
