import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const displayName = user?.name || "SAHYOG User";
  const displayEmail = user?.email || "Email not available";

  const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
    displayName
  )}&backgroundColor=0ea5e9,2563eb,38bdf8&textColor=ffffff`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <img src={avatarUrl} alt="Profile Avatar" className="profile-avatar-img" />

          <h1 className="profile-name">{displayName}</h1>

          <p className="profile-role">NIT Raipur Member</p>
        </div>

        <div className="profile-info">
          <div className="profile-info-row">
            <span>Email</span>
            <strong>{displayEmail}</strong>
          </div>

          <div className="profile-info-row">
            <span>User ID</span>
            <strong>{user?.id || "Not available"}</strong>
          </div>

          <div className="profile-info-row">
            <span>Status</span>
            <strong className="active-status">Active</strong>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-btn">Edit Profile</button>

          <button className="logout-profile-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;