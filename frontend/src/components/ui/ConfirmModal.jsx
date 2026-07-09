import React from "react";

const ConfirmModal = ({
  open,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "min(430px, 100%)",
          background: "#0f172a",
          border: "1px solid rgba(148, 163, 184, 0.28)",
          borderRadius: "20px",
          padding: "26px",
          color: "white",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{title}</h2>

        <p style={{ color: "rgba(226, 232, 240, 0.85)", lineHeight: 1.6 }}>
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "rgba(148, 163, 184, 0.25)",
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: danger
                ? "linear-gradient(135deg, #ef4444, #991b1b)"
                : "linear-gradient(135deg, #38bdf8, #2563eb)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;