import React from "react";
import { useNavigate } from "react-router-dom";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="help-clean-home">
      <section className="help-home-hero">
        <span className="help-home-badge">SAHYOG STUDENT SUPPORT</span>

        <h1>Get the right help, at the right time</h1>

        <p>
          Choose student support for personal guidance, or use the AI assistant
          for quick academic and study-related help.
        </p>
      </section>

      <section className="help-option-grid">
        <div className="help-option-card primary">
          <div className="help-option-icon">❤️</div>

          <h2>Connect With SAHYOG Team</h2>

          <p>
            Share your concern with trusted student volunteers. You may stay
            anonymous and share contact details only if you want a follow-up.
          </p>

          <div className="help-option-points">
            <span>Academic stress</span>
            <span>Career guidance</span>
            <span>Campus support</span>
            <span>Personal concerns</span>
          </div>

          <button onClick={() => navigate("/help/sahyog")}>
            Contact Team
          </button>
        </div>

        <div className="help-option-card">
          <div className="help-option-icon">🤖</div>

          <h2>AI Study Assistant</h2>

          <p>
            Ask for study planning, coding doubts, revision strategy, or quick
            academic guidance anytime.
          </p>

          <div className="help-option-points">
            <span>Study plans</span>
            <span>Coding help</span>
            <span>Revision support</span>
            <span>Quick doubts</span>
          </div>

          <button onClick={() => navigate("/help/ai")}>
            Open AI Assistant
          </button>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;