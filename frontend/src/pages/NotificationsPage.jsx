import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Trash2,
} from "lucide-react";

import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../api";

import {
  connectSocket,
} from "../socket/socket.js";

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
    return "Announcement";
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

const formatNotificationTime = (value) => {
  if (!value) return "Just now";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const notifyNavbar = () => {
  window.dispatchEvent(
    new Event("notification-count-changed")
  );
};

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const loadNotifications = async (
    silent = false
  ) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await fetchNotifications();

      const notificationList = Array.isArray(data)
        ? data
        : data?.notifications || [];

      setNotifications(notificationList);
    } catch (loadError) {
      setError(
        loadError.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const socket = connectSocket();

    const handleNotificationUpdate = () => {
      loadNotifications(true);
    };

    socket.on(
      "new-announcement",
      handleNotificationUpdate
    );

    socket.on(
      "notification-created",
      handleNotificationUpdate
    );

    return () => {
      socket.off(
        "new-announcement",
        handleNotificationUpdate
      );

      socket.off(
        "notification-created",
        handleNotificationUpdate
      );
    };
  }, []);

  const handleOpenNotification = async (item) => {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item._id);

        setNotifications((current) =>
          current.map((notification) =>
            notification._id === item._id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
          )
        );

        notifyNavbar();
      } catch {
        // Detail page can still open.
      }
    }

    navigate(`/notifications/${item._id}`, {
      state: {
        notification: {
          ...item,
          isRead: true,
        },
      },
    });
  };

  const handleDelete = async (
    event,
    notificationId
  ) => {
    event.stopPropagation();

    try {
      setDeletingId(notificationId);

      await deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter(
          (item) => item._id !== notificationId
        )
      );

      notifyNavbar();
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "Notification could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (item) => !item.isRead
      ).length,
    [notifications]
  );

  return (
    <div className="notify-page-v2">
      <section className="notify-phone-card">
        <div className="notify-phone-header">
          <div>
            <span className="notify-small-label">
              SAHYOG Updates
            </span>

            <h1>Notifications</h1>

            <p className="notify-header-description">
              Announcements and your personal
              SAHYOG activity updates.
            </p>
          </div>

          <button
            type="button"
            className={`notify-refresh-btn ${
              refreshing ? "refreshing" : ""
            }`}
            onClick={() =>
              loadNotifications(true)
            }
            disabled={refreshing}
            aria-label="Refresh notifications"
          >
            ↻
          </button>
        </div>

        <div className="notify-summary-row">
          <div>
            <strong>
              {notifications.length}
            </strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>

          <div>
            <strong>
              {notifications.length -
                unreadCount}
            </strong>
            <span>Read</span>
          </div>
        </div>

        <div className="notify-list-heading">
          <div>
            <h2>Inbox</h2>
            <p>Tap an update to open it</p>
          </div>

          {unreadCount > 0 && (
            <span>{unreadCount} new</span>
          )}
        </div>

        <div className="notify-chat-list">
          {loading && (
            <div className="notify-empty-v2">
              <div className="notify-empty-icon">
                ⏳
              </div>

              <h2>
                Loading notifications...
              </h2>
            </div>
          )}

          {!loading && error && (
            <div className="notify-empty-v2 notify-error-state">
              <div className="notify-empty-icon">
                ⚠️
              </div>

              <h2>
                Unable to load notifications
              </h2>

              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  loadNotifications()
                }
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            notifications.length === 0 && (
              <div className="notify-empty-v2">
                <div className="notify-empty-icon">
                  🔕
                </div>

                <h2>No notifications yet</h2>

                <p>
                  Admin announcements and your
                  SAHYOG updates will appear here.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            notifications.map((item) => (
              <article
                key={item._id}
                className={`notify-message-card ${
                  item.isRead
                    ? "read"
                    : "unread"
                }`}
                onClick={() =>
                  handleOpenNotification(item)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    handleOpenNotification(item);
                  }
                }}
              >
                <div
                  className={`notify-avatar notify-avatar-${String(
                    item.type || "SYSTEM"
                  ).toLowerCase()}`}
                >
                  {getNotificationIcon(item.type)}
                </div>

                <div className="notify-message-body">
                  <div className="notify-message-top">
                    <div>
                      <span className="notify-type-label">
                        {getNotificationLabel(
                          item.type
                        )}
                      </span>

                      <h2>
                        {item.title ||
                          "SAHYOG Update"}
                      </h2>
                    </div>

                    <div className="notify-card-tools">
                      <time>
                        {formatNotificationTime(
                          item.createdAt
                        )}
                      </time>

                      <button
                        type="button"
                        className="notify-delete-icon"
                        onClick={(event) =>
                          handleDelete(
                            event,
                            item._id
                          )
                        }
                        disabled={
                          deletingId === item._id
                        }
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p>{item.message}</p>

                  <div className="notify-message-bottom">
                    {!item.isRead ? (
                      <span className="notify-dot">
                        New
                      </span>
                    ) : (
                      <strong>✓ Read</strong>
                    )}

                    <span className="notify-open-label">
                      Open
                    </span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};

export default NotificationsPage;