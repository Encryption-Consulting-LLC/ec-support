import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <>
      <div className="layout-container">
        <div className="layout-content-wrapper">
          <div className="layout-topbar border-bottom-2 border-gray-200 surface-overlay flex flex-wrap justify-content-between align-items-center px-6 sticky top-0 z-1">
            <Topbar />
          </div>
          <div className="layout-content support-main">
            <Outlet />
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
