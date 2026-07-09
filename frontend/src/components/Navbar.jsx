import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import sahyogLogo from "../assets/sahyog-logo.png";
import {
  fetchNotificationCount,
  downloadSupportCSVUrl,
} from "../api";

const ADMIN_EMAIL = "sahyogbloodrequest@gmail.com";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const data = await fetchNotificationCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <img src={sahyogLogo} alt="Sahyog Logo" className="navbar-logo" />
          <div className="brand-title-box">
            <span className="brand-text">SAHYOG - The Student Wellbeing Club</span>
            <span className="brand-subtitle">NIT Raipur</span>
          </div>
        </Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/blood-request" className="navbar-link blood-link">Blood Request</Link>

        {user && (
          <>
            <Link to="/help" className="navbar-link help-link">Sahyog Help</Link>
            <Link to="/events" className="navbar-link">Events</Link>
            <Link to="/about" className="navbar-link">About Us</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {!user && (
          <div className="auth-links">
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" className="navbar-link">Register</Link>
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
                <button className="profile-circle">👤</button>
                <span className="navbar-user">{user?.name?.split(" ")[0]}</span>
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    My Profile
                  </Link>

                  <Link to="/coming-soon/my-downloads" onClick={() => setShowProfileMenu(false)}>
                    My Downloads
                  </Link>

                  <Link to="/coming-soon/cr-contact" onClick={() => setShowProfileMenu(false)}>
                    Connect With CR
                  </Link>

                  <Link to="/coming-soon/team-sahyog" onClick={() => setShowProfileMenu(false)}>
                    Team Sahyog
                  </Link>

                  <Link to="/coming-soon/campus-view" onClick={() => setShowProfileMenu(false)}>
                    Campus View
                  </Link>

                  <Link to="/coming-soon/emergency-contacts" onClick={() => setShowProfileMenu(false)}>
                    Emergency Contacts
                  </Link>

                  {user.email === ADMIN_EMAIL && (
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
                        Export Responses 📊
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