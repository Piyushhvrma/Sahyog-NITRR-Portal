import React, { useState } from "react";
import { submitSupportRequest } from "../api";

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

    if (!formData.category || !formData.message) {
      setStatus({
        type: "error",
        text: "Please select a category and describe your concern.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: null, text: "" });

      const data = await submitSupportRequest(formData);

      if (data.success) {
        setStatus({
          type: "success",
          text: "Your request has been sent privately to the SAHYOG team.",
        });

        setFormData({
          name: "",
          contact: "",
          category: "",
          message: "",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        text: `Submission failed: ${error.message || "Please try again later."}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-request-page">
      <section className="support-request-card">
        <div className="support-request-header">
          <div className="support-request-icon">❤️</div>

          <span className="support-request-badge">Private Student Support</span>

          <h1>Connect With SAHYOG Team</h1>

          <p>
            Share your concern with the student support team. You may use your
            name or stay anonymous. Contact details are optional and only needed
            if you want a follow-up.
          </p>
        </div>

        {status.text && (
          <div className={`support-status ${status.type}`}>{status.text}</div>
        )}

        <form className="support-request-form" onSubmit={handleSubmit}>
          <div className="support-form-row">
            <div className="support-field">
              <label>Name / Alias</label>
              <input
                type="text"
                name="name"
                placeholder="Optional"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="support-field">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                placeholder="Email, phone, Instagram, or leave blank"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="support-field">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Academic Stress">Academic Stress</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Career Guidance">Career Guidance</option>
              <option value="Hostel Problem">Hostel Problem</option>
              <option value="Relationship Problem">Relationship Problem</option>
              <option value="Financial Problem">Financial Problem</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="support-field">
            <label>Your Concern</label>
            <textarea
              name="message"
              placeholder="Write what you are facing. Keep it simple and honest."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="support-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default SahyogSupportPage;