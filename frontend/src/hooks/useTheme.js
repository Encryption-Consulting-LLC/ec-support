import { useEffect, useState, useCallback, useRef } from "react";
import { fetchUserConfig, patchUserConfig } from "../services/user/userConfig";

// LocalStorage key — also referenced by the no-flash init script in
// index.html. Keep both in sync.
const STORAGE_KEY = "ec-portal-theme";

// Dark is the brand default. Users can opt into light via the Topbar
// toggle; the choice is persisted to localStorage AND server-side via
// /user/me/config so it follows the user across browsers and devices.
const DEFAULT_THEME = "dark";

const isValidTheme = (t) => t === "light" || t === "dark";

const readStored = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(stored)) return stored;
  } catch {
    // localStorage may be blocked (private mode / strict CSP).
  }
  return DEFAULT_THEME;
};

/**
 * Theme hook with server-side persistence.
 *
 * Lifecycle:
 *   1. Synchronous init from localStorage so the first paint matches
 *      what the no-flash script in index.html already applied. No
 *      flicker even on slow networks.
 *   2. After mount, fire-and-forget GET /user/me/config. If the
 *      server has a different value, switch to it (and update
 *      localStorage so next reload starts from the right place).
 *   3. On every user-initiated toggle, fire PATCH /user/me/config
 *      synchronously from the gesture handler so the network call is
 *      visible immediately. No debounce — toggling theme is rare and
 *      the request is tiny.
 *
 * Why no debounce: prior version debounced server writes by 250ms,
 * which delayed the visible POST in DevTools and gave the impression
 * the change wasn't persisting. Cleaner UX: every click = one POST.
 *
 * @returns {{ theme: "light" | "dark", toggleTheme: () => void, setTheme: (t: "light" | "dark") => void }}
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(readStored);

  // Mirror theme into a ref so toggleTheme can read the latest value
  // without depending on stale closures. Avoids the side-effect-in-
  // setState-updater anti-pattern (which would double-fire under
  // React.StrictMode if it's ever re-enabled in main.jsx).
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Prevent the initial server-hydrate from itself triggering a write
  // back to the server (would create a needless round-trip).
  const hydratedFromServerRef = useRef(false);

  // 1. Apply theme to <html> + localStorage on every change.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore — preference is in-memory only this session.
    }
  }, [theme]);

  // 2. Hydrate from server once on mount. We only set state if the
  // server value differs from what we already have, to avoid a
  // pointless re-render on the common case (local + server agree).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const serverConfig = await fetchUserConfig();
      if (cancelled) return;
      const serverTheme = serverConfig?.theme;
      hydratedFromServerRef.current = true;
      if (isValidTheme(serverTheme) && serverTheme !== theme) {
        setThemeState(serverTheme);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally empty deps — this is a one-shot hydrate on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Internal: apply a theme change locally AND push to the server in
  // the same tick. The server PATCH is best-effort; on transient
  // failure useTheme's localStorage write keeps the choice intact
  // until next login.
  const applyTheme = useCallback((next) => {
    setThemeState(next);
    // Only push to the server after the initial hydrate has run —
    // otherwise the very first render could race the server fetch
    // and overwrite the server's value with the localStorage default.
    if (hydratedFromServerRef.current) {
      patchUserConfig({ theme: next });
    }
  }, []);

  const setTheme = useCallback(
    (next) => {
      if (!isValidTheme(next)) return;
      applyTheme(next);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const next = themeRef.current === "dark" ? "light" : "dark";
    applyTheme(next);
  }, [applyTheme]);

  return { theme, toggleTheme, setTheme };
};
