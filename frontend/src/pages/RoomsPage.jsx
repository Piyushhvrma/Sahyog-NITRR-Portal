import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  createRoom,
  fetchRoomByCode,
  voteInRoom,
  toggleRoomStatus,
  deleteRoom,
} from "../api";
import { connectSocket } from "../socket/socket.js";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import roomImage from "../assets/room-election.jpg";

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

      const data = await fetchRoomByCode(roomCode.trim().toUpperCase());

      setActiveRoom(data.room);
      setHasVoted(data.hasVoted);

      const socket = connectSocket();
      socket.emit("join-room", data.room.roomCode);
    } catch (error) {
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

    socket.on("room-status-updated", (payload) => {
      setActiveRoom((current) => {
        if (!current || current.roomCode !== payload.roomCode) return current;

        return {
          ...current,
          isActive: payload.isActive,
        };
      });
    });

    socket.on("room-deleted", (payload) => {
      setActiveRoom((current) => {
        if (!current || current.roomCode !== payload.roomCode) return current;
        return null;
      });
    });

    return () => {
      socket.off("poll-updated");
      socket.off("room-status-updated");
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
        message: `Room created successfully. Code: ${data.room.roomCode}`,
      });

      setForm({
        title: "",
        description: "",
        pollQuestion: "",
        optionsText: "Option 1\nOption 2",
      });

      setActiveRoom(data.room);
      setHasVoted(false);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to create room.",
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

  const handleToggleRoom = async () => {
    if (!activeRoom) return;

    try {
      const data = await toggleRoomStatus(activeRoom.roomCode);

      setStatus({
        type: "success",
        message: data.room.isActive ? "Room reopened." : "Room closed.",
      });

      setActiveRoom(data.room);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to update room.",
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently close and delete this room?"
    );

    if (!confirmDelete) return;

    try {
      await deleteRoom(activeRoom.roomCode);

      setStatus({
        type: "success",
        message: "Room deleted successfully.",
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

  return (
    <div className="rooms-page">
      <section className="rooms-hero-card">
        <div className="rooms-content-card">
          <div className="rooms-text-block">
            <span className="rooms-badge">SAHYOG Live Polling</span>

            <h1>Join Room</h1>

            <p className="rooms-subtitle">
              Enter the private room code shared by your admin or class
              coordinator to join a simple election poll.
            </p>

            <form
              className="rooms-join-form"
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

            <div className="rooms-info-strip">
              <span>Private Code</span>
              <span>Live Voting</span>
              <span>Simple Poll</span>
            </div>
          </div>

          <div className="rooms-image-wrap">
            <img
              src={roomImage}
              alt="Election room discussion"
              className="rooms-hero-image"
            />
          </div>
        </div>
      </section>

      <div className="rooms-status-wrap">
        <StatusMessage type={status.type} message={status.message} />
      </div>

      {isAdmin && (
        <section className="rooms-white-card">
          <div className="rooms-section-header">
            <span className="rooms-badge">Admin Control</span>
            <h2>Create Election Room</h2>
            <p>
              Create a private room and share the code only with selected class
              members.
            </p>
          </div>

          <form className="rooms-create-form" onSubmit={handleCreateRoom}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Room Title, example: CR Election"
              required
            />

            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description optional"
            />

            <input
              value={form.pollQuestion}
              onChange={(e) =>
                setForm({ ...form, pollQuestion: e.target.value })
              }
              placeholder="Poll Question, example: Who should be the CR?"
              required
            />

            <textarea
              value={form.optionsText}
              onChange={(e) =>
                setForm({ ...form, optionsText: e.target.value })
              }
              rows="5"
              placeholder="Enter options, one per line"
              required
            />

            <button type="submit">Create Room</button>
          </form>
        </section>
      )}

      {activeRoom && (
        <section className="rooms-white-card">
          <div className="rooms-section-header">
            <span className="rooms-badge">Room Code: {activeRoom.roomCode}</span>

            <h2>{activeRoom.title}</h2>

            {activeRoom.description && <p>{activeRoom.description}</p>}

            <h3>{activeRoom.pollQuestion}</h3>

            {!activeRoom.isActive && (
              <p className="room-closed-text">This room is closed.</p>
            )}

            <p className="room-total-votes">
              Total Votes: <strong>{totalVotes}</strong>
            </p>
          </div>

          <div className="room-options-list">
            {activeRoom.options.map((option) => {
              const percentage =
                totalVotes === 0
                  ? 0
                  : Math.round((option.votes / totalVotes) * 100);

              return (
                <div key={option._id} className="room-option-card">
                  <div className="room-option-top">
                    <strong>{option.text}</strong>
                    <span>
                      {option.votes} votes • {percentage}%
                    </span>
                  </div>

                  <div className="room-progress">
                    <div style={{ width: `${percentage}%` }} />
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

          {isAdmin && (
            <div className="room-admin-actions">
              <button onClick={handleToggleRoom}>
                {activeRoom.isActive ? "Close Room" : "Reopen Room"}
              </button>

              <button className="room-delete-btn" onClick={handleDeleteRoom}>
                Delete Room
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default RoomsPage;