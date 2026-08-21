import { setSession } from "../../features/auth/authSlice";
import api from "../../lib/axios/api";
import URL from "../../utils/url";
import { resetSessionExpiredFlag } from "../../lib/axios/api";

// LocalStorage keys that logout should remove. Everything else (theme
// preference under "ec-portal-theme", future per-user UI prefs) is kept
// so a user's chosen theme survives logout/login on the same browser.
// Add new keys here when introducing additional auth-scoped storage.
const AUTH_STORAGE_KEYS = ["session_id", "user"];

const handleLogout = async (dispatch, navigate) => {
  const cleanupSession = () => {
    // Surgical removal, not localStorage.clear() — preserves
    // non-session preferences like theme.
    AUTH_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore — private mode / disabled storage; nothing to clean
      }
    });
    dispatch(setSession(null));
    resetSessionExpiredFlag();
    navigate("/login");
    window.location.reload();
  };

  try {
    let loginMethod = null;
    let session_id = null;

    const rawUser = localStorage.getItem("user");
    const rawSessionId = localStorage.getItem("session_id");

    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        session_id = user.session_id || null;
        loginMethod = user.loginMethod || null;
      } catch (parseError) {
        console.error("Failed to parse 'user':", parseError);
        cleanupSession();
        return;
      }
    } else if (rawSessionId) {
      session_id = rawSessionId;
      loginMethod = "local";
    }

    const callback_url = `${window.location.origin}/login`;

    if (loginMethod === "sso") {
      try {
        const response = await api.get(
          `${URL.auth.logout}?callback_url=${encodeURIComponent(callback_url)}`,
          {},
          {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
          }
        );

        if (response.data?.sso_logout_url) {
          cleanupSession();
          window.location.href = response.data.sso_logout_url;
          return;
        }
      } catch (ssoError) {
        console.warn("SSO logout API failed:", ssoError);

        try {
          const fallbackResponse = await api.get(
            `${URL.auth.sso_logout_callback}?state=${session_id}`,
            {},
            {
              maxRedirects: 0,
              validateStatus: (status) => status >= 200 && status < 400,
            }
          );

          if (
            fallbackResponse.status === 302 &&
            fallbackResponse.headers.location
          ) {
            cleanupSession();
            window.location.href = fallbackResponse.headers.location;
            return;
          } else if (
            fallbackResponse.status === 200 &&
            fallbackResponse.data?.success
          ) {
            cleanupSession();
            return;
          }
        } catch (fallbackError) {
          console.error("Fallback SSO logout failed:", fallbackError);
          cleanupSession();
          return;
        }
      }
    } else {
      // --- NORMAL LOGOUT ---
      try {
        await api.get(URL.auth.logout); // Call /auth/logout for session-based logout
        console.log("Normal logout API call succeeded");
      } catch (logoutError) {
        console.warn("Normal logout API call failed:", logoutError);
      }

      cleanupSession();
    }
  } catch (error) {
    console.error("Unexpected logout error:", error);
  }
};

export default handleLogout;
