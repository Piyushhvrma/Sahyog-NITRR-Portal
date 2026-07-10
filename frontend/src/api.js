// frontend/src/api.js
// SAHYOG 2.0 compatibility file
// Explicit exports prevent conflicting star export errors.

export {
  API_BASE_URL,
  apiRequest,
} from "./api/client.js";

export {
  loginUser,
  registerUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  fetchCurrentUser,
  logoutUser,
} from "./api/auth.api.js";

export {
  fetchLinks,
  uploadLink,
  deleteLink,
} from "./api/links.api.js";

export {
  fetchEvents,
  uploadEvent,
  deleteEvent,
  likeEvent,
} from "./api/events.api.js";

export {
  fetchNotifications,
  fetchNotificationCount,
  markNotificationAsRead,
  deleteNotification,
} from "./api/notifications.api.js";

export {
  submitSupportRequest,
  downloadSupportCSVUrl,
} from "./api/support.api.js";

export {
  submitBloodRequest,
} from "./api/blood.api.js";

export {
  sendFeedback,
} from "./api/feedback.api.js";

export {
  sendAIMessage,
} from "./api/ai.api.js";

export {
  fetchUserCount,
} from "./api/users.api.js";

export {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "./api/announcements.api.js";

export {
  uploadProfilePicture,
} from "./api/profile.api.js";

export {
  fetchAdminStats,
  fetchAdminUsers,
  updateUserRole,
  fetchAdminFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
  downloadFeedbackCSVUrl,
  fetchAdminSupportRequests,
  updateSupportRequestStatus,
  deleteSupportRequest,
  fetchAdminBloodRequests,
  updateBloodRequestStatus,
  deleteBloodRequest,
  downloadBloodRequestCSVUrl,
} from "./api/admin.api.js";

export {
  createRoom,
  fetchRooms,
  fetchRoomByCode,
  voteInRoom,
  toggleRoomStatus,
  deleteRoom,
} from "./api/rooms.api.js";