import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  BookOpen,
  Target,
  Zap,
  Layout as LayoutIcon,
  ArrowLeft,
  Settings,
  Bell,
  Search,
  User,
  Users,
  Home,
  Brain,
  Share2,
  MoreVertical,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Star,
  BookMarked,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ToxiAIAssistant from './ToxiAIAssistant';

export default function EduLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const { scrollY } = useScroll();

  const isLessonPage = location.pathname.includes('/lesson/') || location.pathname.includes('/learn');

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    const handleResize = () => {
      setIsKeyboardVisible(window.innerHeight < 500);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from('toxi_profiles').select('*').eq('id', session.user.id).maybeSingle();
      setUserProfile(profile);
      setIsAdmin(session.user.email === 'toxiloveyou@gmail.com');
      setUserRole(profile?.role || 'student');
    }
    getUserData();
  }, []);

  const [notifications] = useState([
    { id: '1', title: 'Hệ thống AI cập nhật', message: 'Trợ lý AI vừa học thêm 500 kịch bản thực chiến mới.', is_read: false, type: 'info' },
    { id: '2', title: 'Thành tựu mới', message: 'Bạn vừa lọt top 5% học viên tích cực nhất tuần này!', is_read: false, type: 'success' }
  ]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    { path: '/edu/overview', icon: LayoutIcon, label: 'Trang chủ' },
    { path: '/edu/dashboard', icon: Target, label: 'Lớp học' },
    { path: '/edu/practice', icon: Zap, label: 'Thực chiến' },
    { path: '/edu/library', icon: BookMarked, label: 'Thư viện' },
    { path: '/edu/explore', icon: Search, label: 'Khoá học' },
    { path: '/edu/referral', icon: Share2, label: 'Giới thiệu' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/edu/login');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-[#2E3192]/10 overflow-x-hidden">
      
      {/* 1. TOP NAVIGATION (SMART HEADER) */}
      {!isLessonPage && (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
          <div className="max-w-[1800px] mx-auto px-4 md:px-8">
            <div className={`flex items-center justify-between transition-all duration-500 rounded-[2rem] px-6 py-3 ${scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-xl border border-white/50' : 'bg-white/40 backdrop-blur-lg border border-white/20 shadow-sm'}`}>
              
              <Link to="/edu/overview" className="flex items-center gap-3 group relative z-[110]">
                <div className="w-10 h-10 bg-[#2E3192] rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xl font-black tracking-tighter text-[#2E3192] uppercase leading-none">TOXI EDU</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">AI Intelligence</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/50 backdrop-blur-xl rounded-[1.5rem] border border-slate-200/30 relative z-[110]">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link key={item.path} to={item.path} className={`relative px-4 lg:px-5 py-2.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group/nav ${isActive ? 'text-white' : 'text-slate-500 hover:text-[#2E3192]'}`}>
                      {isActive && <motion.div layoutId="activeNavHighlight" className="absolute inset-0 bg-[#2E3192] rounded-xl shadow-lg" transition={{ type: "spring", bounce: 0.15, duration: 0.6 }} />}
                      <item.icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-white' : ''}`} />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2.5 md:gap-3 relative z-[110]">
                {/* Toxi AI Header Shortcut - Extremely prominent & professional */}
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-toxi-ai'))}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2E3192] to-indigo-600 hover:from-indigo-600 hover:to-[#2E3192] text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all group"
                  title="Hỏi trợ lý học tập Toxi AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-300 group-hover:rotate-12 transition-transform animate-pulse" />
                  <span className="hidden sm:inline">Hỏi Toxi AI</span>
                  <span className="sm:hidden">Toxi AI</span>
                </button>

                <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 relative hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />}
                </button>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-10 h-10 rounded-2xl bg-slate-50 p-1 border border-slate-100 hover:border-[#2E3192] transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-[#2E3192] to-indigo-900 rounded-xl flex items-center justify-center text-white text-xs font-black">{(userProfile?.full_name || 'U').charAt(0).toUpperCase()}</div>
                </button>
              </div>

              {/* Desktop Dropdowns */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 10 }} exit={{ opacity: 0, y: 20 }} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[120]">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2">Thông báo mới</p>
                    {notifications.map(n => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors mb-1">
                        <p className="text-[11px] font-black text-slate-800">{n.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{n.message}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 10 }} exit={{ opacity: 0, y: 20 }} className="absolute top-full right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-[120]">
                    <div className="p-4 bg-slate-50 rounded-2xl mb-2">
                       <p className="text-sm font-black text-slate-900">{userProfile?.full_name}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Học viên thực chiến</p>
                    </div>
                    <button onClick={() => { setShowUserMenu(false); navigate('/edu/profile'); }} className="w-full p-3 text-[10px] font-black uppercase text-slate-600 hover:text-[#2E3192] flex items-center gap-3 transition-colors">
                      <User className="w-4 h-4" /> Hồ sơ năng lực
                    </button>
                    {(isAdmin || userRole === 'teacher') && (
                      <button onClick={() => { setShowUserMenu(false); navigate('/edu/management'); }} className="w-full p-3 text-[10px] font-black uppercase text-slate-600 hover:text-indigo-600 flex items-center gap-3 transition-colors">
                        <Users className="w-4 h-4" /> Quản lý hệ thống
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full p-3 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-colors">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      )}

      {/* 2. MAIN CONTENT */}
      <main className={isLessonPage ? 'w-full h-screen overflow-hidden relative z-10' : 'pt-24 md:pt-36 max-w-[1800px] mx-auto min-h-screen px-4 md:px-8 pb-32 relative z-10'}>
        <Outlet />
      </main>

      {/* 3. MOBILE NAVIGATION (ULTRA-RELIABLE FIXED BAR) */}
      {!isLessonPage && !isKeyboardVisible && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[300] bg-white border-t border-slate-100 shadow-[0_-15px_50px_rgba(0,0,0,0.08)] pb-safe pointer-events-auto">
          <div className="flex items-center justify-around h-16 px-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center justify-center flex-1 h-full active:scale-90 transition-all relative z-[310]`}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#2E3192] text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400'}`}>
                    <item.icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter mt-1.5 ${isActive ? 'text-[#2E3192]' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Toxi AI Assistant (Global Floating Copilot) */}
      {!isLessonPage && !isKeyboardVisible && (
        <ToxiAIAssistant />
      )}
    </div>
  );
}
