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
      const res = await fetch('http://localhost:5000/api/auth/login', {
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

        <main className="mx-auto max-w-md px-6 py-20">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Store</span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

            <div className="text-center mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Admin Area</span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1.5 font-display">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your credentials to access the dashboard panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-600" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full rounded-xl bg-white/[0.02] border border-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:bg-[#090d1f] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-600" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl bg-[#020617] border border-white/10 py-3 pl-10 pr-12 text-sm text-slate-200 placeholder-slate-600 focus:bg-[#090d1f] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full group relative flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-semibold text-white shadow-lg transition-all duration-300 cursor-pointer ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/35 active:scale-98'
                }`}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />}
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
