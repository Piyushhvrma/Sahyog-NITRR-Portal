export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const getErrorMessage = async (res, fallbackMessage) => {
  try {
    const data = await res.json();
    return data.message || data.msg || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    isFormData = false,
    token,
    adminPassword,
    credentials = "include",
  } = options;

  const finalHeaders = {
    ...headers,
  };

  if (!isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders["x-auth-token"] = token;
  }

  if (adminPassword) {
    finalHeaders["x-admin-password"] = adminPassword;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: finalHeaders,
    credentials,
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    const message = await getErrorMessage(
      res,
      `Request failed with status ${res.status}`
    );

    throw new Error(message);
  }

  return res.json();
}