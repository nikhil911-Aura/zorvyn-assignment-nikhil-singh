const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!data.success) {
    const error = new Error(data.error?.message || "Request failed");
    error.status = res.status;
    error.details = data.error?.details;
    throw error;
  }

  return data.data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
