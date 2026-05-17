import { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  Loader2, 
  Sparkles, 
  Target, 
  RefreshCw, 
  Clock,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Zap,
  Info,
  Calendar,
  Activity,
  Star,
  ArrowUpRight,
  MessageSquare,
  Search,
  ArrowRight,
  Layout as LayoutIcon,
  BookMarked,
  LayoutDashboard,
  Timer,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { getOrCreateProfile, getDashboardData, generateAITip, trackUserActivity } from '../../lib/api/profile';
import { getLearnerEvolution } from '../../lib/api/evolution';
import { useNavigate } from 'react-router-dom';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Khuya rồi đấy';
  if (h < 11) return 'Chào buổi sáng';
  if (h < 13) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function formatXP(xp: number) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export default function EduOverview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>(null);
  const [classProgress, setClassProgress] = useState<any>(null);
  const [aiTip, setAiTip] = useState<string>('');
  const [weeklyStats, setWeeklyStats] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Học Viên';
      
      const [prof, dash, evol, classRes, xpRes, streak] = await Promise.all([
        getOrCreateProfile(user.id, fallbackName),
        getDashboardData(user.id),
        getLearnerEvolution(user.id),
        supabase.from('edu_class_members').select('*, edu_classes(*, courses(*))').eq('student_id', user.id).maybeSingle(),
        supabase.from('xp_events').select('created_at, amount').eq('user_id', user.id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        trackUserActivity(user.id)
      ]);

      setProfile({ ...prof, streak_days: streak });
      setDashData(dash);
      setEvolution(evol);

      const stats = [0, 0, 0, 0, 0, 0, 0];
      const today = new Date();
      xpRes.data?.forEach(event => {
        const d = new Date(event.created_at);
        const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
          stats[6 - diff] += event.amount;
        }
      });
      setWeeklyStats(stats);

      if (classRes.data) {
        const cls = classRes.data.edu_classes;
        const { count: totalLessons } = await supabase
          .from('course_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', cls.course_id);

        const { count: completedLessons } = await supabase
          .from('edu_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        const progress = totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0;
        
        setClassProgress({
          name: cls.name,
          course: cls.courses?.title,
          percent: progress,
          total: totalLessons || 0,
          current: completedLessons || 0
        });
      }

      setIsLoadingTip(true);
      generateAITip(prof, dash).then(tip => {
        setAiTip(tip);
        setIsLoadingTip(false);
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#2E3192] animate-spin" />
          <p className="text-slate-400 font-bold animate-pulse uppercase text-[10px] tracking-widest">Đang cá nhân hóa trải nghiệm...</p>
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ').pop() || 'bạn';
  const totalDue = dashData?.decks?.reduce((sum: number, d: any) => sum + (d.due || 0), 0) || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 px-4 md:px-0 pb-20">
      
      {/* 1. WELCOME & STATUS HERO */}
      <section className="relative overflow-hidden bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none hidden lg:block">
           <LayoutIcon className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit"
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Hệ thống đang ổn định</span>
              </motion.div>
              <div className="space-y-1">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                  {getGreeting()}, {firstName}!
                </h2>
                <p className="text-sm md:text-lg text-slate-400 font-bold italic">
                  "Lấy Tài làm bệ phóng, lấy Đạo đức làm gốc." - Toxi AI sẵn sàng hỗ trợ.
                </p>
              </div>
           </div>

           <div className="flex gap-4 w-full md:w-auto">
              {[
                { label: 'Streak', value: profile?.streak_days ?? 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Total XP', value: formatXP(profile?.total_xp ?? 0), icon: Trophy, color: 'text-[#2E3192]', bg: 'bg-indigo-50' },
                { label: 'Level', value: 3, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label} 
                  className="flex-1 md:w-32 p-4 rounded-[1.5rem] bg-white border border-slate-50 shadow-sm flex flex-col items-center text-center group hover:border-[#2E3192]/20 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 ${stat.color} ${stat.label === 'Streak' ? 'fill-current' : ''}`} />
                  </div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 2. MAIN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Current Progress Card */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-[#0f172a] via-[#1E2060] to-[#2E3192] text-white shadow-2xl group cursor-pointer"
            onClick={() => navigate('/edu/dashboard')}
           >
              {/* Dynamic neural bg effect */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 blur-[150px] rounded-full -mr-40 -mt-40 animate-pulse" />
                 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 blur-[150px] rounded-full -ml-40 -mb-40" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                          Active Course
                       </div>
                    </div>
                    {classProgress ? (
                      <div className="space-y-4">
                        <h3 className="text-3xl md:text-5xl font-black leading-[0.95] tracking-tighter uppercase">
                          Tiếp tục học <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">{classProgress.name}</span>
                        </h3>
                        <p className="text-white/50 text-sm md:text-lg font-medium italic">
                          Bàn làm việc đang sẵn sàng. Bạn đã hoàn thành {classProgress.current}/{classProgress.total} buổi học.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-3xl md:text-5xl font-black leading-[0.95] tracking-tighter uppercase">
                          Bắt đầu <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Hành trình mới</span>
                        </h3>
                        <p className="text-white/50 text-sm md:text-lg font-medium italic">
                          Khám phá lộ trình học tập tối ưu được thiết kế riêng cho DNA ngôn ngữ của bạn.
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                       <button className="px-10 py-5 bg-[#2E3192] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:bg-indigo-900 transition-all flex items-center justify-center gap-2 group/btn">
                          {classProgress ? 'Vào lớp ngay' : 'Tìm khóa học'} 
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>

                 <div className="w-48 h-48 md:w-64 md:h-64 relative shrink-0">
                    <div className="absolute inset-0 bg-white/5 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md">
                       <div className="text-center">
                          <p className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{classProgress?.percent || 0}<span className="text-xl md:text-2xl text-student-primary">%</span></p>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">Hoàn thành</p>
                       </div>
                    </div>
                    {/* SVG Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                       <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                       <circle 
                        cx="50%" cy="50%" r="48%" fill="transparent" 
                        stroke="#2E3192" strokeWidth="6" 
                        strokeDasharray="300" strokeDashoffset={300 - (300 * (classProgress?.percent || 0)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                       />
                    </svg>
                 </div>
              </div>
           </motion.div>

           {/* Metrics Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Performance Chart Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h4 className="text-xl font-black text-slate-900 leading-tight">Năng lượng học</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Weekly Momentum</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#2E3192] flex items-center justify-center shadow-inner">
                       <Activity className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="h-40 flex items-end gap-3 mb-6 relative">
                    {weeklyStats.map((h, i) => {
                       const percent = Math.min(100, Math.max(15, (h / 200) * 100));
                       return (
                         <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                            <div className="relative w-full rounded-2xl bg-slate-50 group-hover/bar:bg-indigo-50 transition-colors overflow-hidden" style={{ height: `${percent}%` }}>
                               <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: '100%' }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="absolute inset-0 bg-[#2E3192] origin-bottom scale-y-[0.8] rounded-2xl group-hover/bar:scale-y-1 transition-transform" 
                               />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                               {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                            </span>
                         </div>
                       );
                    })}
                 </div>
                 <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">XP Tổng kết</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{profile?.total_xp || 0}</p>
                 </div>
              </div>

              {/* Priority Tasks Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h4 className="text-xl font-black text-slate-900 leading-tight">Smart Queue</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Nhiệm vụ ưu tiên</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
                       <Zap className="w-6 h-6 fill-current" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <button 
                      onClick={() => navigate('/edu/practice')}
                      className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-[#2E3192]/5 border border-transparent hover:border-[#2E3192]/20 transition-all flex items-center gap-4 group text-left"
                    >
                       <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#2E3192] shadow-sm group-hover:scale-110 transition-transform">
                          <BrainCircuit className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-slate-900">Thực chiến AI</p>
                          <p className="text-[10px] font-bold text-slate-400 italic">Luyện phản xạ HSK 3</p>
                       </div>
                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#2E3192] transition-colors" />
                    </button>
                    <button 
                      onClick={() => navigate('/edu/library')}
                      className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all flex items-center gap-4 group text-left"
                    >
                       <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                          <BookMarked className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-slate-900">Ôn tập Thư viện</p>
                          <p className="text-[10px] font-bold text-slate-400 italic">{totalDue} thẻ đang chờ</p>
                       </div>
                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* AI Analysis Card */}
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[#2E3192]/10 shadow-2xl shadow-indigo-900/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                 <Sparkles className="w-12 h-12 text-[#2E3192]" />
              </div>
              
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#2E3192] text-white flex items-center justify-center shadow-lg shadow-indigo-900/20">
                       <BrainCircuit className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">AI DNA Analysis</h4>
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Scanning
                       </p>
                    </div>
                 </div>

                 {isLoadingTip ? (
                   <div className="space-y-4 py-4">
                      <div className="h-3 bg-slate-100 rounded-full animate-pulse w-full" />
                      <div className="h-3 bg-slate-100 rounded-full animate-pulse w-5/6" />
                      <div className="h-3 bg-slate-100 rounded-full animate-pulse w-4/6" />
                   </div>
                 ) : (
                   <div className="space-y-8">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border-l-4 border-[#2E3192] relative group-hover:bg-white transition-colors duration-500 shadow-inner">
                         <p className="text-sm text-slate-700 leading-relaxed font-bold italic">
                            "{aiTip || "Đang phân tích xu hướng học tập của bạn để đưa ra lời khuyên tối ưu nhất..."}"
                         </p>
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#2E3192] transition-all flex items-center justify-center gap-3 group/tip" onClick={() => window.dispatchEvent(new CustomEvent('open-toxi-ai'))}>
                         Trò chuyện với Cố vấn AI <TrendingUp className="w-4 h-4 group-hover/tip:-translate-y-0.5 transition-transform" />
                      </button>
                   </div>
                 )}
              </div>
           </div>

           {/* Achievements Highlight */}
           <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                 Thành tựu mới <Trophy className="w-4 h-4 text-orange-400" />
              </h3>
              <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-[2rem] border border-orange-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:shadow-xl transition-all">
                 <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border border-orange-100 group-hover:rotate-12 transition-transform">🥇</div>
                 <div className="flex-1">
                    <p className="text-lg font-black text-slate-900 leading-tight">Chuyên gia HSK 3</p>
                    <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest mt-1">Sắp hoàn thành</p>
                 </div>
                 <ChevronRight className="w-5 h-5 text-orange-400" />
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-50 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all">
                 <Calendar className="w-6 h-6 text-indigo-400 mb-3" />
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ngày học</p>
                 <h4 className="text-2xl font-black text-slate-900 mt-1">{profile?.total_days ?? 0}</h4>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-50 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all">
                 <Star className="w-6 h-6 text-amber-400 mb-3" />
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kỷ luật</p>
                 <h4 className="text-2xl font-black text-slate-900 mt-1">A+</h4>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
}
