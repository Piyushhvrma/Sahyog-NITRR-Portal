import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { fetchEvents, likeEvent } from "../api.js";

const EventCard = ({ event, user, onLike, onOpenImage }) => {
  const [expanded, setExpanded] = useState(false);

  const currentUserId = user?.id || user?._id || null;

  const isLikedByCurrentUser =
    !!currentUserId &&
    event.likes?.some((like) => String(like) === String(currentUserId));

  const shouldTrim = event.description?.length > 180;
  const visibleText =
    !expanded && shouldTrim
      ? event.description.slice(0, 180) + "..."
      : event.description;

  return (
    <article className="event-modern-card">
      <div className="event-modern-content">
        <span className="event-badge">SAHYOG Event</span>

        <h2>{event.title}</h2>

        <p>{visibleText}</p>

        <div className="event-modern-actions">
          {shouldTrim && (
            <button
              type="button"
              className="event-read-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Read More"}
            </button>
          )}

          <button
            type="button"
            onClick={() => onLike(event._id)}
            className={`event-like-pill ${
              isLikedByCurrentUser ? "liked" : ""
            }`}
          >
            ❤️ {event.likes?.length || 0} Likes
          </button>
        </div>

        <small>
          Posted on{" "}
          {new Date(event.createdAt || event.updatedAt).toLocaleDateString(
            "en-IN"
          )}
        </small>
      </div>

      <button
        type="button"
        className="event-modern-image-wrap"
        onClick={() => onOpenImage(event.imageUrl)}
      >
        <img
          src={event.imageUrl}
          alt={event.title}
          className="event-modern-image"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/800x600/ffffff/0f172a?text=SAHYOG+Event";
          }}
        />
      </button>
    </article>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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

  return (
    <div className="events-page-v2">
      <section className="events-main-shell">
        <div className="events-top-heading">
          <span>SAHYOG Gallery</span>
          <h1>Club Events</h1>
          <p>
            Explore SAHYOG activities, student initiatives, workshops, and
            community moments from NIT Raipur.
          </p>
        </div>

        {isLoading && <div className="events-empty-box">Loading Events...</div>}

        {error && <div className="events-empty-box">Error: {error}</div>}

        {!isLoading && !error && events.length === 0 && (
          <div className="events-empty-box">No events posted yet.</div>
        )}

        {!isLoading &&
          !error &&
          events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              user={user}
              onLike={handleLike}
              onOpenImage={setSelectedImage}
            />
          ))}

        {pagination.totalPages > 1 && (
          <div className="events-pagination">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => loadEvents(pagination.page - 1)}
            >
              Previous
            </button>

            <span>
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
      </section>

      {selectedImage && (
        <div className="event-image-modal" onClick={() => setSelectedImage(null)}>
          <button type="button">×</button>
          <img src={selectedImage} alt="Event preview" />
        </div>
      )}
    </div>
  );
};

export default EventsPage;