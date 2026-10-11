import { Link } from "react-router-dom";
import { ROUTES } from "../../lib/router/path";
import useSignedIn from "./useSignedIn";

// Full-width dark band at the end of the KB home, articles and sections.
// Opening a case needs a login, so signed-out readers go to the login page;
// signed-in readers go straight to the Open a case form.
export default function StillStuck() {
  const signedIn = useSignedIn();
  return (
    <section className="kb-band" aria-labelledby="kb-stuck-h">
      <div className="kb-shell kb-stuck">
        <div>
          <h2 id="kb-stuck-h" className="kb-h2">Still stuck?</h2>
          <p>An EC engineer picks up your case.</p>
        </div>
        <Link to={signedIn ? ROUTES.SUPPORT_NEW : ROUTES.LOGIN} className="kb-btn">
          Open a case
        </Link>
      </div>
    </section>
  );
}
