import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

const AdminLinksList = ({ adminPassword }) => {
  const [links, setLinks] = useState([]);

  const fetchLinks = async () => {
    const res = await fetch(`${API_BASE_URL}/api/links`);
    const data = await res.json();
    setLinks(data.links || []);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const deleteLink = async (id) => {
    if (!window.confirm("Delete this PYQ/Note link?")) return;

    const res = await fetch(`${API_BASE_URL}/api/links/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-password": adminPassword,
      },
    });

    const data = await res.json();
    alert(data.message);
    fetchLinks();
  };

  return (
    <div className="admin-manage-card">
      <h2>📚 Manage PYQs / Notes</h2>

      {links.length === 0 ? (
        <p>No links found.</p>
      ) : (
        links.map((link) => (
          <div className="admin-list-item" key={link._id}>
            <div>
              <h3>{link.title}</h3>
              <p>
                {link.year} Year • {link.branch} • Semester {link.semester}
              </p>
              <a href={link.url} target="_blank" rel="noreferrer">
                Open Link
              </a>
            </div>

            <button
              className="admin-delete-btn"
              onClick={() => deleteLink(link._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminLinksList;