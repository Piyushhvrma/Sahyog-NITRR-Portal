import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AuthContext,
} from "../context/AuthContext.jsx";

import {
  fetchAdminUsers,
  updateUserRole,
} from "../api";

import AdminUpload from "../components/AdminUpload.jsx";
import AdminLinksList from "../components/AdminLinksList.jsx";

import AdminEventUpload from "../components/AdminEventUpload.jsx";
import AdminEventList from "../components/AdminEventList.jsx";

import AdminAnnouncementUpload from "../components/AdminAnnouncementUpload.jsx";
import AdminAnnouncementList from "../components/AdminAnnouncementList.jsx";

import AdminFeedbackDashboard from "../components/AdminFeedbackDashboard.jsx";
import AdminSupportDashboard from "../components/AdminSupportDashboard.jsx";
import AdminBloodRequestDashboard from "../components/AdminBloodRequestDashboard.jsx";

import StatusMessage from "../components/ui/StatusMessage.jsx";

import "../styles2/AdminDashboard.css";

const sectionInformation = {
  resources: {
    title: "Academic Resources",
    subtitle:
      "Upload and manage PYQs, notes, books and useful academic links.",
  },

  events: {
    title: "Event Management",
    subtitle:
      "Upload new events and manage existing event posts.",
  },

  announcements: {
    title: "Announcement Management",
    subtitle:
      "Publish important updates and manage previous announcements.",
  },

  feedback: {
    title: "Feedback Dashboard",
    subtitle:
      "Review, search, resolve and delete student feedback.",
  },

  support: {
    title: "Support Request Dashboard",
    subtitle:
      "Manage confidential student concerns and their priority.",
  },

  blood: {
    title: "Blood Request Dashboard",
    subtitle:
      "Track emergency blood requests, status and urgency.",
  },

  roles: {
    title: "User Role Management",
    subtitle:
      "Manage student, admin and superadmin permissions.",
  },
};

const AdminSectionPage = () => {
  const { section } = useParams();

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [users, setUsers] =
    useState([]);

  const [status, setStatus] =
    useState({
      type: null,
      message: "",
    });

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "superadmin";

  const isSuperAdmin =
    user?.role === "superadmin";

  const information =
    sectionInformation[section];

  const loadUsers = async () => {
    if (!isSuperAdmin) return;

    try {
      const data = await fetchAdminUsers();

      setUsers(data.users || []);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Failed to load users.",
      });
    }
  };

  useEffect(() => {
    if (section === "roles") {
      loadUsers();
    }
  }, [section, isSuperAdmin]);

  const handleRoleChange = async (
    userId,
    role
  ) => {
    try {
      await updateUserRole(userId, role);

      setStatus({
        type: "success",
        message:
          "User role updated successfully.",
      });

      loadUsers();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Failed to update user role.",
      });
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container">
        <h2>🚫 Access Denied</h2>
        <p>
          You are not authorized to access
          this admin module.
        </p>
      </div>
    );
  }

  if (!information) {
    return (
      <div className="container">
        <h2>Admin module not found</h2>

        <button
          type="button"
          onClick={() =>
            navigate("/admin")
          }
        >
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  const renderSection = () => {
    if (section === "resources") {
      return (
        <>
          <AdminUpload />
          <AdminLinksList />
        </>
      );
    }

    if (section === "events") {
      return (
        <>
          <AdminEventUpload />
          <AdminEventList />
        </>
      );
    }

    if (section === "announcements") {
      return (
        <>
          <AdminAnnouncementUpload />
          <AdminAnnouncementList />
        </>
      );
    }

    if (section === "feedback") {
      return <AdminFeedbackDashboard />;
    }

    if (section === "support") {
      return <AdminSupportDashboard />;
    }

    if (section === "blood") {
      return <AdminBloodRequestDashboard />;
    }

    if (section === "roles") {
      if (!isSuperAdmin) {
        return (
          <div className="admin-section-empty">
            <h2>Superadmin access required</h2>

            <p>
              Only a superadmin can manage user
              roles.
            </p>
          </div>
        );
      }

      return (
        <div className="admin-role-card">
          <h2>Manage Admin Roles</h2>

          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            users.map((item) => (
              <div
                className="admin-role-row"
                key={item._id}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                  <small>
                    Current role: {item.role}
                  </small>
                </div>

                <select
                  value={item.role}
                  onChange={(event) =>
                    handleRoleChange(
                      item._id,
                      event.target.value
                    )
                  }
                >
                  <option value="student">
                    student
                  </option>

                  <option value="admin">
                    admin
                  </option>

                  <option value="superadmin">
                    superadmin
                  </option>
                </select>
              </div>
            ))
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="admin-section-page">
      <header className="admin-section-header">
        <button
          type="button"
          className="admin-back-button"
          onClick={() =>
            navigate("/admin")
          }
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div>
          <span>SAHYOG Admin</span>
          <h1>{information.title}</h1>
          <p>{information.subtitle}</p>
        </div>
      </header>

      <StatusMessage
        type={status.type}
        message={status.message}
      />

      <section className="admin-section-content">
        {renderSection()}
      </section>
    </div>
  );
};

export default AdminSectionPage;