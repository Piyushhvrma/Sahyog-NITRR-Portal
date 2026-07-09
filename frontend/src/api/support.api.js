// frontend/src/api/support.api.js
// Handles SAHYOG support request APIs.

import { apiRequest, API_BASE_URL } from "./client.js";

export const submitSupportRequest = (payload) => {
  return apiRequest("/api/support", {
    method: "POST",
    body: payload,
  });
};

export const downloadSupportCSVUrl = () => {
  return `${API_BASE_URL}/api/support/download-sheet`;
};