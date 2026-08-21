import React, { useEffect, useRef, useState } from "react";
import URL from "../../utils/url";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import loginUser from "../../services/login/loginUser";
import loginPrecheck from "../../services/login/loginPrecheck";
import { handoffToKeycloak } from "../../services/login/keycloakHandoff";
import { showToastForce } from "../../services/notification/notification";
import { useSelector, useDispatch } from "react-redux";
import { FloatLabel } from "primereact/floatlabel";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Status } from "../../utils/enum";
import { useNavigate } from "react-router-dom";
import { selectSSOProvider, selectUserSession } from "../auth/authSlice";
import { Dropdown } from "primereact/dropdown";
import { SSOlogin } from "../../services/login/SSOlogin";
import LoadSpinner from "../../components/common/LoadSpinner";
import Logo from "../../assets/images/encryption-consulting-black-logo.png";
import { ROUTES } from "../../lib/router/path";

const initialValue = {
  email: "",
  password: "",
  // Optional six-digit TOTP / authenticator code. Hidden until the
  // backend tells us 2FA is configured for this user — see the
  // requireTotp state below.
  totp: "",
};

const validationSchema = Yup.object({
  email: Yup.string().trim().required("Email is required"),
  password: Yup.string().trim().required("Password is required"),
  // TOTP is optional at the schema level; the LoginForm enforces
  // it conditionally when requireTotp is true (Formik validation
  // doesn't see runtime state, so we just block submit instead).
  totp: Yup.string().trim(),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // requireTotp goes true when the backend tells us this user has 2FA
  // configured — either via the up-front precheck (when the email
  // field blurs) or via a failed login response (legacy/fallback). The
  // OTP input appears beneath the password field once this is set,
  // and stays visible across subsequent retries so the user can
  // correct either value without losing the form.
  const [requireTotp, setRequireTotp] = useState(false);
  // True only when the OTP field appears AFTER a submit (legacy
  // post-failure path) — that's the case where stealing focus to the
  // OTP field is helpful. When the precheck reveals it up front, we
  // must NOT autoFocus, because doing so blurs whichever field the
  // user happens to be in (typically the password field) and that
  // triggers Formik's "Password is required" prematurely.
  const [autoFocusTotp, setAutoFocusTotp] = useState(false);
  // Passwordless WebAuthn — when the precheck reports the user has a
  // security key enrolled, we surface a "Sign in with security key"
  // button that hands off to Keycloak's hosted browser flow (the only
  // place a WebAuthn ceremony can run — direct grant doesn't support
  // it). The realm name comes from the precheck because the user may
  // not have selected a realm yet.
  const [webauthnAvailable, setWebauthnAvailable] = useState(false);
  const [precheckRealm, setPrecheckRealm] = useState(null);
  const [webauthnLoading, setWebauthnLoading] = useState(false);
  // Track the last username we precheck'd so we don't fire the
  // request again for the same value (e.g., when the field blurs
  // multiple times without an edit).
  const lastPrecheckedRef = useRef("");
  const { data: providerData, status: providerStatus } =
    useSelector(selectSSOProvider);
  const [selectedRealm, setSelectedRealm] = useState(null);
  const sessionID = useSelector(selectUserSession);

  useEffect(() => {
    if (providerData?.success && providerData?.data) {
      // Pick the first realm that actually has providers. Defaulting to
      // Object.keys()[0] meant a realm with zero IdPs configured would
      // hide every other realm's SSO buttons just because it happened
      // to sort first in the backend response.
      const realms = Object.entries(providerData.data);
      const firstWithProviders = realms.find(
        ([, list]) => Array.isArray(list) && list.length > 0
      );
      const fallback = realms[0]?.[0] || null;
      setSelectedRealm(firstWithProviders ? firstWithProviders[0] : fallback);
    }
  }, [providerData?.data]);

  useEffect(() => {
    if (sessionID) {
      navigate(ROUTES.SUPPORT);
    }
  }, [sessionID, navigate]);

  useEffect(() => {
    if (providerStatus === Status.Idle) {
      dispatch(SSOlogin());
    }
  }, [dispatch, providerStatus]);

  const loginSubmit = async (values) => {
    // When the OTP field is visible but empty, bail out at the
    // frontend rather than hitting /auth/login with an empty
    // totp_code. Without this guard the backend's auth-error
    // disambiguation would re-surface "Two-factor authentication
    // required" — which is technically right but reads as "your
    // password was accepted" to the user.
    if (requireTotp && !values.totp?.trim()) {
      showToastForce(
        "error",
        400,
        "Enter the 6-digit code from your authenticator app."
      );
      return;
    }

    setLoading(true);
    // Build the payload conditionally — only include totp_code when
    // we believe 2FA is in play and the user actually entered a code.
    // Sending an empty totp_code to Keycloak's direct grant returns
    // a different generic error and confuses our disambiguation.
    const payload = {
      username: values.email,
      password: values.password,
    };
    if (requireTotp && values.totp?.trim()) {
      payload.totp_code = values.totp.trim();
    }
    const result = await loginUser(payload, setLoading);
    if (result?.requireTotp) {
      setRequireTotp(true);
      // Post-failure reveal — focus the OTP field so the user
      // can start typing the code immediately.
      setAutoFocusTotp(true);
    }
    // Successful sessions are handled by the sessionID effect below
    // which navigates to /dashboard.
  };

  /**
   * Probe the backend on email blur to learn whether the user has 2FA
   * enrolled. If yes, reveal the OTP field BEFORE the first submit —
   * that way a wrong-password attempt produces a plain "invalid
   * credentials" toast instead of the misleading "two-factor
   * authentication required" flow that makes it look like the
   * password was accepted.
   *
   * We don't toast on precheck failures — the worst case is the
   * legacy post-failure path (where the OTP field appears after
   * submit), which still works.
   */
  const handleEmailBlur = async (e) => {
    const username = (e?.target?.value || "").trim();
    if (!username) {
      // Empty field: drop the cache so a fresh entry — even of the
      // same email later — triggers a new precheck. Without this, a
      // user who enrolls 2FA in another tab and re-enters the email
      // here would never see the OTP field surface up front.
      lastPrecheckedRef.current = "";
      return;
    }
    if (lastPrecheckedRef.current === username) return;
    lastPrecheckedRef.current = username;

    const result = await loginPrecheck(username);
    // Only flip requireTotp on; never off. A user who later changes
    // the email to a non-2FA account can still submit — the password
    // field is the gate, and the OTP field being blank is harmless
    // because we don't send totp_code unless it's filled.
    if (result.requires_totp) {
      setRequireTotp(true);
    }
    // Same one-way switch for WebAuthn: once we've learned the user
    // has a security key enrolled, surface the passwordless button.
    // Reset to false if the precheck explicitly says "no key" — that
    // matters when the user retypes a different email mid-flow.
    if (result.requires_webauthn) {
      setWebauthnAvailable(true);
      if (result.realm_name) {
        setPrecheckRealm(result.realm_name);
      }
    } else {
      setWebauthnAvailable(false);
      setPrecheckRealm(null);
    }
  };

  const handleSSOLogin = (realm, provider) => {
    window.location.href = `${import.meta.env.VITE_SITE_BACKEND_URL}/${
      URL.auth.realm_provider
    }/${realm}/${provider}?callback_url=${
      import.meta.env.VITE_SITE_FRONTEND_URL
    }`;
  };

  return (
    <>
      <div className="section-wrapper">
        <div className="container">
          <div className="flex flex-wrap align-items-center justify-content-center h-screen">
            <div className="w-full sm:w-8 md:w-6 lg:w-4">
              <div className="gradient-border gradient-blue-border p-4 lg:p-5">
                <Formik
                  initialValues={initialValue}
                  validationSchema={validationSchema}
                  onSubmit={loginSubmit}
                  validateOnMount={true}
                >
                  {(formik) => {
                    return (
                      <form onSubmit={formik.handleSubmit}>
                        <div className="relative">
                          <div className="text-center">
                            <img
                              src={Logo}
                              alt="Encryption Consulting"
                              className="ec-logo max-w-9rem mb-5"
                            />
                          </div>
                          {/* Field errors gate on submitCount > 0 (not
                              touched) so blank-required errors don't
                              flash while the user is still working
                              through the form. This matters here
                              because the precheck reveal can fire the
                              password field's onBlur (focus-stealing
                              into the OTP field), which would mark
                              touched=true and pop "Password is
                              required" before the user has done
                              anything wrong. */}
                          {(() => {
                            const showFieldErrors = formik.submitCount > 0;
                            const fieldProps =
                              formik.getFieldProps("email");
                            return (
                              <>
                                <div className="field mb-5">
                                  <FloatLabel>
                                    <InputText
                                      id="email"
                                      type="text"
                                      autoComplete="username"
                                      className="w-full text-sm"
                                      {...fieldProps}
                                      onBlur={(e) => {
                                        fieldProps.onBlur(e);
                                        handleEmailBlur(e);
                                      }}
                                      invalid={
                                        showFieldErrors &&
                                        Boolean(formik.errors.email)
                                      }
                                    />
                                    <label htmlFor="email">Email</label>
                                  </FloatLabel>
                                  {showFieldErrors && (
                                    <ErrorMessage
                                      name="email"
                                      component="div"
                                      className="form-error-msg"
                                    />
                                  )}
                                </div>
                                <div className="field mb-5">
                                  <FloatLabel>
                                    <Password
                                      feedback={false}
                                      id="password"
                                      toggleMask
                                      className="mb-2 block"
                                      inputClassName="text-sm w-full"
                                      {...formik.getFieldProps("password")}
                                      invalid={
                                        showFieldErrors &&
                                        Boolean(formik.errors.password)
                                      }
                                    />
                                    <label
                                      htmlFor="password"
                                      className={
                                        showFieldErrors &&
                                        formik.errors.password
                                          ? "error-msg"
                                          : ""
                                      }
                                    >
                                      Password
                                    </label>
                                  </FloatLabel>
                                  {showFieldErrors && (
                                    <ErrorMessage
                                      name="password"
                                      component="div"
                                      className="form-error-msg"
                                    />
                                  )}
                                </div>
                              </>
                            );
                          })()}
                          {/* OTP / TOTP field — shown only when the
                              backend told us the user has 2FA
                              configured. Stays visible across retries.
                              autoFocus is gated on autoFocusTotp so it
                              only triggers when the field appears
                              AFTER a submit (post-failure path) —
                              never when the precheck reveals it up
                              front, because focus-stealing then would
                              blur whichever field the user is in. */}
                          {requireTotp && (
                            <div className="field mb-5">
                              <FloatLabel>
                                <InputText
                                  id="totp"
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={8}
                                  autoComplete="one-time-code"
                                  autoFocus={autoFocusTotp}
                                  className="w-full text-sm"
                                  {...formik.getFieldProps("totp")}
                                />
                                <label htmlFor="totp">Authenticator code</label>
                              </FloatLabel>
                              <small className="block mt-2 text-ec-secondary-color">
                                Enter the 6-digit code from your authenticator app.
                              </small>
                            </div>
                          )}
                          <Button
                            type="submit"
                            label="Sign In"
                            size="small"
                            className="w-full"
                            loading={loading}
                          ></Button>
                          {/* Passwordless WebAuthn button — only
                              renders when the precheck learned this
                              user has a security key enrolled. Hands
                              off to Keycloak's authorize URL with
                              login_hint prefilled. The realm's
                              browser flow needs to expose WebAuthn
                              Passwordless as an alternative for this
                              to actually skip the password step;
                              otherwise the user lands on the regular
                              Keycloak login screen and can pick
                              "Try another way". */}
                          {webauthnAvailable && (
                            <Button
                              type="button"
                              label="Sign in with security key"
                              icon="pi pi-shield"
                              size="small"
                              outlined
                              className="w-full mt-3"
                              loading={webauthnLoading}
                              onClick={async () => {
                                const username = (
                                  formik.values.email || ""
                                ).trim();
                                if (!username || !precheckRealm) {
                                  showToastForce(
                                    "error",
                                    400,
                                    "Enter your email first so we know which account to look up."
                                  );
                                  return;
                                }
                                setWebauthnLoading(true);
                                const ok = await handoffToKeycloak({
                                  realm: precheckRealm,
                                  loginHint: username,
                                });
                                if (!ok) {
                                  setWebauthnLoading(false);
                                  showToastForce(
                                    "error",
                                    500,
                                    "Couldn't start the security-key sign-in. Try again or use your password."
                                  );
                                }
                                // On success the browser is leaving
                                // the SPA — no need to reset loading.
                              }}
                            />
                          )}
                        </div>
                      </form>
                    );
                  }}
                </Formik>

                {providerData?.success && providerData?.data ? (
                  <>
                    <Divider align="center">
                      <span>or</span>
                    </Divider>

                    {/* {providerData?.data && (
                      <Dropdown
                        value={selectedRealm}
                        onChange={(e) => setSelectedRealm(e.value)}
                        options={Object.keys(providerData?.data)?.map(
                          (key) => ({
                            key,
                            value: key,
                          })
                        )}
                        optionLabel="value"
                        placeholder="Select a Realm"
                        className="w-full mb-3"
                      />
                    )} */}
                    {selectedRealm &&
                      Object.values(providerData?.data[selectedRealm]).map(
                        (provider) => {
                          return (
                            <div
                              className="py-2"
                              key={provider.alias || provider.providerId}
                            >
                              <Button
                                type="button"
                                size="small"
                                className="bg-white hover:bg-gray-100 border-1 border-gray-200 w-full flex justify-content-center"
                                onClick={() =>
                                  handleSSOLogin(
                                    selectedRealm,
                                    provider.alias
                                  )
                                }
                              >
                                <span className="text-900 text-sm capitalize">
                                  {provider.displayName || provider.alias}
                                </span>
                              </Button>
                            </div>
                          );
                        }
                      )}
                  </>
                ) : (
                  <LoadSpinner centered={true} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
