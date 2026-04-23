import axios from "axios";

const normalizeApiBaseUrl = (rawUrl) => {
  const fallbackUrl = "http://localhost:5000/api";
  const input = rawUrl?.trim();

  if (!input) {
    return fallbackUrl;
  }

  try {
    const parsedUrl = new URL(input);
    parsedUrl.pathname = parsedUrl.pathname.endsWith("/api")
      ? parsedUrl.pathname
      : `${parsedUrl.pathname.replace(/\/$/, "")}/api`;
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return input.endsWith("/api") ? input : `${input.replace(/\/$/, "")}/api`;
  }
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
