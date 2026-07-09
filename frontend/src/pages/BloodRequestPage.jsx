import React from "react";
import { Link } from "react-router-dom";
import bloodDonationImage from "../assets/blood-donation.jpg";

const BloodRequestPage = () => {
  return (
    <div className="blood-page">
      <section className="blood-hero-card">
        <div className="blood-content-card">
          <div className="blood-text-block">
            <span className="blood-tag">SAHYOG Emergency Support</span>

            <h1>Blood Request Portal</h1>

            <p className="blood-quote">
              “रक्तदान महादान — One donation can save many lives.”
            </p>

            <p className="blood-subtitle">
              Submit urgent blood requirements directly to the SAHYOG team. The
              request will be reviewed and forwarded for quick student support.
            </p>

            <Link to="/blood-request/emergency" className="blood-main-btn">
              🚨 Emergency Blood Request
            </Link>

            <div className="blood-info-strip">
              <span>Fast Review</span>
              <span>Verified Details</span>
              <span>Student Network</span>
            </div>
          </div>

          <div className="blood-image-wrap">
            <img
              src={bloodDonationImage}
              alt="Blood donation support"
              className="blood-hero-image"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BloodRequestPage;