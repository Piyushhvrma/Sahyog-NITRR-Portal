import React from "react";
import { Link } from "react-router-dom";

const BloodRequestPage = () => {
  return (
    <div className="blood-page">
      <div className="blood-card">
        <div className="blood-top">
          <div className="blood-icon">🩸</div>
          <h1>Blood Request Portal</h1>
          <p className="blood-quote">“रक्तदान महादान — One donation can save many lives.”</p>
          <p className="blood-subtitle">
            A SAHYOG initiative to connect urgent blood needs with willing helpers.
          </p>
        </div>

        <Link to="/blood-request/emergency" className="blood-main-btn">
          🚨 Emergency Blood Request
        </Link>

        <div className="blood-secondary-grid">
          <div className="blood-secondary-card">
            <span>🤝</span>
            <h3>Donor Network</h3>
            <p>Connect with available student donors.</p>
          </div>

          <div className="blood-secondary-card">
            <span>🔔</span>
            <h3>Instant Alerts</h3>
            <p>Notify volunteers during urgent cases.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestPage;