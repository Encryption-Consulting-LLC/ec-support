import api from "../../lib/axios/api";
import URL from "../../utils/url";
import store from "../../lib/redux/store";
import { setSession } from "../../features/auth/authSlice";
import { showToast, showToastForce } from "../notification/notification";
import { handoffToKeycloak } from "./keycloakHandoff";

/**
 * Submit credentials to the login endpoint.
 *
 * Returns an object so the caller (LoginForm) knows what UI move to
 * make. Toast notifications are surfaced from here for the cases
 * where the user just needs a clear error — the only thing the
 * caller has to react to is `requireTotp`, which means "render the
 * OTP input and ask the user to retry with the code".
 *
 * Returns:
 *   { ok: true }                               — session set, navigate
 *   { ok: false, requireTotp: true }           — show the OTP field
 *   { ok: false, requireTotp: false }          — toast already shown
 */
async function loginUser(credentials, setLoading) {
  try {
    const response = await api.post(URL.auth.login, credentials);
    if (response.data?.session_id) {
      localStorage.setItem("session_id", response.data.session_id);
      store.dispatch(setSession(response.data.session_id));
      return { ok: true };
    }
    // 200 with no session_id — unexpected. Surface as generic.
    showToastForce(
      "error",
      500,
      "Login returned no session. Please try again."
    );
    return { ok: false, requireTotp: false };
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    const code = error?.response?.status ?? 500;
    const data = error?.response?.data ?? {};
    const errorType = data.error_type;

    // Backend signals "this user has required actions" with
    // error_type=required_action_redirect + the realm/login_hint
    // we need to start the OIDC redirect. Hand off to Keycloak's
    // hosted UI; on completion it bounces back to
    // /api/v1/auth/action/callback which lands the user in /dashboard
    // already signed in.
    if (
      errorType === "required_action_redirect" &&
      data.realm_name &&
      (data.username || credentials.username)
    ) {
      const handed = await handoffToKeycloak({
        realm: data.realm_name,
        loginHint: data.username || credentials.username,
      });
      if (handed) return { ok: false, requireTotp: false };
      showToastForce(
        "error",
        500,
        "Account setup is required but the redirect failed. Contact support."
      );
      return { ok: false, requireTotp: false };
    }

    // User has TOTP configured but didn't include a code in this
    // submission. Tell the caller to render the OTP field — don't
    // toast, this is the user's first hint that 2FA is needed.
    if (errorType === "totp_required") {
      return { ok: false, requireTotp: true };
    }

    // User provided a TOTP code but the combination failed. We
    // can't tell whether the password or the OTP was wrong (Keycloak
    // returns the same error for both), so the message reflects that.
    // Re-render the OTP field so the user can retry without losing
    // their place in the form.
    if (errorType === "totp_or_password_wrong") {
      showToastForce(
        "error",
        code,
        data.message ||
          "Wrong password or one-time code. Check both and try again."
      );
      return { ok: false, requireTotp: true };
    }

    if (errorType === "account_disabled") {
      showToastForce(
        "error",
        code,
        data.message ||
          "Your account is disabled. Contact your administrator."
      );
      return { ok: false, requireTotp: false };
    }

    // invalid_credentials and the legacy fallbacks land here. 401 on
    // login is intentionally surfaced via showToastForce because the
    // global axios 401 interceptor suppresses toasts on login URLs.
    if (code === 401 || errorType === "invalid_credentials") {
      showToastForce(
        "error",
        code,
        data.message || "Invalid username or password."
      );
    } else {
      showToast(
        "error",
        code,
        data.error || data.message || "Login failed"
      );
    }
    return { ok: false, requireTotp: false };
  } finally {
    setLoading(false);
  }
}

export default loginUser;
