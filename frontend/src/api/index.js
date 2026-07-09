// frontend/src/api/index.js
// Central API exports for SAHYOG 2.0.

export { API_BASE_URL, apiRequest } from "./client.js";

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