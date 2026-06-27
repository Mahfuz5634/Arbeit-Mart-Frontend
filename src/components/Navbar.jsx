import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ShoppingBag, User } from 'lucide-react';

const Navbar = ({ cartCount = 0, onCartClick, floating = false }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('arbeit-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('arbeit-user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className={`${floating ? 'fixed' : 'sticky'} top-0 z-40 w-full transition-all duration-300 ${
      isScrolled 
        ? 'border-b border-white/5 bg-[#020617]/90 backdrop-blur-md shadow-lg shadow-black/20' 
        : 'border-b border-transparent bg-transparent'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        
        <Link to="/" className="flex items-center select-none">
          <span className="text-xl font-bold tracking-widest text-white font-display">
            ARBEIT<span className="font-light text-indigo-400">MART</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <div className="relative group flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex text-right cursor-pointer py-2">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.user?.name || user.name}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                  {user.user?.role || user.role}
                </span>
              </div>
              
              <div className="absolute right-0 top-full pt-2 w-32 origin-top-right opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="rounded-xl border border-white/10 bg-[#070b16] p-1.5 shadow-xl">
                  {(user.user?.role === 'admin' || user.role === 'admin') && (
                    <Link
                      to="/admin/dashboard"
                      className="flex w-full items-center px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              to="/login"
              className="p-2 text-slate-400 transition-all duration-200 hover:text-indigo-400 hover:bg-white/[0.03] rounded-full group cursor-pointer"
              aria-label="Sign In"
              title="Sign In"
            >
              <User className="h-5 w-5 transition-transform group-hover:scale-105" />
            </Link>
          )}
          
          <button 
            onClick={onCartClick}
            className="relative p-2 text-slate-400 transition-all duration-200 hover:text-indigo-400 hover:bg-white/[0.03] rounded-full group cursor-pointer"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-105" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-[#020617] animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        
      </div>
    </header>
  );
};

export default Navbar;