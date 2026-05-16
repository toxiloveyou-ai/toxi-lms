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
   GraduationCap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCourseProgress, completeLessonAndAwardXP } from '../lib/api/lessonProgress';
import { generateEduRoleplayResponse, askLessonAssistant, scoreLessonSubmission } from '../lib/api/eduAI';

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
      words: ["我", "完", "了", "任务", "完成"],
      correctOrder: ["我", "完成", "任务", "完", "了"],
      explain: "Cấu trúc: Chủ ngữ + Động từ + Tân ngữ + 完 + 了 (Tôi đã hoàn thành xong nhiệm vụ)."
   },
   {
      type: 'translate',
      question: "Dịch câu sau sang tiếng Trung:\n'Tôi đã viết xong báo cáo rồi.'",
      expected: "我写完报告了",
      hints: ["写 (xiě)", "完 (wán)", "报告 (bàogào)"],
      explain: "Dùng cấu trúc bổ ngữ kết quả '写完' để chỉ việc viết đã kết thúc."
   }
];

export default function EduLessonPlayer() {
   const { courseId, lessonId } = useParams();
   const navigate = useNavigate();
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [activeZone, setActiveZone] = useState<'zone1' | 'zone2' | 'zone3' | 'zone4'>('zone1');
   const [activeTab, setActiveTab] = useState<'understand' | 'practice' | 'apply'>('understand');
   useEffect(() => {
      if (activeTab && lessonId) localStorage.setItem(`lastTab_${lessonId}`, activeTab);
   }, [activeTab, lessonId]);
   const [lessons, setLessons] = useState<any[]>([]);
   const [activeLesson, setActiveLesson] = useState<any>(null);
   const [progressMap, setProgressMap] = useState<any>({});
   const [loadingData, setLoadingData] = useState(true);
   const [currentUser, setCurrentUser] = useState<any>(null);
   const [completingLesson, setCompletingLesson] = useState(false);

   // Practice State
   const [currentExIdx, setCurrentExIdx] = useState(0);
   const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
   const [showExplain, setShowExplain] = useState(false);
   const [orderedWords, setOrderedWords] = useState<string[]>([]);
   const [availableWords, setAvailableWords] = useState<string[]>([]);
   const [translateText, setTranslateText] = useState('');
   const [earnedXP, setEarnedXP] = useState(0);

   // Roleplay State
   const [roleplayChat, setRoleplayChat] = useState<any[]>([
      { role: 'ai', content: '你好！今天的生产任务完成了吗？', vi: 'Chào bạn! Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?', pinyin: 'Nǐ hǎo! Jīntiān de shēngchǎn rènwu wánchéng le ma?' }
   ]);
   const [roleplayInput, setRoleplayInput] = useState('');
   const [roleplayLoading, setRoleplayLoading] = useState(false);

   // Success Modal State
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [sessionStats, setSessionStats] = useState({ xp: 0, accuracy: 100 });

   // AI Assistant State (Zone 4)
   const [assistantChat, setAssistantChat] = useState<any[]>([]);
   const [assistantInput, setAssistantInput] = useState('');
   const [assistantLoading, setAssistantLoading] = useState(false);

   // New Progress Requirements
   const [videoWatched, setVideoWatched] = useState(false);
   const [aiInteractionCount, setAiInteractionCount] = useState(0);
   const [homeworkSubmitted, setHomeworkSubmitted] = useState(false);
   const [homeworkContent, setHomeworkContent] = useState('');
   const [submittingHomework, setSubmittingHomework] = useState(false);
   const [mySubmissions, setMySubmissions] = useState<any[]>([]);

   // Watermark State
   const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });

   useEffect(() => {
      const interval = setInterval(() => {
         setWatermarkPos({
            top: `${Math.random() * 80 + 5}%`,
            left: `${Math.random() * 80 + 5}%`
         });
      }, 10000);

      // Restore last active tab for this lesson
      const savedTab = localStorage.getItem(`lastTab_${lessonId}`);
      if (savedTab) setActiveTab(savedTab as any);

      return () => clearInterval(interval);
   }, [lessonId]);

   useEffect(() => {
      loadAllData();

      // Security: Disable right click
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
            .select(`
          *,
          courses (
            id,
            title
          )
        `)
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

         if (lessonsData) {
            setLessons(lessonsData);
            const current = lessonsData.find(l => l.id === lessonId) || lessonsData[0];
            setActiveLesson(current);

            if (user) {
               const map = await getCourseProgress(user.id, lessonsData.map(l => l.id));
               setProgressMap(map);

               // Check requirements for current lesson
               const currentProg = map[current.id];
               if (currentProg) {
                  setVideoWatched(currentProg.video_watched || false);
                  setAiInteractionCount(currentProg.ai_interaction_count || 0);
                  setHomeworkSubmitted(currentProg.status === 'completed' || currentProg.homework_submitted);
               }

               // Fetch submissions
               const { data: subs } = await supabase.from('lesson_submissions').select('*').eq('user_id', user.id).eq('lesson_id', current.id);
               setMySubmissions(subs || []);
               if (subs && subs.length > 0) setHomeworkSubmitted(true);
            }
         }
      } catch (err) {
         console.error('Error loading data:', err);
      } finally {
         setLoadingData(false);
         // Auto-scroll sidebar to active lesson
         setTimeout(() => {
            const activeItem = document.getElementById(`lesson-item-${lessonId}`);
            if (activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }, 500);
      }
   };

   const updateRequirement = async (updates: any) => {
      if (!currentUser || !activeLesson) return;
      try {
         await supabase.from('edu_lesson_progress').upsert({
            user_id: currentUser.id,
            lesson_id: activeLesson.id,
            ...updates,
            updated_at: new Date().toISOString()
         }, { onConflict: 'user_id,lesson_id' });
      } catch (err) {
         console.error('Error updating requirement:', err);
      }
   };

   const handleVideoEnd = () => {
      if (!videoWatched) {
         setVideoWatched(true);
         updateRequirement({ video_watched: true });
      }
   };

   const handleSubmitHomework = async () => {
      if (!homeworkContent.trim() || !currentUser || !activeLesson) return;
      setSubmittingHomework(true);
      try {
         const { data, error } = await supabase.from('lesson_submissions').insert([{
            user_id: currentUser.id,
            lesson_id: activeLesson.id,
            submission_type: 'text',
            content: homeworkContent,
            status: 'submitted'
         }]).select().single();

         if (error) throw error;

         setHomeworkSubmitted(true);
         setMySubmissions([data, ...mySubmissions]);
         setHomeworkContent('');
         updateRequirement({ homework_submitted: true });

         // Auto-score with AI
         scoreSubmissionWithAI(data.id, data.content, activeLesson.title).then(res => {
            setMySubmissions(prev => prev.map(s => s.id === data.id ? { ...s, ai_score: res.score, ai_feedback: res.feedback } : s));
         });

      } catch (err: any) {
         alert('Lỗi khi nộp bài: ' + err.message);
      } finally {
         setSubmittingHomework(false);
      }
   };

   const scoreSubmissionWithAI = async (submissionId: string, content: string, lessonTitle: string) => {
      try {
         const result = await scoreLessonSubmission(lessonTitle, content, activeLesson?.content_json?.vocabulary || []);

         // Update the submission record with AI feedback
         await supabase.from('lesson_submissions').update({
            ai_score: result.score,
            ai_feedback: result.feedback,
            status: result.is_pass ? 'passed' : 'needs_work'
         }).eq('id', submissionId);

         return result;
      } catch (err) {
         console.error('Error scoring submission:', err);
         return { score: 0, feedback: 'AI error' };
      }
   };

   const handleCompleteLesson = async () => {
      if (!currentUser || !activeLesson || completingLesson) return;

      // Strict validation
      if (!videoWatched) {
         alert('Bạn cần xem hết video bài giảng để hoàn thành!');
         return;
      }
      if (aiInteractionCount < 3) {
         alert('Bạn cần tương tác với AI Mentor ít nhất 3 câu hỏi/trả lời để thấu hiểu bài học!');
         setActiveZone('zone4');
         return;
      }
      if (!homeworkSubmitted) {
         alert('Bạn cần hoàn thành và nộp bài tập thực hành!');
         setActiveTab('apply');
         return;
      }

      try {
         setCompletingLesson(true);
         const xpEarned = earnedXP || 50;
         await completeLessonAndAwardXP(currentUser.id, activeLesson.id, 100, xpEarned);

         // Update local progress state immediately
         setProgressMap(prev => ({
            ...prev,
            [activeLesson.id]: { status: 'completed' }
         }));

         setSessionStats({ xp: xpEarned, accuracy: 100 });
         setShowSuccessModal(true);
      } catch (err) {
         console.error('Error completing lesson:', err);
      } finally {
         setCompletingLesson(false);
      }
   };

   const updatePhaseProgress = async (phase: string) => {
      if (!currentUser || !activeLesson) return;
      try {
         await supabase.from('edu_lesson_progress').upsert({
            user_id: currentUser.id,
            lesson_id: activeLesson.id,
            phase_completed: phase,
            updated_at: new Date().toISOString()
         }, { onConflict: 'user_id,lesson_id' });
      } catch (err) {
         console.error('Error updating phase progress:', err);
      }
   };

   const handleNextAfterSuccess = () => {
      setShowSuccessModal(false);
      const nextIdx = lessons.findIndex(l => l.id === activeLesson.id) + 1;
      if (nextIdx < lessons.length) {
         navigate(`/edu/course/${courseId}/lesson/${lessons[nextIdx].id}`);
      } else {
         navigate(`/edu/dashboard`);
      }
   };

   // Practice Logic
   const exercises = activeLesson?.content_json?.practice || PRACTICE_EXERCISES;
   const ex = exercises[currentExIdx];
   useEffect(() => {
      if (ex.type === 'order_sentence') {
         setAvailableWords([...ex.words!].sort(() => Math.random() - 0.5));
         setOrderedWords([]);
      }
      setSelectedOpt(null);
      setShowExplain(false);
      setTranslateText('');
   }, [currentExIdx, activeLesson]);

   const handleWordSelect = (word: string, isAvailable: boolean) => {
      if (isAvailable) {
         setAvailableWords(availableWords.filter(w => w !== word));
         setOrderedWords([...orderedWords, word]);
      } else {
         setOrderedWords(orderedWords.filter(w => w !== word));
         setAvailableWords([...availableWords, word]);
      }
   };

   const checkPracticeAnswer = () => {
      setShowExplain(true);
      setEarnedXP(prev => prev + 25);
   };

   const isPracticeAnswerReady = () => {
      if (ex.type === 'listen_select' || ex.type === 'fill_blank') return selectedOpt !== null;
      if (ex.type === 'order_sentence') return orderedWords.length === ex.words!.length;
      if (ex.type === 'translate') return translateText.trim().length > 2;
      return false;
   };

   const nextPractice = () => {
      const exercises = activeLesson?.content_json?.practice || PRACTICE_EXERCISES;
      if (currentExIdx < exercises.length - 1) {
         setCurrentExIdx(prev => prev + 1);
      } else {
         setActiveTab('apply');
      }
   };

   const handleRoleplaySubmit = async () => {
      if (!roleplayInput.trim() || !activeLesson) return;
      setRoleplayLoading(true);
      const userMsg = roleplayInput;
      setRoleplayInput('');
      setRoleplayChat(prev => [...prev, { role: 'user', content: userMsg }]);

      try {
         const response = await generateEduRoleplayResponse(
            activeLesson.title,
            userMsg,
            roleplayChat,
            JSON.stringify(activeLesson.content_json?.vocabulary || [])
         );

         setRoleplayChat(prev => [...prev, {
            role: 'ai',
            content: response.content,
            vi: response.vi,
            pinyin: response.pinyin,
            feedback: response.feedback
         }]);
         const newCount = aiInteractionCount + 1;
         setAiInteractionCount(newCount);
         updateRequirement({ ai_interaction_count: newCount });
         setEarnedXP(prev => prev + (response.xp_bonus || 10));
      } catch (err) {
         console.error('Roleplay error:', err);
      } finally {
         setRoleplayLoading(false);
      }
   };

   const handleAssistantSubmit = async () => {
      if (!assistantInput.trim() || !activeLesson) return;
      setAssistantLoading(true);
      const userQ = assistantInput;
      setAssistantInput('');
      setAssistantChat(prev => [...prev, { role: 'user', content: userQ }]);

      try {
         const response = await askLessonAssistant(activeLesson, userQ);
         setAssistantChat(prev => [...prev, {
            role: 'ai',
            content: response.answer,
            examples: response.examples,
            grammar: response.grammar_points
         }]);
      } catch (err) {
         console.error('Assistant error:', err);
      } finally {
         setAssistantLoading(false);
      }
   };

   return (
      <div className="flex h-screen bg-[#FDFDFF] text-slate-900 overflow-hidden font-sans selection:bg-indigo-100 relative">
         {/* Security Watermark */}
         <div className="absolute z-[999] pointer-events-none opacity-[0.03] select-none text-[10px] font-heading font-black uppercase tracking-[0.5em] text-slate-900 whitespace-nowrap transition-all duration-1000" style={{ top: watermarkPos.top, left: watermarkPos.left }}>
            Toxi Edu • {currentUser?.email} • {new Date().toLocaleDateString()}
         </div>

         {/* Decorative Background */}
         <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-50/30 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none" />

         {/* Loading Overlay */}
         {loadingData && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-xl flex items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                     <div className="w-12 h-12 border-4 border-indigo-100 border-t-[#1A237E] rounded-full animate-spin"></div>
                     <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-[#1A237E] animate-pulse" />
                  </div>
                  <p className="text-[#1A237E] font-heading font-black text-[10px] uppercase tracking-[0.3em]">Toxi Edu is loading...</p>
               </div>
            </div>
         )}

         {/* SIDEBAR: LESSON LIST */}
         <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/60 shadow-xl transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shrink-0`}>
            <div className="p-5 border-b border-slate-100 space-y-4 shrink-0 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
               <button onClick={() => navigate('/edu/dashboard')} className="flex items-center gap-2 text-[9px] font-heading font-black text-slate-400 hover:text-[#1A237E] transition-all uppercase tracking-widest relative z-10">
                  <ChevronLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
               </button>
               <div className="relative z-10">
                  <h2 className="text-base font-heading font-black tracking-tight leading-tight text-slate-800 mb-2 truncate">{lessons[0]?.courses?.title || 'Khóa học'}</h2>
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[8px] font-heading font-black text-slate-500 uppercase tracking-widest">
                        <span>Tiến độ học tập</span>
                        <span className="text-[#1A237E]">{lessons.length > 0 ? Math.round((Object.values(progressMap).filter((p: any) => p.status === 'completed').length / lessons.length) * 100) : 0}%</span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-gradient-to-r from-[#1A237E] to-[#000051] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(26,35,126,0.4)]" style={{ width: `${lessons.length > 0 ? Math.round((Object.values(progressMap).filter((p: any) => p.status === 'completed').length / lessons.length) * 100) : 0}%` }} />
                     </div>
                  </div>
               </div>
            </div>

            <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
               <span className="text-[8px] font-heading font-black text-slate-400 uppercase tracking-widest">Nội dung bài giảng</span>
               <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[7px] font-heading font-black text-emerald-600 uppercase">Live Update</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
               {lessons.map((lesson: any, idx: number) => {
                  const prog = progressMap[lesson.id];
                  const isCompleted = prog?.status === 'completed';
                  const isActive = activeLesson?.id === lesson.id;

                  const prevLessonId = idx > 0 ? lessons[idx - 1].id : null;
                  const isLocked = idx > 0 && progressMap[prevLessonId!]?.status !== 'completed';

                  return (
                     <button
                        key={lesson.id}
                        id={`lesson-item-${lesson.id}`}
                        disabled={isLocked}
                        onClick={() => {
                           if (!isLocked) {
                              setActiveLesson(lesson);
                              navigate(`/edu/course/${courseId}/lesson/${lesson.id}`);
                           }
                        }}
                        className={`w-full flex items-center gap-3 p-3 clip-diagonal transition-all border group/item ${isActive ? 'bg-indigo-50/50 text-indigo-950 border-indigo-100 shadow-sm' :
                              isLocked ? 'opacity-40 grayscale cursor-not-allowed border-transparent' :
                                 'text-slate-500 hover:bg-slate-50 border-transparent'
                           }`}>
                        <div className={`w-7 h-7 clip-diagonal flex items-center justify-center shrink-0 text-[8px] font-heading font-black shadow-sm transition-transform group-hover/item:scale-110 ${isActive ? 'bg-[#1A237E] text-white' :
                              isCompleted ? 'bg-emerald-500 text-white' :
                                 isLocked ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400'
                           }`}>
                           {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isLocked ? <Shield className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                           <p className={`text-[10px] font-heading font-black leading-tight truncate ${isActive ? 'text-indigo-950' : 'text-slate-700'}`}>{lesson.title}</p>
                           <div className="flex items-center gap-2 text-[7px] font-bold uppercase tracking-widest opacity-40">
                              {isLocked ? (
                                 <span className="flex items-center gap-1 text-slate-400"><Shield className="w-2.5 h-2.5" /> Hoàn thành bài trước để mở</span>
                              ) : (
                                 <>
                                    {lesson.content_type === 'video' ? <Video className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
                                    <span>{lesson.duration_minutes || 0}m • {lesson.content_type}</span>
                                 </>
                              )}
                           </div>
                        </div>
                     </button>
                  );
               })}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0 space-y-3">
               <div className="p-4 bg-indigo-50/30 clip-diagonal border border-indigo-100/50 space-y-2">
                  <p className="text-[8px] font-heading font-black text-[#1A237E] uppercase tracking-widest flex items-center gap-2">
                     <FileDown className="w-3 h-3" /> Tài liệu Offline
                  </p>
                  <p className="text-[7px] text-slate-500 font-medium leading-tight">Tải PDF & Audio để học bất cứ lúc nào không cần mạng.</p>
                  <button className="w-full py-2 bg-white text-[#1A237E] clip-diagonal font-heading font-black text-[8px] uppercase tracking-widest border border-indigo-100 shadow-sm hover:bg-[#1A237E] hover:text-white transition-all">
                     Tải về trọn bộ (.zip)
                  </button>
               </div>
               <button className="w-full py-3 bg-slate-900 text-white clip-diagonal font-heading font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#FF9800]" /> Hỗ trợ học viên
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT AREA */}
         <main className="flex-1 relative flex flex-col min-w-0">
            <header className="h-14 border-b border-slate-200/50 px-6 flex items-center justify-between bg-white/70 backdrop-blur-xl z-20 shrink-0 shadow-sm">
               <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 clip-diagonal text-slate-400 hover:text-[#1A237E] shadow-sm active:scale-95 transition-all">
                     <Menu className="w-4.5 h-4.5" />
                  </button>
                  <div className="h-6 w-px bg-slate-200/50 hidden md:block" />
                  <h1 className="text-xs font-heading font-black text-slate-800 tracking-tight truncate max-w-[300px]">
                     {activeLesson?.title || 'Đang tải bài học...'}
                  </h1>
               </div>

               <div className="hidden xl:flex items-center gap-1 bg-slate-100/50 p-1 clip-diagonal border border-slate-200/40">
                  {([
                     { id: 'zone1', label: 'Định hướng', icon: BookOpen, color: 'text-[#FF9800]' },
                     { id: 'zone2', label: 'Bài học', icon: Target, color: 'text-emerald-500' },
                     { id: 'zone3', label: 'Cộng đồng', icon: Users, color: 'text-blue-500' },
                     { id: 'zone4', label: 'AI Mentor', icon: Sparkles, color: 'text-[#1A237E]' },
                  ] as const).map(z => (
                     <button key={z.id} onClick={() => setActiveZone(z.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 clip-diagonal text-[8px] font-heading font-black uppercase tracking-widest transition-all ${activeZone === z.id ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                        <z.icon className={`w-3 h-3 ${activeZone === z.id ? z.color : ''}`} />
                        <span className="hidden 2xl:block">{z.label}</span>
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-white clip-diagonal border border-indigo-100 shadow-sm group">
                     <div key={earnedXP} className="w-6 h-6 bg-[#1A237E] clip-diagonal flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:rotate-12 transition-transform animate-in zoom-in duration-300">
                        <Zap className="w-3 h-3 text-[#FF9800]" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-heading font-black text-indigo-900 tabular-nums">{earnedXP || 0} XP</span>
                     </div>
                  </div>
                  <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 clip-diagonal text-slate-400 hover:text-[#1A237E] shadow-sm"><Settings className="w-4.5 h-4.5" /></button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10">
               <div className="max-w-[1300px] mx-auto space-y-6">

                  {activeLesson && (
                     <div className="w-full">

                        {/* ZONE 1: ĐỊNH HƯỚNG */}
                        {activeZone === 'zone1' && (
                           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-4">
                              <div className="bg-white/90 backdrop-blur-xl clip-diagonal p-6 border border-white shadow-sm group overflow-hidden">
                                 <h2 className="text-sm font-heading font-black text-slate-900 flex items-center gap-3 mb-4">
                                    <BookOpen className="w-8 h-8 text-[#1A237E] p-2 bg-indigo-50 clip-diagonal" /> Từ vựng cốt lõi
                                 </h2>
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {(activeLesson?.content_json?.vocabulary || []).map((v: any, i: number) => (
                                       <div key={i} className="bg-white p-4 clip-diagonal border border-slate-100 hover:border-indigo-400 hover:shadow-md transition-all duration-500 group/card relative overflow-hidden flex flex-col items-center">
                                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                          <div className="relative z-10 flex flex-col items-center text-center">
                                             <div className="text-2xl font-heading font-black text-slate-900 mb-1">{v.hanzi}</div>
                                             <div className="px-2 py-0.5 bg-indigo-50 text-[#1A237E] clip-diagonal text-[7px] font-heading font-black uppercase tracking-widest mb-1">{v.pinyin}</div>
                                             <div className="text-[9px] font-bold text-[#FF9800] uppercase tracking-wide mb-3">{v.meaning}</div>
                                             <button className="w-7 h-7 bg-slate-50 hover:bg-[#1A237E] text-slate-400 hover:text-white clip-diagonal flex items-center justify-center transition-all shadow-sm"
                                                onClick={() => { const u = new SpeechSynthesisUtterance(v.hanzi); u.lang = 'zh-CN'; u.rate = 0.8; speechSynthesis.speak(u); }}>
                                                <Volume2 className="w-3.5 h-3.5" />
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              <div className="bg-white/90 backdrop-blur-xl clip-diagonal p-6 border border-white shadow-sm">
                                 <h2 className="text-sm font-heading font-black text-slate-900 flex items-center gap-3 mb-4">
                                    <Target className="w-8 h-8 text-emerald-500 p-2 bg-emerald-50 clip-diagonal" /> Mục tiêu bài học
                                 </h2>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(activeLesson?.content_json?.outcomes || []).map((out: string, i: number) => (
                                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 clip-diagonal hover:bg-white transition-all group/out">
                                          <div className="w-6 h-6 bg-emerald-500 text-white clip-diagonal flex items-center justify-center shadow-lg group-hover/out:scale-110 transition-transform">
                                             <Check className="w-3.5 h-3.5 stroke-[4]" />
                                          </div>
                                          <p className="text-slate-700 font-bold text-[10px]">{out}</p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* ZONE 2: NỘI DUNG CHÍNH */}
                        {activeZone === 'zone2' && (
                           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
                              {activeLesson.content_type === 'video' && (
                                 <div className="relative aspect-video bg-black clip-diagonal overflow-hidden shadow-2xl border-[6px] border-white group">
                                    <iframe
                                       src={activeLesson.content_url}
                                       className="w-full h-full"
                                       allowFullScreen
                                       onEnded={handleVideoEnd}
                                    />
                                 </div>
                              )}

                              {activeLesson.content_type === 'pdf' && (
                                 <div className="bg-white clip-diagonal p-1 border border-slate-200 shadow-xl h-[550px]">
                                    <iframe src={activeLesson.content_url} className="w-full h-full clip-diagonal" />
                                 </div>
                              )}

                              <div className="bg-white/80 backdrop-blur-2xl clip-diagonal p-6 border border-white shadow-sm">
                                 <div className="flex items-center gap-1 bg-slate-100/50 p-1 clip-diagonal mb-6 w-fit mx-auto border border-slate-200/30">
                                    {(['understand', 'practice', 'apply'] as const).map(tab => (
                                       <button key={tab} onClick={() => {
                                          setActiveTab(tab);
                                          updatePhaseProgress(tab);
                                       }}
                                          className={`px-8 py-2 clip-diagonal text-[9px] font-heading font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#1A237E] text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                                          {tab === 'understand' ? 'Thấu hiểu' : tab === 'practice' ? 'Rèn luyện' : 'Ứng dụng'}
                                       </button>
                                    ))}
                                 </div>

                                 {/* 1. THẤU HIỂU */}
                                 {activeTab === 'understand' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                       {/* Teacher's Master Insight Section */}
                                       <div className="p-8 bg-gradient-to-br from-[#1A237E] to-[#000051] clip-diagonal text-white shadow-2xl relative overflow-hidden group mb-8">
                                          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                             <GraduationCap className="w-32 h-32" />
                                          </div>
                                          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                             <div className="w-20 h-20 bg-[#FF9800] clip-diagonal flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                                <Sparkles className="w-10 h-10" />
                                             </div>
                                             <div className="space-y-3">
                                                <h4 className="text-xs font-heading font-black text-orange-200 uppercase tracking-widest">Lời khuyên từ Giảng viên</h4>
                                                <p className="text-base font-bold leading-relaxed text-slate-200">
                                                   "{activeLesson?.teacher_notes || 'Để nắm vững bài này, bạn cần chú ý kỹ cách phát âm bộ thủ \"Mộc\" và sự thay đổi ý nghĩa khi kết hợp với các từ chỉ phương hướng.'}"
                                                </p>
                                                <div className="flex items-center gap-4 text-[10px] font-heading font-black text-indigo-200 uppercase tracking-widest pt-2">
                                                   <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Đã kiểm duyệt nội dung</span>
                                                   <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> 1.2k học viên đã xem</span>
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       {(activeLesson?.content_json?.key_sentences || [
                                          { zh: '你好！今天的生产任务完成了吗？', vi: 'Chào bạn! Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?', pinyin: 'Nǐ hǎo! Jīntiān de shēngchǎn rènwu wánchéng le ma?', explanation: 'Mẫu câu hỏi tiến độ sản xuất cơ bản.' }
                                       ]).map((s: any, idx: number) => (
                                          <section key={idx} className="p-6 bg-gradient-to-br from-indigo-50 to-white clip-diagonal border border-indigo-100 relative group overflow-hidden">
                                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A237E]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                             <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                                                <div className="flex-1 space-y-3">
                                                   <span className="px-2 py-0.5 bg-[#1A237E] text-white text-[7px] font-heading font-black uppercase tracking-widest rounded shadow-md">Mẫu câu trọng tâm #{idx + 1}</span>
                                                   <h3 className="text-2xl font-heading font-black text-slate-800 leading-tight">{s.zh}</h3>
                                                   <p className="text-sm font-bold text-slate-400 italic">{s.pinyin}</p>
                                                   <div className="p-3 bg-white/60 backdrop-blur-sm clip-diagonal border border-indigo-50 shadow-sm">
                                                      <p className="text-[11px] font-heading font-black text-indigo-900">{s.vi}</p>
                                                   </div>
                                                   <div className="flex gap-2 pt-2">
                                                      <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-[9px] hover:bg-[#000051] transition-all shadow-md group/btn"
                                                         onClick={() => { const u = new SpeechSynthesisUtterance(s.zh); u.lang = 'zh-CN'; u.rate = 0.8; speechSynthesis.speak(u); }}>
                                                         <Volume2 className="w-3.5 h-3.5 group-hover/btn:scale-110" /> Nghe AI đọc
                                                      </button>
                                                   </div>
                                                </div>
                                                {s.explanation && (
                                                   <div className="w-full md:w-64 bg-white/80 p-4 clip-diagonal border border-slate-100 shadow-sm">
                                                      <h4 className="text-[8px] font-heading font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                         <Info className="w-3 h-3 text-[#FF9800]" /> Giải thích ngữ pháp
                                                      </h4>
                                                      <div className="space-y-3">
                                                         <div className="p-2.5 bg-indigo-50/50 clip-diagonal border border-indigo-100/50">
                                                            <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">{s.explanation}</p>
                                                         </div>
                                                      </div>
                                                   </div>
                                                )}
                                             </div>
                                          </section>
                                       ))}
                                    </div>
                                 )}

                                 {/* 2. RÈN LUYỆN */}
                                 {activeTab === 'practice' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                       <div className="bg-slate-50/50 clip-diagonal p-8 border border-slate-200 relative overflow-hidden shadow-inner">
                                          <div className="flex items-center justify-between mb-6">
                                             <div className="flex flex-col">
                                                <span className="px-3 py-1 bg-orange-100 text-[#FF9800] text-[8px] font-heading font-black uppercase clip-diagonal mb-2 w-fit">
                                                   Thử thách {currentExIdx + 1}/{(activeLesson?.content_json?.practice || PRACTICE_EXERCISES).length}
                                                </span>
                                                <h3 className="text-lg font-heading font-black text-slate-800 leading-snug">{ex.question}</h3>
                                             </div>
                                             <div className="hidden md:flex gap-1.5">
                                                {(activeLesson?.content_json?.practice || PRACTICE_EXERCISES).map((_: any, idx: number) => (
                                                   <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentExIdx ? 'w-8 bg-[#FF9800]' : idx < currentExIdx ? 'w-1.5 bg-emerald-500' : 'w-1.5 bg-slate-200'}`} />
                                                ))}
                                             </div>
                                          </div>

                                          {(ex.type === 'listen_select' || ex.type === 'fill_blank') && (
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                                {ex.options?.map((opt: string, idx: number) => {
                                                   const isCorrectAns = idx === ex.correctIndex;
                                                   let style = 'border-slate-200 hover:border-indigo-400 bg-white text-slate-700 hover:bg-indigo-50/30';
                                                   if (showExplain) {
                                                      style = isCorrectAns ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : selectedOpt === idx ? 'border-red-500 bg-red-50 text-red-700' : 'opacity-40 border-slate-100';
                                                   } else if (selectedOpt === idx) {
                                                      style = 'border-[#1A237E] bg-indigo-50 text-[#1A237E] shadow-md';
                                                   }
                                                   return (
                                                      <button key={idx} onClick={() => !showExplain && setSelectedOpt(idx)} disabled={showExplain} className={`p-5 clip-diagonal border border-2 text-left font-heading font-black transition-all ${style} group/opt`}>
                                                         <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 clip-diagonal border flex items-center justify-center shrink-0 ${showExplain && isCorrectAns ? 'bg-emerald-500 border-emerald-500 text-white' : selectedOpt === idx ? 'bg-[#1A237E] border-[#1A237E] text-white' : 'border-slate-200 text-slate-300'}`}>
                                                               {showExplain && isCorrectAns ? <Check className="w-4 h-4 stroke-[4]" /> : <span className="text-[10px] font-heading font-black">{String.fromCharCode(65 + idx)}</span>}
                                                            </div>
                                                            <span className="text-[13px]">{opt}</span>
                                                         </div>
                                                      </button>
                                                   );
                                                })}
                                             </div>
                                          )}

                                          {ex.type === 'order_sentence' && (
                                             <div className="space-y-4 mb-6">
                                                <div className="min-h-[5rem] p-6 clip-diagonal border-2 border-dashed border-slate-200 bg-white/80 flex flex-wrap gap-2 items-center justify-center shadow-inner">
                                                   {orderedWords.length === 0 && <span className="text-slate-300 font-heading font-black text-[9px] uppercase tracking-widest">Bấm chọn các từ bên dưới</span>}
                                                   {orderedWords.map((word, idx) => (
                                                      <button key={idx} onClick={() => handleWordSelect(word, false)} disabled={showExplain} className="px-4 py-2 bg-[#1A237E] text-white font-heading font-black clip-diagonal shadow-md hover:scale-105 transition-all text-sm">{word}</button>
                                                   ))}
                                                </div>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                   {availableWords.map((word, idx) => (
                                                      <button key={idx} onClick={() => handleWordSelect(word, true)} disabled={showExplain} className="px-4 py-2 bg-white border border-slate-200 text-slate-800 font-heading font-black clip-diagonal hover:border-[#1A237E] hover:text-[#1A237E] transition-all text-sm shadow-sm">{word}</button>
                                                   ))}
                                                </div>
                                             </div>
                                          )}

                                          {ex.type === 'translate' && (
                                             <div className="space-y-4 mb-6">
                                                <div className="p-5 bg-white clip-diagonal border-2 border-slate-100 shadow-sm">
                                                   <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                      <Sparkles className="w-3.5 h-3.5 text-[#1A237E]" /> Gợi ý từ vựng:
                                                   </p>
                                                   <div className="flex flex-wrap gap-2">
                                                      {(ex.hints || []).map((hint: string, i: number) => (
                                                         <span key={i} className="px-3 py-1 bg-indigo-50 text-[#1A237E] clip-diagonal text-[9px] font-heading font-black border border-indigo-100 shadow-sm">{hint}</span>
                                                      ))}
                                                   </div>
                                                </div>
                                                <textarea
                                                   className="w-full p-5 bg-white border border-2 border-slate-200 clip-diagonal text-base font-heading font-black min-h-[120px] focus:border-[#1A237E] outline-none shadow-sm transition-all"
                                                   placeholder="Nhập bản dịch của bạn ở đây..."
                                                   value={translateText}
                                                   onChange={(e) => setTranslateText(e.target.value)}
                                                   disabled={showExplain}
                                                />
                                             </div>
                                          )}

                                          {showExplain ? (
                                             <div className="animate-in fade-in slide-in-from-top-2">
                                                <div className="p-4 bg-indigo-50 clip-diagonal border border-indigo-100/50 mb-6 flex items-start gap-3 shadow-sm">
                                                   <Info className="w-5 h-5 text-[#1A237E] shrink-0 mt-0.5" />
                                                   <div>
                                                      <p className="text-[8px] font-heading font-black text-indigo-400 uppercase tracking-widest mb-1">Giải thích từ chuyên gia</p>
                                                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{ex.explain}</p>
                                                   </div>
                                                </div>
                                                <button onClick={nextPractice} className="w-full py-4 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest hover:bg-[#000051] transition-all flex items-center justify-center gap-2 group shadow-xl">
                                                   {currentExIdx < (activeLesson?.content_json?.practice || PRACTICE_EXERCISES).length - 1 ? 'Tiếp tục rèn luyện' : 'Chuyển sang thực chiến'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                             </div>
                                          ) : (
                                             <button onClick={checkPracticeAnswer} disabled={!isPracticeAnswerReady()} className="w-full py-4 bg-slate-900 text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest mt-4 shadow-lg disabled:opacity-20 hover:bg-black transition-all">Kiểm tra đáp án</button>
                                          )}
                                       </div>
                                    </div>
                                 )}

                                 {/* 3. ỨNG DỤNG */}
                                 {activeTab === 'apply' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                       <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                          <div className="md:col-span-8 space-y-6">
                                             <div className="bg-slate-50 clip-diagonal p-10 border border-slate-200 shadow-inner space-y-8">
                                                <div className="flex flex-col gap-4">
                                                   <div className="w-16 h-16 bg-white clip-diagonal flex items-center justify-center shadow-sm border border-slate-100">
                                                      <AudioLines className="w-8 h-8 text-[#1A237E]" />
                                                   </div>
                                                   <div className="space-y-2">
                                                      <h3 className="text-xl font-heading font-black text-slate-800 tracking-tight">Thực hành & Nộp bài tập</h3>
                                                      <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                         Hãy viết lại các từ vựng đã học hôm nay hoặc trả lời câu hỏi bài tập của giáo viên vào ô bên dưới. AI sẽ giúp bạn chấm điểm và sửa lỗi ngay lập tức.
                                                      </p>
                                                   </div>
                                                </div>

                                                {/* Homework Input */}
                                                <div className="space-y-4">
                                                   <textarea
                                                      value={homeworkContent}
                                                      onChange={(e) => setHomeworkContent(e.target.value)}
                                                      placeholder="Nhập nội dung bài tập của bạn ở đây..."
                                                      className="w-full p-6 bg-white border-2 border-slate-100 clip-diagonal text-sm font-medium focus:border-[#1A237E] outline-none shadow-sm min-h-[200px] transition-all"
                                                   />
                                                   <button
                                                      onClick={handleSubmitHomework}
                                                      disabled={!homeworkContent.trim() || submittingHomework}
                                                      className="w-full py-4 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                                                   >
                                                      {submittingHomework ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Nộp bài ngay'}
                                                   </button>
                                                </div>

                                                {/* Submission History */}
                                                {mySubmissions.length > 0 && (
                                                   <div className="space-y-4 pt-6 border-t border-slate-200">
                                                      <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest">Lịch sử bài nộp</p>
                                                      {mySubmissions.map((sub: any, i: number) => (
                                                         <div key={i} className="p-6 bg-white clip-diagonal border border-slate-100 space-y-4 shadow-sm">
                                                            <div className="flex items-center justify-between">
                                                               <span className="text-[8px] font-heading font-black text-slate-400 uppercase">{new Date(sub.submitted_at).toLocaleString()}</span>
                                                               {sub.ai_score && (
                                                                  <div className="flex items-center gap-2">
                                                                     <span className="text-[10px] font-heading font-black text-emerald-600 uppercase">AI Score: {sub.ai_score}/100</span>
                                                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                                  </div>
                                                               )}
                                                            </div>
                                                            <p className="text-xs text-slate-700 font-medium leading-relaxed">{sub.content}</p>
                                                            {sub.ai_feedback && (
                                                               <div className="p-4 bg-indigo-50/50 clip-diagonal border border-indigo-100/50">
                                                                  <p className="text-[10px] font-heading font-black text-indigo-900 mb-1 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Nhận xét từ AI Mentor:</p>
                                                                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">{sub.ai_feedback}</p>
                                                               </div>
                                                            )}
                                                         </div>
                                                      ))}
                                                   </div>
                                                )}
                                             </div>
                                          </div>

                                          <div className="md:col-span-4 space-y-6">
                                             <div className="bg-[#1A237E] clip-diagonal p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
                                                <div className="absolute bottom-0 right-0 p-6 opacity-20"><Target className="w-20 h-20" /></div>
                                                <h4 className="text-sm font-heading font-black uppercase tracking-widest text-indigo-200">Điều kiện vượt ải</h4>
                                                <div className="space-y-4">
                                                   <div className="flex items-center justify-between">
                                                      <span className="text-[10px] font-bold text-indigo-100 flex items-center gap-2">
                                                         <Video className="w-3.5 h-3.5" /> Xem video bài giảng
                                                      </span>
                                                      {videoWatched ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-indigo-400" />}
                                                   </div>
                                                   <div className="flex items-center justify-between">
                                                      <span className="text-[10px] font-bold text-indigo-100 flex items-center gap-2">
                                                         <MessageCircle className="w-3.5 h-3.5" /> Phản xạ AI ({aiInteractionCount}/3)
                                                      </span>
                                                      {aiInteractionCount >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-indigo-400" />}
                                                   </div>
                                                   <div className="flex items-center justify-between">
                                                      <span className="text-[10px] font-bold text-indigo-100 flex items-center gap-2">
                                                         <FileText className="w-3.5 h-3.5" /> Hoàn thành bài tập
                                                      </span>
                                                      {homeworkSubmitted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-indigo-400" />}
                                                   </div>
                                                </div>

                                                <div className="pt-4">
                                                   <button
                                                      disabled={!videoWatched || aiInteractionCount < 3 || !homeworkSubmitted || completingLesson}
                                                      onClick={handleCompleteLesson}
                                                      className="w-full py-4 bg-[#FF9800] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                                                   >
                                                      {completingLesson ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Hoàn thành bài học'}
                                                   </button>
                                                   {!videoWatched || aiInteractionCount < 3 || !homeworkSubmitted ? (
                                                      <p className="text-[8px] text-indigo-300 font-bold uppercase tracking-widest mt-3 text-center">Hoàn thành đủ các bước để mở khóa bài tiếp theo</p>
                                                   ) : null}
                                                </div>
                                             </div>

                                             <div className="bg-white clip-diagonal p-8 border border-slate-200 shadow-sm space-y-4">
                                                <h4 className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                   <BookmarkPlus className="w-3.5 h-3.5 text-[#FF9800]" /> Lưu trữ quan trọng
                                                </h4>
                                                <div className="space-y-3">
                                                   <button className="w-full flex items-center gap-3 p-3 bg-slate-50 clip-diagonal hover:bg-indigo-50 transition-colors group">
                                                      <div className="w-2 h-2 bg-[#1A237E] rounded-full group-hover:scale-150 transition-transform" />
                                                      <span className="text-[11px] font-bold text-slate-600">Flashcard Bài {activeLesson?.order_index}</span>
                                                   </button>
                                                   <button className="w-full flex items-center gap-3 p-3 bg-slate-50 clip-diagonal hover:bg-indigo-50 transition-colors group">
                                                      <div className="w-2 h-2 bg-[#1A237E] rounded-full group-hover:scale-150 transition-transform" />
                                                      <span className="text-[11px] font-bold text-slate-600">Sơ đồ tư duy ngữ pháp</span>
                                                   </button>
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="bg-white clip-diagonal p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
                                          <div className="w-40 h-40 bg-indigo-50 clip-diagonal flex items-center justify-center shrink-0 shadow-inner">
                                             <Sparkles className="w-16 h-16 text-[#1A237E] animate-pulse" />
                                          </div>
                                          <div className="space-y-4 text-center md:text-left">
                                             <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">AI Roleplay Studio</h3>
                                             <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                                                Nếu bạn đang học Online, hãy sử dụng phòng AI Roleplay để giả lập các tình huống thực tế. Mentor AI sẽ đóng vai đối tác, khách hàng hoặc sếp của bạn.
                                             </p>
                                             <button onClick={() => setActiveZone('zone4')} className="px-8 py-3 bg-[#1A237E] text-white clip-diagonal font-heading font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                                                Mở phòng Roleplay ngay
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}

                        {/* ZONE 3: CỘNG ĐỒNG */}
                        {activeZone === 'zone3' && (
                           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                              <div className="bg-white/90 backdrop-blur-xl clip-diagonal p-12 border border-slate-100 text-center space-y-6 shadow-sm">
                                 <div className="w-20 h-20 bg-blue-50 text-blue-600 clip-diagonal flex items-center justify-center mx-auto shadow-xl shadow-blue-100">
                                    <Users className="w-10 h-10" />
                                 </div>
                                 <div className="space-y-2">
                                    <h2 className="text-2xl font-heading font-black text-slate-900">Cộng đồng Toxi Edu</h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Nơi thảo luận và chia sẻ kinh nghiệm học tập</p>
                                 </div>
                                 <button className="px-10 py-4 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#000051] transition-all">Tham gia thảo luận ngay</button>
                              </div>
                           </div>
                        )}

                        {/* ZONE 4: AI MENTOR */}
                        {activeZone === 'zone4' && (
                           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                              <div className="bg-white/90 backdrop-blur-xl clip-diagonal p-6 border border-slate-200 flex flex-col h-[600px] shadow-sm relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                                 <div className="flex items-center gap-4 mb-6 shrink-0 relative z-10">
                                    <div className="w-12 h-12 bg-[#1A237E] clip-diagonal flex items-center justify-center text-white shadow-lg">
                                       <Sparkles className="w-7 h-7" />
                                    </div>
                                    <div>
                                       <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">AI Mentor Trực tuyến</h2>
                                       <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest">Hỏi bất cứ điều gì về tiếng Trung</p>
                                    </div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 mb-4 relative z-10 p-2">
                                    {assistantChat.length === 0 && (
                                       <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-10 space-y-4">
                                          <Sparkles className="w-12 h-12 text-[#1A237E]" />
                                          <p className="text-xs font-heading font-black uppercase tracking-widest text-slate-500 leading-relaxed">
                                             Chào bạn! Tôi là Mentor của bài học "{activeLesson?.title}". <br />
                                             Bạn cần tôi giải thích thêm về từ vựng hay ngữ pháp nào trong bài này không?
                                          </p>
                                       </div>
                                    )}
                                    {assistantChat.map((msg, i) => (
                                       <div key={i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                          <div className={`max-w-[85%] p-5 clip-diagonal text-sm font-bold shadow-sm relative group/msg ${msg.role === 'user' ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-50 text-slate-800 border border-slate-100'}`}>
                                             {msg.content}
                                             {msg.role === 'ai' && (
                                                <button
                                                   onClick={() => { navigator.clipboard.writeText(msg.content); alert('Đã sao chép phản hồi!'); }}
                                                   className="absolute -right-2 -top-2 w-7 h-7 bg-white shadow-md border border-slate-100 clip-diagonal flex items-center justify-center text-slate-400 hover:text-[#1A237E] opacity-0 group-hover/msg:opacity-100 transition-all"
                                                >
                                                   <BookmarkPlus className="w-3.5 h-3.5" />
                                                </button>
                                             )}
                                          </div>
                                          {msg.grammar && (
                                             <div className="p-4 bg-indigo-50/50 border border-indigo-100 clip-diagonal text-[10px] font-heading font-black text-indigo-900 max-w-[80%]">
                                                <div className="flex items-center gap-2 mb-2">
                                                   <div className="w-1.5 h-4 bg-[#1A237E] rounded-full" />
                                                   <span className="uppercase tracking-widest">Cấu trúc ngữ pháp</span>
                                                </div>
                                                {msg.grammar}
                                             </div>
                                          )}
                                          {msg.examples && msg.examples.length > 0 && (
                                             <div className="space-y-2 max-w-[80%]">
                                                {msg.examples.map((ex: any, idx: number) => (
                                                   <div key={idx} className="p-3 bg-white border border-slate-100 clip-diagonal shadow-sm">
                                                      <p className="text-[11px] font-heading font-black text-slate-900">{ex.zh}</p>
                                                      <p className="text-[9px] text-slate-400 italic mt-1">{ex.vi}</p>
                                                   </div>
                                                ))}
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                    {assistantLoading && (
                                       <div className="flex items-center gap-3 text-slate-400">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span className="text-[10px] font-heading font-black uppercase tracking-widest">AI đang suy nghĩ...</span>
                                       </div>
                                    )}
                                 </div>

                                 <div className="flex gap-3 shrink-0 relative z-10 pt-2 border-t border-slate-100">
                                    <input
                                       value={assistantInput}
                                       onChange={(e) => setAssistantInput(e.target.value)}
                                       onKeyDown={(e) => e.key === 'Enter' && handleAssistantSubmit()}
                                       placeholder="Nhập câu hỏi của bạn tại đây..."
                                       className="flex-1 p-4 clip-diagonal border-2 border-slate-100 text-[13px] font-bold focus:outline-none focus:border-[#1A237E] shadow-sm transition-all bg-white"
                                    />
                                    <button onClick={handleAssistantSubmit} disabled={assistantLoading || !assistantInput.trim()} className="w-14 h-14 bg-[#1A237E] text-white clip-diagonal-hover flex items-center justify-center shadow-lg hover:bg-[#000051] active:scale-95 transition-all disabled:opacity-20">
                                       {assistantLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* FOOTER ACTIONS */}
                        <div className="flex items-center justify-between pt-10 border-t border-slate-100 mt-10 mb-6">
                           <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 clip-diagonal border border-slate-100">
                              <Shield className="w-4 h-4 text-emerald-500" />
                              <span className="text-[8px] font-heading font-black text-slate-400 uppercase tracking-widest">Toxi Edu Secure Portal v2.5</span>
                           </div>
                           <button onClick={handleCompleteLesson} disabled={completingLesson}
                              className="px-10 py-5 bg-[#1A237E] text-white clip-diagonal font-heading font-black text-xs uppercase tracking-widest shadow-[0_15px_40px_rgba(26,35,126,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group/finish">
                              {completingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                 <>
                                    Hoàn thành bài học
                                    <ChevronRight className="w-4 h-4 group-hover/finish:translate-x-1 transition-transform" />
                                 </>
                              )}
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </main>

         {/* SUCCESS MODAL */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/60 backdrop-blur-md p-4 animate-in fade-in duration-500">
               <div className="bg-white clip-diagonal p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                  <div className="relative z-10 flex flex-col items-center text-center">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-600 clip-diagonal flex items-center justify-center mb-6 shadow-lg shadow-emerald-100 animate-bounce">
                        <Target className="w-10 h-10" />
                     </div>
                     <h3 className="text-3xl font-heading font-black text-slate-900 tracking-tight mb-2">Tuyệt vời, chúc mừng bạn!</h3>
                     <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-widest">Bạn đã hoàn thành xuất sắc bài học này</p>

                     <div className="grid grid-cols-2 gap-4 w-full mb-10">
                        <div className="p-6 bg-slate-50 clip-diagonal border border-slate-100 flex flex-col items-center gap-2 group hover:bg-white hover:border-indigo-200 transition-all">
                           <div className="w-10 h-10 bg-[#1A237E] text-white clip-diagonal flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                              <Zap className="w-5 h-5 fill-current text-[#FF9800]" />
                           </div>
                           <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest">Kinh nghiệm</p>
                           <p className="text-2xl font-heading font-black text-indigo-900">+{sessionStats.xp} XP</p>
                        </div>
                        <div className="p-6 bg-slate-50 clip-diagonal border border-slate-100 flex flex-col items-center gap-2 group hover:bg-white hover:border-emerald-200 transition-all">
                           <div className="w-10 h-10 bg-emerald-500 text-white clip-diagonal flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                              <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest">Độ chính xác</p>
                           <p className="text-2xl font-heading font-black text-emerald-600">{sessionStats.accuracy}%</p>
                        </div>
                     </div>

                     <div className="flex flex-col w-full gap-3">
                        {lessons.findIndex(l => l.id === activeLesson?.id) === lessons.length - 1 ? (
                           <button onClick={() => navigate(`/edu/course/${courseId}/exam`)} className="w-full py-5 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                              Bắt đầu thi cuối khóa <GraduationCap className="w-5 h-5" />
                           </button>
                        ) : (
                           <button onClick={handleNextAfterSuccess} className="w-full py-5 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                              Tiếp tục bài học mới <ArrowRight className="w-4.5 h-4.5" />
                           </button>
                        )}
                        <button onClick={() => navigate('/edu/dashboard')} className="w-full py-4 bg-white text-slate-400 hover:text-[#1A237E] clip-diagonal font-heading font-black text-[10px] uppercase tracking-widest transition-all">
                           Quay lại Dashboard
                        </button>
                     </div>

                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
