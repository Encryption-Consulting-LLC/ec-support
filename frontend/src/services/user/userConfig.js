/**
 * User-config service — talks to /user/me/config on the Resource Hub
 * backend. Used by useTheme (and later: notification settings UI) to
 * persist preferences server-side so they follow the user across
 * browsers and devices.
 *
 * Convention: every call is best-effort. The UI must never block on
 * these; localStorage remains the source of truth for the initial
 * paint. We sync to the server in the background, and on conflict the
 * server wins for the next session.
 */

import api from "../../lib/axios/api";
import URL from "../../utils/url";

/**
 * GET /user/me/config — fetch the caller's config blob.
 * Returns `{ config }` on 200, or `null` on any error (including the
 * 404 "user not yet provisioned" race). Callers fall back to local
 * defaults when this returns null.
 *
 * Note: useTheme reads only the .theme key from this and ignores the
 * rest. Settings UI reads the full doc + meta.
 */
export const fetchUserConfig = async () => {
  try {
    const response = await api.get(URL.user.config);
    return response?.data?.config ?? null;
  } catch (error) {
    // Don't surface a toast — the user didn't ask for this; it's a
    // background hydrate. Just log and fall back to local defaults.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("fetchUserConfig failed; using local defaults", error);
    }
    return null;
  }
};

/**
 * Same as fetchUserConfig but returns the full envelope including the
 * `meta` field (VAPID public key, etc.). Settings UI uses this so it
 * can enable browser push without a second round-trip.
 *
 * Shape on success: { config, meta: { vapid_public_key } }
 */
export const fetchUserConfigEnvelope = async () => {
  try {
    const response = await api.get(URL.user.config);
    return response?.data ?? null;
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("fetchUserConfigEnvelope failed", error);
    }
    return null;
  }
};

/**
 * PATCH /user/me/config — partial update. Pass only the keys you
 * want to change; the server deep-merges into the existing config.
 *
 *   patchUserConfig({ theme: "light" })
 *   patchUserConfig({ notifications: { channels: { email: true } } })
 *
 * Returns the merged config dict on success, or null on failure.
 * Silent on transport errors for the same reason as fetchUserConfig —
 * preference writes shouldn't toast the user.
 */
export const patchUserConfig = async (partial) => {
  if (!partial || typeof partial !== "object") return null;
  try {
    const response = await api.patch(URL.user.config, partial);
    return response?.data?.config ?? null;
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("patchUserConfig failed", partial, error);
    }
    return null;
  }
};
