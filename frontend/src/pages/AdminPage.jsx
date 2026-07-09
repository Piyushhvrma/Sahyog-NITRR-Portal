import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

import AdminUpload from "../components/AdminUpload.jsx";
import AdminEventUpload from "../components/AdminEventUpload.jsx";
import AdminAnnouncementUpload from "../components/AdminAnnouncementUpload.jsx";
import AdminAnnouncementList from "../components/AdminAnnouncementList.jsx";
import AdminEventList from "../components/AdminEventList.jsx";
import AdminLinksList from "../components/AdminLinksList.jsx";
import AdminFeedbackDashboard from "../components/AdminFeedbackDashboard.jsx";
import AdminSupportDashboard from "../components/AdminSupportDashboard.jsx";
import AdminBloodRequestDashboard from "../components/AdminBloodRequestDashboard.jsx";

import StatusMessage from "../components/ui/StatusMessage.jsx";

import {
  fetchAdminStats,
  fetchAdminUsers,
  updateUserRole,
} from "../api";

const AdminPage = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ type: null, message: "" });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load admin stats.",
      });
    }
  };

  const loadUsers = async () => {
    if (!isSuperAdmin) return;

    try {
      const data = await fetchAdminUsers();
      setUsers(data.users || []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load users.",
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }

    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isAdmin, isSuperAdmin]);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);

      setStatus({
        type: "success",
        message: "User role updated successfully.",
      });

      loadUsers();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to update user role.",
      });
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h2>🚫 Access Denied</h2>
        <p>Please login to access the admin panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <h2>🚫 Access Denied</h2>
        <p>You are not authorized to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div
      className="admin-container"
      style={{
        maxWidth: "1000px",
        margin: "2rem auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        SAHYOG Admin Dashboard
      </h1>

      <StatusMessage type={status.type} message={status.message} />

      {stats && (
        <div className="admin-manage-card" style={{ marginBottom: "2rem" }}>
          <h2>📊 Platform Stats</h2>

          <div className="options">
            <button>Total Users: {stats.userCount}</button>
            <button>Resources: {stats.linkCount}</button>
            <button>Events: {stats.eventCount}</button>
            <button>Feedbacks: {stats.feedbackCount}</button>
            <button>Support Requests: {stats.supportCount}</button>
            <button>Announcements: {stats.announcementCount}</button>
          </div>
        </div>
      )}

      {isSuperAdmin && (
        <div className="admin-manage-card" style={{ marginBottom: "2rem" }}>
          <h2>👑 Manage Admin Roles</h2>

          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            users.map((item) => (
              <div className="admin-list-item" key={item._id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.email}</p>
                  <p>Current Role: {item.role}</p>
                </div>

                <select
                  value={item.role}
                  onChange={(e) =>
                    handleRoleChange(item._id, e.target.value)
                  }
                >
                  <option value="student">student</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}
      <AdminFeedbackDashboard />

<hr style={{ margin: "2rem 0" }} />

<AdminSupportDashboard />

<hr style={{ margin: "2rem 0" }} />

<AdminBloodRequestDashboard />

<hr style={{ margin: "2rem 0" }} />

      <AdminUpload />

      <hr style={{ margin: "2rem 0" }} />

      <AdminLinksList />

      <hr style={{ margin: "2rem 0" }} />

      <AdminEventUpload />

      <hr style={{ margin: "2rem 0" }} />

      <AdminEventList />

      <hr style={{ margin: "2rem 0" }} />

      <AdminAnnouncementUpload />

      <hr style={{ margin: "2rem 0" }} />

      <AdminAnnouncementList />
    </div>
  );
};

export default AdminPage;