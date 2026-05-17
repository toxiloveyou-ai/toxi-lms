import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { 
  Award, Star, Shield, Loader2, BrainCircuit, Zap, Target, BookOpen, 
  Compass, Download, Share2, ArrowUpRight, History, Globe, Sparkles,
  Fingerprint, Cpu, Database, ChevronRight, Trophy, User, Flame, 
  Settings, X, Upload 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrCreateProfile, getDashboardData, updateProfile, uploadAvatar } from '../../lib/api/profile';
import { getLearnerEvolution } from '../../lib/api/evolution';
import { getUserCertificates } from '../../lib/api/eduLifecycle';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';


const journeyMilestones = [
  { date: '2026-04-01', title: 'Khởi đầu hành trình', desc: 'Giai đoạn Xóa mù chữ Hán', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { date: '2026-04-15', title: 'Vượt qua Pinyin', desc: 'Làm chủ hệ thống phát âm 3.0', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { date: '2026-05-01', title: 'Thực chiến đầu tiên', desc: 'Hoàn thành kịch bản "Chào hỏi đối tác"', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { date: '2026-05-07', title: 'Chạm mốc HSK 1+', desc: 'Sẵn sàng cho kỳ thi năng lực', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

const presetAvatars = [
  { name: 'Neon Student', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student&backgroundColor=2e3192' },
  { name: 'AI Explorer', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=explorer&backgroundColor=0f172a' },
  { name: 'Zen Master', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=zen&backgroundColor=ea580c' },
  { name: 'Bio Core', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=core&backgroundColor=10b981' },
  { name: 'Future Quantum', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum&backgroundColor=6366f1' },
  { name: 'Toxi Companion', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=toxi&backgroundColor=1e293b' },
];

export default function EduProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Edit & Personal Goals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'goals'>('profile');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
    target_exam: 'HSK 5',
    exam_date: '',
    target_score: '' as string | number,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

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

        if (prof) {
          setFormData({
            full_name: prof.full_name || '',
            phone: prof.phone || '',
            bio: prof.bio || '',
            avatar_url: prof.avatar_url || '',
            target_exam: prof.target_exam || 'HSK 5',
            exam_date: prof.exam_date ? (typeof prof.exam_date === 'string' ? prof.exam_date.split('T')[0] : new Date(prof.exam_date).toISOString().split('T')[0]) : '',
            target_score: prof.target_score || '',
          });
        }

      } catch (error) {
        console.error("Error loading profile data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const openModalWithTab = (tab: 'profile' | 'goals') => {
    setActiveTab(tab);
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        target_exam: profile.target_exam || 'HSK 5',
        exam_date: profile.exam_date ? (typeof profile.exam_date === 'string' ? profile.exam_date.split('T')[0] : new Date(profile.exam_date).toISOString().split('T')[0]) : '',
        target_score: profile.target_score || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const publicUrl = await uploadAvatar(user.id, file);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Lỗi tải lên hình ảnh: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        target_exam: formData.target_exam,
        exam_date: formData.exam_date || null,
        target_score: formData.target_score ? Number(formData.target_score) : null,
      };

      const updated = await updateProfile(user.id, updates);
      setProfile(updated);
      setShowSuccessAnim(true);
      setTimeout(() => {
        setShowSuccessAnim(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (error: any) {
      console.error("Update profile error:", error);
      alert("Lỗi cập nhật hồ sơ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Dynamic values calculated from active decks
  const averageProgress = dashData?.decks && dashData.decks.length > 0
    ? Math.round(dashData.decks.reduce((acc: number, d: any) => acc + (d.progress || 0), 0) / dashData.decks.length)
    : 0;
  const currentProgress = averageProgress > 0 ? averageProgress : Math.min(95, Math.round((profile?.total_xp || 0) / 100)) || 10;

  // Format date helper
  const formatExamDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa đặt';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const radarData = [
    { subject: 'Ngữ pháp', A: dashData?.lastExam?.radar_stats?.Grammar || (evolution?.linguistic_dna?.grammarPatterns?.length || 0) * 15 || 65, fullMark: 100 },
    { subject: 'Từ vựng', A: Math.min(100, (profile?.total_xp || 0) / 100) || 85, fullMark: 100 },
    { subject: 'Nghe hiểu', A: dashData?.lastExam?.radar_stats?.Listening || 78, fullMark: 100 },
    { subject: 'Phát âm', A: dashData?.lastExam?.radar_stats?.Speaking || evolution?.ethical_growth?.persistenceScore || 65, fullMark: 100 },
    { subject: 'Phản xạ', A: dashData?.lastExam?.radar_stats?.Speaking || 70, fullMark: 100 },
    { subject: 'Đọc hiểu', A: dashData?.lastExam?.radar_stats?.Reading || 88, fullMark: 100 },
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
               
               <div className="relative z-10 space-y-6 w-full flex flex-col items-center">
                  <div className="relative inline-block group/avatar">
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-[#2E3192] p-1 flex items-center justify-center shadow-2xl shadow-indigo-500/50 relative overflow-hidden">
                        {profile?.avatar_url ? (
                           <img 
                              src={profile.avatar_url} 
                              alt={fullName} 
                              className="w-full h-full rounded-full object-cover" 
                           />
                        ) : (
                           <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl font-black italic tracking-tighter">
                              {initial}
                           </div>
                        )}
                        <button 
                           onClick={() => openModalWithTab('profile')}
                           className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-white rounded-full"
                        >
                           Thay đổi
                        </button>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                        <Fingerprint className="w-6 h-6 text-[#2E3192]" />
                     </div>
                  </div>

                  <div className="space-y-2 text-center w-full">
                     <h2 className="text-3xl font-black tracking-tight uppercase leading-none truncate max-w-full px-2">{fullName}</h2>
                     {profile?.bio && (
                        <p className="text-[10px] text-white/60 font-medium italic max-w-[240px] mx-auto line-clamp-2">{profile.bio}</p>
                     )}
                     <div className="flex flex-col items-center gap-1.5 pt-1">
                        <div className="flex items-center justify-center gap-2">
                           <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">ID: TX-{profile?.id?.slice(0, 8)}</span>
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        {profile?.phone && (
                           <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">SĐT: {profile.phone}</p>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/10">
                     <div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Mục tiêu hướng tới</p>
                        <p className="text-xl font-black text-orange-400 truncate">{profile?.target_exam || 'HSK 3+'}</p>
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
                     <button 
                        onClick={() => openModalWithTab('profile')}
                        className="px-6 py-3 bg-[#2E3192] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-[#1B1D55] active:scale-95 transition-all flex items-center gap-2"
                     >
                        <User className="w-4 h-4" /> Cập nhật hồ sơ
                     </button>
                     <button className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:text-[#2E3192] hover:bg-slate-100 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Xuất chứng chỉ
                     </button>
                     <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 hover:text-[#2E3192] hover:bg-slate-100 active:scale-95 transition-all">
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
                     <div className="flex items-center gap-2">
                        <button 
                           onClick={() => openModalWithTab('goals')}
                           className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 rounded-xl border border-white/10 transition-all"
                           title="Cài đặt mục tiêu"
                        >
                           <Settings className="w-3.5 h-3.5 text-yellow-400" />
                        </button>
                        <span className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg">Target Active</span>
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mục tiêu trung hạn</p>
                     <h4 className="text-3xl font-black tracking-tight leading-none italic">{profile?.target_exam || 'Chứng chỉ HSK 4'}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Dự kiến đạt</p>
                        <p className="text-xl font-black text-orange-400">{formatExamDate(profile?.exam_date)}</p>
                     </div>
                     <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Mục tiêu điểm</p>
                        <p className="text-xl font-black text-emerald-400">{profile?.target_score || '---'}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Trình độ hiện tại</p>
                           <p className="text-sm font-bold">Hoàn thành {currentProgress}% lộ trình</p>
                        </div>
                        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                     </div>
                     <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${currentProgress}%` }}
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

      {/* 4. MODAL: PROFILE & GOAL SETTINGS */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md"
            >
              {/* Backdrop click to close */}
              <div className="absolute inset-0" onClick={() => !isSubmitting && setIsModalOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 md:p-8 max-w-xl w-full relative z-10 max-h-[90vh] overflow-y-auto"
              >
                {showSuccessAnim ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-xl shadow-emerald-500/10">
                      <Sparkles className="w-10 h-10 animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">ĐỒNG BỘ THÀNH CÔNG!</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">DNA học thuật đã được cập nhật</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#2E3192]">
                          <Settings className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Cài đặt học viên</h3>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Hồ sơ năng lực & Mục tiêu học tập</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 text-slate-400 hover:text-[#2E3192] hover:bg-slate-50 rounded-xl active:scale-95 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tabs Selector */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === 'profile' ? 'bg-[#2E3192] text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Hồ sơ cá nhân
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('goals')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === 'goals' ? 'bg-[#2E3192] text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Mục tiêu học tập
                      </button>
                    </div>

                    {/* Form fields based on Active Tab */}
                    <div className="space-y-5 py-2">
                      {activeTab === 'profile' ? (
                        <div className="space-y-4">
                          {/* Avatar settings */}
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ảnh đại diện thực chiến</label>
                            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                              {/* Avatar Preview */}
                              <div className="relative group shrink-0">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-[#2E3192] p-0.5 shadow-md">
                                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                                    {formData.avatar_url ? (
                                      <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center text-2xl font-black italic">
                                        {formData.full_name?.charAt(0).toUpperCase() || 'H'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {uploading && (
                                  <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                  </div>
                                )}
                              </div>

                              {/* Upload actions & Presets */}
                              <div className="flex-1 space-y-3 w-full">
                                <div className="flex items-center gap-3">
                                  <label className="px-4 py-2 bg-white text-slate-700 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
                                    <Upload className="w-3.5 h-3.5" /> Chọn tệp
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleAvatarUpload} 
                                      className="hidden" 
                                    />
                                  </label>
                                  <span className="text-[9px] font-bold text-slate-400 italic">PNG, JPG tối đa 5MB</span>
                                </div>
                              </div>
                            </div>

                            {/* Presets Grid */}
                            <div className="space-y-2">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hoặc chọn AI Avatar Preset:</span>
                              <div className="grid grid-cols-6 gap-2">
                                {presetAvatars.map((p, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, avatar_url: p.url }))}
                                    className={`w-10 h-10 rounded-xl overflow-hidden p-0.5 transition-all active:scale-90 border-2 ${formData.avatar_url === p.url ? 'border-[#2E3192] scale-105 shadow-md' : 'border-transparent hover:border-slate-300'}`}
                                    title={p.name}
                                  >
                                    <img src={p.url} alt="" className="w-full h-full rounded-lg object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Name & Phone */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Họ và Tên</label>
                              <input 
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all"
                                placeholder="Họ tên học viên"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                              <input 
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all"
                                placeholder="Nhập số điện thoại"
                              />
                            </div>
                          </div>

                          {/* Bio */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tiểu sử / Giới thiệu</label>
                            <textarea 
                              rows={3}
                              value={formData.bio}
                              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all resize-none"
                              placeholder="Lời giới thiệu ngắn hoặc danh ngôn truyền cảm hứng..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Target Exam */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mục tiêu chứng chỉ / Lộ trình</label>
                            <select
                              value={formData.target_exam}
                              onChange={(e) => setFormData(prev => ({ ...prev, target_exam: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all"
                            >
                              <option value="HSK 1">HSK 1 - Bắt đầu cơ bản</option>
                              <option value="HSK 2">HSK 2 - Giao tiếp đơn giản</option>
                              <option value="HSK 3">HSK 3 - Thực chiến cơ bản</option>
                              <option value="HSK 4">HSK 4 - Làm việc thực tế</option>
                              <option value="HSK 5">HSK 5 - Chuyên nghiệp trôi chảy</option>
                              <option value="HSK 6">HSK 6 - Đỉnh cao học thuật</option>
                              <option value="HSK 7-9">HSK 7-9 - Nghiên cứu cao cấp</option>
                              <option value="Giao tiếp Thương mại">Giao tiếp Thương mại / Doanh nghiệp</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Target Score */}
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mục tiêu điểm số</label>
                              <input 
                                type="number"
                                min={100}
                                max={300}
                                value={formData.target_score}
                                onChange={(e) => setFormData(prev => ({ ...prev, target_score: e.target.value ? Number(e.target.value) : '' }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all"
                                placeholder="Ví dụ: 250"
                              />
                              <p className="text-[8px] font-bold text-slate-400 italic">Thang điểm chuẩn: 180 là đỗ, 300 là tối đa.</p>
                            </div>

                            {/* Exam Date */}
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ngày thi dự kiến</label>
                              <input 
                                type="date"
                                value={formData.exam_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, exam_date: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#2E3192] transition-all"
                              />
                            </div>
                          </div>

                          {/* Motivational Info box */}
                          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                            <Target className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-orange-700 uppercase tracking-wider">Lời khuyên AI mục tiêu</p>
                              <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
                                Hệ thống định hình DNA học thuật khuyên bạn nên ôn tập ít nhất 15 phút mỗi ngày để đạt mục tiêu này với xác suất đỗ trên 85%.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200/50 active:scale-95 transition-all"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || uploading}
                        className="px-6 py-3 bg-[#2E3192] hover:bg-[#1B1D55] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Đồng bộ...
                          </>
                        ) : (
                          <>
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
