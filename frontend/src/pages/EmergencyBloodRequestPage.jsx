import React from "react";

const EmergencyBloodRequestPage = () => {
  return (
    <div className="emergency-page">
      <div className="emergency-card">
        <div className="emergency-top">
          <div className="emergency-icon">🚨</div>
          <h1>Emergency Blood Request</h1>
          <p>
            Fill correct patient and student details. This request will later be connected with backend notifications.
          </p>
        </div>

        <form className="emergency-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Student Name</label>
              <input type="text" placeholder="Enter your full name" />
            </div>

            <div className="form-group">
              <label>Branch</label>
              <input type="text" placeholder="Information Technology" />
            </div>

            <div className="form-group">
              <label>Year</label>
              <input type="text" placeholder="3rd Year" />
            </div>

            <div className="form-group">
              <label>Roll Number</label>
              <input type="text" placeholder="Enter roll number" />
            </div>

            <div className="form-group">
              <label>Patient Family Contact</label>
              <input type="tel" placeholder="Enter contact number" />
            </div>

            <div className="form-group">
              <label>Hospital Name</label>
              <input type="text" placeholder="Enter hospital name" />
            </div>
          </div>

          <div className="form-group">
            <label>Request Details</label>
            <textarea
              rows="5"
              placeholder="Mention illness, required blood group, units needed, urgency, hospital address, patient condition, and extra details..."
            ></textarea>
          </div>

          <label className="document-upload">
            <span>📄 Upload Valid Document / Prescription Photo</span>
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