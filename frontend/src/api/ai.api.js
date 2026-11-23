import { apiRequest } from "./client";

export const sendAIMessage = (message) => {
  return apiRequest("/api/ai/chat", {
    method: "POST",
    body: { message },
  });
};

export const likeEvent = (eventId) => {
  return apiRequest(`/api/events/like/${eventId}`, {
    method: "PUT",
  });
};