import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import "../styles2/NotificationPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "x-auth-token": token,
        },
      });

      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notify-page">
      <div className="notify-hero">
        <span className="notify-badge">SAHYOG Updates</span>
        <h1>Notifications</h1>
        <p>
          Stay updated with admin announcements, important notices, and portal
          activity.
        </p>

        <div className="notify-stats">
          <div>
            <strong>{notifications.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>
        </div>
      </div>

      <div className="notify-list">
        {notifications.length === 0 ? (
          <div className="notify-empty">
            <div className="notify-empty-icon">🔔</div>
            <h2>No notifications yet</h2>
            <p>New announcements from SAHYOG will appear here.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              className={`notify-card ${!item.isRead ? "unread" : "read"}`}
            >
              <div className="notify-icon">
                {item.type === "ADMIN" ? "📢" : "✅"}
              </div>

              <div className="notify-content">
                <div className="notify-top-row">
                  <span className="notify-type">
                    {item.type === "ADMIN" ? "Admin Announcement" : "Activity"}
                  </span>

                  {!item.isRead && <span className="notify-new-dot">New</span>}
                </div>

                <h2>{item.title}</h2>
                <p>{item.message}</p>

                <div className="notify-bottom-row">
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {!item.isRead ? (
                    <button
                      className="notify-read-btn"
                      onClick={() => markAsRead(item._id)}
                    >
                      Mark as Read
                    </button>
                  ) : (
                    <span className="notify-read-label">Read</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;