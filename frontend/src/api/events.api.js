import { apiRequest } from "./client.js";

export const fetchEvents = () => {
  return apiRequest("/api/events");
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