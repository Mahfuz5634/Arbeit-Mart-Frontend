import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('arbeit-user');
    if (loggedInUser) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in all fields.", "error");
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }

      const userRole = data.user?.role || data.role;
      if (userRole !== 'admin') {
        throw new Error("Access Denied. Only administrators are allowed to sign in.");
      }

      localStorage.setItem('arbeit-user', JSON.stringify(data));
      addToast(`Welcome back, ${data.user?.name || 'Administrator'}!`, 'success');
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);

    } catch (err) {
      console.error(err);
      addToast(err.message || "Connection error. Failed to log in.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased flex flex-col justify-between">
      <div>
        <Navbar 
          searchQuery="" 
          setSearchQuery={() => {}} 
          cartCount={0}
          onCartClick={() => {}}
        />

        <main className="mx-auto max-w-md px-6 py-20 animate-in fade-in duration-300">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors duration-250 mb-6"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Store</span>
          </Link>

          <div className="rounded-3xl border border-white/[0.04] bg-[#070b16]/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Admin Area</span>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1 font-display">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1 font-light">Enter credentials to access the workspace admin control panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full rounded-xl bg-slate-950/30 border border-white/[0.06] py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-650 focus:bg-[#070a1a] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-[9px] font-bold uppercase tracking-wider text-slate-455 block mb-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl bg-slate-950/30 border border-white/[0.06] py-3 pl-10 pr-12 text-xs text-slate-200 placeholder-slate-650 focus:bg-[#070a1a] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-550 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full group relative flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 cursor-pointer ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/20 active:scale-[0.99]'
                }`}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />}
              </button>
            </form>
          </div>
        </main>
      </div>

      <Toast 
        toasts={toasts}
        removeToast={removeToast}
      />

      <Footer />
    </div>
  );
};

export default Login;
