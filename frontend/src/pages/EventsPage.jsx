import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { fetchEvents, likeEvent } from "../api.js";

const EventCard = ({
  event,
  user,
  onLike,
  onOpenEvent,
  onOpenImage,
}) => {
  const currentUserId = user?.id || user?._id || null;

  const isLikedByCurrentUser =
    Boolean(currentUserId) &&
    event.likes?.some(
      (like) => String(like) === String(currentUserId)
    );

  const description = event.description || "";

  const shortDescription =
    description.length > 125
      ? `${description.slice(0, 125).trim()}...`
      : description;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(event._id);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    onOpenImage(event.imageUrl);
  };

  return (
    <article className="event-premium-card">
      <button
        type="button"
        className="event-premium-image-button"
        onClick={handleImageClick}
        aria-label={`Open image for ${event.title}`}
      >
        <img
          src={event.imageUrl}
          alt={event.title}
          className="event-premium-image"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/900x600/e0f2fe/0f172a?text=SAHYOG+Event";
          }}
        />

        <span className="event-image-overlay-label">
          View Photo
        </span>
      </button>

      <div className="event-premium-body">
        <div className="event-premium-top-row">
          <span className="event-premium-badge">
            SAHYOG Event
          </span>

          <time className="event-premium-date">
            {new Date(
              event.createdAt || event.updatedAt
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>

        <h2>{event.title}</h2>

        <p className="event-premium-preview">
          {shortDescription}
        </p>

        <div className="event-premium-actions">
          <button
            type="button"
            className="event-read-more-btn"
            onClick={() => onOpenEvent(event)}
          >
            Read More
          </button>

          <button
            type="button"
            className={`event-like-btn ${
              isLikedByCurrentUser ? "liked" : ""
            }`}
            onClick={handleLikeClick}
          >
            <span className="event-like-icon">👍</span>

            <span>
              {isLikedByCurrentUser ? "Liked" : "Like"}
            </span>

            <strong>{event.likes?.length || 0}</strong>
          </button>
        </div>
      </div>
    </article>
  );
};

const EventDetailModal = ({
  event,
  user,
  onClose,
  onLike,
  onOpenImage,
}) => {
  if (!event) return null;

  const currentUserId = user?.id || user?._id || null;

  const isLikedByCurrentUser =
    Boolean(currentUserId) &&
    event.likes?.some(
      (like) => String(like) === String(currentUserId)
    );

  return (
    <div
      className="event-detail-modal"
      onClick={onClose}
      role="presentation"
    >
      <article
        className="event-detail-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="event-detail-close"
          onClick={onClose}
          aria-label="Close event"
        >
          ×
        </button>

        <button
          type="button"
          className="event-detail-image-wrap"
          onClick={() => onOpenImage(event.imageUrl)}
        >
          <img
            src={event.imageUrl}
            alt={event.title}
            className="event-detail-image"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1000x650/e0f2fe/0f172a?text=SAHYOG+Event";
            }}
          />
        </button>

        <div className="event-detail-content">
          <div className="event-detail-meta">
            <span className="event-premium-badge">
              SAHYOG Event
            </span>

            <time>
              {new Date(
                event.createdAt || event.updatedAt
              ).toLocaleString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          <h1>{event.title}</h1>

          <div className="event-detail-description">
            {event.description}
          </div>

          <div className="event-detail-footer">
            <button
              type="button"
              className={`event-like-btn event-detail-like ${
                isLikedByCurrentUser ? "liked" : ""
              }`}
              onClick={() => onLike(event._id)}
            >
              <span className="event-like-icon">👍</span>

              <span>
                {isLikedByCurrentUser ? "Liked" : "Like"}
              </span>

              <strong>{event.likes?.length || 0}</strong>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const loadEvents = async (page = 1) => {
    try {
      setIsLoading(true);
      setError("");

      const data = await fetchEvents({
        page,
        limit: pagination.limit,
      });

      setEvents(data.events || []);

      setPagination(
        data.pagination || pagination
      );
    } catch (err) {
      setError(
        err.message || "Failed to fetch events."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
  }, []);

  useEffect(() => {
    const shouldLockScroll =
      Boolean(selectedEvent) ||
      Boolean(selectedImage);

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent, selectedImage]);

  const handleLike = async (eventId) => {
    if (!isLoggedIn) {
      alert("You must be logged in to like an event.");
      navigate("/login");
      return;
    }

    try {
      const updatedLikesArray = await likeEvent(
        eventId
      );

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event._id === eventId
            ? {
                ...event,
                likes: updatedLikesArray,
              }
            : event
        )
      );

      setSelectedEvent((currentEvent) => {
        if (
          !currentEvent ||
          currentEvent._id !== eventId
        ) {
          return currentEvent;
        }

        return {
          ...currentEvent,
          likes: updatedLikesArray,
        };
      });
    } catch (err) {
      alert(
        err.message || "Failed to like event."
      );
    }
  };

  return (
    <div className="events-page-v2">
      <section className="events-main-shell">
        <header className="events-top-heading">
          <span>SAHYOG Gallery</span>

          <h1>Club Events</h1>

          <p>
            Explore student initiatives, workshops,
            social activities and memorable SAHYOG
            moments from NIT Raipur.
          </p>
        </header>

        {isLoading && (
          <div className="events-empty-box">
            Loading events...
          </div>
        )}

        {error && (
          <div className="events-empty-box events-error-box">
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          events.length === 0 && (
            <div className="events-empty-box">
              No events posted yet.
            </div>
          )}

        {!isLoading &&
          !error &&
          events.length > 0 && (
            <div className="events-premium-grid">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  user={user}
                  onLike={handleLike}
                  onOpenEvent={setSelectedEvent}
                  onOpenImage={setSelectedImage}
                />
              ))}
            </div>
          )}

        {pagination.totalPages > 1 && (
          <div className="events-pagination">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() =>
                loadEvents(pagination.page - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                loadEvents(pagination.page + 1)
              }
            >
              Next
            </button>
          </div>
        )}
      </section>

      <EventDetailModal
        event={selectedEvent}
        user={user}
        onClose={() => setSelectedEvent(null)}
        onLike={handleLike}
        onOpenImage={setSelectedImage}
      />

      {selectedImage && (
        <div
          className="event-image-modal"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Event preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default EventsPage;