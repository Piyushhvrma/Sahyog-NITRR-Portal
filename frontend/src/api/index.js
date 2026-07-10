// frontend/src/api/index.js
// Central API exports for SAHYOG 2.0.

export {
  API_BASE_URL,
  apiRequest,
} from "./client.js";

export {
  loginUser,
  registerUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  fetchCurrentUser,
  logoutUser,
} from "./auth.api.js";

export {
  fetchLinks,
  uploadLink,
  deleteLink,
} from "./links.api.js";

export {
  fetchEvents,
  uploadEvent,
  deleteEvent,
  likeEvent,
} from "./events.api.js";

export {
  fetchNotifications,
  fetchNotificationCount,
  markNotificationAsRead,
  deleteNotification,
} from "./notifications.api.js";

export {
  submitSupportRequest,
  downloadSupportCSVUrl,
} from "./support.api.js";

export {
  submitBloodRequest,
} from "./blood.api.js";

export {
  sendFeedback,
} from "./feedback.api.js";

export {
  sendAIMessage,
} from "./ai.api.js";

export {
  fetchUserCount,
} from "./users.api.js";

export {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "./announcements.api.js";

export {
  uploadProfilePicture,
} from "./profile.api.js";

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
} from "./admin.api.js";

export {
  createRoom,
  fetchRooms,
  fetchRoomByCode,
  voteInRoom,
  toggleRoomStatus,
  deleteRoom,
} from "./rooms.api.js";