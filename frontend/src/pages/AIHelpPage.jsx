import React, { useState, useRef, useEffect } from "react";
import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { sendAIMessage } from "../api";
import { AuthContext } from "../context/AuthContext.jsx";
import SourceCitations from "../components/SourceCitations.jsx";

const AIHelpPage = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || user?.id || "anon";
  const [mode, setMode] = useState("general");
  const storageKey = `sahyog_ai_chat:${userId}:${mode}`;

  const [chat, setChat] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedStorageKey, setLoadedStorageKey] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setChat(saved ? JSON.parse(saved) : []);
    } catch {
      setChat([]);
    }
    setLoadedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(chat.slice(-40))
    );
  }, [chat, loadedStorageKey, storageKey]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    setChat((prev) => [...prev, { sender: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const history = chat
        .slice(-6)
        .map((item) => ({
          role: item.sender === "user" ? "user" : "assistant",
          content: item.text,
        }));
      const data = await sendAIMessage(
        userMessage,
        history,
        mode
      );

      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "I could not generate a reply.",
          sources: Array.isArray(data.sources) ? data.sources : [],
          grounded: data.grounded,
          mode: data.mode,
        },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ ${error.message || "I could not connect right now. Please try again later."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    setChat([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="ai-buddy-page">
      <section className="ai-buddy-card">
        <div className="ai-buddy-header">
          <div className="ai-buddy-title">
            <div className="ai-buddy-icon">🤖</div>

            <div>
              <span>Online Guidance</span>
              <h1>SAHYOG AI Buddy</h1>
              <p>
                Ask about study planning, academic stress, hostel adjustment,
                coding doubts, or general college guidance.
              </p>
            </div>
          </div>

          {chat.length > 0 && (
            <button className="ai-clear-btn" onClick={handleClearChat}>
              Clear Chat
            </button>
          )}
        </div>

        <div className="ai-mode-selector" role="group" aria-label="Chat mode">
          <button
            type="button"
            className={mode === "general" ? "active" : ""}
            aria-pressed={mode === "general"}
            onClick={() => setMode("general")}
          >
            General Chat
          </button>
          <button
            type="button"
            className={mode === "college" ? "active" : ""}
            aria-pressed={mode === "college"}
            onClick={() => setMode("college")}
          >
            College Knowledge
          </button>
        </div>

        {mode === "college" && (
          <p className="ai-mode-hint">
            Answers are grounded in approved NIT Raipur documents and include sources.
          </p>
        )}

        <div className="ai-chat-window">
          {chat.length === 0 ? (
            <div className="ai-empty">
              <h3>How can I help?</h3>
              <p>Type your doubt or concern below. Keep it simple and clear.</p>
            </div>
          ) : (
            chat.map((msg, index) => (
              <div key={index} className={`ai-msg-row ${msg.sender}`}>
                <div className="ai-msg-avatar">
                  {msg.sender === "user" ? "👤" : "🤖"}
                </div>

                <div className="ai-msg-bubble">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  {msg.sender === "ai" && (
                    <SourceCitations sources={msg.sources} />
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="ai-msg-row ai">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-msg-bubble">Typing...</div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="ai-input-bar">
          <textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="1"
          />

          <button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
};

export default AIHelpPage;