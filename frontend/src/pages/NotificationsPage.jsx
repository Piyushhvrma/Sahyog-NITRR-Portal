import React, { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../api";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="notify-page-v2">
      <section className="notify-phone-card">
        <div className="notify-phone-header">
          <div>
            <span className="notify-small-label">SAHYOG Updates</span>
            <h1>Notifications</h1>
          </div>

          <div className="notify-bell-circle">🔔</div>
        </div>

        <div className="notify-summary-row">
          <div>
            <strong>{notifications.length}</strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>
        </div>

        <div className="notify-chat-list">
          {loading && (
            <div className="notify-empty-v2">
              <div className="notify-empty-icon">⏳</div>
              <h2>Loading notifications...</h2>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="notify-empty-v2">
              <div className="notify-empty-icon">🔕</div>
              <h2>No notifications yet</h2>
              <p>Important SAHYOG updates will appear here.</p>
            </div>
          )}

          {!loading &&
            notifications.map((item) => (
              <div
                key={item._id}
                className={`notify-message-card ${
                  item.isRead ? "read" : "unread"
                }`}
              >
                <div className="notify-avatar">
                  {item.type === "announcement"
                    ? "📢"
                    : item.type === "event"
                    ? "🎉"
                    : item.type === "blood"
                    ? "🩸"
                    : "🔔"}
                </div>

                <div className="notify-message-body">
                  <div className="notify-message-top">
                    <h2>{item.title || "SAHYOG Update"}</h2>

                    {!item.isRead && <span className="notify-dot">New</span>}
                  </div>

                  <p>{item.message}</p>

                  <div className="notify-message-bottom">
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Just now"}
                    </span>

                    {!item.isRead ? (
                      <button onClick={() => handleRead(item._id)}>
                        Mark read
                      </button>
                    ) : (
                      <strong>Read</strong>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default NotificationsPage;