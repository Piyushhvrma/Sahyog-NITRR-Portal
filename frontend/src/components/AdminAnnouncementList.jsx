import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

const AdminAnnouncementList = ({ adminPassword }) => {
  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/announcements`
      );

      const data = await res.json();

      setAnnouncements(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const deleteAnnouncement = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-admin-password": adminPassword,
          },
        }
      );

      const data = await res.json();

      alert(data.message);

      fetchAnnouncements();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📢 All Announcements</h2>

      {announcements.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        announcements.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #333",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <p>
              <strong>Category:</strong>{" "}
              {item.category}
            </p>

            <button
              onClick={() =>
                deleteAnnouncement(item._id)
              }
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAnnouncementList;