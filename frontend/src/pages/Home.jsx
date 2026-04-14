import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Shield, Zap, Star, Calendar } from 'lucide-react';
import dashboardPreview from '../assets/dashboard-preview.png';

const Home = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["Software Engineers", "Lawyers", "Service Providers", "Freelancers"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 100);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white selection:bg-violet-500/30 font-sans">
      {/* 1. FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 bg-violet-600/10 rounded-xl border border-violet-500/20 group-hover:border-violet-500/50 transition-all">
              <LayoutGrid size={22} className="text-violet-500" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">Projectify</span>
          </div>
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white transition">Sign In</button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <main className="max-w-7xl mx-auto px-8 pt-32 pb-20 relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] -z-10" />

        {/* REDUCED SPACE BADGE */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-bold uppercase tracking-[0.25em]">
            <Zap size={10} /> Optimistic for the WorkHolic
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* LEFT: Typewriter Hero */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
              The hub for <br />
              <span className="text-violet-500 block min-h-[1.1em] text-4xl md:text-5xl lg:text-6xl mt-1">
                {text}<span className="animate-pulse opacity-70">|</span>
              </span>
            </h1>
            
            <p className="max-w-md text-gray-400 text-base md:text-lg leading-relaxed mb-8 font-medium">
              A premium dashboard for tracking system entities and data records with SQL backend persistence.
            </p>
          </div>

          {/* RIGHT: Dashboard Mockup */}
          <div className="lg:w-1/2 flex justify-center items-center">
            <div className="relative p-1 bg-gradient-to-br from-violet-500/30 to-transparent rounded-[2rem] shadow-[0_0_50px_-15px_rgba(124,58,237,0.3)]">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/50 to-transparent z-10 rounded-b-[1.9rem] pointer-events-none" />
              <img src={dashboardPreview} alt="Mockup" className="w-full h-auto object-contain rounded-[1.9rem] border border-white/10" />
            </div>
          </div>
        </div>

        {/* CENTERED BUTTON */}
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => navigate('/register')} 
            className="px-10 py-4 bg-violet-600 hover:bg-violet-700 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-violet-600/40 group active:scale-95"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* 3. FEATURES */}
      <section className="bg-[#0D1117] border-t border-white/5 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<LayoutGrid size={22}/>} title="Structure Registry" desc="Manage hundred of project nodes with detailed descriptions." />
            <FeatureCard icon={<Star size={22}/>} color="emerald" title="Priority Ranking" desc="Reorder your grid based on visual star priority directly from SQL." />
            <FeatureCard icon={<Calendar size={22}/>} color="amber" title="Deadline Monitor" desc="Focus on high-urgency system records with smart sorting." />
            <FeatureCard icon={<Shield size={22}/>} color="rose" title="Security Shield" desc="JWT protected routes and Bcrypt hashing for secure data." />
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="text-center py-12 border-t border-white/5 bg-[#0B0E14]">
          <p className="text-white font-bold text-lg">Vinaykumar Singh</p>
          <p className="text-violet-400 font-mono text-[10px] tracking-widest mt-1">CONNECT: +91 9819086916</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color = "violet" }) => {
  const colors = {
    violet: "text-violet-400 bg-violet-600/10 hover:border-violet-500/30",
    emerald: "text-emerald-400 bg-emerald-600/10 hover:border-emerald-500/30",
    amber: "text-amber-400 bg-amber-600/10 hover:border-amber-500/30",
    rose: "text-rose-400 bg-rose-600/10 hover:border-rose-500/30"
  };

  return (
    <div className={`p-6 bg-[#161B22] border border-white/5 rounded-2xl transition-all group flex flex-col gap-4 ${colors[color]}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 bg-white/5">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export default Home;