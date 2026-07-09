import { apiRequest } from "./client";

export const loginUser = (payload) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: payload,
  });
};

export const registerUser = (payload) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: payload,
  });
};

export const googleLogin = (credential) => {
  return apiRequest("/api/auth/google-login", {
    method: "POST",
    body: { credential },
  });
};

export const forgotPassword = (email) => {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
};

export const resetPassword = (payload) => {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });
};