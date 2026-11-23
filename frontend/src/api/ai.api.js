import { apiRequest } from "./client";

export const sendAIMessage = (message, history = []) => {
  return apiRequest("/api/ai/chat", {
    method: "POST",
    body: { message, history },
  });
};

export const likeEvent = (eventId) => {
  return apiRequest(`/api/events/like/${eventId}`, {
    method: "PUT",
  });
};