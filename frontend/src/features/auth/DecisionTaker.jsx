import { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { autoRefresh } from "../../services/auth/autoRefresh";
import { Status } from "../../utils/enum";
import { setupAutoValidate } from "../../services/auth/authValidate";
import {
  selectAutoRefresh,
  selectAutoValidate,
  resetAutoValidate,
} from "./authSlice";
import { setSession, setExpiredSession } from "./authSlice";

// Session rotation tunables. The backend issues new session IDs on
// /auth/refresh and invalidates the old one, so we cycle on a short
// interval to keep the session warm. Idle threshold pauses the cycle
// when the user is clearly away — once they come back, the next interval
// tick picks up where it left off.
const REFRESH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
const IDLE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

// Discrete user-interaction events that count as "still here". mousemove
// is included because for read-heavy pages it's often the only signal
// between clicks. All handlers are ref-write only, so attaching to
// mousemove is cheap.
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export default function DecisionTakerSelector() {
  const dispatch = useDispatch();
  const sessionId = useSelector((state) => state.auth.session);
  const { data: autoRefreshData, status: autoRefreshStatus } =
    useSelector(selectAutoRefresh);
  const intervalRef = useRef(null);
  // Last time the user did something. Initialized to "now" so a freshly
  // loaded portal isn't immediately considered idle.
  const lastActivityRef = useRef(Date.now());
  const { status: autoValidateStatus } = useSelector(selectAutoValidate);

  // Same pattern as the refresh-interval effect below: depend on the
  // BOOLEAN presence of a session, not the raw id. Previously the
  // deps were [sessionId, dispatch], and the cleanup dispatched
  // resetAutoValidate on every sessionId change — which fired every
  // ~4 minutes when /auth/refresh rotates the id. That blank-then-
  // refetch cycle put isAdmin into the `null` window briefly, so any
  // UI gated on admin role (the Admin entry in the topbar profile
  // menu, the AdminGate route) silently dropped out for users who
  // happened to open the menu during the rotation.
  //
  // The validate response doesn't need to be reset on rotation —
  // same user, same realm, same roles. Only the auth state itself
  // changes (which is what the rotated id is for). So we re-fetch
  // exactly once on login (hasSession false → true) and clear on
  // logout (true → false); rotations leave autoValidate untouched.
  //
  // Shared with the refresh-interval effect below. Includes the
  // localStorage fallback for the OIDC-callback path: main.jsx
  // populates session_id into localStorage BEFORE React mounts, and
  // the Redux setSession dispatch may land a tick later — without
  // the fallback hasSession would be false on the first render and
  // we'd skip the validate fetch.
  const hasSession = Boolean(sessionId || localStorage.getItem("session_id"));

  useEffect(() => {
    if (!hasSession) {
      if (autoValidateStatus !== Status.Idle) {
        dispatch(resetAutoValidate());
      }
      return;
    }
    if (autoValidateStatus === Status.Idle) {
      // Read the current id at fetch time (not from the closure) so a
      // rotation that landed between hasSession flipping and this
      // dispatch firing uses the freshest token.
      const currentId = sessionId || localStorage.getItem("session_id");
      if (currentId) dispatch(setupAutoValidate(currentId));
    }
    // No cleanup — validate state persists across rotations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, dispatch]);

  // Track user activity globally. Single source of truth via a ref so
  // updates don't trigger re-renders.
  useEffect(() => {
    const markActive = () => {
      lastActivityRef.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, markActive, { passive: true })
    );
    return () => {
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, markActive)
      );
    };
  }, []);

  // Session rotation loop. Keeps the interval alive across idle/active
  // transitions — we just skip the refresh call when idle. That way, the
  // moment the user comes back, the next tick (≤ 4 min later) resumes
  // rotation without needing to re-arm anything.
  //
  // IMPORTANT: setInterval's first fire is REFRESH_INTERVAL_MS in the
  // future. Without the eager kickoff below, the user can sit on a page
  // for almost 4 minutes after reload before the first /auth/refresh —
  // long enough for the underlying Keycloak access token (default TTL
  // is often shorter than 4min) to expire and start producing 401s on
  // every API call. We fire one refresh ~5s after mount to rotate the
  // token while it's still valid, then settle into the 4-min cadence.
  useEffect(() => {
    if (!hasSession) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const tick = () => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor > IDLE_THRESHOLD_MS) {
        // User has been idle > 15 minutes — proactively trigger the
        // session-expired dialog instead of silently skipping refresh.
        // The dialog is modal + closable=false, so the user has to
        // click "Login Again" which then clears the session. Reusing
        // the same expiredSession flag the axios 401 interceptor uses,
        // so both code paths land on the same dialog.
        dispatch(setExpiredSession(true));
        return;
      }
      dispatch(autoRefresh());
    };

    // Eager kickoff: rotate the session shortly after mount. 5 seconds
    // (not immediate) lets the validate request complete first — racing
    // refresh against validate creates a window where both might write
    // a new session_id to localStorage out of order. Cleared in the
    // effect's cleanup so we don't double-fire on unmount/remount.
    const initialTimeout = setTimeout(tick, 5 * 1000);

    intervalRef.current = setInterval(tick, REFRESH_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalRef.current);
    };
    // Depend on hasSession (boolean) instead of the raw sessionId, so
    // the effect only re-runs when the user logs in or logs out — not
    // every time /auth/refresh rotates the id. The previous
    // `[sessionId, dispatch]` deps caused a feedback loop:
    //   tick → /auth/refresh → new session_id → setSession dispatch →
    //   sessionId changes → useEffect re-runs → cleanup clears
    //   interval → new eager 5s timeout → tick fires again 5s later …
    // So instead of a 4-minute cadence we were refreshing every ~5s.
    // The tick callback doesn't read sessionId directly (autoRefresh
    // pulls from the store via getState), so closing over a stale
    // value here is harmless.
  }, [hasSession, dispatch]);

  // When refresh returns a new session_id, persist it to localStorage
  // (where the axios interceptor reads from) and Redux. The backend has
  // already invalidated the old id, so this MUST land before any further
  // requests fire — useEffect runs synchronously after the dispatch
  // updates the store, so we're safe here.
  useEffect(() => {
    if (autoRefreshData?.session_id) {
      const next = autoRefreshData.session_id;
      localStorage.setItem("session_id", next);
      dispatch(setSession(next));
    }
  }, [autoRefreshData, dispatch]);

  // If refresh fails (e.g. backend already invalidated the session),
  // tear down the interval so we don't keep hammering a dead session.
  useEffect(() => {
    if (autoRefreshStatus === Status.Failed && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [autoRefreshStatus]);

  return null;
}
