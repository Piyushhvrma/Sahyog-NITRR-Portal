import { apiRequest } from "./client";

export const fetchNotifications = (token) => {
  return apiRequest("/api/notifications", {
    token,
  });
};

export const fetchNotificationCount = (token) => {
  return apiRequest("/api/notifications/count", {
    token,
  });
};

export const markNotificationAsRead = (id, token) => {
  return apiRequest(`/api/notifications/${id}/read`, {
    method: "PUT",
    token,
  });
};