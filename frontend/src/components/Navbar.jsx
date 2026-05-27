import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import sahyogLogo from "../assets/sahyog-logo.png";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="navbar">
      {/* LEFT SECTION: Branding */}
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <img src={sahyogLogo} alt="Sahyog Logo" className="navbar-logo" />
          <div className="brand-title-box">
            <span className="brand-text">SAHYOG - The Student Wellbeing Club</span>
            <span className="brand-subtitle">NIT Raipur</span>
          </div>
        </Link>
      </div>

      {/* CENTER SECTION: Navigation Links */}
      <div className="navbar-center">
        <Link to="/" className="navbar-link">
          Home
        </Link>
        <Link to="/blood-request" className="navbar-link blood-link">
          Blood Request
        </Link>

        {/* These options only show when a user is logged in */}
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

      {/* RIGHT SECTION: Profile & User Actions */}
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
          <div className="profile-section-wrapper">
            <div 
              className="profile-trigger-zone"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <button className="profile-circle">
                👤
              </button>
              <span className="navbar-user">
                {user?.name?.split(" ")[0]}
              </span>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                  Profile
                </Link>
                <Link to="/coming-soon/my-downloads" onClick={() => setShowProfileMenu(false)}>
                  My Downloads
                </Link>
                <Link to="/coming-soon/Contact-Crs" onClick={() => setShowProfileMenu(false)}>
                  Contact CRs
                </Link>
                <Link to="/coming-soon/team-info" onClick={() => setShowProfileMenu(false)}>
                  Team Info
                </Link>

                {/* 👇 ADMIN SECURITY GUARD: Displays ONLY to your designated club email 👇 */}
                {user && user.email === "sahyogbloodrequest@gmail.com" && (
                  <a 
                    href="http://localhost:4000/api/support/download-sheet" 
                    download
                    onClick={() => setShowProfileMenu(false)}
                    style={{ color: "#6ee7ff" }} /* Subtle visual color pop for the admin link */
                  >
                    Export Responses 📊
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;