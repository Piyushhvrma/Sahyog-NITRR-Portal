import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const AIHelpPage = () => {
  // CHANGED: initialize from localStorage instead of []
  const [chat, setChat] = useState(() => {
    try {
      const saved = localStorage.getItem("sahyog_ai_chat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  // NEW: persist chat to localStorage on every update
  useEffect(() => {
    localStorage.setItem("sahyog_ai_chat", JSON.stringify(chat));
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setChat((prev) => [...prev, { sender: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://sahyog-backend-topb.onrender.com/api/ai/chat",
        { message: userMessage },
        { withCredentials: true }
      );

      setChat((prev) => [
        ...prev,
        { sender: "ai", text: res.data.reply },
      ]);
    } catch (error) {
      console.error(error);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ *System connection dropped. Please check deployment logs.*" },
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

  // NEW: clear chat handler
  const handleClearChat = () => {
    setChat([]);
    localStorage.removeItem("sahyog_ai_chat");
  };

  return (
    <div className="premium-ai-container">
      {/* HEADER CONSOLE */}
      <div className="ai-console-header">
        <div className="ai-identity">
          <span className="ai-avatar-badge">🤖</span>
          <div className="ai-meta-text">
            <h2>SAHYOG AI Buddy</h2>
            <span className="ai-status-pulse">
              <span className="pulse-dot"></span> Online Guidance
            </span>
          </div>
        </div>
        <div className="ai-header-right">
          <p className="ai-confidentiality-notice">🔒 Fully Encrypted & Confidential</p>
          {/* NEW: Clear chat button */}
          {chat.length > 0 && (
            <button className="clear-chat-btn" onClick={handleClearChat}>
              🗑️ Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* CHAT DISPLAY HUB */}
      <div className="ai-chat-window">
        {chat.length === 0 ? (
          <div className="chat-empty-placeholder">
            <span className="placeholder-art">✨</span>
            <h3>Welcome to Anonymous AI Support</h3>
            <p>Type anything below to start a conversation regarding academic load, scheduling, or coping mechanics.</p>
          </div>
        ) : (
          chat.map((msg, index) => (
            <div key={index} className={`chat-bubble-row ${msg.sender}-row`}>
              <div className="chat-avatar-frame">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div className="chat-bubble-content">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="chat-bubble-row ai-row">
            <div className="chat-avatar-frame">🤖</div>
            <div className="chat-bubble-content loading-bubble">
              <div className="typing-pulse">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* CONTROL CONSOLE INPUT */}
      <div className="ai-input-console">
        <textarea
          placeholder="Type your concern here... (Press Enter to send)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="1"
        />
        <button className="ai-send-action-btn" onClick={sendMessage}>
          Send ⚡
        </button>
      </div>
    </div>
  );
};

export default AIHelpPage;