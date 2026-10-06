import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Footer from "./Footer";
import LoadSpinner from "../common/LoadSpinner";

const MainLayout = () => {
  return (
    <>
      <div className="layout-container">
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