import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle, Sparkles } from "lucide-react";
import { chatApi } from "../../lib/api";
import { toast } from "sonner";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  "How do I submit a grievance?",
  "Check my grievance status",
  "What departments are available?",
  "How does AI classification work?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for the CIVIX Governance Platform. I can help you with:\n\n• Checking the status of your grievances\n• Understanding the grievance process\n• Answering questions about government services\n• Guidance on submitting a new grievance\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatApi.send(msg);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.message, timestamp: new Date() }]);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) { toast.error("Too many messages. Please wait a moment."); }
      else { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", timestamp: new Date() }]); }
    } finally { setLoading(false); }
  };

  const showQuickPrompts = messages.length === 1;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl" style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}>
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">CIVIX AI Assistant</h1>
          <p className="text-xs text-gray-500">Powered by Gemini • Always available</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 mb-6 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.2)" }}>
                <Bot className="h-4.5 w-4.5 text-purple-400" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === "user" ? "order-1" : ""}`}>
              <div
                className={`px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-white text-black rounded-2xl rounded-br-md"
                    : "rounded-2xl rounded-bl-md text-gray-300"
                }`}
                style={msg.role === "assistant" ? { background: "#141414", border: "1px solid rgba(255,255,255,0.08)" } : {}}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className={`text-[11px] mt-1.5 px-1 ${msg.role === "user" ? "text-right text-gray-600" : "text-gray-600"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                <User className="h-4.5 w-4.5 text-black" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.2)" }}>
              <Bot className="h-4.5 w-4.5 text-purple-400" />
            </div>
            <div className="px-4 py-3.5 rounded-2xl rounded-bl-md" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {showQuickPrompts && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Rate limit + Input */}
      <div>
        <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-2.5 px-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>30 messages per 15 minutes</span>
        </div>
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Ask me anything about CIVIX..."
            className="flex-1 px-5 py-3.5 rounded-2xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            maxLength={2000}
          />
          <button
            className="px-5 py-3.5 rounded-2xl bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-30 flex items-center gap-2"
            disabled={loading || !input.trim()}
            onClick={() => handleSend()}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
