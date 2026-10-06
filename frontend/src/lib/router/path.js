export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  // Support hub is the portal's landing page after login — /support is
  // the case list, /support/new the submit-a-request form, and
  // /support/<case_no> the case detail + comment thread. /support/new
  // wins over the :case_no param route by react-router's static-
  // segment ranking.
  SUPPORT: "/support",
  SUPPORT_NEW: "/support/new",
  // Static orientation page — /support/guide beats /support/:case_no by
  // react-router's static-segment ranking, same as /support/new.
  SUPPORT_GUIDE: "/support/guide",
  SUPPORT_DETAIL: "/support/:case_no",
  KB: "/kb",
  KB_SEARCH: "/kb/search",
  KB_PAGE: "/kb/*",
};
export const kbUrl = (id) => (id ? `${ROUTES.KB}/${id}` : ROUTES.KB);
