import React from "react";
import { useNavigate } from "react-router-dom";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="help-main-page">
      {/* HERO SECTION */}
      <div className="help-hero-section">
        <div className="hero-text-section">
          <span className="hero-badge">SAHYOG SUPPORT SYSTEM</span>
          <h1>You Don’t Have To Handle Everything Alone.</h1>
          <p>
            Whether it’s stress, academics, career confusion, emotional pressure,
            loneliness, hostel issues, or anything else — SAHYOG is here to support you.
          </p>
        </div>
      </div>

      {/* STACKED CONTENT CONTAINER */}
      <div className="help-stack-container">
        
        {/* PRIMARY MAIN OPTION: HUMAN TEAM CONNECT */}
        <div className="help-glass-card primary-team-card">
          <div className="card-header-row">
            <span className="card-icon">❤️</span>
            <div>
              <h2>Reach SAHYOG Team</h2>
              <p className="card-subtitle-tag">Official Student Support Group</p>
            </div>
          </div>
          
          <p className="card-desc">
            Connect privately and securely with the SAHYOG team. Share your concerns, academic hurdles, 
            or personal situations comfortably. Our team is here to listen and guide you through.
          </p>
          
          <div className="support-points-grid">
            <span className="point-item"><span className="check-mark">✓</span> Academic Support</span>
            <span className="point-item"><span className="check-mark">✓</span> Mental Wellbeing</span>
            <span className="point-item"><span className="check-mark">✓</span> Career Guidance</span>
            <span className="point-item"><span className="check-mark">✓</span> Financial & Personal Concerns</span>
          </div>

          <p className="privacy-disclaimer">
            You may use any name or contact details you feel comfortable sharing. Your privacy is protected.
          </p>

          <button className="help-action-btn reach-team-btn" onClick={() => navigate("/help/sahyog")}>
            Connect with SAHYOG Team →
          </button>
        </div>

        {/* SECONDARY SHORT OPTION: AI HELP */}
        <div className="help-glass-card secondary-ai-card">
          <div className="ai-layout-split">
            <div className="ai-text-block">
              <div className="card-header-row small-gap">
                <span className="card-icon-small">🤖</span>
                <h3>Need Instant Guidance?</h3>
                <span className="ai-mini-badge">Fast Response</span>
              </div>
              <p className="card-desc-small">
                Get quick, anonymous AI-powered assistance for study planning, productivity tips, or coding support.
              </p>
            </div>
            
            <button className="help-action-btn open-ai-btn-small" onClick={() => navigate("/help/ai")}>
              Open AI Help
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;