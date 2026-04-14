import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data);
    } catch (err) {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-6 relative">
      {/* NEW: Floating Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
      >
        <Home size={18} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">Return Home</span>
      </button>

      <div className="w-full max-w-md bg-[#161B22] border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 rounded-full blur-[80px]" />

        <header className="text-center mb-10">
          <div className="inline-flex p-3 bg-violet-600/20 rounded-2xl text-violet-400 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Sign In</h1>
          <p className="text-gray-500 text-sm mt-2">Access your Projectify workspace</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-violet-500 transition-all text-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-violet-500 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-600/20 active:scale-[0.98] group"
          >
            Authenticate
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account? {' '}
            <Link to="/register" className="text-violet-400 font-bold hover:underline">Register now</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;