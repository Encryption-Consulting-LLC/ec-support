import React, { useRef, useEffect, lazy } from "react";
import Login from "./pages/login/Login";
import { Toast } from "primereact/toast";
import { setToastRef } from "./services/notification/notification";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { pendingAuthErrorFromOIDC } from "./main";
import DecisionTakerSelector from "./features/auth/DecisionTaker";
import SessionExpiredDialog from "./features/auth/HandleSession";
import PrivateRouteSelector from "./features/auth/PrivateRoute";
import SessionGuardSelector from "./features/auth/SessionGuard";
import MainLayout from "./components/layout/MainLayout";
import SupportCases from "./features/support/SupportCases";
import NewCase from "./features/support/NewCase";
import CaseDetail from "./features/support/CaseDetail";
import SupportGuide from "./features/support/SupportGuide";
import { ConfirmDialog } from "primereact/confirmdialog";
import { ROUTES } from "./lib/router/path";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/themes/primeone-light.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "./global.scss";

/**
 * EC Support Portal — standalone client-facing ticketing app.
 *
 * The whole auth stack (Keycloak-backed login, TOTP/WebAuthn required-
 * action handoff, session rotation, expired-session dialog) is vendored
 * unchanged from the Client Portal, so credentials and behavior match
 * what clients already know. Everything behind PrivateRouteSelector is
 * the support module. The /kb knowledge base is public and sits outside it.
 */

const KbPage = lazy(() => import("./features/kb/kbPage"));

function App() {
  const toast = useRef(null);

  useEffect(() => {
    setToastRef(toast.current);

    // OIDC fragment pickup (session_id / auth_error) runs in main.jsx
    // BEFORE React mounts — see the comment there. This effect only
    // surfaces a queued auth_error once the Toast ref exists.
    if (pendingAuthErrorFromOIDC) {
      import("./services/notification/notification").then(
        ({ showToastForce }) => {
          showToastForce(
            "error",
            "Authentication failed",
            pendingAuthErrorFromOIDC
          );
        }
      );
    }
  }, []);

  return (
    <>
      <Toast ref={toast} />
      {/* Exactly one ConfirmDialog at the app root — see the Client
          Portal for the triple-popup bug this prevents. */}
      <ConfirmDialog />
      <BrowserRouter>
        <DecisionTakerSelector />
        <SessionExpiredDialog />
        <Routes>
          <Route path="" element={<SessionGuardSelector />} />
          <Route path={ROUTES.HOME} element={<SessionGuardSelector />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route element={<MainLayout />}>
            {/* Public: the knowledge base needs no login. */}
            <Route path={ROUTES.KB_PAGE} element={<KbPage />} />
            <Route element={<PrivateRouteSelector />}>
              <Route path={ROUTES.SUPPORT} element={<SupportCases />} />
              <Route path={ROUTES.SUPPORT_NEW} element={<NewCase />} />
              <Route path={ROUTES.SUPPORT_GUIDE} element={<SupportGuide />} />
              <Route path={ROUTES.SUPPORT_DETAIL} element={<CaseDetail />} />
            </Route>
          </Route>
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
