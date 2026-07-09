import React, { useEffect, useState } from "react";
import { fetchEvents, deleteEvent } from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminEventList = () => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [selectedEventId, setSelectedEventId] = useState(null);

  const loadEvents = async (page = 1) => {
    try {
      const data = await fetchEvents({ page, limit: pagination.limit });

      setEvents(data.events || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load events.",
      });
    }
  };

  useEffect(() => {
    loadEvents(1);
  }, []);

  const handleDelete = async () => {
    if (!selectedEventId) return;

    try {
      await deleteEvent(selectedEventId);

      setStatus({
        type: "success",
        message: "Event and image deleted successfully.",
      });

      setSelectedEventId(null);
      loadEvents(pagination.page);
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

      {pagination.totalPages > 1 && (
        <div className="options" style={{ marginTop: "20px" }}>
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => loadEvents(pagination.page - 1)}
          >
            Previous
          </button>

          <button disabled>
            Page {pagination.page} of {pagination.totalPages}
          </button>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => loadEvents(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!selectedEventId}
        title="Delete Event?"
        message="This will delete the event from MongoDB and remove its image from Cloudinary."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedEventId(null)}
      />
    </div>
  );
};

export default AdminEventList;