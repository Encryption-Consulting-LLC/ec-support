import { Navigate, useLocation, useParams } from "react-router-dom";
import { kbUrl } from "../../lib/router/path";

// The KB used to live at /kb. Old links (emails, bookmarks, search results)
// land here and are sent to the same page under the new address, keeping
// the search query and #section.
export default function LegacyKbRedirect() {
  const rest = useParams()["*"] ?? "";
  const { search, hash } = useLocation();
  return <Navigate to={`${kbUrl(rest.replace(/\/$/, ""))}${search}${hash}`} replace />;
}
