import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { uploadProfilePicture } from "../api";
import StatusMessage from "../components/ui/StatusMessage.jsx";

const ProfilePage = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const displayName = user?.name || "SAHYOG User";
  const displayEmail = user?.email || "Email not available";

  const fallbackAvatar = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
    displayName
  )}&backgroundColor=0ea5e9,2563eb,38bdf8&textColor=ffffff`;

  const avatarUrl = previewUrl || user?.profilePictureUrl || fallbackAvatar;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Only JPG, JPEG, PNG and WEBP images are allowed.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "Image size must be less than 2MB.",
      });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus({ type: null, message: "" });
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setStatus({
        type: "error",
        message: "Please select an image first.",
      });
      return;
    }

    try {
      setUploading(true);
      setStatus({ type: null, message: "" });

      const formData = new FormData();
      formData.append("profilePic", selectedImage);

      const data = await uploadProfilePicture(formData);

      updateUser(data.user);

      setSelectedImage(null);
      setPreviewUrl("");

      const input = document.getElementById("profile-picture-input");
      if (input) input.value = "";

      setStatus({
        type: "success",
        message: "Profile picture updated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to upload profile picture.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <img
            src={avatarUrl}
            alt="Profile Avatar"
            className="profile-avatar-img"
          />

          <h1 className="profile-name">{displayName}</h1>

          <p className="profile-role">
            {user?.role === "superadmin"
              ? "Super Admin"
              : user?.role === "admin"
              ? "Admin"
              : "NIT Raipur Member"}
          </p>
        </div>

        <StatusMessage type={status.type} message={status.message} />

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
            <span>Role</span>
            <strong>{user?.role || "student"}</strong>
          </div>

          <div className="profile-info-row">
            <span>Status</span>
            <strong className="active-status">Active</strong>
          </div>
        </div>

        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <label>Update Profile Picture</label>

          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <button
            className="profile-btn"
            onClick={handleUpload}
            disabled={uploading}
            style={{ width: "100%", margin: "12px 0 0" }}
          >
            {uploading ? "Uploading..." : "Upload Profile Picture"}
          </button>
        </div>

        <div className="profile-actions">
          <button className="logout-profile-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;