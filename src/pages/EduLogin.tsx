import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Phone, User, ArrowRight, Loader2, BookOpen, KeyRound, Globe, Smartphone, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateAccessCode, markCodeAsUsed } from '../constants/eduAccess';

export default function EduLogin() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate Access Code
    const isValid = await validateAccessCode(accessCode);
    if (!isValid) {
      setError("Mã truy cập không hợp lệ, đã được sử dụng hoặc hết hạn.");
      setLoading(false);
      return;
    }

    try {
      // CASE 1: User is already logged in (e.g. via Google), just activating the code
      if (currentUser) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { is_toxi_student: true, access_code: accessCode }
        });

        if (updateError) throw updateError;

        // Update profile too
        await supabase.from('toxi_profiles').upsert([{
          id: currentUser.id,
          is_toxi_student: true,
          access_code_used: accessCode,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]
        }]);

        await markCodeAsUsed(accessCode, currentUser.id);
        navigate('/edu/overview');
        return;
      }

      // CASE 2: New login or registration with Email or Phone
      let authEmail = identifier.trim();
      let cleanPhone = '';

      if (!authEmail.includes('@')) {
        cleanPhone = authEmail.replace(/[^0-9]/g, '');
        if (!cleanPhone) throw new Error("Vui lòng nhập Email hoặc Số điện thoại.");
        authEmail = `${cleanPhone}@toxi.edu.vn`;
      }

      if (mode === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          await markCodeAsUsed(accessCode, data.user.id);
        }
        navigate('/edu/overview');
      } else {
        // Register Mode
        if (!fullName || !password) {
          throw new Error("Vui lòng điền đầy đủ thông tin.");
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: cleanPhone,
              is_toxi_student: true,
              access_code: accessCode
            }
          }
        });

        if (signUpError) throw signUpError;

        // Ensure profile is created
        if (data.user) {
          const { error: profileError } = await supabase.from('toxi_profiles').upsert([{
            id: data.user.id,
            full_name: fullName,
            phone: cleanPhone,
            is_toxi_student: true,
            access_code_used: accessCode
          }]);
          
          if (profileError && profileError.code !== '23505') {
            console.error("Profile creation error:", profileError);
          }
          await markCodeAsUsed(accessCode, data.user.id);
        }
        
        navigate('/edu/overview');
      }
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans p-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{ backgroundImage: 'url("/assets/images/edu_bg.png")' }}
      />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

      {/* Main Content */}
      <div className="w-full max-w-sm p-6 sm:p-8 bg-white/90 backdrop-blur-xl rounded-[2.5rem] relative z-10 border border-white/20 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2E3192] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 relative">
            <BookOpen className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
              <Cpu className="w-2 h-2 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#2E3192] uppercase">
            TOXI EDU
          </h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Smart Tech Learning</p>
        </div>

        {currentUser ? (
          <div className="p-4 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100/50 text-center space-y-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <User className="w-5 h-5 text-[#2E3192]" />
             </div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Đang đăng nhập</p>
                <p className="text-xs font-black text-[#2E3192] break-all">{currentUser.email}</p>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
              <button 
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-400'}`}
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'register' ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-400'}`}
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-orange-400" />
              </div>
              <input
                type="text"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl bg-orange-50/50 text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all text-xs uppercase"
                placeholder="MÃ TRUY CẬP HỌC VIÊN"
              />
            </div>

            {!currentUser && (
              <div className="space-y-3">
                {mode === 'register' && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all text-xs"
                      placeholder="Họ và Tên học viên"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all text-xs"
                    placeholder="SĐT hoặc Email"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all text-xs"
                    placeholder="Mật khẩu"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-[#2E3192] hover:bg-[#1B1D55] text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{currentUser ? 'Kích hoạt ngay' : (mode === 'login' ? 'Vào học' : 'Đăng ký')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 relative z-10 text-center space-y-1">
        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">
          Toxi Edu System &copy; 2024
        </p>
        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
          Sản phẩm phát triển bởi Công ty TNHH TOXI
        </p>
      </div>
    </div>
  );
}
