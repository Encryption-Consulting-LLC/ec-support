import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import Footer from "./Footer";
import LoadSpinner from "../common/LoadSpinner";
import { ROUTES } from "../../lib/router/path";

// Syne for headlines (the EC website's display font). React 19 hoists the
// <link> into <head>.
const SYNE = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700&display=swap";

const MainLayout = () => {
  // .site-chrome: the EC-site look on every portal page (dark pill topbar,
  // dark title bands; styles in global.scss). .kb-chrome: KB-only layout fixes.
  const { pathname } = useLocation();
  const onKb = pathname === ROUTES.KB || pathname.startsWith(`${ROUTES.KB}/`);

  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={SYNE} precedence="default" />
      <div className={`layout-container site-chrome${onKb ? " kb-chrome" : ""}`}>
        <div className="layout-content-wrapper">
          <div className="layout-topbar border-bottom-2 border-gray-200 surface-overlay flex flex-wrap justify-content-between align-items-center px-6 sticky top-0 z-5">
            <Topbar />
          </div>
          <div className="layout-content support-main">
            {/* Lazy pages (the KB) render a spinner while their chunk loads;
                topbar and footer stay put. */}
            <Suspense fallback={<LoadSpinner centered />}>
              <Outlet />
            </Suspense>
          </div>
          <div className="footer-wrapper">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
