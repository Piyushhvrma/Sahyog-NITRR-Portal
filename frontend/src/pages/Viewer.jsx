import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FeedbackForm from "../components/FeedbackForm";
import { fetchLinks } from "../api.js";

const Viewer = () => {
  const { year, branch, semester } = useParams();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetchLinks({ year, branch, semester })
      .then((data) => {
        setLinks(data.links || []);
      })
      .catch(console.error);
  }, [year, branch, semester]);

  return (
    <div className="container">
      <h1>
        {branch} - {year} - {semester}
      </h1>

      <div className="pyq-section-card">
        <h2>Available PYQ Links</h2>

        {links.length === 0 ? (
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
      </div>

      <hr />

      <FeedbackForm />
    </div>
  );
};

export default Viewer;