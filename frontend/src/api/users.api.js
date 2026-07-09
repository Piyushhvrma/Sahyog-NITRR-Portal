import { apiRequest } from "./client";

export const fetchUserCount = () => {
  return apiRequest("/api/users/count");
};