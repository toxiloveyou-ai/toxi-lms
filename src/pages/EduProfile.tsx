import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  Award, Medal, Star, Shield, TrendingUp, Calendar, Loader2, 
  BrainCircuit, Zap, Target, BookOpen, Compass, Download, 
  Share2, ArrowUpRight, History, Heart, Globe, Sparkles
} from 'lucide-react';
import { getDashboardData, getOrCreateProfile } from '../lib/api/profile';
import { getLearnerEvolution } from '../lib/api/evolution';
import { getUserCertificates } from '../lib/api/eduLifecycle';
import { supabase } from '../lib/supabase';


const journeyMilestones = [
  { date: '2026-04-01', title: 'Khởi đầu hành trình', desc: 'Giai đoạn Xóa mù chữ Hán', icon: Star, color: 'bg-amber-100 text-amber-600' },
  { date: '2026-04-15', title: 'Vượt qua Pinyin', desc: 'Làm chủ hệ thống phát âm 3.0', icon: Zap, color: 'bg-blue-100 text-blue-600' },
  { date: '2026-05-01', title: 'Thực chiến đầu tiên', desc: 'Hoàn thành kịch bản "Chào hỏi đối tác"', icon: Award, color: 'bg-emerald-100 text-emerald-600' },
  { date: '2026-05-07', title: 'Chạm mốc HSK 1+', desc: 'Sẵn sàng cho kỳ thi năng lực', icon: Target, color: 'bg-indigo-100 text-indigo-600' },
];

export default function EduProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Học Viên';
        const [prof, dash, evol, certs] = await Promise.all([
          getOrCreateProfile(user.id, fallbackName),
          getDashboardData(user.id),
          getLearnerEvolution(user.id),
          getUserCertificates(user.id)
        ]);

        setProfile(prof);
        setDashData(dash);
        setEvolution(evol);
        setCertificates(certs.data || []);

      } catch (error) {
        console.error("Error loading profile data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#2E3192] animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang giải mã DNA ngôn ngữ...</p>
      </div>
    );
  }

  const fullName = profile?.full_name || 'Học Viên Toxi';
  const initial = fullName.charAt(0).toUpperCase();

  const radarData = [
    { subject: 'Ngữ pháp', A: evolution?.linguistic_dna?.grammarPatterns?.length * 15 || 65, fullMark: 100 },
    { subject: 'Từ vựng', A: profile?.total_xp / 100 || 85, fullMark: 100 },
    { subject: 'Nghe hiểu', A: 78, fullMark: 100 },
    { subject: 'Phát âm', A: evolution?.ethical_growth?.persistenceScore || 65, fullMark: 100 },
    { subject: 'Phản xạ', A: 70, fullMark: 100 },
    { subject: 'Đọc hiểu', A: 88, fullMark: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Premium Hero Section */}
      <div className="relative rounded-[3rem] overflow-hidden bg-[#1E2060] text-white p-10 md:p-16 shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-student-primary/20 to-transparent rounded-full blur-[120px] -mr-64 -mt-64" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 border-4 border-white/20 p-1 backdrop-blur-md shadow-2xl relative">
                     <div className="w-full h-full rounded-full bg-gradient-to-br from-student-primary to-[#2E3192] flex items-center justify-center text-5xl font-black italic">
                        {initial}
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 animate-bounce">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                     </div>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                     <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Premium Learner</span>
                     <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-sm">Verified ID: TOXI-{profile?.id?.slice(0, 6)}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight">{fullName}</h1>
                  <p className="text-white/60 font-medium max-w-lg text-lg leading-relaxed italic">
                    "Hành trình vạn dặm bắt đầu từ một bước chân. Đang chinh phục đỉnh cao HSK 3."
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
               <div className="flex gap-4">
                  <button className="flex-1 md:flex-none px-8 py-4 bg-white text-[#2E3192] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3">
                    <Download className="w-4 h-4" /> Export CV
                  </button>
                  <button className="p-4 bg-white/10 text-white rounded-2xl border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md">
                    <Share2 className="w-5 h-5" />
                  </button>
               </div>
               <div className="bg-black/20 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex justify-between items-center gap-8">
                  <div className="text-center">
                     <p className="text-2xl font-black text-orange-400">{profile?.streak_days || 0}</p>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Streak</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                     <p className="text-2xl font-black text-indigo-400">{Math.floor(profile?.total_xp / 1000) || 0}k</p>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Points</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                     <p className="text-2xl font-black text-emerald-400">#42</p>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Left: Deep Intelligence */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Linguistic DNA Section */}
            <div className="student-card p-10 bg-white border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <BrainCircuit className="w-12 h-12 text-slate-100" />
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-14 h-14 bg-[#2E3192]/5 rounded-[24px] flex items-center justify-center">
                        <Zap className="w-7 h-7 text-[#2E3192]" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Linguistic DNA</h2>
                        <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Deep Learning Profile Analysis</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                              <PolarGrid stroke="#f1f5f9" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Student" dataKey="A" stroke="#2E3192" strokeWidth={3} fill="#2E3192" fillOpacity={0.1} />
                           </RadarChart>
                        </ResponsiveContainer>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-[#2E3192] uppercase tracking-[0.2em] mb-4">Core Strengths</h4>
                           <div className="flex flex-wrap gap-2">
                              {(evolution?.linguistic_dna?.vocabularyStrengths || ['Từ vựng cơ bản', 'Giao tiếp']).map((s: string) => (
                                 <span key={s} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-100">{s}</span>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Focus Required</h4>
                           <div className="flex flex-wrap gap-2">
                              {(evolution?.linguistic_dna?.weaknesses || ['Phản xạ nhanh', 'Biến điệu Pinyin']).map((w: string) => (
                                 <span key={w} className="px-4 py-2 bg-orange-50 text-orange-700 text-xs font-black rounded-xl border border-orange-100">{w}</span>
                              ))}
                           </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-6">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Shield className="w-3 h-3 text-emerald-500" /> Virtue Index
                           </p>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                              "{evolution?.ethical_growth?.virtueNote || "Người học thể hiện thái độ kiên trì vượt bậc, luôn hoàn thành 100% nhiệm vụ ngày."}"
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Achievement Milestones - Journey */}
            <div className="student-card p-10 bg-white border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <History className="w-6 h-6 text-[#2E3192]" /> Lịch Sử Tiến Hóa
               </h3>
               
               <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {journeyMilestones.map((m, i) => (
                     <div key={i} className="relative pl-12 group">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl ${m.color} flex items-center justify-center z-10 shadow-sm border-2 border-white transition-transform group-hover:scale-110`}>
                           <m.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.date}</p>
                           <h4 className="text-lg font-black text-slate-800">{m.title}</h4>
                           <p className="text-sm text-slate-500 font-medium">{m.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right: Goals & Commitments */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* Goal Card */}
            <div className="student-card p-8 bg-gradient-to-br from-[#2E3192] to-indigo-900 text-white shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-white/10 rounded-2xl">
                     <Target className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full">Active Goal</span>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Mục tiêu kỳ thi</h4>
                     <p className="text-3xl font-black">Chứng chỉ HSK 1</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Dự kiến</p>
                        <p className="text-lg font-black text-orange-400">15/06</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Tự tin</p>
                        <p className="text-lg font-black text-emerald-400">85%</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>Lộ trình hoàn thiện</span>
                        <span>68%</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-[68%]" />
                     </div>
                  </div>
               </div>
            </div>

            {/* AI Recommendations */}
            <div className="student-card p-8 bg-white border-slate-100">
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" /> Smart Action Items
               </h4>
               
               <div className="space-y-4">
                  {[
                    { title: 'Tăng phản xạ 1-1', desc: 'Sử dụng "Thực Chiến" kịch bản Đàm phán.', points: '+50 XP', icon: Zap },
                    { title: 'Cố định từ vựng HSK', desc: 'Ôn tập 25 từ vựng mục Ngành nghề.', points: '+30 XP', icon: BookOpen },
                    { title: 'Đánh bóng phát âm', desc: 'Thử thách "Phòng Lab" với 5 âm khó.', points: '+45 XP', icon: Heart }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors group cursor-pointer">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                             <item.icon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-black text-slate-800">{item.title}</p>
                             <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-300" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Community Social */}
            <div className="student-card p-8 bg-indigo-50 border-indigo-100">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                     <Globe className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-sm font-black text-indigo-900">Top 1% Global</p>
                     <p className="text-[10px] font-bold text-indigo-500 uppercase">Hạng 1.250 / 128.000</p>
                  </div>
               </div>
               <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  Mời bạn bè & So trình
               </button>
            </div>

         </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                 <Award className="w-8 h-8 text-indigo-600" /> Chứng chỉ của tôi
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{certificates.length} Chứng chỉ đã đạt được</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div key={cert.id} className="student-card p-6 bg-white border-slate-100 group cursor-pointer hover:border-indigo-400 transition-all hover:shadow-xl relative overflow-hidden" onClick={() => window.open(`/edu/certificate/${cert.cert_id}`, '_blank')}>
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                   
                   <div className="flex items-start gap-4 relative z-10">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         <Award className="w-7 h-7" />
                      </div>
                      <div className="flex-1 space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {cert.cert_id}</p>
                         <h4 className="text-lg font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{cert.courses?.title}</h4>
                         <div className="flex items-center gap-2 pt-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded">Chính thức</span>
                            <span className="text-[9px] font-bold text-slate-400 italic">Ngày cấp: {new Date(cert.issue_date).toLocaleDateString('vi-VN')}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Xem chi tiết</p>
                      <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}

