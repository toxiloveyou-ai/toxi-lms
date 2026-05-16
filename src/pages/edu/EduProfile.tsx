import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { 
  Award, Medal, Star, Shield, TrendingUp, Calendar, Loader2, 
  BrainCircuit, Zap, Target, BookOpen, Compass, Download, 
  Share2, ArrowUpRight, History, Heart, Globe, Sparkles,
  Fingerprint, Cpu, Database, Activity, Layout as LayoutIcon,
  ChevronRight, ArrowLeft, Trophy, User, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardData, getOrCreateProfile } from '../../lib/api/profile';
import { getLearnerEvolution } from '../../lib/api/evolution';
import { getUserCertificates } from '../../lib/api/eduLifecycle';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const journeyMilestones = [
  { date: '2026-04-01', title: 'Khởi đầu hành trình', desc: 'Giai đoạn Xóa mù chữ Hán', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { date: '2026-04-15', title: 'Vượt qua Pinyin', desc: 'Làm chủ hệ thống phát âm 3.0', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { date: '2026-05-01', title: 'Thực chiến đầu tiên', desc: 'Hoàn thành kịch bản "Chào hỏi đối tác"', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { date: '2026-05-07', title: 'Chạm mốc HSK 1+', desc: 'Sẵn sàng cho kỳ thi năng lực', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

export default function EduProfile() {
  const navigate = useNavigate();
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-[#2E3192] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Fingerprint className="w-6 h-6 text-[#2E3192]/50" />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Scanning Personal DNA Profile...</p>
      </div>
    );
  }

  const fullName = profile?.full_name || 'Học Viên Toxi';
  const initial = fullName.charAt(0).toUpperCase();

  const radarData = [
    { subject: 'Ngữ pháp', A: (evolution?.linguistic_dna?.grammarPatterns?.length || 0) * 15 || 65, fullMark: 100 },
    { subject: 'Từ vựng', A: Math.min(100, (profile?.total_xp || 0) / 100) || 85, fullMark: 100 },
    { subject: 'Nghe hiểu', A: 78, fullMark: 100 },
    { subject: 'Phát âm', A: evolution?.ethical_growth?.persistenceScore || 65, fullMark: 100 },
    { subject: 'Phản xạ', A: 70, fullMark: 100 },
    { subject: 'Đọc hiểu', A: 88, fullMark: 100 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      
      {/* 1. FUTURISTIC HERO: THE CITIZEN CARD */}
      <section className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 rounded-[3rem] blur opacity-15 group-hover:opacity-25 transition duration-1000" />
         
         <div className="relative bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-1/3 bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden flex flex-col items-center text-center justify-center">
               <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-transparent blur-3xl" />
                  <Database className="w-full h-full text-white/5" />
               </div>
               
               <div className="relative z-10 space-y-6">
                  <div className="relative inline-block">
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-[#2E3192] p-1 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl font-black italic tracking-tighter">
                           {initial}
                        </div>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                        <Fingerprint className="w-6 h-6 text-[#2E3192]" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <h2 className="text-3xl font-black tracking-tight uppercase leading-none">{fullName}</h2>
                     <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">ID: TX-{profile?.id?.slice(0, 8)}</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/10">
                     <div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Cấp độ học thuật</p>
                        <p className="text-xl font-black text-orange-400">HSK 3+</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Chỉ số kiên trì</p>
                        <p className="text-xl font-black text-emerald-400">{evolution?.ethical_growth?.persistenceScore || 92}%</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 p-8 md:p-12 space-y-8 flex flex-col justify-center">
               <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-[#2E3192] uppercase tracking-[0.3em]">Hồ sơ năng lực thực chiến</p>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Intelligence Profile</h3>
                  </div>
                  <div className="flex gap-3">
                     <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:text-[#2E3192] transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Xuất chứng chỉ
                     </button>
                     <button className="p-3 bg-[#2E3192] text-white rounded-2xl shadow-xl shadow-indigo-900/20 active:scale-95 transition-all">
                        <Share2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                     { label: 'Chuỗi học tập', value: profile?.streak_days || 0, unit: 'Ngày', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                     { label: 'Kinh nghiệm', value: Math.floor((profile?.total_xp || 0) / 1000) || 0, unit: 'k XP', icon: Trophy, color: 'text-[#2E3192]', bg: 'bg-indigo-50' },
                     { label: 'Xếp hạng tuần', value: '#12', unit: 'Global', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  ].map((stat, i) => (
                     <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                           <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                           <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}<span className="text-xs ml-1 text-slate-400">{stat.unit}</span></p>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                     </div>
                     <p className="text-sm font-bold text-slate-600 italic">"Hành trình vạn dặm bắt đầu từ một bước chân. Bạn đang làm rất tốt!"</p>
                  </div>
                  <button className="hidden sm:flex items-center gap-2 text-[10px] font-black text-[#2E3192] uppercase tracking-widest">
                     Xem thêm động lực <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 2. CORE INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
         <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Cpu className="w-64 h-64" />
               </div>
               
               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl">
                           <BrainCircuit className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Linguistic DNA</h2>
                           <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                              <span className="w-2 h-2 bg-[#2E3192] rounded-full animate-ping" /> Cấu trúc năng lực trí tuệ
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">DNA Verified</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                     <div className="h-[380px] w-full relative">
                        <div className="absolute inset-0 bg-indigo-50/20 rounded-full blur-3xl" />
                        <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                              <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                              <Radar name="Student" dataKey="A" stroke="#2E3192" strokeWidth={4} fill="#2E3192" fillOpacity={0.15} />
                           </RadarChart>
                        </ResponsiveContainer>
                     </div>

                     <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-[#2E3192]/20 transition-all">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Target className="w-3 h-3 text-[#2E3192]" /> Độ chính xác</p>
                              <p className="text-2xl font-black text-slate-900">92%</p>
                           </div>
                           <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-orange-500/20 transition-all">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap className="w-3 h-3 text-orange-500" /> Tốc độ phản xạ</p>
                              <p className="text-2xl font-black text-slate-900">0.8s</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-2">Điểm mạnh cốt lõi</h4>
                           <div className="flex flex-wrap gap-2">
                              {(evolution?.linguistic_dna?.vocabularyStrengths || ['Từ vựng kinh tế', 'Hội thoại thực chiến', 'Phát âm chuẩn']).map((s: string) => (
                                 <motion.span whileHover={{ y: -2 }} key={s} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-tight shadow-sm">{s}</motion.span>
                              ))}
                           </div>
                        </div>

                        <div className="p-6 bg-[#2E3192] text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-10 h-10" /></div>
                           <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Nhận xét từ AI</p>
                           <p className="text-sm font-bold leading-relaxed italic">
                              "{evolution?.ethical_growth?.virtueNote || "Năng lực ngôn ngữ của bạn đang phát triển theo hướng chuyên sâu về thực chiến. Cần chú trọng thêm các cấu trúc ngữ pháp phức tạp."}"
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                     <History className="w-7 h-7 text-[#2E3192]" /> Lịch sử tiến hóa
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hành trình 90 ngày</p>
               </div>
               
               <div className="relative space-y-12 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50 before:rounded-full">
                  {journeyMilestones.map((m, i) => (
                     <div key={i} className="relative pl-16 group">
                        <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center z-10 shadow-lg border-4 border-white transition-all group-hover:scale-110 group-hover:rotate-6`}>
                           <m.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5 p-6 bg-slate-50/50 rounded-[2rem] border border-transparent group-hover:border-slate-200 group-hover:bg-white transition-all">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.date}</p>
                           <h4 className="text-xl font-black text-slate-800">{m.title}</h4>
                           <p className="text-sm text-slate-500 font-medium italic">{m.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                  <Target className="w-24 h-24" />
               </div>
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                        <Target className="w-8 h-8 text-orange-400" />
                     </div>
                     <span className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg">Target Active</span>
                  </div>
                  
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mục tiêu trung hạn</p>
                     <h4 className="text-3xl font-black tracking-tight leading-none italic">Chứng chỉ HSK 4</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Dự kiến đạt</p>
                        <p className="text-xl font-black text-orange-400">20/07</p>
                     </div>
                     <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Xác suất AI</p>
                        <p className="text-xl font-black text-emerald-400">88%</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Trình độ hiện tại</p>
                           <p className="text-sm font-bold">Hoàn thành 72% lộ trình</p>
                        </div>
                        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                     </div>
                     <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: '72%' }}
                           className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 rounded-full" 
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                     <Compass className="w-5 h-5 text-[#2E3192]" /> Nhiệm vụ rèn luyện
                  </h4>
               </div>
               
               <div className="space-y-4">
                  {[
                    { title: 'Phản xạ thực chiến', desc: 'Kịch bản "Đàm phán giá cả".', points: '+80 XP', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { title: 'Thư viện từ vựng', desc: '20 từ vựng chủ đề "Logistic".', points: '+50 XP', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { title: 'Tư duy Hán ngữ', desc: 'Phân tích 5 cấu trúc bẻ lái.', points: '+120 XP', icon: BrainCircuit, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                  ].map((item, i) => (
                    <motion.div 
                      whileHover={{ x: 5 }}
                      key={i} 
                      className="p-5 bg-slate-50 hover:bg-white hover:shadow-lg rounded-3xl border border-transparent hover:border-slate-100 transition-all group cursor-pointer"
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                             <item.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-black text-slate-800">{item.title}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.points}</p>
                          </div>
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <ArrowUpRight className="w-4 h-4 text-slate-400" />
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="bg-[#2E3192] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/20">
                     <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                     <p className="text-xl font-black italic">Top 1% Global</p>
                     <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Vượt qua 12.000 học viên khác</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {certificates.length > 0 && (
        <section className="space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                 <Award className="w-10 h-10 text-[#2E3192]" /> Văn bằng chứng nhận
              </h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map((cert) => (
                <motion.div 
                  whileHover={{ y: -10 }}
                  key={cert.id} 
                  className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden" 
                  onClick={() => window.open(`/edu/certificate/${cert.cert_id}`, '_blank')}
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                   <div className="relative z-10 space-y-6">
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-[#2E3192] transition-colors shadow-lg">
                         <Award className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Serial: {cert.cert_id}</p>
                         <h4 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#2E3192] transition-colors uppercase italic">{cert.courses?.title}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ngày cấp</span>
                            <span className="text-xs font-bold text-slate-900">{new Date(cert.issue_date).toLocaleDateString('vi-VN')}</span>
                         </div>
                         <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-lg border border-emerald-100">Verified</div>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </section>
      )}
      
      <section className="bg-slate-900 p-12 rounded-[4rem] text-center space-y-8 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-transparent blur-3xl" />
         </div>
         <div className="relative z-10 space-y-4">
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Sẵn sàng cho nấc thang mới?</h3>
            <p className="text-white/50 font-bold max-w-xl mx-auto italic">Hệ thống AI đã phân tích và chuẩn bị sẵn kịch bản rèn luyện tiếp theo dựa trên DNA ngôn ngữ của bạn.</p>
         </div>
         <button onClick={() => navigate('/edu/practice')} className="relative z-10 px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">Bắt đầu thực chiến ngay</button>
      </section>

    </div>
  );
}
