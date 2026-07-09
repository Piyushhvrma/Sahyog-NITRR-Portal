// frontend/src/api/announcements.api.js
// Handles announcement-related API calls.

import { apiRequest } from "./client.js";

export const fetchAnnouncements = () => {
  return apiRequest("/api/announcements");
};

export const createAnnouncement = (payload, adminPassword) => {
  return apiRequest("/api/announcements", {
    method: "POST",
    body: payload,
    adminPassword,
  });
};

export const deleteAnnouncement = (id, adminPassword) => {
  return apiRequest(`/api/announcements/${id}`, {
    method: "DELETE",
    adminPassword,
  });
};