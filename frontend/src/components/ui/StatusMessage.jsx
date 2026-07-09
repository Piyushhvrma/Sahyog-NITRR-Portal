import React from "react";

const StatusMessage = ({ type = "info", message }) => {
  if (!message) return null;

  const styles = {
    success: {
      background: "rgba(34, 197, 94, 0.12)",
      border: "1px solid rgba(34, 197, 94, 0.35)",
      color: "#bbf7d0",
    },
    error: {
      background: "rgba(239, 68, 68, 0.12)",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      color: "#fecaca",
    },
    info: {
      background: "rgba(56, 189, 248, 0.12)",
      border: "1px solid rgba(56, 189, 248, 0.35)",
      color: "#bae6fd",
    },
  };

  return (
    <div
      style={{
        margin: "14px 0",
        padding: "12px 16px",
        borderRadius: "12px",
        fontWeight: "700",
        textAlign: "center",
        ...styles[type],
      }}
    >
      {message}
    </div>
  );
};

export default StatusMessage;