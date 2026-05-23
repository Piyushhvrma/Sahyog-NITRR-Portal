import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import sahyogLogo from "../assets/sahyog-logo.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <img src={sahyogLogo} alt="Sahyog Club Logo" className="navbar-logo" />

          <div className="brand-title-box">
            <span className="brand-text">SAHYOG - The WellBeing Club</span>
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
          <Link to="/blood-request" className="navbar-link blood-link">
            Blood Request
          </Link>

          {user && (
            <>
              <Link to="/events" className="navbar-link">Events</Link>
              <Link to="/about" className="navbar-link">About Us</Link>

              <span className="navbar-user">
                Welcome, {user?.name?.split(" ")[0]}
              </span>

              
            </>
          )}

          {!user && (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link">Register</Link>
            </>
          )}
        </div>

        <div className="profile-menu-wrapper">
          <button
            className="profile-circle"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={user ? "Profile Menu" : "Login"}
          >
            👤
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    Profile Info
                  </Link>

                  <Link to="/coming-soon/my-downloads" onClick={() => setShowProfileMenu(false)}>
                    My Downloads
                  </Link>

                  <Link to="/coming-soon/info-crs-contact" onClick={() => setShowProfileMenu(false)}>
                    Contact CRs
                  </Link>

                  <Link to="/coming-soon/team-informations" onClick={() => setShowProfileMenu(false)}>
                    Team Informations
                  </Link>
                </>
              ) : (
                <Link to="/login" onClick={() => setShowProfileMenu(false)}>
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;