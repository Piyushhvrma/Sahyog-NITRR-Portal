import React, { useState } from "react";
import { API_BASE_URL } from "../api";

const AdminAnnouncementUpload = ({ adminPassword }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `${API_BASE_URL}/api/announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword,
          },
          body: JSON.stringify({
            title,
            description,
            category,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to create announcement"
        );
      }

      setMessage("✅ Announcement Published Successfully");

      setTitle("");
      setDescription("");
      setCategory("General");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcement-admin-card">
      <h2>📢 Publish Announcement</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Announcement Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>General</option>
          <option>Event</option>
          <option>Blood Donation</option>
          <option>Emergency</option>
          <option>Academic</option>
        </select>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Publishing..."
            : "Publish Announcement"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "15px",
            fontWeight: "600",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AdminAnnouncementUpload;