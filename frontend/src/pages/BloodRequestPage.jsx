import React from "react";
import { Link } from "react-router-dom";

const BloodRequestPage = () => {
  return (
    <div className="blood-page">
      <div className="blood-card">
        <h1>🩸 Blood Request Portal</h1>

        <p className="blood-subtitle">
          SAHYOG emergency blood assistance system for students.
        </p>

        <div className="blood-features blood-three">
          <Link to="/blood-request/emergency" className="blood-feature blood-main-card">
            Emergency Request
          </Link>

          <div className="blood-feature">
            Donor Network
          </div>

          <div className="blood-feature">
            Instant Notifications
          </div>
        </div>

        <button className="blood-coming-btn">
          Backend Integration Coming Soon
        </button>
      </div>
    </div>
  );
};

export default BloodRequestPage;