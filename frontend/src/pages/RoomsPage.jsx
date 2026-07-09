import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

import {
  createRoom,
  fetchRoomByCode,
  voteInRoom,
  deleteRoom,
} from "../api";

import { connectSocket } from "../socket/socket.js";
import StatusMessage from "../components/ui/StatusMessage.jsx";

const RoomsPage = () => {
  const { user } = useContext(AuthContext);

  const [activeRoom, setActiveRoom] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const [status, setStatus] = useState({ type: null, message: "" });

  const [form, setForm] = useState({
    title: "",
    description: "",
    pollQuestion: "",
    optionsText: "Option 1\nOption 2",
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const loadRoomByCode = async (roomCode) => {
    try {
      setStatus({ type: null, message: "" });

      const cleanCode = roomCode.trim().toUpperCase();

      const data = await fetchRoomByCode(cleanCode);

      setActiveRoom(data.room);
      setHasVoted(data.hasVoted);

      const socket = connectSocket();
      socket.emit("join-room", data.room.roomCode);
    } catch (error) {
      setActiveRoom(null);
      setHasVoted(false);

      setStatus({
        type: "error",
        message: error.message || "Room not found.",
      });
    }
  };

  useEffect(() => {
    const socket = connectSocket();

    socket.on("poll-updated", (payload) => {
      setActiveRoom((current) => {
        if (!current || current.roomCode !== payload.roomCode) return current;

        return {
          ...current,
          options: payload.options,
          voters: Array.from({ length: payload.totalVotes }),
        };
      });
    });

    socket.on("room-deleted", (payload) => {
      setActiveRoom((current) => {
        if (!current || current.roomCode !== payload.roomCode) return current;
        return null;
      });

      setHasVoted(false);
      setJoinCode("");

      setStatus({
        type: "info",
        message: "This room has been closed by the admin.",
      });
    });

    return () => {
      socket.off("poll-updated");
      socket.off("room-deleted");
    };
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    const options = form.optionsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (options.length < 2) {
      setStatus({
        type: "error",
        message: "Please add at least two options.",
      });
      return;
    }

    try {
      const data = await createRoom({
        title: form.title,
        description: form.description,
        pollQuestion: form.pollQuestion,
        options,
      });

      setStatus({
        type: "success",
        message: `Room created successfully. Share this code only with your class: ${data.room.roomCode}`,
      });

      setForm({
        title: "",
        description: "",
        pollQuestion: "",
        optionsText: "Option 1\nOption 2",
      });

      setActiveRoom(data.room);
      setHasVoted(false);

      const socket = connectSocket();
      socket.emit("join-room", data.room.roomCode);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to create room.",
      });
    }
  };

  const copyRoomCode = async () => {
    if (!activeRoom?.roomCode) return;

    try {
      await navigator.clipboard.writeText(activeRoom.roomCode);

      setStatus({
        type: "success",
        message: "Room code copied successfully.",
      });
    } catch {
      setStatus({
        type: "info",
        message: `Room code: ${activeRoom.roomCode}`,
      });
    }
  };

  const handleVote = async (optionId) => {
    if (!activeRoom) return;

    try {
      const data = await voteInRoom(activeRoom.roomCode, optionId);

      setActiveRoom(data.room);
      setHasVoted(true);

      setStatus({
        type: "success",
        message: "Vote submitted successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to vote.",
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to close and delete this room permanently?"
    );

    if (!confirmDelete) return;

    try {
      await deleteRoom(activeRoom.roomCode);

      setStatus({
        type: "success",
        message: "Room closed and deleted successfully.",
      });

      setActiveRoom(null);
      setHasVoted(false);
      setJoinCode("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete room.",
      });
    }
  };

  const totalVotes =
    activeRoom?.options?.reduce(
      (sum, option) => sum + Number(option.votes || 0),
      0
    ) || 0;

  const canDeleteRoom =
    isAdmin &&
    activeRoom?.createdBy &&
    String(activeRoom.createdBy) === String(user?.id);

  return (
    <div className="container">
      <h1>Join Room</h1>

      <p>
        Enter the private room code shared by your admin or class coordinator to
        join a simple election poll.
      </p>

      <StatusMessage type={status.type} message={status.message} />

      <div className="admin-manage-card" style={{ marginBottom: "2rem" }}>
        <h2>Enter Room Code</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadRoomByCode(joinCode);
          }}
        >
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Example: ABC123"
            required
          />

          <button type="submit">Join Room</button>
        </form>
      </div>

      {isAdmin && (
        <div className="admin-manage-card" style={{ marginBottom: "2rem" }}>
          <h2>Create Election Room</h2>

          <form onSubmit={handleCreateRoom}>
            <label>Room Title</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Example: CR Election"
              required
            />

            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Optional short description"
            />

            <label>Poll Question</label>
            <input
              value={form.pollQuestion}
              onChange={(e) =>
                setForm({
                  ...form,
                  pollQuestion: e.target.value,
                })
              }
              placeholder="Who should be the CR?"
              required
            />

            <label>Options one per line</label>
            <textarea
              value={form.optionsText}
              onChange={(e) =>
                setForm({
                  ...form,
                  optionsText: e.target.value,
                })
              }
              rows="5"
              required
            />

            <button type="submit">Create Room</button>
          </form>
        </div>
      )}

      {activeRoom && (
        <div className="admin-manage-card">
          <h2>
            {activeRoom.title} ({activeRoom.roomCode})
          </h2>

          <p>{activeRoom.description}</p>

          {isAdmin && (
            <button type="button" onClick={copyRoomCode}>
              Copy Room Code
            </button>
          )}

          {canDeleteRoom && (
            <button
              type="button"
              onClick={handleDeleteRoom}
              style={{
                background: "linear-gradient(135deg, #ef4444, #991b1b)",
              }}
            >
              Close Room Permanently
            </button>
          )}

          <h3>{activeRoom.pollQuestion}</h3>

          {!activeRoom.isActive && (
            <p style={{ color: "#fecaca", fontWeight: "700" }}>
              This room is closed.
            </p>
          )}

          <p>
            <strong>Total Votes:</strong> {totalVotes}
          </p>

          {activeRoom.options.map((option) => {
            const percentage =
              totalVotes === 0
                ? 0
                : Math.round((option.votes / totalVotes) * 100);

            return (
              <div
                key={option._id}
                style={{
                  padding: "14px",
                  margin: "12px 0",
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{option.text}</strong>
                  <span>
                    {option.votes} votes • {percentage}%
                  </span>
                </div>

                <div
                  style={{
                    height: "10px",
                    width: "100%",
                    background: "rgba(15,23,42,0.9)",
                    borderRadius: "999px",
                    marginTop: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "linear-gradient(135deg, #38bdf8, #2563eb)",
                    }}
                  />
                </div>

                <button
                  disabled={hasVoted || !activeRoom.isActive}
                  onClick={() => handleVote(option._id)}
                >
                  {hasVoted ? "Voted" : "Vote"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;