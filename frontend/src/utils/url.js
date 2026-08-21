const URL = {
  auth: {
    login: "/auth/login",
    login_precheck: "/auth/login-precheck",
    auto_renew: "/auth/auto-renew",
    validate: "/auth/validate",
    sso_providers: "/auth/sso/providers",
    realm_provider: "/auth/sso/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    sso_logout_callback: "/auth/sso/logout/callback",
  },
  user: {
    // Used by useTheme to persist the theme preference server-side.
    // Best-effort — the portal works fine if these 404 on a backend
    // that doesn't expose them.
    me: "/user/me",
    config: "/user/me/config",
  },
  support: {
    // Mounted at /api/v1/support (see backend/app/api/support.py).
    // Path templates with <case_no> / <index> are interpolated at
    // call time by the service module.
    cases: "/support/cases",
    case_detail: "/support/cases/<case_no>",
    comments: "/support/cases/<case_no>/comments",
    attachment: "/support/cases/<case_no>/attachments/<index>",
  },
};

export default URL;
