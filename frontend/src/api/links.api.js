import { apiRequest } from "./client.js";

export const fetchLinks = ({ year, branch, semester } = {}) => {
  const params = new URLSearchParams();

  if (year) params.set("year", year);
  if (branch) params.set("branch", branch);
  if (semester) params.set("semester", semester);

  const query = params.toString();

  return apiRequest(`/api/links${query ? `?${query}` : ""}`);
};

export const uploadLink = (payload) => {
  return apiRequest("/api/links/upload", {
    method: "POST",
    body: payload,
  });
};

export const deleteLink = (id) => {
  return apiRequest(`/api/links/${id}`, {
    method: "DELETE",
  });
};