import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Menu, X, Home, BookMarked, Lightbulb, GraduationCap, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicNavProps {
  onRegisterClick?: () => void;
}

const navLinks = [
  { to: '/about/chinese', label: 'Về chúng tôi', mobileLabel: 'Về chúng tôi', icon: <GraduationCap className="w-5 h-5" /> },
  { to: '/method', label: 'Phương pháp', mobileLabel: 'Phương pháp', icon: <Lightbulb className="w-5 h-5" /> },
  { to: '/courses', label: 'Khóa học', mobileLabel: 'Khóa học', icon: <BookMarked className="w-5 h-5" /> },
];

export default function PublicNav({ onRegisterClick }: PublicNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'stable';
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
            ? 'h-16 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100'
            : 'h-20 bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-sm bg-[#2E3192] flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300 clip-diagonal">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="hidden xs:block">
              <p className="text-xl font-heading font-black tracking-tighter text-[#2E3192] uppercase leading-none">TOXI EDU</p>
              <p className="text-[10px] text-[#FF9800] font-bold uppercase tracking-[0.1em] mt-1">Smart Learning</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold transition-all duration-200 relative py-1 ${isActive(link.to)
                    ? 'text-[#2E3192]'
                    : 'text-slate-500 hover:text-[#2E3192]'
                  }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.span 
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#2E3192] rounded-full" 
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            {onRegisterClick && (
              <button
                onClick={onRegisterClick}
                className="text-sm font-bold text-slate-400 hover:text-[#2E3192] transition-colors"
              >
                Liên hệ
              </button>
            )}
            <Link
              to="/edu/login"
              className="bg-[#2E3192] hover:bg-[#000051] text-white px-6 py-2.5 rounded-sm text-[10px] font-heading font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/20 active:scale-95 clip-diagonal"
            >
              Hệ thống học tập
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2.5 rounded-sm transition-all z-[110] ${
              mobileOpen ? 'bg-[#2E3192] text-white' : 'bg-slate-50 text-slate-600'
            }`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu (Slide-out Overlay) */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[105] bg-white md:hidden flex flex-col"
            >
              <div className="pt-24 px-6 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Khám phá</p>
                  <Link
                    to="/"
                    className={`flex items-center justify-between p-5 rounded-sm font-heading font-black text-lg ${
                      isActive('/') ? 'text-[#2E3192] bg-indigo-50' : 'text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-sm clip-diagonal bg-slate-100 flex items-center justify-center">
                          <Home className="w-5 h-5 text-[#2E3192]" />
                       </div>
                       Trang chủ
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-30" />
                  </Link>

                  {navLinks.map((link, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      key={link.to}
                    >
                      <Link
                        to={link.to}
                        className={`flex items-center justify-between p-5 rounded-sm font-heading font-black text-lg ${
                          isActive(link.to) ? 'text-[#2E3192] bg-indigo-50' : 'text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-sm clip-diagonal flex items-center justify-center ${
                            isActive(link.to) ? 'bg-[#2E3192] text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {link.icon}
                          </div>
                          {link.mobileLabel}
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-30" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-sm border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <BookOpen className="w-20 h-20" />
                   </div>
                   <h4 className="text-sm font-black text-slate-800 mb-2 uppercase">Sẵn sàng bắt đầu?</h4>
                   <p className="text-xs text-slate-500 mb-6 leading-relaxed">Gia nhập hệ thống học tập AI tiên tiến nhất hiện nay.</p>
                   <Link
                      to="/edu/login"
                      className="w-full flex items-center justify-center gap-3 p-4 bg-[#2E3192] text-white rounded-sm font-heading font-black text-sm clip-diagonal shadow-lg shadow-indigo-900/20"
                    >
                      HỆ THỐNG HỌC TẬP <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
              </div>

              <div className="p-8 border-t border-slate-50 flex items-center justify-center gap-8">
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2E3192]">Điều khoản</button>
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2E3192]">Bảo mật</button>
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2E3192]">Liên hệ</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}
