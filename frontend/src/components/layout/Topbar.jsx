import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { Menu } from "primereact/menu";
import handleLogout from "../../services/logout/authLogout";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../lib/router/path";
import ECLogo from "../../assets/images/encryption-consulting-black-logo.png";
import UserIcon from "../../assets/icons/UserIcon";

/**
 * Support-portal topbar. Deliberately thin compared to the Client
 * Portal's: no product menu, no vault, no notification center — just
 * navigation for cases, the theme toggle, and sign-out. The layout
 * wrapper (MainLayout) provides the flex/justify-between shell.
 */

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      text
      rounded
      icon={isDark ? "pi pi-sun" : "pi pi-moon"}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    />
  );
}

export default function Topbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef(null);
  // Same check PrivateRoute uses. The KB is public, so this topbar also
  // renders for signed-out visitors; case navigation is for signed-in users.
  const sessionId = useSelector((state) => state.auth.session);
  const signedIn = Boolean(sessionId || localStorage.getItem("session_id"));

  // Underline the current section. /support/new and /support/guide are their
  // own items; every other /support path (list, case detail) is Cases.
  const { pathname } = useLocation();
  const current = pathname.startsWith(ROUTES.KB)
    ? ROUTES.KB
    : [ROUTES.SUPPORT_NEW, ROUTES.SUPPORT_GUIDE].includes(pathname)
      ? pathname
      : ROUTES.SUPPORT;
  const item = (label, to) => ({
    label,
    command: () => navigate(to),
    className: current === to ? "topbar-current" : undefined,
  });

  const menuItems = [
    ...(signedIn
      ? [
          item("Cases", ROUTES.SUPPORT),
          item("Open a case", ROUTES.SUPPORT_NEW),
          item("How support works", ROUTES.SUPPORT_GUIDE),
        ]
      : []),
    item("Knowledge base", ROUTES.KB),
  ];

  const userMenuItems = [
    {
      label: "Sign out",
      icon: "pi pi-sign-out",
      command: () => handleLogout(dispatch, navigate),
    },
  ];

  return (
    <>
      <div className="flex align-items-center">
        <div className="sidebar-logo mr-6">
          <img
            src={ECLogo}
            alt="Encryption Consulting"
            className="max-w-9rem cursor-pointer block"
            onClick={() => navigate(signedIn ? ROUTES.SUPPORT : ROUTES.KB)}
          />
        </div>
        <div className="topbar-menus">
          <Menubar model={menuItems} />
        </div>
      </div>
      <div className="flex align-items-center gap-2">
        <ThemeToggle />
        {signedIn ? (
          <>
            <Button
              text
              rounded
              aria-label="Account"
              onClick={(e) => userMenuRef.current?.toggle(e)}
            >
              <UserIcon />
            </Button>
            <Menu model={userMenuItems} popup ref={userMenuRef} />
          </>
        ) : (
          <Button
            label="Sign in"
            size="small"
            onClick={() => navigate(ROUTES.LOGIN)}
          />
        )}
      </div>
    </>
  );
}