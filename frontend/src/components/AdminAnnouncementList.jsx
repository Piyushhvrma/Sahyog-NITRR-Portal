import React, { useEffect, useState } from "react";
import { fetchAnnouncements, deleteAnnouncement } from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminAnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load announcements.",
      });
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      await deleteAnnouncement(selectedAnnouncementId);

      setStatus({
        type: "success",
        message: "Announcement deleted successfully.",
      });

      setSelectedAnnouncementId(null);
      loadAnnouncements();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete announcement.",
      });
      setSelectedAnnouncementId(null);
    }
  };

  return (
    <div className="admin-manage-card" style={{ marginTop: "30px" }}>
      <h2>📢 All Announcements</h2>

      <StatusMessage type={status.type} message={status.message} />

      {announcements.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        announcements.map((item) => (
          <div className="admin-list-item" key={item._id}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
            </div>

            <button
              className="admin-delete-btn"
              onClick={() => setSelectedAnnouncementId(item._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}

      <ConfirmModal
        open={!!selectedAnnouncementId}
        title="Delete Announcement?"
        message="This will delete the announcement and its connected notifications."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedAnnouncementId(null)}
      />
    </div>
  );
};

export default AdminAnnouncementList;