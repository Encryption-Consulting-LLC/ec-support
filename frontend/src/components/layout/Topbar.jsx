import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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

  const menuItems = [
    { label: "Cases", command: () => navigate(ROUTES.SUPPORT) },
    { label: "Open a case", command: () => navigate(ROUTES.SUPPORT_NEW) },
    { label: "How support works", command: () => navigate(ROUTES.SUPPORT_GUIDE) },
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
            onClick={() => navigate(ROUTES.SUPPORT)}
          />
        </div>
        <div className="topbar-menus">
          <Menubar model={menuItems} />
        </div>
      </div>
      <div className="flex align-items-center gap-2">
        <ThemeToggle />
        <Button
          text
          rounded
          aria-label="Account"
          onClick={(e) => userMenuRef.current?.toggle(e)}
        >
          <UserIcon />
        </Button>
        <Menu model={userMenuItems} popup ref={userMenuRef} />
      </div>
    </>
  );
}
