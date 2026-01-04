import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, User, AlertCircle, Loader2, Building2, TrendingUp, Shield } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Session handoff from eProcurement:
    // /login?token=...&user=...(base64 json)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userB64 = params.get('user');

    if (!token || !userB64) return;

    try {
      const userJson = decodeURIComponent(escape(atob(userB64)));
      const user = JSON.parse(userJson);

      api.setToken(token);
      api.setUser(user);

      // Force reload so AuthProvider rehydrates from storage.
      window.location.replace('/');
    } catch (e) {
      console.error('Failed to consume eProc session handoff:', e);
      setError('Could not complete single sign-on. Please login again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - White with centered branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden items-center justify-center">
        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
        
        {/* Content (centered within left side) */}
        <div className="relative z-10 flex flex-col items-center justify-center px-16 py-12">
          {/* Logo + heading (constrained width, left-aligned) */}
          <div className="mb-12 w-full max-w-sm text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm mb-6">
              <img src="/logo.jpg" alt="RIC Logo" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Rawalpindi Institute<br />of Cardiology
            </h1>
            <p className="text-slate-600 text-xl">Finance Management System</p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 w-full max-w-sm text-left">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">Budget Management</h3>
                <p className="text-slate-600 text-sm">Track and manage institutional budgets with precision</p>
              </div>
            </div>
            <div className="flex items-start gap-4 w-full max-w-sm text-left">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">Financial Analytics</h3>
                <p className="text-slate-600 text-sm">Real-time insights and comprehensive reports</p>
              </div>
            </div>
            <div className="flex items-start gap-4 w-full max-w-sm text-left">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">Secure Access</h3>
                <p className="text-slate-600 text-sm">Role-based permissions for data security</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 left-0 w-full">
            <p className="text-center text-slate-500 text-sm">
              © {new Date().getFullYear()} RIC Finance System
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Black with login form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center px-6 py-12 relative">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-bl from-slate-900/50 via-black to-black" />
        
        {/* Mobile logo */}
        <div className="absolute top-8 left-6 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <img src="/logo.jpg" alt="RIC Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="text-white font-semibold">RIC Finance</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Default credentials</p>
                <p className="text-white font-mono text-sm">
                  <span className="text-teal-400">admin</span>
                  <span className="text-slate-500 mx-2">/</span>
                  <span className="text-teal-400">admin123</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile footer */}
          <p className="text-center text-slate-600 text-sm mt-6 lg:hidden">
            © {new Date().getFullYear()} RIC Finance System
          </p>
        </div>
      </div>
    </div>
  );
}
