import React from "react";

const EmergencyBloodRequestPage = () => {
  return (
    <div className="emergency-page">
      <div className="emergency-card">
        <h1>Emergency Blood Request</h1>
        <p className="emergency-subtitle">
          Fill valid patient and student details. Backend notification system will be added later.
        </p>

        <form className="emergency-form">
          <div className="form-grid">
            <input type="text" placeholder="Student Name" />
            <input type="text" placeholder="Branch" />
            <input type="text" placeholder="Year" />
            <input type="text" placeholder="Roll Number" />
            <input type="tel" placeholder="Patient Family Contact Number" />
            <input type="text" placeholder="Hospital Name" />
          </div>

          <textarea
            rows="5"
            placeholder="Write illness/problem, required blood group, units needed, urgency, hospital address, and any extra details..."
          ></textarea>

          <label className="document-upload">
            Upload Valid Document / Prescription Photo
            <input type="file" accept="image/*,.pdf" />
          </label>

          <button type="button" className="submit-request-btn">
            Submit Blood Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyBloodRequestPage;