import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import store from "./lib/redux/store";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "primereact/api";
import { setSession } from "./features/auth/authSlice";

// -----------------------------------------------------------------------
// OIDC callback handoff — must run BEFORE React mounts.
//
// When the user finishes Keycloak's hosted flow (required actions,
// passwordless WebAuthn, etc.), the backend redirects the browser to
//   https://<portal>/<path>#session_id=<uuid>
// The session id rides in the URL FRAGMENT so it never hits server
// access logs or HTTP referer headers.
//
// We previously consumed the fragment in App.jsx's useEffect, but
// React Router's PrivateRoute runs SYNCHRONOUSLY during the first
// render — it sees no session in Redux/localStorage, returns
// <Navigate to="/login" />, and that navigation strips the fragment
// off the URL before useEffect ever gets to read it. So the session
// id was being lost on every required-action callback.
//
// Hoisting the fragment pickup here — at module load, before React
// touches anything — fixes the race: localStorage is populated and
// the Redux store is preloaded, so PrivateRoute's synchronous check
// finds the session and renders /dashboard.
//
// Also handles the auth_error case (state expired, identity
// mismatch, user cancelled) by stashing the message for App.jsx to
// surface as a toast once the Toast ref is mounted.
let pendingAuthError = null;
if (typeof window !== "undefined" && window.location.hash) {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const sessionFromFragment = params.get("session_id");
  const authError = params.get("auth_error");

  if (sessionFromFragment) {
    try {
      localStorage.setItem("session_id", sessionFromFragment);
    } catch {
      /* private mode / blocked storage — Redux is still set below */
    }
    store.dispatch(setSession(sessionFromFragment));
  } else if (authError) {
    pendingAuthError = decodeURIComponent(authError);
  }

  // Strip the fragment so a reload doesn't re-process it. This also
  // prevents PrivateRoute from getting confused by stale fragments.
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
}
// Expose the queued error message to App.jsx without polluting
// window globals — App imports this and surfaces a toast once Toast
// is mounted (showToastForce can't fire before then).
export const pendingAuthErrorFromOIDC = pendingAuthError;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  //   <Provider store={store}>
  //     <PrimeReactProvider>
  //       <App />
  //     </PrimeReactProvider>
  //   </Provider>
  // </React.StrictMode>
  <Provider store={store}>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </Provider>
);
