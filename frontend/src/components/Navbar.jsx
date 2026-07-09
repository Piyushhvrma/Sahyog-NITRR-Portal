import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import sahyogLogo from "../assets/sahyog-logo.png";

import {
  fetchNotificationCount,
  downloadSupportCSVUrl,
  downloadFeedbackCSVUrl,
  downloadBloodRequestCSVUrl,
} from "../api";

import { connectSocket } from "../socket/socket.js";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const loadUnreadCount = async () => {
    try {
      const data = await fetchNotificationCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();

    const socket = connectSocket();

    socket.on("new-announcement", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new-announcement");
    };
  }, [user]);

  const profileInitial = user?.name?.charAt(0)?.toUpperCase() || "👤";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <img src={sahyogLogo} alt="Sahyog Logo" className="navbar-logo" />

          <div className="brand-title-box">
            <span className="brand-text">
              SAHYOG - The Student Wellbeing Club
            </span>
            <span className="brand-subtitle">NIT Raipur</span>
          </div>
        </Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className="navbar-link">
          Home
        </Link>

        <Link to="/blood-request" className="navbar-link blood-link">
          Blood Request
        </Link>

        {user && (
          <>
            <Link to="/help" className="navbar-link help-link">
              Sahyog Help
            </Link>

            <Link to="/events" className="navbar-link">
              Events
            </Link>

            <Link to="/about" className="navbar-link">
              About Us
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {!user && (
          <div className="auth-links">
            <Link to="/login" className="navbar-link">
              Login
            </Link>

            <Link to="/signup" className="navbar-link">
              Register
            </Link>
          </div>
        )}

        {user && (
          <>
            <Link to="/notifications" className="notification-bell">
              🔔
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </Link>

            <div className="profile-section-wrapper">
              <div
                className="profile-trigger-zone"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <button className="profile-circle" type="button">
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    profileInitial
                  )}
                </button>

                <span className="navbar-user">
                  {user?.name?.split(" ")[0]}
                </span>
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/rooms"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Join Room
                  </Link>

                  <Link
                    to="/coming-soon/team-sahyog"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Team Sahyog
                  </Link>

                  <Link
                    to="/coming-soon/campus-view"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Campus View
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        style={{ color: "#6ee7ff" }}
                      >
                        Admin Panel
                      </Link>

                      <a
                        href={downloadSupportCSVUrl()}
                        download
                        onClick={() => setShowProfileMenu(false)}
                        style={{ color: "#6ee7ff" }}
                      >
                        Export Support 📊
                      </a>

                      <a
                        href={downloadFeedbackCSVUrl()}
                        download
                        onClick={() => setShowProfileMenu(false)}
                        style={{ color: "#6ee7ff" }}
                      >
                        Export Feedback 📝
                      </a>

                      <a
                        href={downloadBloodRequestCSVUrl()}
                        download
                        onClick={() => setShowProfileMenu(false)}
                        style={{ color: "#6ee7ff" }}
                      >
                        Export Blood Requests 🩸
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;