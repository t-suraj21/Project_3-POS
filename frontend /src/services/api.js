import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
  headers: {
    "Content-Type": "application/json",
  },
  // ⚠️ SECURITY: Add request timeout to prevent hanging requests (30 seconds)
  timeout: 30000,
  // Don't send credentials in cross-origin requests by default
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ⚠️ SECURITY: Add timeout specifically for this request
  config.timeout = 30000;
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error("Access denied:", error.response?.data?.message);
      return Promise.reject(error);
    }
    
    // Handle network timeout
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout - server took too long to respond");
      error.response = { 
        status: 503, 
        data: { message: "Server timeout. Please try again." } 
      };
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        response: {
          status: 0,
          data: { message: "Network error. Please check your connection." }
        }
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

