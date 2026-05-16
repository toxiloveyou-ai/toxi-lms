import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
   ChevronLeft,
   Menu,
   Settings,
   Volume2,
   Download,
   CheckCircle2,
   Video,
   FileText,
   Target,
   BookOpen,
   Users,
   Sparkles,
   Zap,
   Info,
   ChevronRight,
   RefreshCw,
   Send,
   Loader2,
   Check,
   Shield,
   FileDown,
   BookmarkPlus,
   ArrowRight,
   HelpCircle,
   MessageCircle,
   AudioLines,
   GraduationCap,
   X,
   Maximize2,
   Play,
   Trophy,
   Activity,
   User,
   Bot,
   ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { getCourseProgress, completeLessonAndAwardXP } from '../../lib/api/lessonProgress';
import { generateEduRoleplayResponse, askLessonAssistant, scoreLessonSubmission } from '../../lib/api/eduAI';

const PRACTICE_EXERCISES = [
   {
      type: 'listen_select',
      question: "Nghe đoạn hội thoại và chọn câu trả lời đúng:\nGiám đốc hỏi về tiến độ dự án mới?",
      options: ["Đã hoàn thành xong", "Đang trong quá trình sản xuất", "Sẽ bắt đầu vào tuần tới", "Chưa có kế hoạch"],
      correctIndex: 0,
      explain: "Trong đoạn hội thoại, nhân viên dùng '完成' (wánchéng) nghĩa là đã hoàn thành."
   },
   {
      type: 'fill_blank',
      question: "Điền từ vào chỗ trống:\n今天的生产任务已经____了。",
      options: ["开始", "任务", "完成", "所以"],
      correctIndex: 2,
      explain: "Dùng '完成' (hoàn thành) để nói về nhiệm vụ sản xuất đã xong."
   },
   {
      type: 'order_sentence',
      question: "Sắp xếp các từ sau thành câu hoàn chỉnh:",
      words: ["我", "完", " l", "了", "任务", "完成"],
      correctOrder: ["我", "完成", "任务", "完", "了"],
      explain: "Cấu trúc: Chủ ngữ + Động từ + Tân ngữ + 完 + 了 (Tôi đã hoàn thành xong nhiệm vụ)."
   }
];

export default function EduLessonPlayer() {
   const { courseId, lessonId } = useParams();
   const navigate = useNavigate();
   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
   const [activeZone, setActiveZone] = useState<'zone1' | 'zone2' | 'zone3' | 'zone4'>('zone1');
   const [activeTab, setActiveTab] = useState<'understand' | 'practice' | 'apply'>('understand');
   
   const [lessons, setLessons] = useState<any[]>([]);
   const [activeLesson, setActiveLesson] = useState<any>(null);
   const [progressMap, setProgressMap] = useState<any>({});
   const [loadingData, setLoadingData] = useState(true);
   const [currentUser, setCurrentUser] = useState<any>(null);
   const [completingLesson, setCompletingLesson] = useState(false);
   const [homeworkContent, setHomeworkContent] = useState('');

   // Mobile Nav State
   const [isNavVisible, setIsNavVisible] = useState(true);
   const { scrollY } = useScroll();
   const lastScrollY = useRef(0);

   useMotionValueEvent(scrollY, "change", (latest) => {
      if (latest > lastScrollY.current && latest > 100) {
         setIsNavVisible(false);
      } else {
         setIsNavVisible(true);
      }
      lastScrollY.current = latest;
   });

   // Practice State
   const [currentExIdx, setCurrentExIdx] = useState(0);
   const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
   const [showExplain, setShowExplain] = useState(false);
   const [earnedXP, setEarnedXP] = useState(0);

   // AI State
   const [roleplayChat, setRoleplayChat] = useState<any[]>([
      { role: 'ai', content: '你好！今天的生产任务 hoàn thành ma？', vi: 'Chào bạn! Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?', pinyin: 'Nǐ hǎo! Jīntiān de shēngchǎn rènwu wánchéng le ma?' }
   ]);
   const [roleplayInput, setRoleplayInput] = useState('');
   const [roleplayLoading, setRoleplayLoading] = useState(false);

   // Success Modal
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [sessionStats, setSessionStats] = useState({ xp: 0, accuracy: 100 });

   // Watermark
   const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });

   useEffect(() => {
      const interval = setInterval(() => {
         setWatermarkPos({
            top: `${Math.random() * 80 + 5}%`,
            left: `${Math.random() * 80 + 5}%`
         });
      }, 10000);
      return () => clearInterval(interval);
   }, []);

   useEffect(() => {
      loadAllData();
      const handleContext = (e: MouseEvent) => e.preventDefault();
      document.addEventListener('contextmenu', handleContext);
      return () => document.removeEventListener('contextmenu', handleContext);
   }, [courseId, lessonId]);

   const loadAllData = async () => {
      try {
         setLoadingData(true);
         const { data: { user } } = await supabase.auth.getUser();
         setCurrentUser(user);

         const { data: lessonsData } = await supabase
            .from('course_lessons')
            .select(`*, courses (id, title)`)
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

         if (lessonsData) {
            setLessons(lessonsData);
            const current = lessonsData.find(l => l.id === lessonId) || lessonsData[0];
            setActiveLesson(current);
            setHomeworkContent(''); // Reset on lesson change

            if (user) {
               const map = await getCourseProgress(user.id, lessonsData.map(l => l.id));
               setProgressMap(map);
            }
         }
      } catch (err) { console.error(err); }
      finally { setLoadingData(false); }
   };

   const handleCompleteLesson = async () => {
      if (!currentUser || !activeLesson || completingLesson) return;
      try {
         setCompletingLesson(true);
         const xp = earnedXP || 50;
         await completeLessonAndAwardXP(currentUser.id, activeLesson.id, 100, xp);
         setProgressMap(prev => ({ ...prev, [activeLesson.id]: { status: 'completed' } }));
         setSessionStats({ xp, accuracy: 100 });
         setShowSuccessModal(true);
      } catch (err) { console.error(err); }
      finally { setCompletingLesson(false); }
   };

   const handleRoleplaySubmit = async () => {
      if (!roleplayInput.trim() || !activeLesson) return;
      setRoleplayLoading(true);
      const userMsg = roleplayInput;
      setRoleplayInput('');
      setRoleplayChat(prev => [...prev, { role: 'user', content: userMsg }]);
      try {
         const response = await generateEduRoleplayResponse(activeLesson.title, userMsg, roleplayChat, JSON.stringify(activeLesson.content_json?.vocabulary || []));
         setRoleplayChat(prev => [...prev, { role: 'ai', content: response.content, vi: response.vi, pinyin: response.pinyin, feedback: response.feedback }]);
         setEarnedXP(prev => prev + 10);
      } catch (err) { console.error(err); }
      finally { setRoleplayLoading(false); }
   };

   const exercises = activeLesson?.content_json?.practice || PRACTICE_EXERCISES;
   const ex = exercises[currentExIdx];

   return (
      <div className="flex h-screen bg-[#FDFDFF] text-slate-900 overflow-hidden font-sans relative selection:bg-indigo-100">
         
         {/* Security Watermark */}
         <div className="absolute z-[999] pointer-events-none opacity-[0.03] select-none text-[10px] font-black uppercase tracking-[0.5em] transition-all duration-1000" style={{ top: watermarkPos.top, left: watermarkPos.left }}>
            Toxi Edu • {currentUser?.email}
         </div>

         {/* MOBILE SIDEBAR OVERLAY */}
         <AnimatePresence>
            {isSidebarOpen && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm lg:hidden"
               />
            )}
         </AnimatePresence>

         {/* SIDEBAR */}
         <aside className={`fixed inset-y-0 left-0 z-[120] w-72 md:w-80 bg-white border-r border-slate-100 shadow-2xl transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shrink-0`}>
            <div className="p-6 border-b border-slate-50 space-y-4">
               <div className="flex items-center justify-between">
                  <button onClick={() => navigate('/edu/dashboard')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest">
                     <ChevronLeft className="w-4 h-4" /> Bàn làm việc
                  </button>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter leading-tight line-clamp-2 uppercase">{lessons[0]?.courses?.title || 'Lớp học'}</h2>
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Tiến trình lớp</span>
                        <span className="text-[#2E3192]">{lessons.length > 0 ? Math.round((Object.values(progressMap).filter((p: any) => p.status === 'completed').length / lessons.length) * 100) : 0}%</span>
                     </div>
                     <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E3192] transition-all duration-1000" style={{ width: `${lessons.length > 0 ? Math.round((Object.values(progressMap).filter((p: any) => p.status === 'completed').length / lessons.length) * 100) : 0}%` }} />
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
               {lessons.map((lesson: any, idx: number) => {
                  const prog = progressMap[lesson.id];
                  const isCompleted = prog?.status === 'completed';
                  const isActive = activeLesson?.id === lesson.id;
                  const isLocked = idx > 0 && progressMap[lessons[idx - 1].id]?.status !== 'completed';

                  return (
                     <button
                        key={lesson.id}
                        disabled={isLocked}
                        onClick={() => {
                           if (!isLocked) {
                              setActiveLesson(lesson);
                              navigate(`/edu/course/${courseId}/lesson/${lesson.id}`);
                              if (window.innerWidth < 1024) setIsSidebarOpen(false);
                           }
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group/item ${isActive ? 'bg-indigo-50 text-[#2E3192] shadow-sm' : isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'}`}
                     >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black transition-transform group-hover/item:scale-110 ${isActive ? 'bg-[#2E3192] text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                           {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Shield className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                           <p className={`text-xs font-black leading-tight truncate ${isActive ? 'text-[#2E3192]' : 'text-slate-700'}`}>{lesson.title}</p>
                           <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-40 mt-0.5">
                              {lesson.content_type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              <span>{lesson.duration_minutes || 0}m • {lesson.content_type}</span>
                           </div>
                        </div>
                     </button>
                  );
               })}
            </div>
         </aside>

         {/* MAIN AREA */}
         <main className="flex-1 flex flex-col min-w-0 relative h-full">
            
            {/* Header */}
            <header className="h-14 md:h-16 border-b border-slate-100 px-4 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl z-[100] shrink-0">
               <div className="flex items-center gap-3">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#2E3192] shadow-sm transition-all">
                     <Menu className="w-5 h-5" />
                  </button>
                  <h1 className="text-[11px] md:text-sm font-black text-slate-900 tracking-tight line-clamp-1 max-w-[150px] xs:max-w-[200px] md:max-w-[400px] uppercase">
                     {activeLesson?.title || 'Đang tải...'}
                  </h1>
               </div>

               <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                  {([
                     { id: 'zone1', label: 'Cốt lõi', icon: BookOpen },
                     { id: 'zone2', label: 'Phòng học', icon: Target },
                     { id: 'zone3', label: 'Phiếu Bài Tập', icon: FileText },
                     { id: 'zone4', label: 'AI Mentor', icon: Sparkles },
                  ] as const).map(z => (
                     <button
                        key={z.id}
                        onClick={() => setActiveZone(z.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeZone === z.id ? 'bg-[#2E3192] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                     >
                        <z.icon className="w-3.5 h-3.5" />
                        {z.label}
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                     <Zap className="w-3.5 h-3.5 text-orange-400 fill-current" />
                     <span className="text-[10px] md:text-xs font-black text-indigo-900 tabular-nums">+{earnedXP}</span>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32 relative z-[10]">
               <div className="max-w-6xl mx-auto">
                  {activeLesson && (
                     <>
                        {/* ZONE 1: CORE */}
                        {activeZone === 'zone1' && (
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                              <div className="bg-[#2E3192] p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                 <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 w-fit text-[9px] font-black uppercase tracking-widest text-orange-400">
                                       <Target className="w-3.5 h-3.5" /> Định hướng
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">Tri thức <br/> Cốt lõi</h2>
                                 </div>
                                 <BookOpen className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Từ vựng quan trọng</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                       {(activeLesson?.content_json?.vocabulary || []).map((v: any, i: number) => (
                                          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-[#2E3192]/20 transition-all">
                                             <div className="text-3xl font-black text-slate-900 mb-1">{v.hanzi}</div>
                                             <div className="text-[8px] font-black text-[#2E3192] uppercase mb-1">{v.pinyin}</div>
                                             <div className="text-[10px] font-bold text-orange-500 mb-3 truncate">{v.meaning}</div>
                                             <button onClick={() => { const u = new SpeechSynthesisUtterance(v.hanzi); u.lang = 'zh-CN'; u.rate = 0.8; speechSynthesis.speak(u); }} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-[#2E3192] hover:text-white flex items-center justify-center mx-auto transition-all"><Volume2 className="w-4 h-4" /></button>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Kết quả đạt được</h3>
                                    <div className="space-y-2">
                                       {(activeLesson?.content_json?.outcomes || ['Nâng cao phản xạ', 'Giao tiếp thực tế']).map((out: string, i: number) => (
                                          <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 group/out shadow-sm">
                                             <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/out:scale-110 transition-transform"><CheckCircle2 className="w-6 h-6" /></div>
                                             <p className="text-sm font-black text-slate-700">{out}</p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}

                        {/* ZONE 2: CLASSROOM */}
                        {activeZone === 'zone2' && (
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                              <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl relative">
                                 <div className="aspect-video bg-black">
                                    <iframe src={activeLesson.content_url} className="w-full h-full" allowFullScreen />
                                 </div>
                                 <div className="p-4 md:p-6 bg-white">
                                    <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto">
                                       {[
                                          { id: 'understand', label: 'Thấu hiểu' },
                                          { id: 'practice', label: 'Rèn luyện' },
                                          { id: 'apply', label: 'Ứng dụng' }
                                       ].map(tab => (
                                          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#2E3192] text-white shadow-xl' : 'text-slate-400'}`}>{tab.label}</button>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                              <div className="min-h-[300px]">
                                 {activeTab === 'understand' && (
                                    <div className="space-y-4">
                                       {(activeLesson?.content_json?.key_sentences || []).map((s: any, idx: number) => (
                                          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 group hover:border-indigo-100 transition-all">
                                             <h4 className="text-3xl font-black text-slate-900">{s.zh}</h4>
                                             <p className="text-sm font-bold text-slate-400">({s.pinyin})</p>
                                             <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50"><p className="text-sm font-black text-[#2E3192] italic">"{s.vi}"</p></div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                                 {activeTab === 'practice' && (
                                    <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Thử thách {currentExIdx + 1}/{exercises.length}</span>
                                          <h3 className="text-2xl font-black text-slate-900 leading-tight">{ex.question}</h3>
                                       </div>
                                       <div className="space-y-4">
                                          {ex.options?.map((opt: string, i: number) => (
                                             <button key={i} onClick={() => !showExplain && setSelectedOpt(i)} className={`w-full p-6 rounded-2xl border-2 text-left text-base font-black transition-all ${showExplain ? (i === ex.correctIndex ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : selectedOpt === i ? 'bg-red-50 border-red-500 text-red-700' : 'opacity-40') : (selectedOpt === i ? 'bg-[#2E3192] text-white border-[#2E3192]' : 'bg-slate-50 border-slate-100 hover:border-indigo-100')}`}>{opt}</button>
                                          ))}
                                       </div>
                                       <div className="flex justify-end pt-4">
                                          {!showExplain ? (
                                             <button onClick={() => { setShowExplain(true); setEarnedXP(prev => prev + (selectedOpt === ex.correctIndex ? 25 : 0)); }} disabled={selectedOpt === null} className="px-10 py-4 bg-[#2E3192] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-20">Kiểm tra</button>
                                          ) : (
                                             <button onClick={() => { if (currentExIdx < exercises.length - 1) { setCurrentExIdx(prev => prev + 1); setSelectedOpt(null); setShowExplain(false); } else { setActiveTab('apply'); } }} className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">Tiếp tục <ArrowRight className="w-4 h-4" /></button>
                                          )}
                                       </div>
                                    </div>
                                 )}
                                 {activeTab === 'apply' && (
                                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 animate-in zoom-in-95">
                                       <div className="text-center space-y-4 py-10">
                                          <div className="w-20 h-20 bg-indigo-50 text-[#2E3192] rounded-full flex items-center justify-center mx-auto shadow-inner">
                                             <FileText className="w-10 h-10" />
                                          </div>
                                          <div className="space-y-1">
                                             <h3 className="text-2xl font-black text-slate-900 uppercase">Sẵn sàng thực hành?</h3>
                                             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hãy chuyển sang mục "Phiếu Bài Tập" để bắt đầu làm bài</p>
                                          </div>
                                          <button onClick={() => setActiveZone('zone3')} className="px-10 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Mở Phiếu Bài Tập ngay</button>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </motion.div>
                        )}

                        {/* ZONE 3: WORKSHEET & SUBMISSION */}
                        {activeZone === 'zone3' && (
                           <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                              <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                 <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/30 w-fit text-[9px] font-black uppercase tracking-widest">
                                       <BookOpen className="w-3.5 h-3.5" /> Giao thoa tri thức
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">Phiếu Bài Tập <br/> & Thực Hành</h2>
                                 </div>
                                 <FileText className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 flex flex-col justify-between">
                                    <div className="space-y-4">
                                       <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner"><Download className="w-8 h-8" /></div>
                                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tải Phiếu Bài Tập</h3>
                                       <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Hãy tải phiếu bài tập buổi này về máy, làm bài và chuẩn bị nộp chính thức.</p>
                                    </div>
                                    {activeLesson.content_json?.worksheet_url ? (
                                       <a href={activeLesson.content_json.worksheet_url} target="_blank" rel="noreferrer" className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                          Tải về ngay <Download className="w-5 h-5" />
                                       </a>
                                    ) : (
                                       <div className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 italic">
                                          Giáo viên đang soạn phiếu...
                                       </div>
                                    )}
                                 </div>

                                 <div className="bg-[#2E3192] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 flex flex-col justify-between text-white">
                                    <div className="space-y-4">
                                       <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/20"><ExternalLink className="w-8 h-8" /></div>
                                       <h3 className="text-2xl font-black tracking-tight">Nộp Bài Chính Thức</h3>
                                       <p className="text-sm font-bold text-white/50 leading-relaxed uppercase tracking-widest">Hệ thống ghi nhận thời gian nộp bài. Hãy nộp đúng hạn để giáo viên chấm điểm.</p>
                                    </div>
                                    <button onClick={() => navigate(`/edu/homework/${activeLesson.id}`)} className="w-full py-5 bg-white text-[#2E3192] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                       Mở cổng nộp bài <ArrowRight className="w-5 h-5" />
                                    </button>
                                 </div>
                              </div>

                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                                 <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#2E3192]" /> Ghi chú thực hành & Nháp nhanh</h3>
                                    <span className="text-[8px] font-black text-slate-300 uppercase">Tự động lưu bản nháp</span>
                                 </div>
                                 <textarea 
                                    value={homeworkContent} 
                                    onChange={(e) => setHomeworkContent(e.target.value)} 
                                    placeholder="Viết câu thực hành hoặc câu hỏi cho giáo viên tại đây..." 
                                    className="w-full h-48 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:outline-none focus:bg-white focus:border-[#2E3192]/30 transition-all text-base font-bold shadow-inner" 
                                 />
                                 <button onClick={handleCompleteLesson} className="w-full py-5 bg-gradient-to-r from-[#2E3192] to-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/20 hover:scale-[1.01] transition-all">Lưu nháp & Hoàn thành bài học</button>
                              </div>
                           </motion.div>
                        )}

                        {/* ZONE 4: AI MENTOR */}
                        {activeZone === 'zone4' && (
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-18rem)] md:h-[calc(100vh-16rem)] flex flex-col bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                              <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-4">
                                 <div className="w-12 h-12 bg-[#2E3192] rounded-2xl flex items-center justify-center text-white shadow-lg"><Sparkles className="w-6 h-6" /></div>
                                 <div><p className="text-xs font-black text-slate-900 uppercase">Tongxiao AI Mentor</p><p className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Đang trực tuyến</p></div>
                              </div>
                              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                 {roleplayChat.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold shadow-sm ${msg.role === 'user' ? 'bg-[#2E3192] text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                          {msg.content}
                                          {msg.vi && <p className="mt-2 text-[10px] italic opacity-60 border-t border-current/20 pt-2">{msg.vi}</p>}
                                       </div>
                                    </div>
                                 ))}
                                 {roleplayLoading && <div className="flex gap-1 p-2"><div className="w-1.5 h-1.5 bg-[#2E3192]/40 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-[#2E3192]/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} /><div className="w-1.5 h-1.5 bg-[#2E3192]/40 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} /></div>}
                              </div>
                              <div className="p-6 bg-white border-t border-slate-50">
                                 <div className="flex items-center gap-3">
                                    <input type="text" value={roleplayInput} onChange={(e) => setRoleplayInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRoleplaySubmit()} placeholder="Hỏi AI về bài học..." className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none text-sm font-black shadow-inner" />
                                    <button onClick={handleRoleplaySubmit} className="w-12 h-12 bg-[#2E3192] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Send className="w-5 h-5" /></button>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </>
                  )}
               </div>
            </div>
         </main>

         {/* SMART MOBILE NAVIGATION (MOVED OUTSIDE MAIN FOR STABILITY) */}
         <AnimatePresence>
            {isNavVisible && (
               <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="sm:hidden fixed bottom-6 inset-x-4 z-[200] max-w-sm mx-auto pointer-events-auto"
               >
                  <div className="bg-slate-900/90 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-1 overflow-hidden">
                     {([
                        { id: 'zone1', label: 'Cốt lõi', icon: BookOpen },
                        { id: 'zone2', label: 'Phòng học', icon: Target },
                        { id: 'zone3', label: 'Phiếu Bài Tập', icon: FileText },
                        { id: 'zone4', label: 'AI Mentor', icon: Sparkles },
                     ] as const).map(z => {
                        const isActive = activeZone === z.id;
                        return (
                           <button 
                              key={z.id} 
                              onClick={() => setActiveZone(z.id)}
                              className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-full transition-all duration-500 ${isActive ? 'bg-[#2E3192] text-white flex-1' : 'text-white/40 w-12'}`}
                           >
                              <z.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'scale-90'}`} />
                              <AnimatePresence>
                                 {isActive && (
                                    <motion.span 
                                       initial={{ opacity: 0, width: 0 }}
                                       animate={{ opacity: 1, width: 'auto' }}
                                       exit={{ opacity: 0, width: 0 }}
                                       className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
                                    >
                                       {z.label}
                                    </motion.span>
                                 )}
                              </AnimatePresence>
                           </button>
                        );
                     })}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* SUCCESS MODAL */}
         <AnimatePresence>
            {showSuccessModal && (
               <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl border-4 border-white">
                     <div className="bg-[#2E3192] p-10 text-center text-white relative overflow-hidden">
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30 relative z-10"><Trophy className="w-8 h-8" /></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10">Bài giảng hoàn tất!</h2>
                        <Sparkles className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-10 -mt-10 rotate-12" />
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="flex gap-4">
                           <div className="flex-1 p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Kinh nghiệm</p>
                              <p className="text-3xl font-black text-[#2E3192]">+{sessionStats.xp}</p>
                           </div>
                           <div className="flex-1 p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Chính xác</p>
                              <p className="text-3xl font-black text-emerald-500">100%</p>
                           </div>
                        </div>
                        <button onClick={() => { setShowSuccessModal(false); navigate(`/edu/dashboard`); }} className="w-full py-4 bg-[#2E3192] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Về bàn làm việc</button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
