import React, {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Trash2,
} from "lucide-react";

import {
  deleteNotification,
  fetchNotifications,
  markNotificationAsRead,
} from "../api";

const getNotificationIcon = (type) => {
  const normalizedType = String(
    type || "SYSTEM"
  ).toUpperCase();

  if (normalizedType === "ADMIN") return "📢";
  if (normalizedType === "SUPPORT") return "❤️";
  if (normalizedType === "BLOOD") return "🩸";
  if (normalizedType === "FEEDBACK") return "📝";

  return "🔔";
};

const getNotificationLabel = (type) => {
  const normalizedType = String(
    type || "SYSTEM"
  ).toUpperCase();

  if (normalizedType === "ADMIN") {
    return "Admin Announcement";
  }

  if (normalizedType === "SUPPORT") {
    return "Support Request";
  }

  if (normalizedType === "BLOOD") {
    return "Blood Support";
  }

  if (normalizedType === "FEEDBACK") {
    return "Feedback";
  }

  return "SAHYOG Update";
};

const notifyNavbar = () => {
  window.dispatchEvent(
    new Event("notification-count-changed")
  );
};

const NotificationDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { notificationId } = useParams();

  const [notification, setNotification] =
    useState(
      location.state?.notification || null
    );

  const [loading, setLoading] =
    useState(
      !location.state?.notification
    );

  const [error, setError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchNotifications();

        const notifications = Array.isArray(data)
          ? data
          : data?.notifications || [];

        const selectedNotification =
          notifications.find(
            (item) =>
              item._id === notificationId
          );

        if (!selectedNotification) {
          setError(
            "This notification was not found or may have been deleted."
          );
          return;
        }

        if (!selectedNotification.isRead) {
          await markNotificationAsRead(
            selectedNotification._id
          );

          selectedNotification.isRead = true;

          notifyNavbar();
        }

        setNotification(selectedNotification);
      } catch (loadError) {
        setError(
          loadError.message ||
            "Notification could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!notification) {
      loadNotification();
      return;
    }

    if (!notification.isRead) {
      markNotificationAsRead(notification._id)
        .then(() => {
          setNotification((current) => ({
            ...current,
            isRead: true,
          }));

          notifyNavbar();
        })
        .catch(() => {});
    }
  }, [notificationId]);

  const handleDelete = async () => {
    if (!notification) return;

    try {
      setDeleting(true);

      await deleteNotification(
        notification._id
      );

      notifyNavbar();

      navigate("/notifications", {
        replace: true,
      });
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "Notification could not be deleted."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-detail-page">
        <div className="notification-detail-state">
          <div>⏳</div>
          <h2>Loading notification...</h2>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="notification-detail-page">
        <div className="notification-detail-state">
          <div>⚠️</div>

          <h2>Notification unavailable</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate("/notifications")
            }
          >
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-detail-page">
      <section className="notification-detail-card">
        <div className="notification-detail-actions">
          <button
            type="button"
            className="notification-back-button"
            onClick={() =>
              navigate("/notifications")
            }
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            className="notification-detail-delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={17} />

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>

        <div
          className={`notification-detail-icon notification-detail-${String(
            notification.type || "SYSTEM"
          ).toLowerCase()}`}
        >
          {getNotificationIcon(
            notification.type
          )}
        </div>

        <span className="notification-detail-label">
          {getNotificationLabel(
            notification.type
          )}
        </span>

        <h1>
          {notification.title ||
            "SAHYOG Update"}
        </h1>

        <p className="notification-detail-message">
          {notification.message}
        </p>

        <div className="notification-detail-footer">
          <span>
            {notification.createdAt
              ? new Date(
                  notification.createdAt
                ).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              : "Just now"}
          </span>

          <strong>✓ Read</strong>
        </div>
      </section>
    </div>
  );
};

export default NotificationDetailPage;