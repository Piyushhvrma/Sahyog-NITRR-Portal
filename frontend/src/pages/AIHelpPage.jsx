import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const AIHelpPage = () => {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

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

      setChat((prev) => [...prev, { sender: "ai", text: res.data.reply }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ I could not connect right now. Please try again later.",
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
    localStorage.removeItem("sahyog_ai_chat");
  };

  return (
    <div className="ai-clean-container">
      <div className="ai-clean-header">
        <div className="ai-clean-left">
          <div className="ai-clean-icon">🤖</div>
          <div>
            <h2>SAHYOG AI Buddy</h2>
            <span>Online Guidance</span>
          </div>
        </div>

        {chat.length > 0 && (
          <button className="ai-clear-btn" onClick={handleClearChat}>
            Clear Chat
          </button>
        )}
      </div>

      <div className="ai-clean-window">
        {chat.length === 0 ? (
          <div className="ai-empty">
            <h3>How can I help?</h3>
            <p>
              Ask about study planning, academic stress, hostel adjustment, or
              general college guidance.
            </p>
          </div>
        ) : (
          chat.map((msg, index) => (
            <div key={index} className={`ai-msg-row ${msg.sender}`}>
              <div className="ai-msg-avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>

              <div className="ai-msg-bubble">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
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

        <button className="ai-send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AIHelpPage;