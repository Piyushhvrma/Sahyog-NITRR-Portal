import { apiRequest } from "./client";

export const sendFeedback = (payload) => {
  return apiRequest("/api/feedback", {
    method: "POST",
    body: payload,
  });
};