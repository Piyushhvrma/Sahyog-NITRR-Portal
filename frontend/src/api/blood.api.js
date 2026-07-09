import { apiRequest } from "./client";

export const submitBloodRequest = (formData) => {
  return apiRequest("/api/blood-request", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
};