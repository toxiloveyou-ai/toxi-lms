import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EduLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function getUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userEmail = session.user.email;
      setIsAdmin(userEmail === 'toxiloveyou@gmail.com');

      const { data: profile } = await supabase
        .from('toxi_profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      setUserRole(profile?.role || 'student');
    }
    getUserRole();
  }, []);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Đăng ký thành công', message: 'Đơn đăng ký khóa HSK 3 của bạn đã được tiếp nhận.', is_read: false, type: 'success' },
    { id: '2', title: 'Bài học mới', message: 'Khóa học AI & Công nghệ vừa cập nhật bài mới.', is_read: true, type: 'info' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    { path: '/edu/overview', icon: LayoutIcon, label: 'Tổng Quan' },
    { path: '/edu/dashboard', icon: Target, label: 'Học Tập' },
    { path: '/edu/practice', icon: Zap, label: 'Ứng Dụng' },
    { path: '/edu/library', icon: BookOpen, label: 'Thư Viện' },
    { path: '/edu/explore', icon: Search, label: 'Khám Phá' },
    { path: '/edu/referral', icon: Share2, label: 'Giới thiệu' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#2E3192]/10">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/edu/overview" className="flex items-center gap-2 text-[#2E3192] font-black text-xl">
            <div className="w-8 h-8 bg-[#2E3192] rounded-lg flex items-center justify-center text-white">T</div>
            Toxi<span className="text-orange-500">Edu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                      ? 'bg-[#2E3192]/5 text-[#2E3192]'
                      : 'text-slate-500 hover:text-[#2E3192] hover:bg-slate-50'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {(userRole === 'teacher' || isAdmin) && (
            <Link to="/edu/management" className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" /> Quản lý Lớp
            </Link>
          )}

          {isAdmin && (
            <Link to="/edu/admin" className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform">
              <Settings className="w-3.5 h-3.5" /> Quản lý
            </Link>
          )}

          <Link to="/app/home" className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform mr-2">
            <Home className="w-3.5 h-3.5" /> Toxi Hub
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm bài học..."
              className="bg-transparent border-none text-xs font-medium outline-none w-32 focus:w-48 transition-all"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-[#2E3192] hover:bg-slate-50 rounded-full transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Thông báo</h4>
                  <button className="text-[10px] font-bold text-[#2E3192] hover:underline">Đánh dấu đã đọc</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 ${!n.is_read ? 'bg-indigo-50/30' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? 'bg-[#2E3192]' : 'bg-slate-200'}`} />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900">{n.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 text-[10px] font-black text-[#2E3192] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                  Xem tất cả
                </button>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <button
            onClick={() => navigate('/edu/profile')}
            className="flex items-center gap-2 p-1 pl-4 pr-1 bg-white border border-slate-200 rounded-full hover:border-[#2E3192] hover:shadow-md transition-all group"
          >
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-orange-500 transition-colors">Học viên Toxi</p>
              <p className="text-[11px] font-bold text-[#2E3192]">Level 3 (HSK 3)</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-[#2E3192] to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-inner">
              TX
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb / Context */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">128 bạn đang học</span>
          </div>
        </div>

        <Outlet />
      </main>

      {/* Floating Action / Support */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-[#2E3192] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group">
          <Brain className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      </div>
    </div>
  );
}
