import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import API from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending data to your Express SQL backend
      await API.post('/auth/register', formData);
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed. Email might already exist in the database.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] px-4">
      <div className="absolute w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -bottom-10 -right-10" />
      
      <div className="w-full max-w-md bg-[#161B22]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Projectify</h1>
          <p className="text-gray-400 mt-2">Create your account to start managing projects.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="text" 
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-violet-500 outline-none transition-all"
                placeholder="Vinay Kumar Singh"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="email" 
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-violet-500 outline-none transition-all"
                placeholder="vinay@engineer.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="password" 
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-violet-500 outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-violet-600/20"
          >
            Create Account 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-violet-400 hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;