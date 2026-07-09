import { apiRequest } from "./client.js";

export const fetchNotifications = () => {
  return apiRequest("/api/notifications");
};

export const fetchNotificationCount = () => {
  return apiRequest("/api/notifications/count");
};

export const markNotificationAsRead = (id) => {
  return apiRequest(`/api/notifications/${id}/read`, {
    method: "PUT",
  });
};