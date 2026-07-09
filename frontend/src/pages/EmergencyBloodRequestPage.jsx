import React, { useState } from "react";
import { submitBloodRequest } from "../api";

const EmergencyBloodRequestPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    requestDetails: "",
    document: null,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, text: "" });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: name === "document" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus({ type: null, text: "" });

      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("requestDetails", formData.requestDetails);

      if (formData.document) {
        data.append("document", formData.document);
      }

      const result = await submitBloodRequest(data);

      if (result.success) {
        setStatus({
          type: "success",
          text: "Blood request submitted successfully!",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          bloodGroup: "",
          requestDetails: "",
          document: null,
        });

        const fileInput = document.getElementById("document");
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Failed to submit blood request.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emergency-blood-page">
      <section className="emergency-blood-card">
        <div className="emergency-blood-header">
          <div className="emergency-blood-icon">🚨</div>

          <span className="emergency-blood-badge">Urgent Blood Support</span>

          <h1>Emergency Blood Request</h1>

          <p>
            Fill the details carefully. Your request will be sent directly to the
            SAHYOG team for quick review.
          </p>
        </div>

        {status.text && (
          <div className={`emergency-status ${status.type}`}>
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="emergency-blood-form">
          <input
            type="text"
            name="name"
            placeholder="Patient / Requester Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address optional"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Contact Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <textarea
            name="requestDetails"
            placeholder="Mention illness, required blood group, units needed, urgency, hospital address, patient condition, and extra details..."
            value={formData.requestDetails}
            onChange={handleChange}
            required
          />

          <div className="emergency-upload-box">
            <label>📄 Upload Valid Document / Prescription Photo</label>
            <input
              id="document"
              type="file"
              name="document"
              accept="image/*,.pdf"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="emergency-submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Blood Request"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default EmergencyBloodRequestPage;