import api from "../../lib/axios/api";

/**
 * Ask the backend to mint a Keycloak authorize URL and follow it.
 * Used wherever we hand the user off to Keycloak's hosted browser
 * flow to complete authentication — currently:
 *   - the post-failure required_action_redirect path in loginUser.js
 *   - the pre-login passwordless WebAuthn button in LoginForm.jsx
 *
 * The backend endpoint (POST /auth/action/start) signs a state token
 * with PKCE, builds the OIDC authorize URL with login_hint prefilled,
 * and returns it. The redirect lands the user on Keycloak's login
 * screen with their username already populated; whether they end up
 * doing password+OTP or passwordless WebAuthn depends on what the
 * realm's browser flow exposes. For WebAuthn-only login, the realm
 * admin must have configured a passwordless flow with the WebAuthn
 * Passwordless authenticator as an alternative.
 *
 * Resolves to true when the browser is being redirected (so the
 * caller should stop doing UI work), false when something prevented
 * the handoff (network, missing redirect_url, etc.).
 */
export async function handoffToKeycloak({
  realm,
  loginHint,
  postLoginRedirect = "/support",
}) {
  if (!realm || !loginHint) return false;
  try {
    const response = await api.post("/auth/action/start", {
      realm,
      login_hint: loginHint,
      post_login_redirect: postLoginRedirect,
    });
    const redirectUrl = response?.data?.redirect_url;
    if (!redirectUrl) return false;
    window.location.assign(redirectUrl);
    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("handoffToKeycloak failed", err);
    }
    return false;
  }
}
