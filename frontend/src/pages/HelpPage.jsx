import React from "react";
import { useNavigate } from "react-router-dom";
import supportImage from "../assets/student-support.jpg";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="help-clean-home">
      <section className="help-hero-card">
        <div className="help-content-card">
          <div className="help-text-block">
            <span className="help-home-badge">SAHYOG Student Support</span>

            <h1>Get the right help, at the right time</h1>

            <p className="help-home-subtitle">
              Share your concern safely with the SAHYOG team or use the AI
              assistant for quick academic and study-related guidance.
            </p>

            <p className="help-home-note">
              You may stay anonymous while submitting your concern. Contact
              details are optional and only needed if you want a follow-up.
            </p>

            <div className="help-action-grid">
              <button
                className="help-main-btn"
                onClick={() => navigate("/help/sahyog")}
              >
                ❤️ Contact SAHYOG Team
              </button>

              <button
                className="help-ai-btn"
                onClick={() => navigate("/help/ai")}
              >
                🤖 Open AI Assistant
              </button>
            </div>

            <div className="help-trust-strip">
              <span>Anonymous Support</span>
              <span>Academic Help</span>
              <span>Personal Guidance</span>
            </div>
          </div>

          <div className="help-image-wrap">
            <img
              src={supportImage}
              alt="Student support and guidance"
              className="help-hero-image"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;