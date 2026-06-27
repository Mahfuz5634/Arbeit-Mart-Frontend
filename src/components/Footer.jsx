import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#020617] pt-20 pb-10 text-slate-400">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-16">
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-widest text-white font-display">
              ARBEIT<span className="font-light text-indigo-400">MART</span>
            </span>
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
              Next-generation workspace tools, heavy minimalist apparel, and audio hardware engineered for precision and durability.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="h-4 w-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Github">
                <svg className="h-4 w-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 font-display">Products</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">Workspace Hardware</a></li>
              <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">Acoustic Audio</a></li>
              <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">Stealth Wearables</a></li>
              <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">Minimalist Apparel</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 font-display">Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Order Tracking</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Warranty & Returns</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Secure Shipping</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Service</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2 font-display">Join the Grid</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Subscribe to receive exclusive drop announcements and limited variant alerts.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-600" />
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full rounded-xl bg-white/[0.02] border border-white/5 py-2.5 pl-10 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:bg-white/[0.04] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
              />
              <button 
                type="submit" 
                className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-medium">
          <p>© {new Date().getFullYear()} ARBEIT MART. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <span>•</span>
            <span className="text-indigo-400/70">Engineered for Creators</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
