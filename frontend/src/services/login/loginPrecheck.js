import api from "../../lib/axios/api";
import URL from "../../utils/url";

/**
 * Ask the backend whether the given username has 2FA / WebAuthn
 * enrolled. Used by the LoginForm so the OTP field can render up
 * front, before the user submits anything. This avoids the confusing
 * UX where a wrong-password attempt was still met with "Two-factor
 * authentication required" — making it look like the password was
 * accepted when it wasn't.
 *
 * Always resolves (never rejects). On any failure we treat the user
 * as single-factor and let the real /auth/login surface the error.
 *
 * Returns:
 *   {
 *     exists: boolean,
 *     requires_totp: boolean,
 *     requires_webauthn: boolean,
 *     realm_name: string | null,
 *   }
 */
async function loginPrecheck(username) {
  const blank = {
    exists: false,
    requires_totp: false,
    requires_webauthn: false,
    realm_name: null,
  };
  const trimmed = (username || "").trim();
  if (!trimmed) return blank;

  try {
    const response = await api.post(URL.auth.login_precheck, {
      username: trimmed,
    });
    const data = response?.data || {};
    return {
      exists: Boolean(data.exists),
      requires_totp: Boolean(data.requires_totp),
      requires_webauthn: Boolean(data.requires_webauthn),
      realm_name: data.realm_name || null,
    };
  } catch (err) {
    // Network blip, 5xx, etc. — fall through to the blank shape so
    // the form still renders. The real login submit will produce
    // whatever error the backend surfaces.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("loginPrecheck failed; falling back to single-factor form", err);
    }
    return blank;
  }
}

export default loginPrecheck;
