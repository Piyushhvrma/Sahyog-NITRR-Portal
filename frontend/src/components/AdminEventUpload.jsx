import React, { useState } from "react";
import { uploadEvent } from "../api";
import StatusMessage from "./ui/StatusMessage";

const AdminEventUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !imageFile) {
      setStatus({
        type: "error",
        message: "Please fill all fields and select an image.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("eventImage", imageFile);

    try {
      setIsLoading(true);
      setStatus({ type: null, message: "" });

      await uploadEvent(formData);

      setStatus({
        type: "success",
        message: "Event uploaded successfully.",
      });

      setTitle("");
      setDescription("");
      setImageFile(null);

      const fileInput = document.getElementById("event-image-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Event upload failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h2>Upload New Event</h2>

      <StatusMessage type={status.type} message={status.message} />

      <form onSubmit={handleSubmit}>
        <label>Event Title:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of the event"
          required
        />

        <label>Event Image:</label>
        <input
          id="event-image-input"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />

        <label>Description / Matter:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write about the event..."
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload Event"}
        </button>
      </form>
    </div>
  );
};

export default AdminEventUpload;