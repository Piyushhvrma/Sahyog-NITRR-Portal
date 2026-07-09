import { apiRequest } from "./client";

export const submitSupportRequest = (payload) => {
  return apiRequest("/api/support", {
    method: "POST",
    body: payload,
  });
};

export const downloadSupportCSVUrl = () => {
  return "/api/support/download-sheet";
};