/**
 * api.js — Axios HTTP Client
 *
 * This is the single Axios instance used by every hook and component in the
 * app. Centralising it here means we define the base URL, default headers,
 * and interceptors in exactly one place.
 *
 * Key behaviours:
 *
 *   Request interceptor:
 *     Reads the JWT from localStorage and attaches it as
 *     "Authorization: Bearer <token>" on every outgoing request.
 *     Routes that don't need auth (login, register) still get the header
 *     attached, but the backend simply ignores it for those endpoints.
 *
 *   Response interceptor:
 *     If any response comes back with a 401 status (token expired or
 *     invalid), we immediately clear the stored session and redirect
 *     the user to /login. This handles the case where the user's
 *     browser was open for more than 7 days without refreshing.
 *
 * In development, the Vite dev server proxies /api/* to localhost:8888,
 * so the baseURL is intentionally left empty ("").
 * In production, configure your web server (nginx/Apache) to proxy
 * /api requests to the PHP backend instead.
 */
import axios from "axios";

const api = axios.create({
  baseURL: "",  // Vite proxies /api/* → PHP backend (see vite.config.js)
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach the stored JWT to every request ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle expired / missing sessions globally ─────────
api.interceptors.response.use(
  // Any 2xx response passes straight through — nothing to do here.
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // The server rejected the token. Clear everything and send the user
      // back to the login page so they can get a fresh token.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    // Re-throw so individual callers can still handle specific errors
    // (e.g., show a "Invalid credentials" message on the login form).
    return Promise.reject(error);
  }
);

export default api;
