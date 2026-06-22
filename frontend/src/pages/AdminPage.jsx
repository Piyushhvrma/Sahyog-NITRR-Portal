import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

import AdminUpload from "../components/AdminUpload.jsx";
import AdminEventUpload from "../components/AdminEventUpload.jsx";
import AdminAnnouncementUpload from "../components/AdminAnnouncementUpload.jsx";
import AdminAnnouncementList from "../components/AdminAnnouncementList.jsx";
import AdminEventList from "../components/AdminEventList.jsx";
import AdminLinksList from "../components/AdminLinksList.jsx";

const ADMIN_PASSWORD = "piyushss";
const ADMIN_EMAIL = "sahyogbloodrequest@gmail.com";

const AdminPage = () => {
  const { user } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  // ===========================
  // EMAIL RESTRICTION
  // ===========================

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div
        className="container"
        style={{
          textAlign: "center",
          paddingTop: "80px",
        }}
      >
        <h2>🚫 Access Denied</h2>

        <p>
          You are not authorized to access the
          admin panel.
        </p>
      </div>
    );
  }

  // ===========================
  // PASSWORD LOGIN
  // ===========================

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setError(
        "Incorrect admin password. Please try again."
      );
    }
  };

  // ===========================
  // ADMIN LOGIN SCREEN
  // ===========================

  if (!isAuthenticated) {
    return (
      <div className="container">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin}>
          <label>Admin Password:</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter admin password"
            style={{
              marginBottom: "1rem",
            }}
          />

          {error && (
            <p
              style={{
                color: "red",
                marginTop: "10px",
              }}
            >
              {error}
            </p>
          )}

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    );
  }

  // ===========================
  // ADMIN DASHBOARD
  // ===========================

  return (
    <div
      className="admin-container"
      style={{
        maxWidth: "900px",
        margin: "2rem auto",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        SAHYOG Admin Dashboard
      </h1>

      <AdminUpload adminPassword={password} />

<hr style={{ margin: "2rem 0" }} />

<AdminLinksList adminPassword={password} />

<hr style={{ margin: "2rem 0" }} />

<AdminEventUpload adminPassword={password} />

<hr style={{ margin: "2rem 0" }} />

<AdminEventList adminPassword={password} />

<hr style={{ margin: "2rem 0" }} />

<AdminAnnouncementUpload adminPassword={password} />

<hr style={{ margin: "2rem 0" }} />

<AdminAnnouncementList adminPassword={password} />
    </div>
    
  );
};

export default AdminPage;