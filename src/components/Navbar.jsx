import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ShoppingBag, Search, User, X, LogOut } from 'lucide-react';

const Navbar = ({ searchQuery, setSearchQuery, cartCount = 0, onCartClick, floating = false }) => {
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
        : floating 
          ? 'border-b border-transparent bg-gradient-to-b from-[#020617]/95 via-[#020617]/50 to-transparent' 
          : 'border-b border-transparent bg-transparent'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        
        <Link to="/" className="flex items-center select-none">
          <span className="text-xl font-bold tracking-widest text-white font-display">
            ARBEIT<span className="font-light text-indigo-400">MART</span>
          </span>
        </Link>

        <div className="relative flex-1 max-w-md mx-4 sm:mx-8">
          <div className="relative group">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search premium gear..."
              className="w-full rounded-full bg-white/[0.03] border border-white/5 py-2 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-500 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 focus:bg-[#090d1f] focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex text-right">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.user?.name || user.name}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                  {user.user?.role || user.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 transition-all duration-200 hover:text-red-400 hover:bg-red-500/5 rounded-full cursor-pointer"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
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