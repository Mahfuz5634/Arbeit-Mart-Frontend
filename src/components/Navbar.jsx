import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ShoppingBag, User } from 'lucide-react';

const Navbar = ({ cartCount = 0, onCartClick, floating = false }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
            <div className="relative flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 cursor-pointer py-1 focus:outline-none"
              >
                <div className="flex flex-col items-end hidden sm:flex text-right">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.user?.name || user.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 mt-0.5">
                    {user.user?.role || user.role}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold text-xs select-none">
                  {user.user?.name ? user.user.name.substring(0, 1).toUpperCase() : (user.name ? user.name.substring(0, 1).toUpperCase() : 'U')}
                </div>
              </button>

              {isUserMenuOpen && (
                <div 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent cursor-default"
                />
              )}
              
              <div className={`absolute right-0 top-full pt-2 w-32 origin-top-right transition-all duration-200 z-50 ${
                isUserMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}>
                <div className="rounded-xl border border-white/10 bg-[#070b16] p-1.5 shadow-xl">
                  {(user.user?.role === 'admin' || user.role === 'admin') && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex w-full items-center px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-indigo-650 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
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