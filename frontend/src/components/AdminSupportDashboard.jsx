import React, { useEffect, useState } from "react";
import {
  fetchAdminSupportRequests,
  updateSupportRequestStatus,
  deleteSupportRequest,
  downloadSupportCSVUrl,
} from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminSupportDashboard = () => {
  const [requests, setRequests] = useState([]);
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

  const loadRequests = async (page = 1) => {
    try {
      setStatus({ type: null, message: "" });

      const data = await fetchAdminSupportRequests({
        page,
        limit: pagination.limit,
        search,
        status: statusFilter,
      });

      setRequests(data.requests || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load support requests.",
      });
    }
  };

  useEffect(() => {
    loadRequests(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadRequests(1);
  };

  const handleUpdate = async (item, field, value) => {
    const payload = {
      status: field === "status" ? value : item.status,
      priority: field === "priority" ? value : item.priority,
      adminNote: field === "adminNote" ? value : item.adminNote || "",
    };

    try {
      await updateSupportRequestStatus(item._id, payload);
      setStatus({ type: "success", message: "Support request updated." });
      loadRequests(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to update support request.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteSupportRequest(selectedId);
      setStatus({
        type: "success",
        message: "Support request deleted successfully.",
      });
      setSelectedId(null);
      loadRequests(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete support request.",
      });
      setSelectedId(null);
    }
  };

  return (
    <div className="admin-manage-card" style={{ marginTop: "2rem" }}>
      <h2>❤️ Support Request Dashboard</h2>

      <StatusMessage type={status.type} message={status.message} />

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search by name, contact, category, or message"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">new</option>
          <option value="in-progress">in-progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">closed</option>
        </select>

        <button type="submit">Search / Filter</button>

        <a
          href={downloadSupportCSVUrl()}
          download
          className="button"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Export Support CSV
        </a>
      </form>

      {requests.length === 0 ? (
        <p>No support requests found.</p>
      ) : (
        requests.map((item) => (
          <div className="admin-list-item" key={item._id}>
            <div>
              <h3>{item.category}</h3>

              <p>
                <strong>Name:</strong> {item.name}
              </p>

              <p>
                <strong>Contact:</strong> {item.contact}
              </p>

              <p>{item.message}</p>

              <p>
                <strong>Email Status:</strong> {item.emailStatus}
              </p>

              {item.adminNote && (
                <p>
                  <strong>Admin Note:</strong> {item.adminNote}
                </p>
              )}

              <small>{new Date(item.createdAt).toLocaleString("en-IN")}</small>
            </div>

            <div style={{ minWidth: "220px" }}>
              <label>Status</label>
              <select
                value={item.status || "new"}
                onChange={(e) =>
                  handleUpdate(item, "status", e.target.value)
                }
              >
                <option value="new">new</option>
                <option value="in-progress">in-progress</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>

              <label>Priority</label>
              <select
                value={item.priority || "medium"}
                onChange={(e) =>
                  handleUpdate(item, "priority", e.target.value)
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>

              <label>Admin Note</label>
              <textarea
                defaultValue={item.adminNote || ""}
                placeholder="Optional note"
                onBlur={(e) =>
                  handleUpdate(item, "adminNote", e.target.value)
                }
                rows="3"
              />

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
            onClick={() => loadRequests(pagination.page - 1)}
          >
            Previous
          </button>

          <button disabled>
            Page {pagination.page} of {pagination.totalPages}
          </button>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => loadRequests(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!selectedId}
        title="Delete Support Request?"
        message="This will permanently delete this support request."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedId(null)}
      />
    </div>
  );
};

export default AdminSupportDashboard;