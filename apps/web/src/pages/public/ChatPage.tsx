import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { chatApi } from "../../lib/api";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for the CIVIX Governance Platform. I can help you with:\n\n- Checking the status of your grievances\n- Understanding the grievance process\n- Answering questions about government services\n- Guidance on submitting a new grievance\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatApi.send(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        toast.error("Too many messages. Please wait a moment.");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-primary text-primary-content rounded-br-md"
                  : "bg-base-200 rounded-bl-md"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <div
                className={`text-xs mt-1 ${
                  msg.role === "user"
                    ? "text-primary-content/60"
                    : "text-base-content/40"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-secondary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-base-200 p-3 rounded-2xl rounded-bl-md">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rate limit notice */}
      <div className="alert alert-info text-xs mb-3">
        <AlertCircle className="h-4 w-4" />
        <span>30 messages per 15 minutes. Please be respectful.</span>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="input input-bordered flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
          maxLength={2000}
        />
        <button
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading || !input.trim()}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
