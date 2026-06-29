import React from "react";
import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-b from-slate-950 to-[#020613] pt-16 pb-10 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <span className="font-bold tracking-widest text-white text-lg font-display block select-none">
              ARBEIT<span className="font-light text-indigo-400">MART</span>
            </span>
            <p className="max-w-xs text-[11px] text-slate-400 font-light leading-relaxed">
              Curating premium mechanical keyboards, acoustic accessories, and
              minimalist daily essentials to build your ultimate productivity
              workspace.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
              <span> Dhaka, Bangladesh</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Collections
            </h4>
            <ul className="space-y-2 text-[11px] font-light">
              <li>
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors duration-200 font-medium"
                >
                  Keyboards
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors duration-200 font-medium"
                >
                  Audio Gear
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors duration-200 font-medium"
                >
                  Stealth Wearables
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors duration-200 font-medium"
                >
                  Desk Mats
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-[11px] font-light">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px]">
          <p className="font-light">
            © {new Date().getFullYear()} ARBEIT MART. Crafted for modern
            creators.
          </p>

          <div className="flex gap-3">
            <a
              href="#"
              className="rounded-full bg-white/[0.02] border border-white/5 p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/10 transition-all duration-300"
              aria-label="Twitter"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="rounded-full bg-white/[0.02] border border-white/5 p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/10 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg
                className="h-3.5 w-3.5 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="#"
              className="rounded-full bg-white/[0.02] border border-white/5 p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/10 transition-all duration-300"
              aria-label="Github"
            >
              <svg
                className="h-3.5 w-3.5 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
