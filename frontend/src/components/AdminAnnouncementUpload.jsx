import React, { useState } from "react";
import { createAnnouncement } from "../api";
import StatusMessage from "./ui/StatusMessage";

const AdminAnnouncementUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3) {
      setStatus({
        type: "error",
        message: "Announcement title must be at least 3 characters.",
      });
      return;
    }

    if (cleanDescription.length < 5 || cleanDescription.length > 5000) {
      setStatus({
        type: "error",
        message:
          "Announcement description must be between 5 and 5000 characters.",
      });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: null, message: "" });

      await createAnnouncement({
        title: cleanTitle,
        description: cleanDescription,
        category,
      });

      setStatus({
        type: "success",
        message: "Announcement published successfully.",
      });

      setTitle("");
      setDescription("");
      setCategory("General");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to publish announcement.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcement-admin-card">
      <h2>📢 Publish Announcement</h2>

      <StatusMessage type={status.type} message={status.message} />

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

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="General">General</option>
          <option value="Event">Event</option>
          <option value="Blood Donation">Blood Donation</option>
          <option value="Emergency">Emergency</option>
          <option value="Academic">Academic</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish Announcement"}
        </button>
      </form>
    </div>
  );
};

export default AdminAnnouncementUpload;