import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Award, Calendar, 
  User, BookOpen, CheckCircle2, ArrowLeft, 
  Sparkles, Download, Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EduVerify() {
  const { code } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function verifyCertificate() {
      setLoading(true);
      try {
        // Mocking verification for now if database record doesn't exist
        // In real app: fetch from Supabase
        const { data, error } = await supabase
          .from('certificates')
          .select('*, courses(title), profiles(full_name)')
          .eq('verify_code', code)
          .single();

        if (error || !data) {
           // For demo, if code is 'DEMO-123'
           if (code === 'DEMO-123') {
              setCert({
                profiles: { full_name: 'Nguyễn Văn Học Viên' },
                courses: { title: 'Tiếng Trung Ứng Dụng Sơ Cấp' },
                issued_at: new Date().toISOString(),
                verify_code: 'DEMO-123'
              });
           } else {
              setError(true);
           }
        } else {
          setCert(data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    verifyCertificate();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-[#2E3192]/20 border-t-[#2E3192] rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang xác minh chứng chỉ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
       <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
             <Link to="/edu/overview" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest mb-8">
                <ArrowLeft className="w-4 h-4" /> Quay lại Toxi Edu
             </Link>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hệ thống Xác minh Chứng chỉ</h1>
             <p className="text-slate-500 font-medium italic">Đảm bảo tính trung thực và minh bạch của mọi văn bằng do Toxi cấp.</p>
          </div>

          {error ? (
            <div className="bg-white rounded-[3rem] p-12 border-2 border-red-100 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
               <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-12 h-12" />
               </div>
               <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-900">Chứng chỉ không hợp lệ</h2>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                     Mã xác minh <span className="text-red-500 font-black">"{code}"</span> không tồn tại trong hệ thống của chúng tôi. 
                     Vui lòng kiểm tra lại mã hoặc liên hệ bộ phận hỗ trợ Toxi.
                  </p>
               </div>
               <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                  Thử lại
               </button>
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-700">
               <div className="bg-[#2E3192] p-12 text-white flex items-center justify-between">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 w-fit text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Chứng chỉ Hợp lệ
                     </div>
                     <h2 className="text-3xl font-black tracking-tight">Văn bằng chính thức</h2>
                  </div>
                  <Award className="w-16 h-16 text-orange-400 opacity-40" />
               </div>

               <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <User className="w-4 h-4" /> Học viên sở hữu
                           </p>
                           <p className="text-2xl font-black text-slate-900">{cert.profiles?.full_name || 'Học viên ẩn danh'}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <BookOpen className="w-4 h-4" /> Khóa học đã hoàn thành
                           </p>
                           <p className="text-xl font-black text-[#2E3192]">{cert.courses?.title}</p>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Ngày cấp chứng chỉ
                           </p>
                           <p className="text-xl font-black text-slate-900">{new Date(cert.issued_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" /> Mã số xác minh
                           </p>
                           <code className="text-lg font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-xl block w-fit border border-orange-100">
                              {cert.verify_code}
                           </code>
                        </div>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Trạng thái</p>
                        <p className="text-sm font-black text-slate-900">Đã kích hoạt</p>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                        <Award className="w-6 h-6 text-[#2E3192]" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Phân loại</p>
                        <p className="text-sm font-black text-slate-900">Chuyên nghiệp</p>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                        <Sparkles className="w-6 h-6 text-orange-400" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Cấp bởi</p>
                        <p className="text-sm font-black text-slate-900">Toxi AI Academy</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-6">
                     <button className="flex-1 px-8 py-5 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                        <Download className="w-5 h-5" /> Tải bản sao
                     </button>
                     <button className="px-8 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-3">
                        <Share2 className="w-5 h-5" /> Chia sẻ LinkedIn
                     </button>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 text-center">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 Toxi AI - Trust through Technology</p>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
