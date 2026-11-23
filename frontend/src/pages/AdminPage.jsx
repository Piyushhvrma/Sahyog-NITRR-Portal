import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  BellRing,
  BookOpen,
  CalendarDays,
  Download,
  Droplets,
  HeartHandshake,
  MessageSquareText,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  AuthContext,
} from "../context/AuthContext.jsx";

import {
  downloadBloodRequestCSVUrl,
  downloadFeedbackCSVUrl,
  downloadSupportCSVUrl,
  fetchAdminStats,
} from "../api";

import StatusMessage from "../components/ui/StatusMessage.jsx";

import "../styles2/AdminDashboard.css";

const AdminPage = () => {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [stats, setStats] =
    useState(null);

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

  useEffect(() => {
    if (!isAdmin) return;

    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (error) {
        setStatus({
          type: "error",
          message:
            error.message ||
            "Failed to load admin statistics.",
        });
      }
    };

    loadStats();
  }, [isAdmin]);

  if (!user) {
    return (
      <div className="container">
        <h2>🚫 Access Denied</h2>
        <p>
          Please login to access the admin panel.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <h2>🚫 Access Denied</h2>
        <p>
          You are not authorized to access
          the admin panel.
        </p>
      </div>
    );
  }

  const modules = [
    {
      key: "resources",
      title: "Academic Resources",
      description:
        "Upload, review and delete PYQ or study-resource links.",
      icon: BookOpen,
      count: stats?.linkCount,
      accent: "blue",
    },
    {
      key: "events",
      title: "Events",
      description:
        "Upload event images, review previous events and delete records.",
      icon: CalendarDays,
      count: stats?.eventCount,
      accent: "purple",
    },
    {
      key: "announcements",
      title: "Announcements",
      description:
        "Publish notices and manage notifications sent to students.",
      icon: BellRing,
      count: stats?.announcementCount,
      accent: "orange",
    },
    {
      key: "feedback",
      title: "Feedback",
      description:
        "Search, review, resolve and delete student feedback.",
      icon: MessageSquareText,
      count: stats?.feedbackCount,
      accent: "green",
    },
    {
      key: "support",
      title: "Support Requests",
      description:
        "Manage confidential student-support requests and priorities.",
      icon: HeartHandshake,
      count: stats?.supportCount,
      accent: "pink",
    },
    {
      key: "blood",
      title: "Blood Requests",
      description:
        "Track emergency blood requests, urgency and completion status.",
      icon: Droplets,
      count: stats?.bloodRequestCount,
      accent: "red",
    },
  ];

  if (isSuperAdmin) {
    modules.unshift({
      key: "roles",
      title: "User Roles",
      description:
        "Manage student, admin and superadmin permissions.",
      icon: ShieldCheck,
      count: stats?.userCount,
      accent: "cyan",
    });
  }

  return (
    <div className="admin-dashboard-page">
      <section className="admin-dashboard-hero">
        <div>
          <span className="admin-dashboard-badge">
            SAHYOG Administration
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Manage resources, events, announcements
            and student-support services from one
            organised dashboard.
          </p>
        </div>

        <div className="admin-dashboard-user">
          <Users size={24} />

          <div>
            <strong>{user.name}</strong>
            <span>
              {user.role === "superadmin"
                ? "Super Admin"
                : "Administrator"}
            </span>
          </div>
        </div>
      </section>

      <StatusMessage
        type={status.type}
        message={status.message}
      />

      <section className="admin-stats-grid">
        <div>
          <span>Total Users</span>
          <strong>
            {stats?.userCount ?? "—"}
          </strong>
        </div>

        <div>
          <span>New Feedback</span>
          <strong>
            {stats?.newFeedbackCount ?? "—"}
          </strong>
        </div>

        <div>
          <span>New Support</span>
          <strong>
            {stats?.newSupportCount ?? "—"}
          </strong>
        </div>

        <div>
          <span>New Blood Requests</span>
          <strong>
            {stats?.newBloodRequestCount ?? "—"}
          </strong>
        </div>
      </section>

      <section className="admin-dashboard-section">
        <div className="admin-section-heading">
          <div>
            <span>Management</span>
            <h2>Admin Modules</h2>
          </div>

          <p>
            Select a module to open its existing
            upload and management components.
          </p>
        </div>

        <div className="admin-module-grid">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <button
                key={module.key}
                type="button"
                className={`admin-module-card admin-module-${module.accent}`}
                onClick={() =>
                  navigate(`/admin/${module.key}`)
                }
              >
                <div className="admin-module-icon">
                  <Icon size={25} />
                </div>

                <div className="admin-module-content">
                  <div className="admin-module-title-row">
                    <h3>{module.title}</h3>

                    {module.count !== undefined && (
                      <span>
                        {module.count ?? 0}
                      </span>
                    )}
                  </div>

                  <p>{module.description}</p>

                  <strong>Open Module →</strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-export-section">
        <div className="admin-section-heading">
          <div>
            <span>Reports</span>
            <h2>Export Centre</h2>
          </div>

          <p>
            Download current records for official
            review and reporting.
          </p>
        </div>

        <div className="admin-export-grid">
          <a
            href={downloadSupportCSVUrl()}
            download
          >
            <Download size={19} />
            Support Requests CSV
          </a>

          <a
            href={downloadFeedbackCSVUrl()}
            download
          >
            <Download size={19} />
            Feedback CSV
          </a>

          <a
            href={downloadBloodRequestCSVUrl()}
            download
          >
            <Download size={19} />
            Blood Requests CSV
          </a>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;