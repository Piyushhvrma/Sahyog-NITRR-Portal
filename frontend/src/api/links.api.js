import { apiRequest } from "./client";

export const fetchLinks = ({ year, branch, semester } = {}) => {
  const params = new URLSearchParams();

  if (year) params.set("year", year);
  if (branch) params.set("branch", branch);
  if (semester) params.set("semester", semester);

  const query = params.toString();

  return apiRequest(`/api/links${query ? `?${query}` : ""}`);
};

export const uploadLink = (payload, adminPassword) => {
  return apiRequest("/api/links/upload", {
    method: "POST",
    body: payload,
    adminPassword,
  });
};

export const deleteLink = (id, adminPassword) => {
  return apiRequest(`/api/links/${id}`, {
    method: "DELETE",
    adminPassword,
  });
};