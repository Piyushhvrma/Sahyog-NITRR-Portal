import React, { useState } from "react";
import { BRANCHES, YEARS, SEMESTERS } from "../constant";
import { uploadLink } from "../api";
import StatusMessage from "./ui/StatusMessage";

export default function AdminUpload() {
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branch || !year || !semester || !title || !link) {
      setStatus({
        type: "error",
        message: "Please fill all fields.",
      });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: null, message: "" });

      await uploadLink({
        branch,
        year,
        semester,
        title,
        url: link,
      });

      setStatus({
        type: "success",
        message: "PYQ/Note link uploaded successfully.",
      });

      setBranch("");
      setYear("");
      setSemester("");
      setTitle("");
      setLink("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Upload failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Admin Upload Panel</h2>

      <StatusMessage type={status.type} message={status.message} />

      <form onSubmit={handleSubmit}>
        <label>Branch:</label>
        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">-- Select Branch --</option>
          {BRANCHES.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>

        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">-- Select Year --</option>
          {YEARS.map((y, i) => (
            <option key={i} value={y}>
              {y}
            </option>
          ))}
        </select>

        <label>Semester:</label>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">-- Select Semester --</option>
          {SEMESTERS.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label>Title:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Example: "End Sem 2024"'
        />

        <label>Google Drive / Resource Link:</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste resource link here"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload PYQ"}
        </button>
      </form>
    </div>
  );
}