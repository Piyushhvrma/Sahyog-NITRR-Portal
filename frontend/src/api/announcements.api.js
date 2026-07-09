import { apiRequest } from "./client.js";

export const fetchAnnouncements = () => {
  return apiRequest("/api/announcements");
};

export const createAnnouncement = (payload) => {
  return apiRequest("/api/announcements", {
    method: "POST",
    body: payload,
  });
};

export const deleteAnnouncement = (id) => {
  return apiRequest(`/api/announcements/${id}`, {
    method: "DELETE",
  });
};