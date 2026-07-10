const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "ADMIN",
        "SYSTEM",
        "FEEDBACK",
        "SUPPORT",
        "BLOOD",
      ],
      default: "SYSTEM",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({
  userId: 1,
  createdAt: -1,
});

NotificationSchema.index(
  {
    userId: 1,
    announcementId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      announcementId: {
        $type: "objectId",
      },
    },
  }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    NotificationSchema
  );