import { apiRequest } from "./client.js";

export const fetchAdminStats = () => {
  return apiRequest("/api/admin/stats");
};

export const fetchAdminUsers = () => {
  return apiRequest("/api/admin/users");
};

export const updateUserRole = (userId, role) => {
  return apiRequest(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });
};