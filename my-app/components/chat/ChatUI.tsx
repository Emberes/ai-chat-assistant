"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOrCreateSessionId,
  SESSION_KEY,
  formatSwedishDate,
} from "@/app/lib/chat/storageFormat";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AskAIResponse = {
  answer?: string;
  sessionId?: string;
  responseId?: string;
};

const STORAGE_KEY = "travkollen_chat_v1";
const LAST_ACTIVE_KEY = "travkollen_last_active_v1";
const RESPONSE_ID_KEY = "travkollen_response_id_v1";

function ChatMessageRow({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  const sender = isUser ? "Du" : "🏇🏼TravHjälpen";

  return (
    <div className={`msgRow ${isUser ? "msgRow--user" : "msgRow--bot"}`}>
      <div className={`msgAvatar ${isUser ? "msgAvatar--user" : "msgAvatar--bot"}`}>
        {sender}
      </div>

      <div className={`msgBubble ${isUser ? "msgBubble--user" : "msgBubble--bot"}`}>
        {content}
      </div>
    </div>
  );
}

const initial_message: ChatMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content: "Välkommen till TravHjälpen! Vad kan jag hjälpa dig med?",
};

export default function ChatUI() {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([initial_message]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getOrCreateSessionId();
  });

  const [previousResponseId, setPreviousResponseId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(RESPONSE_ID_KEY) ?? "";
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }

      const savedResponseId = localStorage.getItem(RESPONSE_ID_KEY);
      if (savedResponseId) {
        setPreviousResponseId(savedResponseId);
      }
    } catch (error) {
      console.error("Could not read chat from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    setDateLabel(formatSwedishDate());
  }, []);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Could not save chat to localStorage:", error);
    }
  }, [messages]);

  async function sendMessage(text: string) {
    if (!sessionId) return;

    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/askAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          sessionId,
          previousResponseId: previousResponseId || undefined,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as AskAIResponse;
      console.log("API response:", data);

      const answer =
        (data.answer ?? "").trim() || "Jag fick inget svar. Prova igen.";
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.responseId) {
        setPreviousResponseId(data.responseId);
        localStorage.setItem(RESPONSE_ID_KEY, data.responseId);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Oj, något gick fel. Försök igen senare.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function resetChat() {
    setMessages([initial_message]);
    setInput("");
    setPreviousResponseId("");

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESPONSE_ID_KEY);

      const newSessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, newSessionId);
      setSessionId(newSessionId);
    } catch (error) {
      console.error("Could not clear chat from localStorage:", error);
    }
  }

  function endChat() {
    setMessages([initial_message]);
    setInput("");
    setPreviousResponseId("");

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LAST_ACTIVE_KEY);
      localStorage.removeItem(RESPONSE_ID_KEY);
    } catch (error) {
      console.error("Could not end chat:", error);
    }

    setSessionId("");
    router.push("/");
    console.log("endChat körs");
  }

  const presets = [
    "Hur fungerar Harry Boy?",
    "Hur fungerar V85?",
    "När är spelstopp för veckans stora V85 och V86?",
  ];

  return (
    <section className="chatCard">
      <header className="chatHeader">
        <div className="chatHeader_inner">
          <div className="chatHeader_left">
            <div className="chatHeader_titles">
              <p className="chatHeader_title">TravHjälpen</p>
              <p className="chatHeader_subtitle">TravHjälpen</p>
            </div>
          </div>

          <div className="chatHeader_date">{dateLabel}</div>

          <div className="chatHeader_right">
            <button
              className="chatHeader_homeBtn"
              type="button"
              onClick={() => setShowEndConfirm(true)}
            >
              Startsida
            </button>
          </div>
        </div>
      </header>

      <div className="chatToolbar">
        <button className="chatToolbar_btn" onClick={resetChat} type="button">
          Starta om ↺
        </button>
        <button
          className="chatToolbar_btn"
          type="button"
          onClick={() => setShowEndConfirm(true)}
        >
          Avsluta chatt
        </button>
      </div>

      <div className="chatBody">
        <div ref={listRef} className="chatMessages">
          {messages.map((m) => (
            <ChatMessageRow key={m.id} role={m.role} content={m.content} />
          ))}

          {isLoading && (
            <div className="msgRow msgRow--bot">
              <div className="msgBubble msgBubble--bot">Skriver…</div>
            </div>
          )}
        </div>
      </div>

      <form className="chatForm" onSubmit={handleSubmit}>
        <div className="chatInputWrap">
          <div className="chatPreMsg">
            <p className="chatPreMsg_label">Förslag på frågor:</p>

            <div className="chatPreMsg_buttons">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="chatPreMsg_btn"
                  onClick={() => setInput(p)}
                  disabled={isLoading}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="chatInputRow">
            <label className="srOnly" htmlFor="chat-input">
              Skriv ett meddelande
            </label>

            <textarea
              id="chat-input"
              className="chatInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Skriv din fråga här…"
              rows={2}
            />

            <button
              className="chatSendBtn"
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              Skicka
            </button>
          </div>
        </div>
      </form>

      {showEndConfirm && (
        <div className="confirmOverlay" role="dialog" aria-modal="true">
          <div className="confirmBox">
            <p>Är du säker att du vill avsluta chatten?</p>

            <div className="confirmBtns">
              <button
                type="button"
                className="chatToolbar_btn"
                onClick={() => setShowEndConfirm(false)}
              >
                Avbryt
              </button>

              <button
                type="button"
                className="chatToolbar_btn"
                onClick={() => {
                  setShowEndConfirm(false);
                  endChat();
                }}
              >
                Ja, avsluta
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}