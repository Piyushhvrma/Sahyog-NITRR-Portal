import { apiRequest } from "./client";

export const sendAIMessage = (message, history = [], mode = "general") => {
  return apiRequest("/api/ai/chat", {
    method: "POST",
    body: {
      message,
      history: history.slice(-6),
      mode,
    },
  });
};

export const likeEvent = (eventId) => {
  return apiRequest(`/api/events/like/${eventId}`, {
    method: "PUT",
  });
};