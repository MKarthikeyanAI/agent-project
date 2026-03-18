"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import { Copy, Check, Loader2, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Components } from "react-markdown";

// ── Markdown components ───────────────────────────────────────────────────────

const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => (
  <h1 className="mt-2 mb-3 text-2xl font-bold" {...props} />
);
const H2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => (
  <h2 className="mt-2 mb-2 text-xl font-semibold" {...props} />
);
const H3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => (
  <h3 className="mt-2 mb-2 text-lg font-semibold" {...props} />
);
const Paragraph: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = (props) => (
  <p className="mb-3 leading-7 text-sm" {...props} />
);
const UL: React.FC<React.HTMLAttributes<HTMLUListElement>> = (props) => (
  <ul className="mb-3 ml-5 list-disc space-y-1 text-sm" {...props} />
);
const OL: React.FC<React.OlHTMLAttributes<HTMLOListElement>> = (props) => (
  <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm" {...props} />
);
const LI: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = (props) => (
  <li className="leading-6" {...props} />
);
const Anchor: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = (props) => (
  <a
    className="underline underline-offset-2 text-primary hover:opacity-90"
    target="_blank"
    rel="noreferrer noopener"
    {...props}
  />
);
const Blockquote: React.FC<React.BlockquoteHTMLAttributes<HTMLElement>> = (props) => (
  <blockquote
    className="mb-3 border-l-2 border-border pl-3 text-muted-foreground"
    {...props}
  />
);
const Code: Components["code"] = ({ children, className, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  if (!match) {
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-xs" {...props}>
        {children}
      </code>
    );
  }
  return (
    <pre className="mb-3 w-full overflow-x-auto rounded-md bg-muted p-3">
      <code className="text-xs leading-5" {...props}>
        {children}
      </code>
    </pre>
  );
};
const HR: React.FC<React.HTMLAttributes<HTMLHRElement>> = (props) => (
  <hr className="my-4 border-border" {...props} />
);
const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = (props) => (
  <div className="mb-3 overflow-x-auto">
    <table className="w-full border-collapse text-sm" {...props} />
  </div>
);
const TH: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = (props) => (
  <th className="border border-border bg-muted px-2 py-1 text-left" {...props} />
);
const TD: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = (props) => (
  <td className="border border-border px-2 py-1" {...props} />
);

const markdownComponents: Components = {
  h1: H1, h2: H2, h3: H3, p: Paragraph, ul: UL, ol: OL, li: LI,
  a: Anchor, blockquote: Blockquote, code: Code, hr: HR,
  table: Table, th: TH, td: TD,
};

// ── Finance starter prompts ───────────────────────────────────────────────────

const STARTER_PROMPTS = [
  { icon: "📊", label: "Analyse my portfolio risk", prompt: "Analyse my current portfolio risk. What's my overall risk score and how can I reduce it?" },
  { icon: "⚖️", label: "Should I rebalance?", prompt: "Looking at my current holdings, do you think I should rebalance my portfolio? What changes would you suggest?" },
  { icon: "🎯", label: "Help me reach my goals", prompt: "Review my financial goals and tell me if my current SIP and investment pace will get me there on time." },
  { icon: "📈", label: "Best holdings performing", prompt: "Which of my holdings are performing best and worst? Should I trim any winners or cut any losers?" },
  { icon: "🛡️", label: "Diversification advice", prompt: "Is my portfolio well diversified? What asset classes am I missing that could reduce my risk?" },
  { icon: "💡", label: "Investment strategy tips", prompt: "Given my portfolio and risk profile, what investment strategy would you recommend for the next 12 months?" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

type TextPart = { type?: string; text?: string };
type MaybePartsMessage = {
  display?: ReactNode;
  parts?: TextPart[];
  content?: TextPart[];
};

function getMessageText(message: MaybePartsMessage): string {
  const parts = Array.isArray(message.parts)
    ? message.parts
    : Array.isArray(message.content)
    ? message.content
    : [];
  return parts
    .filter((p) => p?.type === "text" && p.text)
    .map((p) => p.text)
    .join("\n");
}

function renderMessageContent(message: MaybePartsMessage): ReactNode {
  if (message.display) return message.display;
  const parts = Array.isArray(message.parts)
    ? message.parts
    : Array.isArray(message.content)
    ? message.content
    : [];
  return parts.map((p, idx) =>
    p?.type === "text" && p.text ? (
      <ReactMarkdown key={idx} components={markdownComponents}>
        {p.text}
      </ReactMarkdown>
    ) : null
  );
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-muted rounded transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted max-w-[80%]">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">AI Advisor is thinking...</span>
    </div>
  );
}

const STORAGE_KEY = "wealthpath-chat-messages";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { messages, sendMessage, status, error, setMessages } = useChat({
    onError: (err) => toast.error(err.message || "Failed to send message"),
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, [setMessages]);

  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat cleared");
  };

  function send(text: string) {
    if (!text.trim() || isStreaming) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: text.trim() }] });
    setInput("");
  }

  const isStreaming = status === "streaming";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 140px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">AI Financial Advisor</h1>
              <p className="text-xs text-muted-foreground">Powered by your live portfolio data</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              Clear chat
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">Error: {error.message || "Something went wrong"}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="py-8">
              <div className="text-center mb-8">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary opacity-60" />
                <p className="font-medium mb-1">Your AI advisor knows your portfolio</p>
                <p className="text-sm text-muted-foreground">
                  Ask anything about your investments, goals, risk, or strategy.
                </p>
              </div>
              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_PROMPTS.map((sp) => (
                  <button
                    key={sp.label}
                    onClick={() => send(sp.prompt)}
                    className="text-left px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors text-sm"
                  >
                    <span className="mr-2">{sp.icon}</span>
                    <span className="font-medium">{sp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const messageText = getMessageText(message as MaybePartsMessage);
              const createdAt = (message as { createdAt?: Date }).createdAt;
              const timestamp = createdAt ? formatTimestamp(new Date(createdAt)) : null;
              return (
                <div
                  key={message.id}
                  className={`group p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                      : "bg-muted max-w-[85%]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : "AI Advisor"}
                      </span>
                      {timestamp && (
                        <span className="text-xs opacity-60">{timestamp}</span>
                      )}
                    </div>
                    {message.role === "assistant" && messageText && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={messageText} />
                      </div>
                    )}
                  </div>
                  <div>{renderMessageContent(message as MaybePartsMessage)}</div>
                </div>
              );
            })
          )}
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <ThinkingIndicator />
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 pt-2 border-t"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your portfolio, goals, risk, or investment strategy..."
            className="flex-1 p-2.5 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            disabled={isStreaming}
          />
          <Button type="submit" disabled={!input.trim() || isStreaming}>
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Thinking
              </>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
