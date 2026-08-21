import { SUPPORT_CONTACT } from "../../features/support/supportMeta";
import Twitter from "../../assets/images/twitter-icon.png";
import Facebook from "../../assets/images/facebook-icon.png";
import Youtube from "../../assets/images/youtube-icon.png";
import LinkedIn from "../../assets/images/linkedIn-icon.png";

const AppFooter = () => {
  return (
    <div className="container">
      <div className="layout-footer text-right flex justify-content-between align-items-center">
        <div className="flex gap-5 align-items-center">
          <span>
            <a href="https://x.com/encryptioncons" target="_blank">
              <img src={Twitter} className="max-w-2rem block" alt="Encryption Consulting on X" />
            </a>
          </span>
          <span>
            <a
              href="https://www.facebook.com/encryptionconsulting/"
              target="_blank"
            >
              <img src={Facebook} className="max-w-2rem block" alt="Encryption Consulting on Facebook" />
            </a>
          </span>
          <span>
            <a
              href="https://www.linkedin.com/company/encryptionconsulting"
              target="_blank"
            >
              <img src={LinkedIn} className="max-w-2rem block" alt="Encryption Consulting on LinkedIn" />
            </a>
          </span>
          <span>
            <a
              href="https://www.youtube.com/channel/UCPPGX-tH0btYWSFsgOYkLWA"
              target="_blank"
            >
              <img src={Youtube} className="max-w-2rem block" alt="Encryption Consulting on YouTube" />
            </a>
          </span>
        </div>
        <div className="flex gap-5 align-items-center">
          <span>
            <a
              href={SUPPORT_CONTACT.phoneHref}
              className="text-white hover:text-400 text-sm"
              title={`Support hotline (${SUPPORT_CONTACT.phoneHours})`}
            >
              <i className="pi pi-phone mr-1 text-xs" aria-hidden="true" />
              {SUPPORT_CONTACT.phone}
            </a>
          </span>
          <span>
            <a
              href="https://www.encryptionconsulting.com/privacy-policy/"
              target="_blank"
              className="text-white hover:text-400 text-sm"
            >
              Privacy Policy
            </a>
          </span>
          <span>
            <a
              href="https://www.encryptionconsulting.com/terms-of-service/"
              target="_blank"
              className="text-white hover:text-400 text-sm"
            >
              Terms of Service
            </a>
          </span>
        </div>
        <span className="text-300 text-sm">
          &copy; 2026 Encryption Consulting LLC. All rights reserved.
        </span>
      </div>
    </div>
  );
};

export default AppFooter;
