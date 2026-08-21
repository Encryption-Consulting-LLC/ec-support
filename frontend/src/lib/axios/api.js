// api.js
import axios from "axios";
import store from "../redux/store";
import { setExpiredSession } from "../../features/auth/authSlice";

const api = axios.create({
  //baseURL: "https://127.0.0.1:5500/api/v1",
  baseURL: import.meta.env.VITE_SITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
let isSessionExpired = false;
// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("session_id");
    if (!config.headers) {
      config.headers = {};
    }

    const hasAuthHeader =
      config.headers.Authorization || config.headers.authorization;

    if (token && !hasAuthHeader) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.callbackUrl) {
      config.headers["callback_url"] = window.location.origin;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || "";
      const isLoginRequest = requestUrl.includes("/login");
      if (!isLoginRequest) {
        const state = store.getState();

        // Redux state is the canonical source of truth for whether
        // the expired-session dialog is currently up. The module
        // flag is just a per-instance debounce for concurrent 401s
        // landing before redux updates propagate. If they ever drift
        // (some path cleared redux without resetting our flag), the
        // first 401 after the drift snaps them back into sync.
        if (isSessionExpired && !state.auth.expiredSession) {
          isSessionExpired = false;
        }

        if (!isSessionExpired && !state.auth.expiredSession) {
          isSessionExpired = true;
          store.dispatch(setExpiredSession(true));
        }
      }
    }

    return Promise.reject(error);
  }
);

export function resetSessionExpiredFlag() {
  isSessionExpired = false;
}

export default api;
