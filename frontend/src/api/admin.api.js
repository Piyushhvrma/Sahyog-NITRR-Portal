import { apiRequest, API_BASE_URL } from "./client.js";

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

export const fetchAdminFeedbacks = ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  return apiRequest(`/api/feedback/admin?${params.toString()}`);
};

export const updateFeedbackStatus = (id, status) => {
  return apiRequest(`/api/feedback/admin/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
};

export const deleteFeedback = (id) => {
  return apiRequest(`/api/feedback/admin/${id}`, {
    method: "DELETE",
  });
};

export const downloadFeedbackCSVUrl = () => {
  return `${API_BASE_URL}/api/feedback/admin/export`;
};

export const fetchAdminSupportRequests = ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  return apiRequest(`/api/support/admin?${params.toString()}`);
};

export const updateSupportRequestStatus = (id, payload) => {
  return apiRequest(`/api/support/admin/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
};

export const deleteSupportRequest = (id) => {
  return apiRequest(`/api/support/admin/${id}`, {
    method: "DELETE",
  });
};

export const fetchAdminBloodRequests = ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  return apiRequest(`/api/blood-request/admin?${params.toString()}`);
};

export const updateBloodRequestStatus = (id, payload) => {
  return apiRequest(`/api/blood-request/admin/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
};

export const deleteBloodRequest = (id) => {
  return apiRequest(`/api/blood-request/admin/${id}`, {
    method: "DELETE",
  });
};

export const downloadBloodRequestCSVUrl = () => {
  return `${API_BASE_URL}/api/blood-request/admin/export`;
};