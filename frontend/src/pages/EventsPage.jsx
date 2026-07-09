import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { fetchEvents, likeEvent } from "../api.js";

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="20"
    height="20"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const EventCard = ({ event, user, onLike }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentUserId = user?.id || user?._id || null;

  const isLikedByCurrentUser =
    !!currentUserId &&
    event.likes?.some((like) => String(like) === String(currentUserId));

  const shortDescription =
    event.description.length > 120
      ? event.description.substring(0, 120) + "..."
      : event.description;

  return (
    <div className="event-card-grid">
      <img
        src={event.imageUrl}
        alt={event.title}
        className="event-image-grid"
        onError={(e) => {
          e.target.src =
            "https://placehold.co/600x400/2c3e50/f8f9fa?text=Image+Missing";
        }}
      />

      <div className="event-content-grid">
        <h2>{event.title}</h2>

        <p style={{ whiteSpace: "pre-line" }}>
          {isExpanded ? event.description : shortDescription}
        </p>

        <div className="event-footer">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="read-more-btn"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>

          <button
            onClick={() => onLike(event._id)}
            className={`event-like-btn ${isLikedByCurrentUser ? "liked" : ""}`}
          >
            ❤️ {event.likes?.length || 0} Likes
          </button>
        </div>

        <small>
          Posted on:{" "}
          {new Date(event.createdAt || event.updatedAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const loadEvents = async (page = 1) => {
    try {
      setIsLoading(true);
      setError("");

      const data = await fetchEvents({ page, limit: pagination.limit });

      setEvents(data.events || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError(err.message || "Failed to fetch events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
  }, []);

  const handleLike = async (eventId) => {
    if (!isLoggedIn) {
      alert("You must be logged in to like a post.");
      navigate("/login");
      return;
    }

    try {
      const updatedLikesArray = await likeEvent(eventId);

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event._id === eventId
            ? { ...event, likes: updatedLikesArray }
            : event
        )
      );
    } catch (err) {
      alert(err.message || "Failed to like post.");
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <h2>Loading Events...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="container events-grid-container">
      <h1>SAHYOG - Club Events</h1>

      <div className="events-grid">
        {events.length === 0 ? (
          <p>No events posted yet. Check back soon!</p>
        ) : (
          events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              user={user}
              onLike={handleLike}
            />
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => loadEvents(pagination.page - 1)}
          >
            Previous
          </button>

          <span style={{ fontWeight: "700" }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => loadEvents(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;