import React, { useState } from "react";
import axios from "axios";

const SahyogSupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    category: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: null, text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    isSubmitting(true);
    setStatus({ type: null, text: "" });

    // Validate fields before making the request
    if (!formData.category || !formData.message) {
      setStatus({
        type: "error",
        text: "Please select a classification category and write down your concern description.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // 👇 FIXED: Added the explicit endpoint route path extension here 👇
      const response = await axios.post("https://sahyog-backend-topb.onrender.com/api/support", formData);

      if (response.data.success) {
        setStatus({
          type: "success",
          text: "Your support request has been delivered privately. The SAHYOG team is on it! ❤️",
        });

        // Reset form inputs upon successful delivery
        setFormData({
          name: "",
          contact: "",
          category: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Submission operational fault:", error);
      setStatus({
        type: "error",
        text: `Submission Failed: ${error.response?.data?.message || "Server offline or backend port 4000 blocked."}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="premium-support-page">
      <div className="support-glass-card">
        
        {/* HEADER CONSOLE */}
        <div className="support-header-section">
          <div className="support-badge-icon">❤️</div>
          <h1>Connect With SAHYOG Team</h1>
          <p className="support-desc-p">
            Share your academic concerns, personal hurdles, or situations. 
            You may use an alias name or any contact detail you are fully comfortable sharing. 
            Your confidentiality is strictly protected.
          </p>
        </div>

        {/* NOTIFICATION LAYER */}
        {status.text && (
          <div className={`status-banner-notice ${status.type}`}>
            {status.text}
          </div>
        )}

        {/* INPUT FORM BLOCK */}
        <form className="interactive-support-form" onSubmit={handleSubmit}>
          
          <div className="form-input-row-split">
            <div className="input-group-cell">
              <label htmlFor="name">Identification</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Name or Alias (e.g., Anonymous Student)"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-group-cell">
              <label htmlFor="contact">Secure Contact Endpoint</label>
              <input
                id="contact"
                type="text"
                name="contact"
                placeholder="Email, Phone, Instagram, or 'None'"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group-cell">
            <label htmlFor="category">Problem Space Classification</label>
            <div className="custom-select-wrapper">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">-- Please select an appropriate category --</option>
                <option value="Academic Stress">Academic Stress</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Hostel Problem">Hostel Problem</option>
                <option value="Relationship Problem">Relationship Problem</option>
                <option value="Financial Problem">Financial Problem</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>
          </div>

          <div className="input-group-cell">
            <label htmlFor="message">Elaborate Your Situation</label>
            <textarea
              id="message"
              name="message"
              placeholder="Describe what you are facing right now..."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="support-dispatch-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Dispatching Message..." : "Submit Secure Request →"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default SahyogSupportPage;