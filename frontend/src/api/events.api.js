import { apiRequest } from "./client.js";

export const fetchEvents = ({ page = 1, limit = 6 } = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  return apiRequest(`/api/events?${params.toString()}`);
};

export const uploadEvent = (formData) => {
  return apiRequest("/api/events/upload", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
};

export const deleteEvent = (id) => {
  return apiRequest(`/api/events/${id}`, {
    method: "DELETE",
  });
};

export const likeEvent = (eventId) => {
  return apiRequest(`/api/events/like/${eventId}`, {
    method: "PUT",
  });
};