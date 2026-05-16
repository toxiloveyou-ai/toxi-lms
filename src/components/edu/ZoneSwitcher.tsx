import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, GraduationCap, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZoneSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const isEdu = location.pathname.startsWith('/edu');
  const isPublic = !isEdu && !location.pathname.startsWith('/app');

  return (
    <div className="flex items-center bg-slate-100/80 backdrop-blur-md p-1 rounded-sm border border-slate-200/50 shadow-inner relative group">
      {/* Visual Indicator of Switcher */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-200 rounded-full hidden lg:block" />
      
      <button
        onClick={() => navigate('/')}
        className={`flex items-center gap-2.5 px-6 py-2.5 transition-all relative overflow-hidden group/btn ${
          isPublic 
            ? 'text-white' 
            : 'text-slate-500 hover:text-[#2E3192]'
        }`}
      >
        {isPublic && (
          <motion.div 
            layoutId="activeZone"
            className="absolute inset-0 bg-[#2E3192] clip-diagonal shadow-lg shadow-indigo-900/20"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Home className={`w-3.5 h-3.5 relative z-10 ${isPublic ? 'text-white' : 'text-slate-400 group-hover/btn:scale-110 transition-transform'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] relative z-10 ${isPublic ? 'text-white' : 'text-slate-500'}`}>Trang chủ</span>
        {isPublic && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none relative z-10" />}
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button
        onClick={() => navigate('/edu/overview')}
        className={`flex items-center gap-2.5 px-6 py-2.5 transition-all relative overflow-hidden group/btn ${
          isEdu 
            ? 'text-white' 
            : 'text-slate-500 hover:text-orange-500'
        }`}
      >
        {isEdu && (
          <motion.div 
            layoutId="activeZone"
            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 clip-diagonal shadow-lg shadow-orange-500/20"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <GraduationCap className={`w-4 h-4 relative z-10 ${isEdu ? 'text-white' : 'text-slate-400 group-hover/btn:scale-110 transition-transform'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] relative z-10 ${isEdu ? 'text-white' : 'text-slate-500'}`}>Học tập</span>
        {isEdu && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none relative z-10" />}
      </button>

      {/* Subtle Help Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-slate-100 flex items-center gap-1">
          <ArrowRightLeft className="w-2.5 h-2.5" /> Chuyển đổi vùng làm việc
        </p>
      </div>
    </div>
  );
}
