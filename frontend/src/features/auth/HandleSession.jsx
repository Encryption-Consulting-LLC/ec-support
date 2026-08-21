import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "primereact/dialog";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../lib/router/path";
import { Button } from "primereact/button";
import { setSession, setExpiredSession } from "./authSlice";
import { resetSessionExpiredFlag } from "../../lib/axios/api";

export default function SessionExpiredDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const visible = useSelector((state) => state.auth.expiredSession);
  // LocalStorage keys to wipe on forced logout. Theme preference
  // ("ec-portal-theme") is intentionally NOT in this list — the user's
  // chosen theme should survive session expiry and persist across
  // logins on the same browser. Keep in sync with AUTH_STORAGE_KEYS in
  // services/logout/authLogout.js.
  const AUTH_STORAGE_KEYS = ["session_id", "user"];

  const clearSession = () => {
    setTimeout(() => {
      // Surgical removal — was localStorage.clear() which nuked the
      // theme preference too.
      AUTH_STORAGE_KEYS.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // private mode / storage disabled — nothing to clean
        }
      });
      dispatch(setSession(null));
      resetSessionExpiredFlag();
      navigate(ROUTES.LOGIN);
      window.location.reload();
    }, 500);
  };

  return (
    <Dialog
      header="Session expired"
      visible={visible}
      style={{ width: "min(420px, 92vw)" }}
      modal
      closable={false}
      dismissableMask={false}
      className="p-fluid"
      footer={
        <div className="flex justify-content-end">
          <Button
            label="OK"
            icon="pi pi-sign-in"
            severity="primary"
            onClick={() => {
              dispatch(setExpiredSession(false));
              clearSession();
            }}
            className="p-button-sm"
            autoFocus
          />
        </div>
      }
    >
      <div className="text-center px-2">
        <i
          className="pi pi-clock text-orange-500"
          style={{ fontSize: "2rem" }}
        />
        <p
          className="mt-3 mb-0"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          You've been inactive for more than 15 minutes.
          <br />
          Please sign in again to continue.
        </p>
      </div>
    </Dialog>
  );
}
