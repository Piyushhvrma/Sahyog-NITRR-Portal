import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import sahyogLogo from "../assets/sahyog-logo.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <img
            src={sahyogLogo}
            alt="Sahyog Club Logo"
            className="navbar-logo"
          />

          <div className="brand-title-box">
            <span className="brand-text">
              SAHYOG - The Mentorship Club
            </span>

            <span className="brand-subtitle">
              National Institute of Technology, Raipur
            </span>
          </div>

          <div className="home-wrapper">
            <span className="home-badge">⌂</span>
            <span className="home-label">HOME</span>
          </div>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="navbar-links">

          {/* SHOW ONLY AFTER LOGIN */}
          {user && (
            <>
              <Link to="/events" className="navbar-link">
                Events
              </Link>

              <Link to="/about" className="navbar-link">
                About Us
              </Link>

              <Link to="/blood-request" className="navbar-link blood-link">
                Blood Request
              </Link>

              <span className="navbar-user">
                Welcome, {user?.name?.split(" ")[0]}
              </span>
            </>
          )}
        </div>

        {/* PROFILE ICON */}
        <Link
          to={user ? "/profile" : "/login"}
          className="profile-circle"
          title={user ? "Profile" : "Login"}
        >
          👤
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;