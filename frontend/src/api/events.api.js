import { apiRequest } from "./client";

export const fetchEvents = () => {
  return apiRequest("/api/events");
};

export const uploadEvent = (formData, adminPassword) => {
  return apiRequest("/api/events/upload", {
    method: "POST",
    body: formData,
    isFormData: true,
    adminPassword,
  });
};

export const deleteEvent = (id, adminPassword) => {
  return apiRequest(`/api/events/${id}`, {
    method: "DELETE",
    adminPassword,
  });
};

export const likeEvent = (eventId, token) => {
  return apiRequest(`/api/events/like/${eventId}`, {
    method: "PUT",
    token,
  });
};