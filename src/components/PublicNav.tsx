import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Menu, X, Home, BookMarked, Lightbulb, GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    // Standard stability fix: reserve scrollbar space to prevent layout shifting
    document.documentElement.style.scrollbarGutter = 'stable';
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled 
            ? 'bg-white shadow-sm border-b border-slate-100 py-0' 
            : 'bg-white/80 backdrop-blur-sm border-b border-transparent py-1'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group" onClick={() => setMobileOpen(false)}>
              <div className="w-10 h-10 rounded-sm bg-[#1A237E] flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300 clip-diagonal">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <p className="text-xl font-heading font-black tracking-tighter text-[#1A237E] uppercase leading-none">TOXI EDU</p>
                <p className="text-[10px] text-[#FF9800] font-bold uppercase tracking-[0.1em] mt-1">Smart Learning</p>
              </div>
            </Link>

            {/* Desktop Nav - Simple & Clean */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-bold transition-all duration-200 relative py-1 ${
                    isActive(link.to)
                      ? 'text-[#2E3192]'
                      : 'text-slate-500 hover:text-[#2E3192]'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#2E3192] rounded-full animate-in fade-in slide-in-from-bottom-1" />
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
                className="bg-[#1A237E] hover:bg-[#000051] text-white px-6 py-2.5 rounded-sm text-sm font-heading font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/20 active:scale-95 clip-diagonal"
              >
                Đăng nhập
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                mobileOpen ? 'bg-[#2E3192] text-white' : 'bg-slate-50 text-slate-600'
              }`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-50 shadow-2xl transition-all duration-300 ${
            mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="p-4 space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-4 p-4 rounded-sm font-heading font-bold text-sm ${
                isActive('/') ? 'bg-indigo-50 text-[#1A237E]' : 'text-slate-600'
              }`}
            >
              <Home className="w-5 h-5" /> Trang chủ
            </Link>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 p-4 rounded-sm font-heading font-bold text-sm ${
                  isActive(link.to) ? 'bg-indigo-50 text-[#1A237E]' : 'text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-sm clip-diagonal flex items-center justify-center ${
                  isActive(link.to) ? 'bg-[#1A237E] text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  {link.icon}
                </div>
                {link.mobileLabel}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-slate-50 grid grid-cols-2 gap-3">
              <button
                onClick={() => { setMobileOpen(false); onRegisterClick?.(); }}
                className="p-4 rounded-sm clip-diagonal font-heading font-bold text-xs text-slate-500 bg-slate-50 border border-slate-200"
              >
                Tư vấn
              </button>
              <Link
                to="/edu/login"
                className="flex items-center justify-center gap-2 p-4 rounded-sm clip-diagonal font-heading font-black text-xs text-white bg-[#1A237E]"
              >
                Đăng nhập <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer - Keeps layout stable */}
      <div className="h-16 md:h-20" />

      {/* Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-slate-900/10 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
