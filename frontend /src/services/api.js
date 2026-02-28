import axios from "axios";

const api = axios.create({
  // Empty baseURL – Vite dev server proxies /api/* to the PHP backend.
  // In production, configure your web server to forward /api requests.
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
