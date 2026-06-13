import React from "react";
import { useNavigate } from "react-router-dom";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="help-page">

      <div className="help-container">

        <div className="help-hero">

          <span className="help-badge">
            SAHYOG STUDENT SUPPORT
          </span>

          <h1>
            Support When You Need It Most
          </h1>

          <p>
            Helping students navigate academics,
            wellbeing, career decisions and campus life
            with confidence.
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="help-card-large">

          <div className="help-card-header">
            <div className="help-icon">
              ❤️
            </div>

            <div>
              <h2>Connect With SAHYOG Team</h2>

              <span>
                Official Student Support Network
              </span>
            </div>
          </div>

          <p className="help-description">
            Reach out to student volunteers for guidance,
            support and assistance related to academics,
            wellbeing and campus life.
          </p>

          <div className="help-points">

            <div>✓ Academic Support</div>

            <div>✓ Career Guidance</div>

            <div>✓ Student Welfare</div>

            <div>✓ Campus Assistance</div>

          </div>

          <p className="privacy-note">
            🔒 Feel free to use any name or contact details you are
            comfortable sharing. Your privacy and confidentiality
            are respected.
          </p>

          <button
            className="help-btn"
            onClick={() => navigate("/help/sahyog")}
          >
            Connect With Team →
          </button>

        </div>

        {/* AI CARD */}

        <div className="help-card-small">

          <div className="ai-left">

            <div className="ai-icon">
              🤖
            </div>

            <div>

              <h3>AI Study Assistant</h3>

              <p>
                Get instant help with study planning,
                coding questions and academic doubts.
              </p>

            </div>

          </div>

          <button
            className="help-btn secondary"
            onClick={() => navigate("/help/ai")}
          >
            Launch AI →
          </button>

        </div>

      </div>

    </div>
  );
};

export default HelpPage;