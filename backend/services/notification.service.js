const Notification = require("../models/Notification");
const User = require("../models/User");

const createAnnouncementNotifications = async (announcement) => {
  const users = await User.find().select("_id");

  if (!users.length) return [];

  const notifications = users.map((user) => ({
    userId: user._id,
    announcementId: announcement._id,
    title: announcement.title,
    message: announcement.description,
    type: "ADMIN",
  }));

  return Notification.insertMany(notifications);
};

const deleteNotificationsByAnnouncement = async (announcementId) => {
  return Notification.deleteMany({ announcementId });
};

module.exports = {
  createAnnouncementNotifications,
  deleteNotificationsByAnnouncement,
};