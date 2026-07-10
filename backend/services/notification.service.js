const Notification = require("../models/Notification");
const Announcement = require("../models/Announcement");
const User = require("../models/User");

const normalizeEmail = (email = "") => {
  return String(email).trim().toLowerCase();
};

const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
};

const resolveNotificationUser = async ({
  authenticatedUserId,
  email,
}) => {
  if (authenticatedUserId) {
    const authenticatedUser = await User.findById(
      authenticatedUserId
    ).select("_id");

    if (authenticatedUser) {
      return authenticatedUser;
    }
  }

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return null;
  }

  return User.findOne({
    email: normalizedEmail,
  }).select("_id");
};

const createUserNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
  announcementId = null,
}) => {
  if (!userId || !title || !message) {
    return null;
  }

  return Notification.create({
    userId,
    announcementId,
    title: String(title).trim(),
    message: String(message).trim(),
    type,
    isRead: false,
  });
};

const createFormSubmissionNotification = async ({
  authenticatedUserId,
  email,
  title,
  message,
  type,
}) => {
  const user = await resolveNotificationUser({
    authenticatedUserId,
    email,
  });

  if (!user) {
    return null;
  }

  return createUserNotification({
    userId: user._id,
    title,
    message,
    type,
  });
};

const createAnnouncementNotifications = async (announcement) => {
  const users = await User.find().select("_id");

  if (!users.length) {
    return [];
  }

  const notificationMessage = String(
    announcement.description ||
      announcement.message ||
      ""
  ).trim();

  if (!notificationMessage) {
    throw new Error("Notification message is required.");
  }

  const operations = users.map((user) => ({
    updateOne: {
      filter: {
        userId: user._id,
        announcementId: announcement._id,
      },

      update: {
        $setOnInsert: {
          userId: user._id,
          announcementId: announcement._id,
          title: announcement.title,
          message: notificationMessage,
          type: "ADMIN",
          isRead: false,
        },
      },

      upsert: true,
    },
  }));

  await Notification.bulkWrite(operations, {
    ordered: false,
  });

  return Notification.find({
    announcementId: announcement._id,
  });
};

const syncAnnouncementNotificationsForUser = async (userId) => {
  if (!userId) {
    return;
  }

  const announcements = await Announcement.find()
    .select("_id title description message")
    .sort({ createdAt: 1 })
    .lean();

  if (!announcements.length) {
    return;
  }

  const existingNotifications = await Notification.find({
    userId,
    announcementId: {
      $ne: null,
    },
  })
    .select("announcementId")
    .lean();

  const existingAnnouncementIds = new Set(
    existingNotifications.map((notification) =>
      String(notification.announcementId)
    )
  );

  const missingAnnouncements = announcements.filter(
    (announcement) =>
      !existingAnnouncementIds.has(String(announcement._id))
  );

  if (!missingAnnouncements.length) {
    return;
  }

  const operations = missingAnnouncements.map((announcement) => {
    const notificationMessage = String(
      announcement.description ||
        announcement.message ||
        "A new SAHYOG announcement is available."
    ).trim();

    return {
      updateOne: {
        filter: {
          userId,
          announcementId: announcement._id,
        },

        update: {
          $setOnInsert: {
            userId,
            announcementId: announcement._id,
            title: announcement.title,
            message: notificationMessage,
            type: "ADMIN",
            isRead: false,
          },
        },

        upsert: true,
      },
    };
  });

  await Notification.bulkWrite(operations, {
    ordered: false,
  });
};

const deleteNotificationsByAnnouncement = async (announcementId) => {
  return Notification.deleteMany({
    announcementId,
  });
};

module.exports = {
  resolveNotificationUser,
  createUserNotification,
  createFormSubmissionNotification,
  createAnnouncementNotifications,
  syncAnnouncementNotificationsForUser,
  deleteNotificationsByAnnouncement,
};