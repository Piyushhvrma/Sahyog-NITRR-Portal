import React, { useEffect, useState } from "react";
import { fetchLinks, deleteLink } from "../api";
import StatusMessage from "./ui/StatusMessage";
import ConfirmModal from "./ui/ConfirmModal";

const AdminLinksList = () => {
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [selectedLinkId, setSelectedLinkId] = useState(null);

  const loadLinks = async (page = 1) => {
    try {
      const data = await fetchLinks({ page, limit: pagination.limit });

      setLinks(data.links || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to load links.",
      });
    }
  };

  useEffect(() => {
    loadLinks(1);
  }, []);

  const handleDelete = async () => {
    if (!selectedLinkId) return;

    try {
      await deleteLink(selectedLinkId);

      setStatus({
        type: "success",
        message: "Link deleted successfully.",
      });

      setSelectedLinkId(null);
      loadLinks(pagination.page);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete link.",
      });
      setSelectedLinkId(null);
    }
  };

  return (
    <div className="admin-manage-card">
      <h2>📚 Manage PYQs / Notes</h2>

      <StatusMessage type={status.type} message={status.message} />

      {links.length === 0 ? (
        <p>No links found.</p>
      ) : (
        links.map((link) => (
          <div className="admin-list-item" key={link._id}>
            <div>
              <h3>{link.title}</h3>
              <p>
                {link.year} • {link.branch} • {link.semester}
              </p>

              <a href={link.url} target="_blank" rel="noreferrer">
                Open Link
              </a>
            </div>

            <button
              className="admin-delete-btn"
              onClick={() => setSelectedLinkId(link._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}

      {pagination.totalPages > 1 && (
        <div className="options" style={{ marginTop: "20px" }}>
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => loadLinks(pagination.page - 1)}
          >
            Previous
          </button>

          <button disabled>
            Page {pagination.page} of {pagination.totalPages}
          </button>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => loadLinks(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!selectedLinkId}
        title="Delete Resource Link?"
        message="This will permanently delete this PYQ/Note link from the database."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setSelectedLinkId(null)}
      />
    </div>
  );
};

export default AdminLinksList;