import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const AIHelpPage = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scrolls chat panel downward as messages arrive
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setChat((prev) => [...prev, { sender: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/api/ai/chat", {
        message: userMessage,
      });

      setChat((prev) => [
        ...prev,
        { sender: "ai", text: res.data.reply },
      ]);
    } catch (error) {
      console.error(error);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ *System connection dropped. Please check local server ports.*" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Allows pressing Enter to submit, Shift+Enter to break line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="premium-ai-container">
      {/* HEADER CONSOLE */}
      <div className="ai-console-header">
        <div className="ai-identity">
          <span className="ai-avatar-badge">🤖</span>
          <div className="ai-meta-text">
            <h2>SAHYOG AI Buddy</h2>
            <span className="ai-status-pulse"><span className="pulse-dot"></span> Online Guidance</span>
          </div>
        </div>
        <p className="ai-confidentiality-notice">🔒 Fully Encrypted & Confidential</p>
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
                {/* ReactMarkdown solves the asterisk text styling error */}
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