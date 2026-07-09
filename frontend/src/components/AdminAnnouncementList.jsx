import React, { useEffect, useState } from "react";
import { fetchAnnouncements, deleteAnnouncement } from "../api";

const AdminAnnouncementList = ({ adminPassword }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  const loadAnnouncements = async () => {
    try {
      setError("");
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || "Failed to load announcements.");
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      const data = await deleteAnnouncement(id, adminPassword);
      alert(data.message || "Announcement deleted.");
      loadAnnouncements();
    } catch (err) {
      alert(err.message || "Failed to delete announcement.");
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📢 All Announcements</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {announcements.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        announcements.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #333",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>
              <strong>Category:</strong> {item.category}
            </p>

            <button onClick={() => handleDeleteAnnouncement(item._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAnnouncementList;