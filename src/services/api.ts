import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://prozac-dainty-antiquely.ngrok-free.dev/api";

export const BASE_URL = API_URL.replace("/api", "");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sikapas_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
