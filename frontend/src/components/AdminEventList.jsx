import React, { useEffect, useState } from "react";
import { fetchEvents, deleteEvent } from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminEventList = ({ adminPassword }) => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [selectedEventId, setSelectedEventId] = useState(null);

  const loadEvents = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data || []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load events.",
      });
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async () => {
    if (!selectedEventId) return;

    try {
      await deleteEvent(selectedEventId, adminPassword);

      setStatus({
        type: "success",
        message: "Event deleted successfully.",
      });

      setSelectedEventId(null);
      loadEvents();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete event.",
      });
      setSelectedEventId(null);
    }
  };

  return (
    <div className="admin-manage-card">
      <h2>🎉 Manage Events</h2>

      <StatusMessage type={status.type} message={status.message} />

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((event) => (
          <div className="admin-list-item" key={event._id}>
            <div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </div>

            <button
              className="admin-delete-btn"
              onClick={() => setSelectedEventId(event._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}

      <ConfirmModal
        open={!!selectedEventId}
        title="Delete Event?"
        message="This will delete the event from MongoDB. In the backend upgrade, we will also delete its Cloudinary image."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedEventId(null)}
      />
    </div>
  );
};

export default AdminEventList;