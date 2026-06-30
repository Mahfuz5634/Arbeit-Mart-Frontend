import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Ticket, 
  Truck, 
  Home, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile drawer on path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getAdminUser = () => {
    try {
      const stored = localStorage.getItem('arbeit-user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return { name: 'System Administrator', email: 'admin@arbeit.mart' };
  };

  const admin = getAdminUser();

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { to: '/admin/shipping', label: 'Shipping', icon: Truck },
  ];

  const handleLogout = () => {
    localStorage.removeItem('arbeit-user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased flex flex-col">
      
      {/* Mobile Sticky Header Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#070b16]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <span className="text-xs font-bold tracking-widest text-white">ARBEIT<span className="text-indigo-400">MART</span></span>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar drawer panel */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#070b16] border-r border-white/[0.06] flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <Link to="/admin/dashboard" className="text-md font-bold tracking-widest text-white font-display block select-none">
                ARBEIT<span className="font-light text-indigo-400">MART</span>
              </Link>
              <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-400/90 block mt-0.5">Control Center</span>
            </div>
            
            <Link 
              to="/" 
              className="rounded-lg bg-white/[0.02] border border-white/5 p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer"
              title="Return to Storefront"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-500/5 text-white border-l-2 border-indigo-500 shadow-md shadow-indigo-500/5'
                        : 'text-slate-455 hover:bg-white/[0.02] hover:text-slate-200 border-l-2 border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-300">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card Profile Panel */}
        <div className="p-4 border-t border-white/[0.06] bg-slate-950/20">
          <div className="flex items-center justify-between gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0 select-none">
                {admin.name ? admin.name.substring(0, 1).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-200 truncate">{admin.name || 'System Admin'}</p>
                <p className="text-[9px] text-slate-500 truncate mt-0.5 font-light">{admin.email || 'admin@arbeit.mart'}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Outlet Workspace */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto md:ml-64 bg-[#020617]">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
