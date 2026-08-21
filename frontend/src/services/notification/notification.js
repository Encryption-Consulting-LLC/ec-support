let toastRef = null;

export const setToastRef = (ref) => {
  toastRef = ref;
};

const is401 = (summary) => summary === 401 || summary === "401";

/**
 * Show a Toast notification.
 *
 * 401 errors are intentionally suppressed: the axios interceptor
 * dispatches the modal "Session Expired" dialog on any post-login 401,
 * so a toast on top would just duplicate the message. Use
 * `showToastForce` when you genuinely need a 401 to surface (e.g. the
 * login form's "Username or password is invalid" — that path bypasses
 * the interceptor because the request URL contains /login).
 */
export const showToast = (severity, summary, detail, life = 5000) => {
  if (severity === "error" && is401(summary)) return;
  if (toastRef) {
    toastRef.show([{ severity, summary, detail, life }]);
  }
};

/**
 * Same as `showToast` but bypasses the 401 suppression. Use only for
 * flows that need the user to see the error inline (login screen).
 */
export const showToastForce = (severity, summary, detail, life = 5000) => {
  if (toastRef) {
    toastRef.show([{ severity, summary, detail, life }]);
  }
};
