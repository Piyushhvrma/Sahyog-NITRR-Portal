import { apiRequest } from "./client.js";

export const fetchLinks = ({
  year,
  branch,
  semester,
  page = 1,
  limit = 10,
} = {}) => {
  const params = new URLSearchParams();

  if (year) params.set("year", year);
  if (branch) params.set("branch", branch);
  if (semester) params.set("semester", semester);

  params.set("page", page);
  params.set("limit", limit);

  return apiRequest(`/api/links?${params.toString()}`);
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