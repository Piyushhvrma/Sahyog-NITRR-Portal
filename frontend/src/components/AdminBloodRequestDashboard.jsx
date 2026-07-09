import React, { useEffect, useState } from "react";
import {
  fetchAdminBloodRequests,
  updateBloodRequestStatus,
  deleteBloodRequest,
  downloadBloodRequestCSVUrl,
} from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminBloodRequestDashboard = () => {
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

      const data = await fetchAdminBloodRequests({
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
        message: error.message || "Failed to load blood requests.",
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
      urgency: field === "urgency" ? value : item.urgency,
      adminNote: field === "adminNote" ? value : item.adminNote || "",
    };

    try {
      await updateBloodRequestStatus(item._id, payload);
      setStatus({ type: "success", message: "Blood request updated." });
      loadRequests(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to update blood request.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteBloodRequest(selectedId);
      setStatus({
        type: "success",
        message: "Blood request deleted successfully.",
      });
      setSelectedId(null);
      loadRequests(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete blood request.",
      });
      setSelectedId(null);
    }
  };

  return (
    <div className="admin-manage-card" style={{ marginTop: "2rem" }}>
      <h2>🩸 Blood Request Dashboard</h2>

      <StatusMessage type={status.type} message={status.message} />

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search by name, phone, email, blood group, or details"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">new</option>
          <option value="verified">verified</option>
          <option value="in-progress">in-progress</option>
          <option value="fulfilled">fulfilled</option>
          <option value="closed">closed</option>
          <option value="rejected">rejected</option>
        </select>

        <button type="submit">Search / Filter</button>

        <a
          href={downloadBloodRequestCSVUrl()}
          download
          className="button"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Export Blood CSV
        </a>
      </form>

      {requests.length === 0 ? (
        <p>No blood requests found.</p>
      ) : (
        requests.map((item) => (
          <div className="admin-list-item" key={item._id}>
            <div>
              <h3>
                {item.bloodGroup} Required — {item.name}
              </h3>

              <p>
                <strong>Phone:</strong> {item.phone}
              </p>

              <p>
                <strong>Email:</strong> {item.email || "Not provided"}
              </p>

              <p>
                <strong>Details:</strong> {item.requestDetails}
              </p>

              <p>
                <strong>Document:</strong>{" "}
                {item.hasDocument ? item.documentName || "Uploaded" : "No"}
              </p>

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
                <option value="verified">verified</option>
                <option value="in-progress">in-progress</option>
                <option value="fulfilled">fulfilled</option>
                <option value="closed">closed</option>
                <option value="rejected">rejected</option>
              </select>

              <label>Urgency</label>
              <select
                value={item.urgency || "urgent"}
                onChange={(e) =>
                  handleUpdate(item, "urgency", e.target.value)
                }
              >
                <option value="normal">normal</option>
                <option value="urgent">urgent</option>
                <option value="critical">critical</option>
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
        title="Delete Blood Request?"
        message="This will permanently delete this blood request from admin records."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedId(null)}
      />
    </div>
  );
};

export default AdminBloodRequestDashboard;