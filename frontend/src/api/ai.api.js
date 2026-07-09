import { apiRequest } from "./client";

export const sendAIMessage = (message) => {
  return apiRequest("/api/ai/chat", {
    method: "POST",
    body: { message },
  });
};