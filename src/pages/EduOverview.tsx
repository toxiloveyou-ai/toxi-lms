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
  MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getOrCreateProfile, getDashboardData, generateAITip, trackUserActivity } from '../lib/api/profile';
import { getLearnerEvolution } from '../lib/api/evolution';
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
      
      // Fetch data in parallel - MOVING trackUserActivity INSIDE for speed
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

      // Process Weekly Stats from real XP events
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

      // Process Class Progress
      if (classRes.data) {
        const cls = classRes.data.edu_classes;
        // 1. Fetch total lessons for the course
        const { count: totalLessons } = await supabase
          .from('course_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', cls.course_id);

        // 2. Fetch completed lessons for the user
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

      // Load AI tip async
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
          <Loader2 className="w-10 h-10 text-student-primary animate-spin" />
          <p className="text-student-text/60 font-medium animate-pulse">Đang cá nhân hóa trải nghiệm của bạn...</p>
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ').pop() || 'bạn';
  const totalDue = dashData?.decks?.reduce((sum: number, d: any) => sum + (d.due || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Top Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-student-primary/10 text-student-primary rounded-full w-fit">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest text-student-primary">Toxi Intelligence</span>
          </div>
          <h2 className="text-4xl font-black text-student-text tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="text-student-text/50 font-medium">
            Hệ thống đang theo dõi hành trình <span className="text-student-primary italic">"Học để ứng dụng"</span> của bạn.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="student-card p-4 flex items-center gap-4 border-b-4 border-b-orange-400 bg-white/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <p className="text-[10px] text-student-text/40 font-black uppercase tracking-widest">Streak</p>
              <p className="text-2xl font-black text-student-text leading-none">{profile?.streak_days ?? 0}</p>
            </div>
          </div>
          <div className="student-card p-4 flex items-center gap-4 border-b-4 border-b-blue-400 bg-white/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-500 fill-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-student-text/40 font-black uppercase tracking-widest">XP</p>
              <p className="text-2xl font-black text-student-text leading-none">{formatXP(profile?.total_xp ?? 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Intelligence Hub */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Smart Learning Promotion Card - ENHANCED & DYNAMIC */}
          <div className="relative overflow-hidden p-10 rounded-[3rem] bg-gradient-to-br from-[#0f172a] via-[#1E2060] to-[#2E3192] text-white shadow-2xl group cursor-pointer border border-white/5" onClick={() => navigate('/edu/dashboard')}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-student-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-student-primary/20 group-hover:scale-110" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Toxi AI Engine Active</span>
                </div>
                {classProgress ? (
                  <>
                    <h3 className="text-4xl font-black leading-[1.1] tracking-tight">Tiến trình <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">{classProgress.name}</span></h3>
                    <p className="text-white/60 text-base font-medium max-w-md">Bạn đã hoàn thành <span className="text-white font-black">{classProgress.current}/{classProgress.total}</span> buổi học. Hãy tiếp tục duy trì phong độ nhé!</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-4xl font-black leading-[1.1] tracking-tight">Chinh Phục <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Lộ Trình Thông Minh</span></h3>
                    <p className="text-white/60 text-base font-medium max-w-md">Dựa trên DNA ngôn ngữ của bạn, chúng tôi đã tinh chỉnh lộ trình học tập để tối ưu 45% thời gian ghi nhớ.</p>
                  </>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  <button className="px-8 py-4 bg-student-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-student-primary/40 group-hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    {classProgress ? 'Vào Lớp Ngay' : 'Khám Phá Lộ Trình'} <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/edu/explore'); }} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md transition-all">
                    Thư viện khóa học
                  </button>
                </div>
              </div>
              <div className="w-56 h-56 relative shrink-0 group-hover:rotate-3 transition-transform duration-700">
                <div className="absolute inset-0 bg-student-primary rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="w-full h-full border-[6px] border-white/5 rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-sm bg-white/5 shadow-2xl">
                   <div className="absolute inset-0 border-[1px] border-white/20 rounded-full scale-90" />
                   <Target className="w-24 h-24 text-white/5 absolute -bottom-6 -right-6 rotate-12" />
                   <div className="text-center relative z-10">
                     <p className="text-5xl font-black tracking-tighter">{classProgress?.percent || 0}<span className="text-xl text-student-primary">%</span></p>
                     <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Hoàn thành lộ trình</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Metrics - ENHANCED & SYNCHRONIZED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="student-card p-8 bg-white border-student-border/40 hover:shadow-xl transition-all group/chart">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-black text-student-text">Hiệu Suất Học</h4>
                  <p className="text-xs text-student-text/50 font-medium">Theo tuần này (Hoạt động)</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover/chart:rotate-12 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-3 h-40 mb-4 px-2 relative">
                {weeklyStats.map((h: number, i: number) => {
                  const percent = Math.min(100, Math.max(10, (h / 200) * 100)); // Base on 200 XP target
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar relative">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl">
                        {h} XP
                      </div>
                      <div className={`w-full rounded-t-xl transition-all duration-700 bg-student-primary/10 group-hover/bar:bg-student-primary relative overflow-hidden`} style={{ height: `${percent}%` }}>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                      </div>
                      <span className="text-[9px] font-black text-student-text/30 group-hover/bar:text-student-primary transition-colors">
                      {(() => {
                        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return (6 - i) === 0 ? 'H.Nay' : (6 - i) === 1 ? 'H.Qua' : days[d.getDay()];
                      })()}
                    </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <p className="text-xs font-bold text-student-text/60 italic">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-lg font-black text-student-text">{profile?.total_xp || 0} <span className="text-[10px] text-student-text/40 font-bold uppercase tracking-widest ml-1">XP</span></p>
              </div>
            </div>

            <div className="student-card p-8 bg-white border-student-border/40 flex flex-col hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-black text-student-text">Nhiệm Vụ Ưu Tiên</h4>
                  <p className="text-[10px] font-black text-student-text/30 uppercase tracking-widest mt-1">Smart Queue</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center"><Star className="w-4 h-4 text-orange-400 fill-orange-400" /></div>
                  <div className="w-8 h-8 rounded-full bg-student-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-black text-student-primary">AI</div>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100/50 transition-colors group cursor-pointer" onClick={() => navigate('/app/notebook')}>
                  <div className="w-12 h-12 bg-emerald-500 rounded-[18px] flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                       <p className="text-xs font-black text-emerald-900">Ôn tập Flashcards</p>
                       <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-700 text-[8px] font-black uppercase rounded">Hot</span>
                    </div>
                    <p className="text-[10px] text-emerald-700/70 font-bold truncate">{totalDue} thẻ đang chờ bạn</p>
                  </div>
                  <div className="p-2 text-emerald-600 hover:bg-white rounded-lg transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-student-primary/5 rounded-2xl border border-student-primary/10 hover:bg-student-primary/10 transition-colors group cursor-pointer" onClick={() => navigate('/edu/practice')}>
                  <div className="w-12 h-12 bg-student-primary rounded-[18px] flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                       <p className="text-xs font-black text-student-primary">Thực chiến AI</p>
                       <span className="px-1.5 py-0.5 bg-student-primary/20 text-student-primary text-[8px] font-black uppercase rounded">New</span>
                    </div>
                    <p className="text-[10px] text-indigo-700/60 font-bold">Mô phỏng phỏng vấn HSK 3</p>
                  </div>
                  <div className="p-2 text-student-primary hover:bg-white rounded-lg transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-student-text/40 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Đồng bộ Real-time</span>
                <span>v1.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Focus */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Advisor Card - ENHANCED */}
          <div className="student-card p-8 bg-white border-2 border-student-primary/10 relative overflow-hidden group hover:border-student-primary/30 transition-all">
             <div className="absolute top-0 right-0 p-4">
                <Sparkles className="w-6 h-6 text-student-primary/20 group-hover:text-student-primary transition-colors" />
             </div>
             <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-student-primary/5 rounded-full blur-3xl group-hover:bg-student-primary/10 transition-all" />
             
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-student-primary/10 rounded-2xl flex items-center justify-center text-student-primary shadow-inner">
                    <BrainCircuit className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-student-text leading-tight text-lg">AI DNA Insights</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <p className="text-[10px] font-black text-student-text/40 uppercase tracking-widest">Phân tích thực tế</p>
                    </div>
                  </div>
                </div>

                {isLoadingTip ? (
                  <div className="py-6 space-y-3">
                    <div className="h-4 bg-slate-100 rounded-full animate-pulse w-full" />
                    <div className="h-4 bg-slate-100 rounded-full animate-pulse w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-student-bg rounded-2xl border-l-4 border-student-primary relative">
                       <p className="text-sm text-student-text leading-relaxed font-bold italic">
                         "{aiTip || "Tôi đang phân tích lịch sử học tập của bạn để đưa ra lời khuyên tối ưu nhất."}"
                       </p>
                    </div>
                    
                    {evolution?.linguistic_dna && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-[8px] font-black text-student-text/30 uppercase tracking-widest">Điểm Mạnh</p>
                          <p className="text-xs font-black text-student-text">{evolution.linguistic_dna.vocabularyStrengths?.[0] || 'Từ vựng'}</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-[8px] font-black text-student-text/30 uppercase tracking-widest">Thách Thức</p>
                          <p className="text-xs font-black text-student-text">{evolution.linguistic_dna.grammarChallenges?.[0] || 'Phản xạ'}</p>
                        </div>
                      </div>
                    )}
                    
                    <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                       Phân tích chuyên sâu <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="student-card p-5 bg-white flex flex-col items-center text-center group hover:border-student-primary transition-all">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày học</p>
              <h4 className="text-2xl font-black text-student-text">{profile?.total_days ?? 0}</h4>
            </div>
            <div className="student-card p-5 bg-white flex flex-col items-center text-center group hover:border-student-primary transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cấp độ</p>
              <h4 className="text-2xl font-black text-student-text">3</h4>
            </div>
          </div>

          {/* Goals and Deadlines */}
          {profile?.exam_date && (
            <div className="student-card p-6 bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-white/50" />
                <h3 className="font-black text-sm uppercase tracking-widest">Mục tiêu {profile.target_exam}</h3>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-black">
                  {Math.max(0, Math.floor((new Date(profile.exam_date).getTime() - Date.now()) / 86400000))}
                  <span className="text-[10px] text-white/60 ml-2 font-bold">NGÀY CÒN LẠI</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-white/60">
                  <span>Tiến độ mục tiêu</span>
                  <span>75%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Bottom section: Recent & Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-student-text flex items-center gap-3">
            <Clock className="w-6 h-6 text-student-primary" />
            Vừa tra gần đây
          </h3>
          <div className="flex flex-wrap gap-2">
            {dashData?.recentSearches?.map((word: string, i: number) => (
              <button
                key={i}
                onClick={() => navigate('/app/dictionary')}
                className="px-6 py-3 bg-white border border-student-border/60 rounded-2xl text-sm font-bold text-student-text hover:border-student-primary hover:text-student-primary hover:shadow-lg transition-all"
              >
                {word}
              </button>
            ))}
            {(!dashData?.recentSearches || dashData.recentSearches.length === 0) && (
              <p className="text-student-text/40 text-sm font-medium italic px-2">Chưa có lịch sử tra cứu.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-student-text flex items-center gap-3">
            <Trophy className="w-6 h-6 text-orange-400" />
            Thành tựu mới nhất
          </h3>
          <div className="student-card p-6 bg-gradient-to-r from-orange-50 to-white border-orange-100 flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-2xl text-orange-600 shadow-sm border border-orange-100 group-hover:rotate-12 transition-transform">🥇</div>
              <div>
                <p className="text-lg font-black text-student-text leading-tight">Chuyên gia HSK 1</p>
                <p className="text-xs text-student-text/50 font-bold uppercase tracking-widest mt-1">Hoàn thành 100% từ vựng</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
               <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
