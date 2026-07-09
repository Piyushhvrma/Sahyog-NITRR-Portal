import { apiRequest } from "./client.js";

export const uploadProfilePicture = (formData) => {
  return apiRequest("/api/profile/upload-picture", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
};