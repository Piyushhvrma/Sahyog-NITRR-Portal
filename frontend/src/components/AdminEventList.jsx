import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

const AdminEventList = ({ adminPassword }) => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const res = await fetch(`${API_BASE_URL}/api/events`);
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-password": adminPassword,
      },
    });

    const data = await res.json();
    alert(data.message);
    fetchEvents();
  };

  return (
    <div className="admin-manage-card">
      <h2>🎉 Manage Events</h2>

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
              onClick={() => deleteEvent(event._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminEventList;