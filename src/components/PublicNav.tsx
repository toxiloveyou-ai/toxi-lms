import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Menu, X, Home, BookMarked, Lightbulb, GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface PublicNavProps {
  onRegisterClick?: () => void;
}

const navLinks = [
  { to: '/about/chinese', label: 'Tiếng Trung Toxi', mobileLabel: 'Về chúng tôi', icon: <GraduationCap className="w-5 h-5" /> },
  { to: '/method', label: 'Phương pháp', mobileLabel: 'Phương pháp', icon: <Lightbulb className="w-5 h-5" /> },
  { to: '/courses', label: 'Khóa học', mobileLabel: 'Khóa học', icon: <BookMarked className="w-5 h-5" /> },
];

export default function PublicNav({ onRegisterClick }: PublicNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md shadow-slate-200/50' : 'bg-white/90'} backdrop-blur-xl border-b border-slate-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group" onClick={() => setMobileOpen(false)}>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#2E3192] flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <p className="text-lg md:text-xl font-black tracking-tight text-[#2E3192] uppercase leading-none">TOXI EDU</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Smart Learning</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-bold transition-colors duration-200 relative pb-0.5 ${
                    isActive(link.to)
                      ? 'text-[#2E3192] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#2E3192] after:rounded-full'
                      : 'text-slate-500 hover:text-[#2E3192]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {onRegisterClick && (
                <button onClick={onRegisterClick} className="text-sm font-bold text-[#2E3192] hover:underline whitespace-nowrap">
                  Đăng ký tư vấn
                </button>
              )}
              <Link
                to="/edu/login"
                className="flex items-center gap-1.5 bg-[#2E3192] hover:bg-[#1B1D55] text-white px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Đăng nhập <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile: Register CTA + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {onRegisterClick && (
                <button
                  onClick={onRegisterClick}
                  className="text-xs font-black text-white bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Tư vấn
                </button>
              )}
              <button
                onClick={() => setMobileOpen(prev => !prev)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${
                  isActive('/') ? 'bg-indigo-50 text-[#2E3192]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive('/') ? 'bg-[#2E3192] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Home className="w-4 h-4" />
                </span>
                Trang chủ
              </Link>

              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${
                    isActive(link.to) ? 'bg-indigo-50 text-[#2E3192]' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive(link.to) ? 'bg-[#2E3192] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {link.icon}
                  </span>
                  {link.mobileLabel}
                </Link>
              ))}
            </div>

            {/* Mobile Footer Actions */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2">
              {onRegisterClick && (
                <button
                  onClick={() => { setMobileOpen(false); onRegisterClick(); }}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-colors"
                >
                  Đăng ký tư vấn miễn phí
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link
                to="/edu/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl font-black text-sm text-white bg-[#2E3192] hover:bg-[#1B1D55] transition-colors uppercase tracking-wider"
              >
                Đăng nhập hệ thống <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16 md:h-20" />

      {/* Backdrop for mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ top: '64px' }}
        />
      )}
    </>
  );
}
