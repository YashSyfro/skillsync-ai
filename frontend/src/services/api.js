import axios from "axios";

/**
 * One Axios instance for the entire app.
 *
 * Why not just call axios.post() directly in components?
 * If the base URL changes (e.g. local → production), you change it
 * in one place. If you later add auth headers or request logging,
 * you add it here and every call gets it automatically.
 *
 * VITE_API_URL is read from .env at build time.
 * Default falls back to localhost:8000 so the app runs without .env.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    Accept: "application/json",
  },
});

export default api;
