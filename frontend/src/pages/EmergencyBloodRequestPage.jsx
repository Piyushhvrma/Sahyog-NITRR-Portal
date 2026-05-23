import React, { useState } from "react";

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

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "document") {
      setFormData({
        ...formData,
        document: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("requestDetails", formData.requestDetails);

      if (formData.document) {
        data.append("document", formData.document);
      }

      const response = await fetch(`${API_BASE_URL}/api/blood-request`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        alert("Blood request submitted successfully!");

        setFormData({
          name: "",
          email: "",
          phone: "",
          bloodGroup: "",
          requestDetails: "",
          document: null,
        });

        document.getElementById("document").value = "";
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Blood request submit error:", error);
      alert("Failed to submit blood request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-page">
      <div className="blood-card">
        <div className="blood-top">
          <div className="blood-icon">🚨</div>
          <h1>Emergency Blood Request</h1>
          <p className="blood-subtitle">
            Fill the details carefully. Your request will be sent directly to the SAHYOG team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="blood-form">
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

          <div className="blood-upload-box">
            <label>📄 Upload Valid Document / Prescription Photo</label>
            <input
              id="document"
              type="file"
              name="document"
              accept="image/*,.pdf"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="blood-main-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Blood Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyBloodRequestPage;