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
    setIsSubmitting(true);
    setStatus({ type: null, text: "" });

    if (!formData.category || !formData.message) {
      setStatus({
        type: "error",
        text: "Please select a category and describe your concern.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://sahyog-backend-topb.onrender.com/api/support",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
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
        text: `Submission failed: ${
          error.response?.data?.message || "Please try again later."
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="help-clean-page">
      <div className="help-clean-card">
        <div className="help-clean-header">
          <div className="help-clean-icon">❤️</div>
          <h1>Connect With SAHYOG Team</h1>
          <p>
            Share your concern with the student support team. You may use your
            name or stay anonymous. Only add contact details if you want a
            follow-up.
          </p>
        </div>

        {status.text && (
          <div className={`help-status ${status.type}`}>
            {status.text}
          </div>
        )}

        <form className="help-clean-form" onSubmit={handleSubmit}>
          <div className="help-form-row">
            <div className="help-field">
              <label>Name / Alias</label>
              <input
                type="text"
                name="name"
                placeholder="Optional"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="help-field">
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

          <div className="help-field">
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

          <div className="help-field">
            <label>Your Concern</label>
            <textarea
              name="message"
              placeholder="Write what you are facing. Keep it simple and honest."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="help-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SahyogSupportPage;