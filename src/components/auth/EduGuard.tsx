import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function EduGuard() {
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkStudentStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsStudent(false);
          setLoading(false);
          return;
        }

        // Check user_metadata first (fastest)
        const metadata = session.user.user_metadata;
        if (metadata?.is_toxi_student === true) {
          setIsStudent(true);
          setLoading(false);
          return;
        }

        // Check profile table as backup
        const { data: profile } = await supabase
          .from('toxi_profiles')
          .select('is_toxi_student, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.is_toxi_student || profile?.role === 'teacher') {
          setIsStudent(true);
        } else {
          // Check if admin
          const isAdmin = session.user.email === 'toxiloveyou@gmail.com';
          if (isAdmin) {
            setIsStudent(true);
          } else {
            setIsStudent(false);
          }
        }
      } catch (error) {
        console.error("Error checking student status:", error);
        setIsStudent(false);
      } finally {
        setLoading(false);
      }
    }

    checkStudentStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6ED] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#2E3192] animate-spin" />
        <p className="text-[#2E3192] font-black text-xs uppercase tracking-widest">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="min-h-screen bg-[#F9F6ED] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 border-2 border-orange-100 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#2E3192] uppercase">Truy cập bị từ chối</h2>
            <p className="text-slate-500 font-medium">
              Bạn cần có tài khoản <span className="text-[#2E3192] font-black">Học viên Toxi</span> để truy cập vào hệ thống này.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Navigate to="/edu/login" state={{ from: location }} replace />
            <a href="/edu/login" className="px-8 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              Đăng nhập Học viên
            </a>
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
