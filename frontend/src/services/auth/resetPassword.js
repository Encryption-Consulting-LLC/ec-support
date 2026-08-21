import api from "../../lib/axios/api";
import { showToast } from "../notification/notification";

/**
 * Resets the currently-authenticated user's own password.
 *
 * Calls POST /auth/{realm}/{userId}/resetPassword with body
 * { password, temporary: false }. The backend enforces that
 * {realm, userId} match the session's realm and sub — i.e. users can
 * only reset their own password.
 *
 * @param {object} args
 * @param {string} args.realm    — realm name (from autoValidate response)
 * @param {string} args.userId   — user sub / ID (from autoValidate response)
 * @param {string} args.password — new password (caller validates length)
 * @returns {Promise<object>} the success response body from the backend
 * @throws on any non-2xx response (after surfacing a toast)
 */
export const resetUserPassword = async ({ realm, userId, password }) => {
  try {
    const response = await api.post(
      `/auth/${encodeURIComponent(realm)}/${encodeURIComponent(
        userId
      )}/resetPassword`,
      { password, temporary: false }
    );
    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      "Password reset failed";
    const code = error?.response?.status || 500;
    showToast("error", code, message);
    throw error;
  }
};
