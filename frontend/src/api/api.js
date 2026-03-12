import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const isPhpGatewayBase = /\/index\.php\/?$/.test(baseURL);

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically (REQUEST INTERCEPTOR)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Production gateway mode:
    // transform "/v1/..." into "?path=/v1/..." against index.php
    if (isPhpGatewayBase && config.url && !/^https?:\/\//i.test(config.url)) {
      const normalizedPath = config.url.startsWith("/") ? config.url : `/${config.url}`;
      config.params = { ...(config.params || {}), path: normalizedPath };
      config.url = "";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401 (RESPONSE INTERCEPTOR)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);

    // Only redirect when an authenticated request is rejected.
    if (status === 401 && hadAuthHeader) {
      console.log("Unauthorized → Logging out user…");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Auto redirect to login
    }

    return Promise.reject(error);
  }
);

export default api;
