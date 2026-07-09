import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FeedbackForm from "../components/FeedbackForm";
import { fetchLinks } from "../api.js";

const Viewer = () => {
  const { year, branch, semester } = useParams();

  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLinks = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchLinks({
        year,
        branch,
        semester,
        page,
        limit: pagination.limit,
      });

      setLinks(data.links || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError(err.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks(1);
  }, [year, branch, semester]);

  return (
    <div className="container">
      <h1>
        {branch} - {year} - {semester}
      </h1>

      <div className="pyq-section-card">
        <h2>Available PYQ Links</h2>

        {loading && <p>Loading resources...</p>}

        {error && (
          <p style={{ color: "#fecaca", fontWeight: "700" }}>{error}</p>
        )}

        {!loading && links.length === 0 ? (
          <p className="no-links-text">No links uploaded yet.</p>
        ) : (
          <div className="pyq-link-grid">
            {links.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="pyq-link-card"
              >
                <span className="pyq-link-icon">📄</span>
                <span>{link.title}</span>
              </a>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => loadLinks(pagination.page - 1)}
            >
              Previous
            </button>

            <span style={{ fontWeight: "700" }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => loadLinks(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <hr />

      <FeedbackForm />
    </div>
  );
};

export default Viewer;