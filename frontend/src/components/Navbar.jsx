import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  AuthContext,
} from "../context/AuthContext.jsx";

import sahyogLogo from "../assets/sahyog-logo.png";

import {
  fetchNotificationCount,
} from "../api";

import {
  connectSocket,
} from "../socket/socket.js";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  const profileDropdownRef = useRef(null);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "superadmin";

  const loadUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await fetchNotificationCount();

      setUnreadCount(Number(data?.count) || 0);
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return undefined;
    }

    loadUnreadCount();

    const socket = connectSocket();

    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };

    socket.on(
      "new-announcement",
      handleNotificationUpdate
    );

    socket.on(
      "notification-created",
      handleNotificationUpdate
    );

    window.addEventListener(
      "notification-count-changed",
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

      window.removeEventListener(
        "notification-count-changed",
        handleNotificationUpdate
      );
    };
  }, [user?.id]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const closeProfileMenu = () => {
    setShowProfileMenu(false);
  };

  const profileInitial =
    user?.name?.charAt(0)?.toUpperCase() || "👤";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeProfileMenu}
        >
          <img
            src={sahyogLogo}
            alt="Sahyog Logo"
            className="navbar-logo"
          />

          <div className="brand-title-box">
            <span className="brand-text">
              SAHYOG - The Student Wellbeing Club
            </span>

            <span className="brand-subtitle">
              NIT Raipur
            </span>
          </div>
        </Link>
      </div>

      <div className="navbar-center">
        <Link
          to="/"
          className="navbar-link"
          onClick={closeProfileMenu}
        >
          Home
        </Link>

        <Link
          to="/blood-request"
          className="navbar-link blood-link"
          onClick={closeProfileMenu}
        >
          Blood Request
        </Link>

        {user && (
          <>
            <Link
              to="/help"
              className="navbar-link help-link"
              onClick={closeProfileMenu}
            >
              Sahyog Help
            </Link>

            <Link
              to="/events"
              className="navbar-link"
              onClick={closeProfileMenu}
            >
              Events
            </Link>

            <Link
              to="/about"
              className="navbar-link"
              onClick={closeProfileMenu}
            >
              About Us
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {!user && (
          <div className="auth-links">
            <Link
              to="/login"
              className="navbar-link"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="navbar-link"
            >
              Register
            </Link>
          </div>
        )}

        {user && (
          <>
            <div className="notification-bell-container">
              <Link
                to="/notifications"
                className="notification-bell"
                onClick={closeProfileMenu}
                aria-label={`Notifications${
                  unreadCount > 0
                    ? `, ${unreadCount} unread`
                    : ""
                }`}
              >
                <span className="notification-icon">
                  🔔
                </span>
              </Link>

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </div>

            <div
              className="profile-section-wrapper"
              ref={profileDropdownRef}
            >
              <div
                className="profile-trigger-zone"
                onClick={() =>
                  setShowProfileMenu(
                    (current) => !current
                  )
                }
              >
                <button
                  className="profile-circle"
                  type="button"
                >
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
                    onClick={closeProfileMenu}
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/rooms"
                    onClick={closeProfileMenu}
                  >
                    Join Room
                  </Link>

                  <Link
                    to="/coming-soon/team-sahyog"
                    onClick={closeProfileMenu}
                  >
                    Team Sahyog
                  </Link>

                  <Link
                    to="/coming-soon/campus-view"
                    onClick={closeProfileMenu}
                  >
                    Campus View
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeProfileMenu}
                      style={{
                        color: "#6ee7ff",
                      }}
                    >
                      Admin Panel
                    </Link>
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