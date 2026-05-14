import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Share2, 
  ShieldCheck, 
  Award, 
  Loader2, 
  ChevronLeft,
  Printer,
  Calendar,
  User,
  BookOpen,
  Sparkles,
  Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EduCertificateView() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<any>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCertificate();
  }, [certId]);

  async function fetchCertificate() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select('*, toxi_profiles(full_name), courses(title)')
        .eq('cert_id', certId)
        .single();
      
      if (error) throw error;
      setCert(data);
    } catch (err) {
      console.error('Error fetching certificate:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!cert) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <p className="text-slate-500 font-bold">Không tìm thấy chứng chỉ này.</p>
      <button onClick={() => navigate('/edu/profile')} className="text-indigo-600 font-black uppercase text-xs tracking-widest">Quay lại Hồ sơ</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] py-12 px-4 md:px-8 font-sans selection:bg-indigo-100">
      {/* Header Actions - Hidden on Print */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-12 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-all">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-4 h-4" /> In chứng chỉ
          </button>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95">
            <Download className="w-4 h-4" /> Tải xuống PDF
          </button>
        </div>
      </div>

      {/* THE CERTIFICATE */}
      <div className="max-w-5xl mx-auto">
        <div ref={certRef} className="relative aspect-[1.414/1] w-full bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-none border-[16px] border-double border-indigo-900/10 p-1 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] overflow-hidden">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-indigo-900/20 m-8" />
          <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-indigo-900/20 m-8" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-indigo-900/20 m-8" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-indigo-900/20 m-8" />

          {/* Inner Border */}
          <div className="h-full w-full border border-indigo-900/5 p-12 flex flex-col items-center justify-between relative">
            
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
               <Award className="w-[500px] h-[500px] rotate-12" />
            </div>

            {/* Header */}
            <div className="text-center space-y-6 relative z-10">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-[#2E3192] rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                     <Award className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[#2E3192] text-xl font-black tracking-[0.3em] uppercase">Toxi Edu Intelligence</h3>
                    <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase">Academy of Applied Language & AI</p>
                  </div>
               </div>
               <div className="h-px w-32 bg-indigo-900/20 mx-auto" />
            </div>

            {/* Main Content */}
            <div className="text-center space-y-8 relative z-10">
               <h1 className="text-5xl font-serif italic text-slate-800 tracking-tight">Chứng nhận Hoàn thành</h1>
               <div className="space-y-2">
                 <p className="text-slate-400 font-medium text-lg italic">Hệ thống Toxi Edu trân trọng chứng nhận</p>
                 <h2 className="text-6xl font-black text-indigo-900 uppercase tracking-tight py-4 drop-shadow-sm">{cert.toxi_profiles?.full_name || 'Học viên'}</h2>
               </div>
               <div className="max-w-2xl mx-auto space-y-4">
                 <p className="text-slate-600 font-medium text-xl leading-relaxed">
                   Đã hoàn thành xuất sắc khóa học <span className="font-black text-slate-800 border-b-2 border-indigo-600/30">"{cert.courses?.title}"</span>
                 </p>
                 <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                   Đạt chuẩn năng lực ứng dụng Hán ngữ & Công nghệ AI
                 </p>
               </div>
            </div>

            {/* Bottom Info */}
            <div className="w-full grid grid-cols-3 items-end pt-12 relative z-10">
               <div className="space-y-4 text-center">
                  <div className="space-y-1">
                     <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Mã chứng chỉ</p>
                     <p className="text-indigo-900 font-black text-sm">{cert.cert_id}</p>
                  </div>
                  <div className="pt-4">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${window.location.href}`} className="w-20 h-20 mx-auto border border-slate-100 p-1 bg-white shadow-sm grayscale opacity-60" alt="Verification QR" />
                  </div>
               </div>

               <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-double border-indigo-900/10 flex items-center justify-center opacity-40">
                     <ShieldCheck className="w-12 h-12 text-indigo-900" />
                  </div>
                  <p className="mt-4 text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Verified Authenticity</p>
               </div>

               <div className="text-center space-y-4">
                  <div className="space-y-4">
                    <div className="w-48 h-px bg-slate-200 mx-auto" />
                    <div>
                      <p className="text-slate-800 font-black text-sm">LÊ ĐÌNH HIỂU</p>
                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Founder of Toxi Edu</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Ngày cấp</p>
                    <p className="text-slate-800 font-black text-xs">{new Date(cert.issue_date).toLocaleDateString('vi-VN')}</p>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Verification Info - Hidden on Print */}
        <div className="mt-12 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 print:hidden">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
                 <p className="text-sm font-black text-emerald-600 uppercase">Đã xác minh</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <Trophy className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết quả thi</p>
                 <p className="text-sm font-black text-slate-800">{cert.metadata_json?.score || 100}/100</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <Sparkles className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Công nghệ xác thực</p>
                 <p className="text-sm font-black text-slate-800 uppercase">Toxi Block-ID</p>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .max-w-5xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { size: landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
}
