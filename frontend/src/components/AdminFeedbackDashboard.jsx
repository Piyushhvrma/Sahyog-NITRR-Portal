import React, { useEffect, useState } from "react";
import {
  fetchAdminFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
  downloadFeedbackCSVUrl,
} from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminFeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [selectedId, setSelectedId] = useState(null);

  const loadFeedbacks = async (page = 1) => {
    try {
      setStatus({ type: null, message: "" });

      const data = await fetchAdminFeedbacks({
        page,
        limit: pagination.limit,
        search,
        status: statusFilter,
      });

      setFeedbacks(data.feedbacks || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load feedbacks.",
      });
    }
  };

  useEffect(() => {
    loadFeedbacks(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadFeedbacks(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateFeedbackStatus(id, newStatus);
      setStatus({ type: "success", message: "Feedback status updated." });
      loadFeedbacks(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to update feedback.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteFeedback(selectedId);
      setStatus({ type: "success", message: "Feedback deleted successfully." });
      setSelectedId(null);
      loadFeedbacks(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete feedback.",
      });
      setSelectedId(null);
    }
  };

  return (
    <div className="admin-manage-card" style={{ marginTop: "2rem" }}>
      <h2>📝 Feedback Dashboard</h2>

      <StatusMessage type={status.type} message={status.message} />

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search by name, email, or message"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">new</option>
          <option value="reviewed">reviewed</option>
          <option value="resolved">resolved</option>
        </select>

        <button type="submit">Search / Filter</button>

        <a
          href={downloadFeedbackCSVUrl()}
          download
          className="button"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Export Feedback CSV
        </a>
      </form>

      {feedbacks.length === 0 ? (
        <p>No feedback found.</p>
      ) : (
        feedbacks.map((item) => (
          <div className="admin-list-item" key={item._id}>
            <div>
              <h3>{item.name}</h3>
              <p>{item.email}</p>
              <p>{item.message}</p>
              <small>
                {new Date(item.createdAt).toLocaleString("en-IN")}
              </small>
            </div>

            <div style={{ minWidth: "180px" }}>
              <select
                value={item.status || "new"}
                onChange={(e) => handleStatusChange(item._id, e.target.value)}
              >
                <option value="new">new</option>
                <option value="reviewed">reviewed</option>
                <option value="resolved">resolved</option>
              </select>

              <button
                className="admin-delete-btn"
                onClick={() => setSelectedId(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {pagination.totalPages > 1 && (
        <div className="options" style={{ marginTop: "20px" }}>
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => loadFeedbacks(pagination.page - 1)}
          >
            Previous
          </button>

          <button disabled>
            Page {pagination.page} of {pagination.totalPages}
          </button>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => loadFeedbacks(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!selectedId}
        title="Delete Feedback?"
        message="This will permanently delete this feedback."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedId(null)}
      />
    </div>
  );
};

export default AdminFeedbackDashboard;