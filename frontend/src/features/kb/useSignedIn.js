import { useSelector } from "react-redux";

// Same check PrivateRoute and the Topbar use. The KB is public; this only
// changes wording (e.g. "Sign in to open a case"), never what can be read.
export default function useSignedIn() {
  const session = useSelector((state) => state.auth.session);
  return Boolean(session || localStorage.getItem("session_id"));
}
