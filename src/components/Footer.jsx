import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#020617] py-8 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold tracking-widest text-white font-display">
          ARBEIT<span className="font-light text-indigo-400">MART</span>
        </span>
        <p>© {new Date().getFullYear()} ARBEIT MART. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
