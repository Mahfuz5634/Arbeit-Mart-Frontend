import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router';
import { LayoutDashboard, Package, ShoppingBag, Ticket, Truck, Home, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin/dashboard" className="text-lg font-bold tracking-tight text-white font-display">
            Admin Panel
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-200" title="Storefront">
              <Home className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
