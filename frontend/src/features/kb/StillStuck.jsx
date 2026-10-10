import { Link } from "react-router-dom";
import { ROUTES } from "../../lib/router/path";
import { SUPPORT_CONTACT } from "../support/supportMeta";
import useSignedIn from "./useSignedIn";

// Full-width dark band at the end of an article. Opening a case needs a
// login (the route is private), so signed-out readers are told up front.
export default function StillStuck() {
  const signedIn = useSignedIn();
  return (
    <section className="kb-band" aria-labelledby="kb-stuck-h">
      <div className="kb-shell kb-stuck">
        <div>
          <h2 id="kb-stuck-h" className="kb-h2">Still stuck?</h2>
          <p>
            An EC engineer picks up your case. Sev 1: open it, then call{" "}
            <a href={SUPPORT_CONTACT.phoneHref}>{SUPPORT_CONTACT.phone}</a>.
          </p>
        </div>
        <Link to={ROUTES.SUPPORT_NEW} className="kb-btn">
          {signedIn ? "Open a case" : "Sign in to open a case"}
        </Link>
      </div>
    </section>
  );
}
