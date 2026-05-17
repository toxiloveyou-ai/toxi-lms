import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
   ChevronLeft, Smartphone, Laptop, Cpu, Mic, Ear,
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
import { getCourseProgress, completeLessonAndAwardXP, getMySubmissions } from '../../lib/api/lessonProgress';
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

const GENERAL_KNOWLEDGE_MOCKS = {
   tech_tips: [
      {
         title: '1. Quét Dịch AI / OCR Tài Liệu SOP',
         desc: 'Chụp ảnh tài liệu chỉ dẫn vận hành tiếng Trung qua Toxi OCR AI. Hệ thống tự động bóc tách từ vựng, dịch chéo thuật ngữ chuyên môn ngay lập tức để tra cứu nhanh.'
      },
      {
         title: '2. Nhập Báo Cáo Gặp Sự Cố Bằng Giọng Nói (Baidu/Sogou IME)',
         desc: 'Kích hoạt gõ bằng giọng nói tiếng Trung (语音输入) trên bàn phím. Chỉ cần nói to rõ ràng, hệ thống sẽ tự động gõ chữ Hán chuẩn 99% để soạn nhanh báo cáo.'
      },
      {
         title: '3. Tra Cứu Tham Số Lỗi Nhanh Qua Mã QR Thiết Bị',
         desc: 'Quét mã QR trên thân máy bằng ứng dụng TOXI. Yêu cầu AI Mentor phân tích mã lỗi, đề xuất phương án và sinh câu lệnh báo cáo tiếng Trung tự động.'
      }
   ],
   sop: [
      { step: '1', title: '准备 (Zhǔnbèi)', eng: 'Chuẩn bị', desc: 'Kiểm tra trang thiết bị bảo hộ lao động (PPE), thiết bị đầu cuối và vật tư phục vụ dây chuyền trước giờ sản xuất.' },
      { step: '2', title: '操作 (Cāozuò)', eng: 'Thao tác', desc: 'Thực hiện thao tác kỹ thuật chuẩn xác theo tài liệu chỉ dẫn vận hành (SOP) được dán trước vị trí làm việc.' },
      { step: '3', title: '检查 (Jiǎnchá)', eng: 'Kiểm tra', desc: 'Nhân viên IPQC tiến hành kiểm tra ngẫu nhiên chất lượng sản phẩm trên băng tải nhằm phát hiện lỗi sớm.' },
      { step: '4', title: '报告 (Bàogào)', eng: 'Báo cáo', desc: 'Phát hiện sự cố chất lượng hoặc lỗi máy, lập tức dừng dây chuyền (nếu cần) và báo cáo Tổ trưởng (组长).' }
   ],
   abbreviations: [
      { acronym: 'SMT', cn: '表面贴装技术', py: 'Biǎomiàn tiēzhuāng jìshù', vi: 'Công nghệ dán bề mặt linh kiện', desc: 'Quy trình dán bo mạch điện tử tự động.' },
      { acronym: 'IPQC', cn: '过程质量控制', py: 'Guòchéng zhìliàng kòngzhì', vi: 'Kiểm soát chất lượng trong quá trình', desc: 'Kỹ sư kiểm tra chất lượng trực tiếp tại dây chuyền.' },
      { acronym: 'FATP', cn: '整机组装测试包装', py: 'Zhěngjī zǔzhuāng cèshì bāozhuāng', vi: 'Lắp ráp hoàn thiện, kiểm thử & đóng gói', desc: 'Giai đoạn cuối cùng trước khi xuất xưởng.' },
      { acronym: 'SOP', cn: '标准作业程序', py: 'Biāozhǔn zuòyè chéngxù', vi: 'Quy trình vận hành tiêu chuẩn', desc: 'Tài liệu hướng dẫn thao tác bắt buộc.' }
   ],
   rules: [
      {
         title: '1. Gọi Đúng Chức Danh Kèm Họ',
         desc: 'Tuyệt đối không gọi sếp người Hoa bằng tên riêng. Luôn gọi theo công thức: Họ + Chức vụ. Ví dụ: Vương Khóa trưởng (王课长 - Wáng Kèzhǎng), Trương Tổ trưởng (张组长 - Zhāng Zǔzhǎng), Lý Xưởng trưởng (李厂长 - Lǐ Chǎngzhǎng).'
      },
      {
         title: '2. Báo Cáo Đi Kèm Giải Pháp',
         desc: 'Khi phát hiện phế phẩm (不良品 - Bùliángpǐn), hãy báo cáo sếp lập tức. Đừng chỉ nêu vấn đề; hãy đề xuất phương án xử lý sơ bộ theo cấu trúc: "Báo cáo sếp + Vấn đề phát sinh + Phương án giải quyết + Xin ý kiến chỉ đạo".'
      },
      {
         title: '3. Hiệu Suất & Kết Quả Là Trên Hết',
         desc: 'Sếp Trung Quốc cực kỳ coi trọng tính hiệu quả (效率 - xiàolǜ) và kết quả (结果 - jiéguǒ). Khi trả lời câu hỏi tiến độ, hãy đi thẳng vào trọng tâm, đưa ra con số định lượng cụ thể và trạng thái hoàn thành rõ ràng.'
      }
   ],
   questions: [
      { text: 'Làm thế nào để báo cáo sếp về sự cố chất lượng trên dây chuyền SMT?', prompt: 'Chào AI Mentor, hãy viết cho tôi mẫu hội thoại tiếng Trung thực chiến để báo cáo sếp khi phát hiện lỗi chất lượng (不良品) trên dây chuyền SMT.' },
      { text: 'Cách xưng hô chuẩn xác với các cấp quản lý trong nhà máy?', prompt: 'Chào AI Mentor, hãy hướng dẫn chi tiết cách xưng hô (Tổ trưởng, Khóa trưởng, Bộ trưởng, Xưởng trưởng) kèm họ của sếp trong nhà máy Trung Quốc.' },
      { text: 'Giải nghĩa chi tiết thuật ngữ IPQC và nhiệm vụ của họ?', prompt: 'Chào AI Mentor, giải nghĩa chi tiết thuật ngữ IPQC (过程质量控制) trong nhà máy, và viết các câu giao tiếp thực tế giữa công nhân và IPQC.' }
   ]
};

// Helper to convert standard YouTube/Vimeo links to iframe-compatible embed URLs
const getEmbedUrl = (url: string) => {
   if (!url) return '';
   
   // Handle YouTube
   if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('watch?v=')) {
         const parts = url.split('watch?v=');
         if (parts[1]) {
            videoId = parts[1].split('&')[0];
         }
      } else if (url.includes('youtu.be/')) {
         const parts = url.split('youtu.be/');
         if (parts[1]) {
            videoId = parts[1].split('?')[0];
         }
      } else if (url.includes('youtube.com/shorts/')) {
         const parts = url.split('youtube.com/shorts/');
         if (parts[1]) {
            videoId = parts[1].split('?')[0];
         }
      } else if (url.includes('youtube.com/embed/')) {
         return url; // Already an embed URL
      }
      
      if (videoId) {
         return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      }
   }
   
   // Handle Vimeo
   if (url.includes('vimeo.com/')) {
      if (!url.includes('player.vimeo.com')) {
         const parts = url.split('vimeo.com/');
         const videoId = parts[1]?.split('?')[0];
         if (videoId) {
            return `https://player.vimeo.com/video/${videoId}`;
         }
      }
   }
   
   return url;
};

export default function EduLessonPlayer() {
   const { courseId, lessonId } = useParams();
   const navigate = useNavigate();
   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
   const [activeZone, setActiveZone] = useState<'zone1' | 'zone2' | 'zone3' | 'zone4'>('zone1');
   const [activeTab, setActiveTab] = useState<'understand' | 'practice' | 'apply'>('understand');
   const [zone1Tab, setZone1Tab] = useState<'core' | 'general'>('core');
   
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

   // Recording & Voice Simulation State
   const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
   const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<{ index: number; score: number; feedback: string } | null>(null);

   // Upgraded Classroom Features State
   const [understandMode, setUnderstandMode] = useState<'list' | 'flashcard' | 'srs'>('list');
   const [flashcardIndex, setFlashcardIndex] = useState(0);
   const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
   
   // Spaced Repetition System (SRS) Leitner States
   const [srsVocabIndex, setSrsVocabIndex] = useState(0);
   const [isSrsCardFlipped, setIsSrsCardFlipped] = useState(false);
   const [srsQueue, setSrsQueue] = useState<number[]>([]);
   const [srsSessionCompleted, setSrsSessionCompleted] = useState(false);
   const [srsMasteredCount, setSrsMasteredCount] = useState(0);
   const [practiceScores, setPracticeScores] = useState<boolean[]>([]);
   const [quizCompleted, setQuizCompleted] = useState(false);
   const [rehearsalInput, setRehearsalInput] = useState('');
   const [rehearsalResult, setRehearsalResult] = useState<{ score: number; grammarFeedback: string; xpReward: number; suggestions: string } | null>(null);
   const [rehearsalLoading, setRehearsalLoading] = useState(false);
   const [submissions, setSubmissions] = useState<any[]>([]);

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

    useEffect(() => {
       if (understandMode === 'srs' && activeLesson?.content_json?.vocabulary) {
          const indices = Array.from({ length: activeLesson.content_json.vocabulary.length }, (_, i) => i);
          setSrsQueue(indices);
          setSrsVocabIndex(0);
          setIsSrsCardFlipped(false);
          setSrsSessionCompleted(false);
          setSrsMasteredCount(0);
       }
    }, [understandMode, activeLesson]);

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
               const mySubs = await getMySubmissions(user.id, current.id);
               setSubmissions(mySubs || []);
            }
         }
      } catch (err) { console.error(err); }
      finally { setLoadingData(false); }
   };

   const handleCompleteLesson = async () => {
      if (!currentUser || !activeLesson || completingLesson) return;
      const hasVocab = activeLesson?.content_json?.vocabulary && activeLesson.content_json.vocabulary.length > 0;
      const isVocabMastered = !hasVocab || srsSessionCompleted;
      const isHomeworkSubmitted = submissions && submissions.length > 0;
      
      if (!isVocabMastered || !isHomeworkSubmitted) return;
      
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

   const askAiMentorDirectly = async (questionText: string) => {
      setActiveZone('zone4');
      setRoleplayLoading(true);
      setRoleplayChat(prev => [...prev, { role: 'user', content: questionText }]);
      try {
         const response = await generateEduRoleplayResponse(
            activeLesson ? activeLesson.title : 'Kiến thức chung', 
            questionText, 
            roleplayChat, 
            JSON.stringify(activeLesson?.content_json?.vocabulary || [])
         );
         setRoleplayChat(prev => [...prev, { role: 'ai', content: response.content, vi: response.vi, pinyin: response.pinyin, feedback: response.feedback }]);
         setEarnedXP(prev => prev + 15);
      } catch (err) { 
         console.error(err); 
      } finally { 
         setRoleplayLoading(false); 
      }
   };

   const handleVoiceChallenge = (sentenceText: string, index: number) => {
      if (recordingIndex !== null) return;
      
      setRecordingIndex(index);
      setVoiceAnalysisResult(null);
      
      // Play the Chinese sentence first so student hears native model
      const u = new SpeechSynthesisUtterance(sentenceText);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      speechSynthesis.speak(u);
      
      setTimeout(() => {
         // Finish recording and output rich analysis
         const randomScore = Math.floor(Math.random() * 12) + 88; // 88 to 99%
         const feedbacks = [
            "Phát âm cực kỳ chuẩn xác! Âm bật hơi rõ ràng, ngữ điệu tự nhiên như người bản xứ.",
            "Tuyệt vời! Thanh điệu và trọng âm hoàn hảo. Hãy uốn lưỡi sâu hơn một chút ở các phụ âm kép.",
            "Rất tốt! Khẩu hình chuẩn và tốc độ vừa phải. Chú ý độ vang của thanh nhẹ ở cuối câu.",
            "Đạt chuẩn xuất sắc! Nhịp điệu câu mạch lạc, phát âm âm đầu sắc nét."
         ];
         const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
         
         setVoiceAnalysisResult({
            index: index,
            score: randomScore,
            feedback: randomFeedback
         });
         setRecordingIndex(null);
         setEarnedXP(prev => prev + 15);
      }, 2500);
   };

   const handleRehearsalSubmit = () => {
      if (!rehearsalInput.trim()) return;
      setRehearsalLoading(true);
      
      setTimeout(() => {
         const input = rehearsalInput.trim().toLowerCase();
         let score = 90;
         let grammarFeedback = "Câu trả lời của bạn rất đầy đủ, đúng ngữ pháp và thể hiện phong thái làm việc chuyên nghiệp.";
         let suggestions = "Bạn có thể sử dụng thêm trạng ngữ chỉ thời gian để câu báo cáo mang tính định lượng chính xác hơn.";
         let xp = 30;

         // Quick Chinese check based on keywords
         if (input.includes('完成') || input.includes('做完') || input.includes('好了')) {
            score = 96;
            grammarFeedback = "Tuyệt vời! Bạn đã áp dụng cực kỳ chuẩn bổ ngữ kết quả '完' (wán) và động từ '完成' (wánchéng) đã học trong bài học.";
            suggestions = "Câu văn rất lưu loát và tự nhiên, sếp Lý chắc chắn sẽ hài lòng và đánh giá cao tính chủ động của bạn.";
            xp = 40;
         } else if (input.match(/^[a-zA-Z\s,!?.]+$/)) {
            // Only Pinyin/English typed
            score = 65;
            grammarFeedback = "Chú ý: Hãy thử soạn thảo câu trả lời bằng chữ Hán (chữ Trung Quốc) thay vì chỉ gõ Pinyin hoặc Tiếng Việt để rèn luyện kỹ năng thực tế.";
            suggestions = "Hãy dùng bàn phím tiếng Trung và soạn câu '李厂长，今天的任务已经完成了。' để làm quen.";
            xp = 15;
         } else {
            score = 85;
            grammarFeedback = "Khá tốt! Ý tế rõ ràng. Tuy nhiên, cấu trúc câu có thể trau chuốt thêm để chuẩn văn phong giao tiếp công xưởng.";
            suggestions = "Nên bổ sung chức danh ở đầu câu để thể hiện sự tôn trọng, ví dụ: '李厂长，任务做好了。'.";
         }

         setRehearsalResult({
            score,
            grammarFeedback,
            xpReward: xp,
            suggestions
         });
         setEarnedXP(prev => prev + xp);
         setRehearsalLoading(false);
      }, 1500);
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
                              {/* 1. Header Banner */}
                              <div className="bg-gradient-to-r from-[#2E3192] via-indigo-900 to-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-110">
                                    <BookOpen className="w-48 h-48 rotate-12" />
                                 </div>
                                 <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 w-fit text-[9px] font-black uppercase tracking-widest text-orange-400">
                                       <Target className="w-3.5 h-3.5 animate-pulse" /> ĐỊNH HƯỚNG PHÁT TRIỂN NĂNG LỰC
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">
                                       Tri thức <br/> Cốt lõi & Kiến thức chung
                                    </h2>
                                    <p className="text-slate-400 text-xs md:text-sm font-medium max-w-xl leading-relaxed">
                                       Làm chủ hệ thống từ vựng cốt tủy, sơ đồ ngữ pháp thực chiến kết hợp với cẩm nang văn hóa, thuật ngữ vận hành chuẩn SOP tại các nhà máy công nghệ Trung Quốc.
                                    </p>
                                 </div>
                              </div>

                              {/* 2. Sub-tab navigation */}
                              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/60">
                                 <button
                                    onClick={() => setZone1Tab('core')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                       zone1Tab === 'core' 
                                          ? 'bg-white text-[#2E3192] shadow-md border border-slate-200/50' 
                                          : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                 >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Tri thức cốt lõi</span>
                                 </button>
                                 <button
                                    onClick={() => setZone1Tab('general')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                       zone1Tab === 'general' 
                                          ? 'bg-white text-[#2E3192] shadow-md border border-slate-200/50' 
                                          : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                 >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>Kiến thức chung & Văn hóa & Tips ứng dụng công nghệ</span>
                                 </button>
                              </div>

                              {/* 3. Sub-tab Content Panel */}
                              <AnimatePresence mode="wait">
                                                                                                     {zone1Tab === 'core' ? (
                                     <motion.div 
                                        key="core"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                                     >
                                        {/* COLUMN 1: TỪ VỰNG TRONG BÀI */}
                                        <div className="space-y-4">
                                           <div className="flex items-center justify-between px-2">
                                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                 <BookOpen className="w-4 h-4 text-[#2E3192]" /> Từ vựng trong bài
                                              </h3>
                                              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">Lõi</span>
                                           </div>
                                           <div className="space-y-4">
                                              {(activeLesson?.content_json?.vocabulary || []).map((v: any, i: number) => (
                                                 <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-[#2E3192]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/20 rounded-full blur-xl pointer-events-none" />
                                                    
                                                    <div className="space-y-2 relative z-10">
                                                       <div className="flex justify-between items-start">
                                                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Từ vựng #{i+1}</span>
                                                          <button 
                                                             onClick={() => { 
                                                                const u = new SpeechSynthesisUtterance(v.hanzi); 
                                                                u.lang = 'zh-CN'; 
                                                                u.rate = 0.75; 
                                                                speechSynthesis.speak(u); 
                                                             }} 
                                                             className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 hover:bg-[#2E3192] hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                                                          >
                                                             <Volume2 className="w-3.5 h-3.5" />
                                                          </button>
                                                       </div>
                                                       <div>
                                                          <div className="text-2xl font-black text-slate-900 group-hover:text-[#2E3192] transition-colors">{v.hanzi}</div>
                                                          <div className="text-[9px] font-mono text-slate-400 mt-0.5">{v.pinyin}</div>
                                                       </div>
                                                       <div className="text-xs font-black text-[#2E3192]">{v.meaning}</div>
                                                    </div>

                                                    {v.usage && (
                                                       <div className="mt-3 pt-2.5 border-t border-slate-50 text-[9px] text-slate-500 font-medium">
                                                          <span className="text-[7px] font-black uppercase text-slate-300 block mb-0.5">Cách dùng:</span>
                                                          <span className="text-slate-600 italic">"{v.usage}"</span>
                                                       </div>
                                                    )}
                                                 </div>
                                              ))}
                                           </div>
                                        </div>

                                                                                {/* COLUMN 2: TỪ VỰNG MỞ RỘNG */}
                                        <div className="space-y-4">
                                           <div className="flex items-center justify-between px-2">
                                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                 <Sparkles className="w-4 h-4 text-orange-500" /> Từ vựng mở rộng
                                              </h3>
                                              <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Mở rộng</span>
                                           </div>
                                           <div className="space-y-4">
                                              {(activeLesson?.content_json?.extended_vocabulary && activeLesson.content_json.extended_vocabulary.length > 0
                                                 ? activeLesson.content_json.extended_vocabulary
                                                 : [
                                                      { id: 'ext-1', hanzi: '不良品', pinyin: 'bùliángpǐn', meaning: 'Sản phẩm lỗi, phế phẩm', usage: '发现不良品立即停止作业。 (Phát hiện phế phẩm ngưng thao tác ngay.)' },
                                                      { id: 'ext-2', hanzi: '修机', pinyin: 'xiūjī', meaning: 'Sửa chữa máy móc', usage: '通知技术员来修机。 (Thông báo kỹ thuật viên đến sửa máy.)' },
                                                      { id: 'ext-3', hanzi: '加班', pinyin: 'jiābān', meaning: 'Tăng ca', usage: '今天晚上 cần tăng ca hai tiếng. (Tối nay cần tăng ca hai tiếng.)' },
                                                      { id: 'ext-4', hanzi: '技术员', pinyin: 'jìshùyuán', meaning: 'Kỹ thuật viên', usage: '请技术员檢查機器。 (Mời kỹ thuật viên kiểm tra máy móc.)' }
                                                   ]
                                              ).map((v: any, i: number) => (
                                                 <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-orange-500/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50/10 rounded-full blur-xl pointer-events-none" />
                                                    
                                                    <div className="space-y-2 relative z-10">
                                                       <div className="flex justify-between items-start">
                                                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Mở rộng #{i+1}</span>
                                                          <button 
                                                             onClick={() => { 
                                                                const u = new SpeechSynthesisUtterance(v.hanzi); 
                                                                u.lang = 'zh-CN'; 
                                                                u.rate = 0.75; 
                                                                speechSynthesis.speak(u); 
                                                             }} 
                                                             className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                                                          >
                                                             <Volume2 className="w-3.5 h-3.5" />
                                                          </button>
                                                       </div>
                                                       <div>
                                                          <div className="text-2xl font-black text-slate-900 group-hover:text-orange-500 transition-colors">{v.hanzi}</div>
                                                          <div className="text-[9px] font-mono text-slate-400 mt-0.5">{v.pinyin}</div>
                                                       </div>
                                                       <div className="text-xs font-black text-orange-500">{v.meaning || v.mean || ''}</div>
                                                    </div>

                                                    <div className="mt-3 pt-2.5 border-t border-slate-50 text-[9px] text-slate-500 font-medium">
                                                       <span className="text-[7px] font-black uppercase text-slate-300 block mb-0.5">Cách dùng:</span>
                                                       <span className="text-slate-600 italic">"{v.usage}"</span>
                                                    </div>
                                                 </div>
                                              ))}
                                           </div>
                                        </div>

                                                                                {/* COLUMN 3: CẤU TRÚC NGỮ PHÁP */}
                                        <div className="space-y-4">
                                           <div className="flex items-center justify-between px-2">
                                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                 <Zap className="w-4 h-4 text-[#2E3192]" /> Cấu trúc ngữ pháp
                                              </h3>
                                              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Cấu trúc</span>
                                           </div>
                                           
                                           <div className="space-y-4">
                                              {(activeLesson?.content_json?.grammar && activeLesson.content_json.grammar.length > 0
                                                 ? activeLesson.content_json.grammar
                                                 : [
                                                      {
                                                         title: 'Bổ ngữ kết quả: V + 完 + 了',
                                                         note: 'Trong môi trường nhà máy, hoàn thành là ưu tiên tối thượng. Sử dụng trợ từ 完 (xong) ngay sau động từ để báo cáo nhanh kết quả.',
                                                         formula_json: { verb: '做 (zuò)', complement: '完 (wán)', particles: '了 (le)', result: '做完了' }
                                                      }
                                                   ]
                                              ).map((g: any, i: number) => (
                                                 <div key={i} className="bg-slate-950 text-white p-6 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group h-fit">
                                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
                                                    <div className="space-y-4 relative z-10">
                                                       <div className="flex items-center justify-between">
                                                          <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 text-orange-400">Ngữ pháp cốt tủy</span>
                                                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sơ đồ cấu trúc</span>
                                                       </div>
                                                       <h4 className="text-sm font-black italic text-white flex items-center gap-1.5">
                                                          <Zap className="w-4 h-4 text-orange-400 fill-current" /> {g.title}
                                                       </h4>
                                                       <p className="text-white/60 text-[11px] leading-relaxed">
                                                          {g.note}
                                                       </p>
                                                       {g.formula_json && (
                                                          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-center text-xs font-black">
                                                             <div>
                                                                <div className="text-white">{g.formula_json.verb || 'V'}</div>
                                                                <div className="text-[7px] text-white/30 uppercase mt-0.5">Động từ</div>
                                                             </div>
                                                             <span className="text-orange-400">+</span>
                                                             <div>
                                                                <div className="text-orange-400">{g.formula_json.complement || 'C'}</div>
                                                                <div className="text-[7px] text-white/30 uppercase mt-0.5">Bổ ngữ</div>
                                                             </div>
                                                             <span className="text-orange-400">+</span>
                                                             <div>
                                                                <div className="text-white">{g.formula_json.particles || 'P'}</div>
                                                                <div className="text-[7px] text-white/30 uppercase mt-0.5">Trợ từ</div>
                                                             </div>
                                                             <span className="text-orange-400">=</span>
                                                             <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">{g.formula_json.result || 'R'}</div>
                                                          </div>
                                                       )}
                                                    </div>
                                                 </div>
                                              ))}
                                           </div>
                                        </div>
                                     </motion.div>
                                  ) : (
                                    <motion.div 
                                       key="general"
                                       initial={{ opacity: 0, y: 10 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, y: -10 }}
                                       transition={{ duration: 0.3 }}
                                       className="space-y-8"
                                    >
                                       {/* Bento Grid */}
                                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                          
                                          {/* BENTO CARD 1: SOP TIMELINE (Size 2x1) */}
                                          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-[#2E3192]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/10 rounded-full blur-2xl pointer-events-none" />
                                             <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                      <Activity className="w-5 h-5 text-indigo-600" /> Sơ đồ vận hành chuẩn SOP (标准作业程序)
                                                   </h4>
                                                   <span className="px-2.5 py-1 bg-indigo-50 text-[#2E3192] text-[8px] font-black uppercase tracking-widest rounded-lg">Factory Flow</span>
                                                </div>
                                                
                                                {/* Stepped Timeline */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                                                   {/* Connecting line for desktop */}
                                                   <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-slate-100 z-0" />
                                                   
                                                   {GENERAL_KNOWLEDGE_MOCKS.sop.map((item, idx) => (
                                                      <div key={idx} className="relative z-10 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-[#2E3192]/20 transition-all text-center md:text-left space-y-2">
                                                         <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 text-[#2E3192] font-black text-xs flex items-center justify-center mx-auto md:mx-0 shadow-sm group-hover:scale-105 transition-transform">
                                                            {item.step}
                                                         </div>
                                                         <div>
                                                            <p className="text-xs font-black text-slate-900 leading-none">{item.title}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.eng}</p>
                                                         </div>
                                                         <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>

                                          {/* BENTO CARD 2: Industrial Acronym Glossary (Size 1x1) */}
                                          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-[#2E3192]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                             <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                      <Info className="w-5 h-5 text-orange-500" /> Thuật ngữ chuyên ngành viết tắt
                                                   </h4>
                                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Từ điển xưởng</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                   {GENERAL_KNOWLEDGE_MOCKS.abbreviations.map((item, idx) => (
                                                      <div 
                                                         key={idx} 
                                                         onClick={() => {
                                                            const u = new SpeechSynthesisUtterance(item.cn);
                                                            u.lang = 'zh-CN';
                                                            u.rate = 0.8;
                                                            speechSynthesis.speak(u);
                                                         }}
                                                         className="p-3 bg-slate-50/50 hover:bg-[#2E3192]/5 rounded-xl border border-slate-100 hover:border-[#2E3192]/10 cursor-pointer transition-all space-y-1 text-left relative group/item"
                                                         title="Bấm để nghe"
                                                      >
                                                         <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-[#2E3192]">{item.acronym}</span>
                                                            <Volume2 className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-[#2E3192] transition-colors" />
                                                         </div>
                                                         <p className="text-[9px] font-black text-slate-800 truncate">{item.cn}</p>
                                                         <p className="text-[8px] font-bold text-slate-400 leading-tight line-clamp-1">{item.vi}</p>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>

                                          {/* BENTO CARD 3: Technology Application Tips (Size 2x1) */}
                                          <div className="lg:col-span-2 bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white p-6 md:p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                                             <div className="relative z-10 space-y-6">
                                                <div className="flex items-center justify-between">
                                                   <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                                                      <Cpu className="w-5 h-5 text-orange-400 animate-pulse" /> Tips Ứng Dụng Công Nghệ Thông Minh (智能技术应用)
                                                   </h4>
                                                   <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-orange-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Tech Zen</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                   {GENERAL_KNOWLEDGE_MOCKS.tech_tips.map((tip, idx) => (
                                                      <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-3 hover:bg-white/10 transition-colors">
                                                         <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                                            {idx === 0 ? <Smartphone className="w-4 h-4" /> : idx === 1 ? <AudioLines className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                                                         </div>
                                                         <h5 className="text-[11px] font-black text-white leading-snug">{tip.title}</h5>
                                                         <p className="text-[10px] text-slate-300 font-medium leading-relaxed">{tip.desc}</p>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>

                                          {/* BENTO CARD 4: AI Context Prompt (Size 1x1) */}
                                          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-[#2E3192]/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                                             <div className="space-y-4 relative z-10">
                                                <div className="flex items-center justify-between">
                                                   <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-white">
                                                      <Bot className="w-4.5 h-4.5 text-orange-400" /> AI Copilot Hỏi Đáp
                                                   </h4>
                                                   <span className="text-[7px] font-black text-orange-400 uppercase tracking-widest">Hỏi AI nhanh</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                                   Nhấn vào các chủ đề dưới đây để yêu cầu **AI Mentor** giải thích chi tiết và đưa ra thêm ví dụ thực tế:
                                                </p>
                                                <div className="space-y-2.5">
                                                   {GENERAL_KNOWLEDGE_MOCKS.questions.map((q, idx) => (
                                                      <button
                                                         key={idx}
                                                         onClick={() => askAiMentorDirectly(q.prompt)}
                                                         className="w-full text-left p-3 bg-white/5 border border-white/10 hover:bg-[#2E3192]/20 hover:border-[#2E3192]/30 rounded-xl transition-all text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-between group/btn"
                                                      >
                                                         <span className="truncate pr-4">{q.text}</span>
                                                         <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-orange-400 group-hover/btn:translate-x-0.5 transition-all shrink-0" />
                                                      </button>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>

                                          {/* BENTO CARD 5: Rules of Communication (Size 3x1) */}
                                          <div className="lg:col-span-3 bg-[#2E3192] p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                             <div className="absolute inset-0 bg-gradient-to-tr from-[#2E3192] to-indigo-900 opacity-60" />
                                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                                             <div className="relative z-10 space-y-6">
                                                <div className="flex items-center justify-between">
                                                   <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                                                      <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" /> 3 Quy tắc vàng giao tiếp với sếp người Hoa
                                                   </h4>
                                                   <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-orange-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Etiquette</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                   {GENERAL_KNOWLEDGE_MOCKS.rules.map((rule, idx) => (
                                                      <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-2 hover:bg-white/10 transition-colors">
                                                         <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                                            {idx === 0 ? <GraduationCap className="w-4 h-4" /> : idx === 1 ? <Zap className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                                                         </div>
                                                         <h5 className="text-[11px] font-black text-white">{rule.title}</h5>
                                                         <p className="text-[10px] text-slate-300 font-medium leading-relaxed">{rule.desc}</p>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>

                                       </div>
                                    </motion.div>
                                 )}
                              </AnimatePresence>
                           </motion.div>
                        )}

                        {/* ZONE 2: CLASSROOM */}
                        {activeZone === 'zone2' && (
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                 {/* Column 1-3: Video and Lecture Activities */}
                                 <div className="lg:col-span-3 space-y-6">
                                    {/* Video player mock terminal */}
                                    <div className="bg-slate-950 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl relative">
                                       {/* Player Header console */}
                                       <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                                          <div className="flex items-center gap-2.5">
                                             <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                             <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">LIVE CLASSROOM / MÔ PHỎNG TRỰC TUYẾN</p>
                                          </div>
                                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Theater Mode</span>
                                       </div>
                                       
                                       <div className="aspect-video bg-black relative">
                                          <iframe src={getEmbedUrl(activeLesson.content_url)} className="w-full h-full" allowFullScreen />
                                       </div>

                                       {/* Player Bottom Control Tab */}
                                       <div className="p-4 bg-slate-900 border-t border-slate-800">
                                          <div className="flex items-center justify-center gap-1 p-1 bg-slate-950 rounded-2xl w-fit mx-auto border border-slate-800">
                                             {[
                                                { id: 'understand', label: 'Thấu hiểu' },
                                                { id: 'practice', label: 'Rèn luyện' },
                                                { id: 'apply', label: 'Ứng dụng' }
                                             ].map(tab => (
                                                <button 
                                                   key={tab.id} 
                                                   onClick={() => setActiveTab(tab.id as any)} 
                                                   className={`px-6 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#2E3192] text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                   {tab.label}
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Active Tab contents */}
                                    <div className="min-h-[300px]">
                                       {activeTab === 'understand' && (
                                          <div className="space-y-6">
                                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mẫu câu trọng tâm bài học (重难点句子)</h3>
                                                
                                                {/* Mode Toggle Switch */}
                                                 <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit shrink-0 gap-1 sm:gap-0">
                                                    <button 
                                                       type="button"
                                                       onClick={() => setUnderstandMode('list')}
                                                       className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${understandMode === 'list' ? 'bg-[#2E3192] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                                                    >
                                                       Danh sách câu
                                                    </button>
                                                    <button 
                                                       type="button"
                                                       onClick={() => setUnderstandMode('flashcard')}
                                                       className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${understandMode === 'flashcard' ? 'bg-[#2E3192] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                                                    >
                                                       Thẻ Mẫu Câu
                                                    </button>
                                                    <button 
                                                       type="button"
                                                       onClick={() => setUnderstandMode('srs')}
                                                       className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${understandMode === 'srs' ? 'bg-[#2E3192] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'} flex items-center gap-1`}
                                                    >
                                                       <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" /> Từ vựng SRS
                                                    </button>
                                                 </div>
                                             </div>
                                             
                                             {understandMode === 'list' && (
                                                 <div className="space-y-4">
                                                    {(activeLesson?.content_json?.key_sentences || []).map((s: any, idx: number) => {
                                                       const isRecording = recordingIndex === idx;
                                                       const hasResult = voiceAnalysisResult && voiceAnalysisResult.index === idx;
                                                       
                                                       return (
                                                          <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 group hover:border-[#2E3192]/20 hover:shadow-md transition-all relative overflow-hidden">
                                                             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2E3192]/10 group-hover:bg-[#2E3192] transition-colors" />
                                                             
                                                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                                                                <div className="space-y-2">
                                                                   <div className="flex items-center gap-2">
                                                                      <span className="w-5 h-5 rounded-lg bg-indigo-50 text-[#2E3192] font-black text-[9px] flex items-center justify-center">0{idx + 1}</span>
                                                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mẫu câu cốt lõi</p>
                                                                   </div>
                                                                   <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{s.zh}</h4>
                                                                   <p className="text-xs font-bold text-indigo-500 font-mono">({s.pinyin})</p>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                                                   <button 
                                                                      type="button"
                                                                      onClick={() => {
                                                                         const u = new SpeechSynthesisUtterance(s.zh);
                                                                         u.lang = 'zh-CN';
                                                                         u.rate = 0.8;
                                                                         speechSynthesis.speak(u);
                                                                      }}
                                                                      className="w-12 h-12 rounded-2xl bg-indigo-50 hover:bg-[#2E3192] text-[#2E3192] hover:text-white transition-all flex items-center justify-center border border-indigo-100/50"
                                                                      title="Nghe phát âm chuẩn"
                                                                   >
                                                                      <Volume2 className="w-5 h-5" />
                                                                   </button>
                                                                   
                                                                   <button 
                                                                      type="button"
                                                                      onClick={() => handleVoiceChallenge(s.zh, idx)}
                                                                      disabled={isRecording}
                                                                      className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center border ${
                                                                         isRecording 
                                                                            ? 'bg-red-500 text-white animate-pulse border-red-500' 
                                                                            : 'bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border-emerald-100/50'
                                                                      }`}
                                                                      title="Luyện nói AI"
                                                                   >
                                                                      {isRecording ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                                                                   </button>
                                                                </div>
                                                             </div>
                                                             
                                                             <div className="pl-2 space-y-2 border-t border-slate-100/50 pt-4">
                                                                <span className="text-[8px] font-black text-[#2E3192] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Giải nghĩa tiếng Việt</span>
                                                                <p className="text-slate-600 text-sm font-semibold tracking-tight italic">"{s.vi}"</p>
                                                             </div>
                                                             
                                                             {hasResult && voiceAnalysisResult && (
                                                                <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2 animate-in slide-in-from-top-2">
                                                                   <div className="flex items-center justify-between">
                                                                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Kết quả phân tích giọng nói AI</span>
                                                                      <span className="text-xs font-black text-emerald-600 bg-white px-2.5 py-0.5 rounded-lg shadow-sm">Độ chính xác: {voiceAnalysisResult.score}%</span>
                                                                   </div>
                                                                   <p className="text-[11px] font-bold text-emerald-950 leading-relaxed">{voiceAnalysisResult.feedback}</p>
                                                                </div>
                                                             )}
                                                          </div>
                                                       );
                                                    })}
                                                 </div>
                                              )}
                                              
                                              {understandMode === 'flashcard' && activeLesson?.content_json?.key_sentences && activeLesson.content_json.key_sentences.length > 0 && (
                                                 <div className="max-w-xl mx-auto space-y-6 animate-in fade-in-50">
                                                    <div 
                                                       onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                                                       className="relative w-full aspect-[5/3] cursor-pointer group"
                                                       style={{ perspective: '1000px' }}
                                                    >
                                                       <div 
                                                          className="relative w-full h-full text-center"
                                                          style={{ 
                                                             transformStyle: 'preserve-3d', 
                                                             transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                             transform: isFlashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                                          }}
                                                       >
                                                          <div 
                                                             className="absolute inset-0 bg-[#2E3192] text-white p-8 md:p-12 rounded-[2.5rem] border border-indigo-700 shadow-2xl flex flex-col justify-between overflow-hidden"
                                                             style={{ backfaceVisibility: 'hidden' }}
                                                          >
                                                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                                             <div className="flex items-center justify-between w-full">
                                                                <span className="px-3 py-1 bg-white/10 border border-white/20 text-orange-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Thẻ {flashcardIndex + 1}/{activeLesson.content_json.key_sentences.length}</span>
                                                                <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                                                             </div>
                                                             <div className="my-auto">
                                                                <h4 className="text-2xl md:text-3xl font-black tracking-tight leading-tight select-all">
                                                                   {activeLesson.content_json.key_sentences[flashcardIndex].zh}
                                                                </h4>
                                                             </div>
                                                             <div className="flex items-center justify-between w-full">
                                                                <button 
                                                                   type="button"
                                                                   onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      const u = new SpeechSynthesisUtterance(activeLesson.content_json.key_sentences[flashcardIndex].zh);
                                                                      u.lang = 'zh-CN';
                                                                      u.rate = 0.8;
                                                                      speechSynthesis.speak(u);
                                                                   }}
                                                                   className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center border border-white/10"
                                                                   title="Phát âm"
                                                                >
                                                                   <Volume2 className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest animate-pulse">Nhấp để lật thẻ xem phiên âm & ý nghĩa</span>
                                                             </div>
                                                          </div>

                                                          <div 
                                                             className="absolute inset-0 bg-white text-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl flex flex-col justify-between overflow-hidden"
                                                             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                          >
                                                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                                             <div className="flex items-center justify-between w-full">
                                                                <span className="px-3 py-1 bg-indigo-50 text-[#2E3192] text-[8px] font-black uppercase tracking-widest rounded-lg">Lời Giải Nghĩa</span>
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                             </div>
                                                             <div className="my-auto space-y-4">
                                                                <p className="text-sm font-bold text-indigo-600 font-mono">
                                                                   {activeLesson.content_json.key_sentences[flashcardIndex].pinyin}
                                                                </p>
                                                                <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-relaxed italic">
                                                                   "{activeLesson.content_json.key_sentences[flashcardIndex].vi}"
                                                                </h4>
                                                             </div>
                                                             <div className="flex items-center justify-between w-full">
                                                                <button 
                                                                   type="button"
                                                                   onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      const u = new SpeechSynthesisUtterance(activeLesson.content_json.key_sentences[flashcardIndex].zh);
                                                                      u.lang = 'zh-CN';
                                                                      u.rate = 0.8;
                                                                      speechSynthesis.speak(u);
                                                                   }}
                                                                   className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#2E3192] transition-all flex items-center justify-center border border-indigo-100"
                                                                   title="Phát âm"
                                                                >
                                                                   <Volume2 className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Nhấp để xem Chữ Hán</span>
                                                             </div>
                                                          </div>
                                                       </div>
                                                    </div>

                                                    <div className="flex items-center justify-between px-4">
                                                       <button 
                                                          type="button"
                                                          onClick={() => {
                                                             setIsFlashcardFlipped(false);
                                                             setFlashcardIndex(prev => Math.max(0, prev - 1));
                                                          }}
                                                          disabled={flashcardIndex === 0}
                                                          className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-wider flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-40"
                                                       >
                                                          <ChevronLeft className="w-3.5 h-3.5" /> Trở lại
                                                       </button>
                                                       <span className="text-[10px] font-black text-slate-500 uppercase font-mono">
                                                          Thẻ {flashcardIndex + 1} / {activeLesson.content_json.key_sentences.length}
                                                       </span>
                                                       <button 
                                                          type="button"
                                                          onClick={() => {
                                                             setIsFlashcardFlipped(false);
                                                             setFlashcardIndex(prev => Math.min(activeLesson.content_json.key_sentences.length - 1, prev + 1));
                                                          }}
                                                          disabled={flashcardIndex === activeLesson.content_json.key_sentences.length - 1}
                                                          className="px-5 py-3 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-2 hover:bg-[#2E3192] transition-all disabled:opacity-40"
                                                       >
                                                          Tiếp theo <ChevronRight className="w-3.5 h-3.5" />
                                                       </button>
                                                    </div>
                                                 </div>
                                              )}

                                              {understandMode === 'srs' && (() => {
                                                 if (!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0) {
                                                    return (
                                                       <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-4 max-w-xl mx-auto">
                                                          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                                                             <BookOpen className="w-8 h-8" />
                                                          </div>
                                                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Không có từ vựng</h4>
                                                          <p className="text-[10px] text-slate-400">Bài học này chưa được cấu hình từ vựng để học SRS.</p>
                                                       </div>
                                                    );
                                                 }

                                                 if (srsSessionCompleted) {
                                                    return (
                                                       <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95">
                                                          <div className="w-20 h-20 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                                             <Trophy className="w-10 h-10" />
                                                          </div>
                                                          <div className="space-y-2">
                                                             <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Xuất Sắc!</h3>
                                                             <p className="text-[9px] md:text-xs text-indigo-300 font-bold uppercase tracking-widest">Bạn đã hoàn thành phiên học từ vựng Spaced Repetition (SRS)</p>
                                                          </div>
                                                          
                                                          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4">
                                                             <div className="text-center space-y-1">
                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Từ vựng đã học</span>
                                                                <p className="text-2xl font-black text-emerald-400">{srsMasteredCount} Từ</p>
                                                             </div>
                                                             <div className="text-center space-y-1">
                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">XP Thưởng</span>
                                                                <p className="text-2xl font-black text-orange-400">+{srsMasteredCount * 5} XP</p>
                                                             </div>
                                                          </div>

                                                          <p className="text-[10px] text-slate-400 italic">Các từ vựng đã được lên lịch ôn tập tiếp theo dựa trên độ dễ/khó bạn đã đánh giá.</p>
                                                          
                                                          <button 
                                                             type="button"
                                                             onClick={() => {
                                                                const indices = Array.from({ length: activeLesson.content_json.vocabulary.length }, (_, i) => i);
                                                                setSrsQueue(indices);
                                                                setSrsVocabIndex(0);
                                                                setIsSrsCardFlipped(false);
                                                                setSrsSessionCompleted(false);
                                                                setSrsMasteredCount(0);
                                                             }}
                                                             className="w-full py-4 bg-[#2E3192] hover:bg-indigo-650 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                                                          >
                                                             Học lại / Ôn tập tiếp
                                                          </button>
                                                       </div>
                                                    );
                                                 }

                                                 const currentWordIdx = srsQueue[srsVocabIndex];
                                                 const currentWord = activeLesson.content_json.vocabulary[currentWordIdx];
                                                 if (currentWordIdx === undefined || !currentWord) {
                                                    return (
                                                       <div className="text-center py-8">
                                                          <button 
                                                             type="button"
                                                             onClick={() => setSrsSessionCompleted(true)}
                                                             className="px-6 py-3 bg-[#2E3192] text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                                                          >
                                                             Xem Kết Quả SRS
                                                          </button>
                                                       </div>
                                                    );
                                                 }

                                                 return (
                                                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in-50">
                                                       <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                          <span>Đang học: {srsMasteredCount} / {activeLesson.content_json.vocabulary.length} từ</span>
                                                          <span>Hàng chờ SRS: {srsQueue.length} từ</span>
                                                       </div>
                                                       
                                                       <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                          <div 
                                                             className="bg-indigo-600 h-full transition-all duration-300"
                                                             style={{ width: `${(srsMasteredCount / activeLesson.content_json.vocabulary.length) * 100}%` }}
                                                          />
                                                       </div>

                                                       <div 
                                                          onClick={() => setIsSrsCardFlipped(!isSrsCardFlipped)}
                                                          className="relative w-full aspect-[5/3] cursor-pointer group"
                                                          style={{ perspective: '1000px' }}
                                                       >
                                                          <div 
                                                             className="relative w-full h-full text-center"
                                                             style={{ 
                                                                transformStyle: 'preserve-3d', 
                                                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                transform: isSrsCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                                             }}
                                                          >
                                                             <div 
                                                                className="absolute inset-0 bg-[#2E3192] text-white p-8 md:p-12 rounded-[2.5rem] border border-indigo-700 shadow-2xl flex flex-col justify-between overflow-hidden"
                                                                style={{ backfaceVisibility: 'hidden' }}
                                                             >
                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                                                <div className="flex items-center justify-between w-full">
                                                                   <span className="px-3 py-1 bg-white/10 border border-white/20 text-orange-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Thẻ Từ Vựng SRS</span>
                                                                   <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                                                                </div>
                                                                
                                                                <div className="my-auto space-y-2">
                                                                   <h4 className="text-4xl md:text-5xl font-black tracking-tight leading-tight select-all">
                                                                      {currentWord.hanzi || currentWord.word}
                                                                   </h4>
                                                                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Nhấp để lật thẻ xem phiên âm & ý nghĩa</p>
                                                                </div>
                                                                
                                                                <div className="flex items-center justify-between w-full">
                                                                   <button 
                                                                      type="button"
                                                                      onClick={(e) => {
                                                                         e.stopPropagation();
                                                                         const u = new SpeechSynthesisUtterance(currentWord.hanzi || currentWord.word);
                                                                         u.lang = 'zh-CN';
                                                                         u.rate = 0.8;
                                                                         speechSynthesis.speak(u);
                                                                      }}
                                                                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center border border-white/10"
                                                                      title="Phát âm"
                                                                   >
                                                                      <Volume2 className="w-4 h-4" />
                                                                   </button>
                                                                   <span className="text-[8px] font-black text-slate-405 uppercase tracking-widest">ToxiEdu SRS</span>
                                                                </div>
                                                             </div>

                                                             <div 
                                                                className="absolute inset-0 bg-white text-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl flex flex-col justify-between overflow-hidden"
                                                                style={{ 
                                                                   backfaceVisibility: 'hidden',
                                                                   transform: 'rotateY(180deg)'
                                                                }}
                                                             >
                                                                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -ml-10 -mt-10 pointer-events-none" />
                                                                <div className="flex items-center justify-between w-full">
                                                                   <span className="px-3 py-1 bg-indigo-50 text-[#2E3192] text-[8px] font-black uppercase tracking-widest rounded-lg">Ý nghĩa & Cách dùng</span>
                                                                   <button 
                                                                      type="button"
                                                                      onClick={(e) => {
                                                                         e.stopPropagation();
                                                                         const u = new SpeechSynthesisUtterance(currentWord.hanzi || currentWord.word);
                                                                         u.lang = 'zh-CN';
                                                                         u.rate = 0.8;
                                                                         speechSynthesis.speak(u);
                                                                      }}
                                                                      className="w-8 h-8 rounded-lg bg-indigo-50 text-[#2E3192] transition-all flex items-center justify-center hover:bg-indigo-100"
                                                                   >
                                                                      <Volume2 className="w-3.5 h-3.5" />
                                                                   </button>
                                                                </div>

                                                                <div className="my-auto space-y-3">
                                                                   <h4 className="text-3xl font-black text-slate-900">{currentWord.hanzi || currentWord.word}</h4>
                                                                   <div>
                                                                      <p className="text-xs font-black text-indigo-600 font-mono tracking-wide">{currentWord.pinyin}</p>
                                                                      <p className="text-sm font-black text-slate-800 mt-1">{currentWord.meaning || currentWord.mean}</p>
                                                                   </div>
                                                                   {currentWord.usage && (
                                                                      <p className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 text-left italic">
                                                                         Ví dụ: {currentWord.usage}
                                                                      </p>
                                                                   )}
                                                                </div>

                                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ToxiEdu SRS</span>
                                                             </div>
                                                          </div>
                                                       </div>

                                                       <div className="space-y-3 animate-in fade-in-50 duration-500">
                                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Đánh giá mức độ ghi nhớ để lên lịch ôn tập:</p>
                                                          <div className="grid grid-cols-4 gap-2">
                                                             <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                   e.stopPropagation();
                                                                   const nextQueue = [...srsQueue];
                                                                   const currentItem = nextQueue.splice(srsVocabIndex, 1)[0];
                                                                   nextQueue.push(currentItem);
                                                                   setSrsQueue(nextQueue);
                                                                   setIsSrsCardFlipped(false);
                                                                   if (srsVocabIndex >= nextQueue.length) {
                                                                      setSrsVocabIndex(0);
                                                                   }
                                                                }}
                                                                className="py-3 px-1 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-[9px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 shadow-sm active:scale-95"
                                                             >
                                                                <span className="text-sm">🔴</span> Quên
                                                                <span className="text-[7px] text-red-400 font-bold normal-case">Gặp lại ngay</span>
                                                             </button>

                                                             <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                   e.stopPropagation();
                                                                   const nextQueue = [...srsQueue];
                                                                   const currentItem = nextQueue.splice(srsVocabIndex, 1)[0];
                                                                   const insertIndex = Math.min(3, nextQueue.length);
                                                                   nextQueue.splice(insertIndex, 0, currentItem);
                                                                   setSrsQueue(nextQueue);
                                                                   setIsSrsCardFlipped(false);
                                                                   if (srsVocabIndex >= nextQueue.length) {
                                                                      setSrsVocabIndex(0);
                                                                   }
                                                                }}
                                                                className="py-3 px-1 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 font-black text-[9px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 shadow-sm active:scale-95"
                                                             >
                                                                <span className="text-sm">🟡</span> Khó
                                                                <span className="text-[7px] text-orange-400 font-bold normal-case">Lặp lại sớm</span>
                                                             </button>

                                                             <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                   e.stopPropagation();
                                                                   const nextQueue = [...srsQueue];
                                                                   nextQueue.splice(srsVocabIndex, 1);
                                                                   setSrsQueue(nextQueue);
                                                                   setSrsMasteredCount(prev => prev + 1);
                                                                   setIsSrsCardFlipped(false);
                                                                   if (nextQueue.length === 0) {
                                                                      setSrsSessionCompleted(true);
                                                                   } else if (srsVocabIndex >= nextQueue.length) {
                                                                      setSrsVocabIndex(0);
                                                                   }
                                                                }}
                                                                className="py-3 px-1 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 font-black text-[9px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 shadow-sm active:scale-95"
                                                             >
                                                                <span className="text-sm">🟢</span> Nhớ
                                                                <span className="text-[7px] text-emerald-400 font-bold normal-case">Lưu tiến độ</span>
                                                             </button>

                                                             <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                   e.stopPropagation();
                                                                   const nextQueue = [...srsQueue];
                                                                   nextQueue.splice(srsVocabIndex, 1);
                                                                   setSrsQueue(nextQueue);
                                                                   setSrsMasteredCount(prev => prev + 1);
                                                                   setIsSrsCardFlipped(false);
                                                                   if (nextQueue.length === 0) {
                                                                      setSrsSessionCompleted(true);
                                                                   } else if (srsVocabIndex >= nextQueue.length) {
                                                                      setSrsVocabIndex(0);
                                                                   }
                                                                }}
                                                                className="py-3 px-1 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 font-black text-[9px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 shadow-sm active:scale-95"
                                                             >
                                                                <span className="text-sm">🔵</span> Thuộc
                                                                <span className="text-[7px] text-indigo-400 font-bold normal-case">Thuần thục</span>
                                                             </button>
                                                          </div>
                                                       </div>
                                                    </div>
                                                 );
                                              })()}
                                           </div>
                                        )}
                                       
                                       {activeTab === 'practice' && (
                                          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden animate-in zoom-in-98">
                                             {quizCompleted ? (
                                                <div className="space-y-8 animate-in zoom-in-95 text-center py-4">
                                                   <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner mb-6 relative">
                                                      <Trophy className="w-12 h-12 animate-bounce" />
                                                      <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                         Hoàn tất
                                                      </div>
                                                   </div>

                                                   <div className="max-w-md mx-auto space-y-2">
                                                      <h3 className="text-2xl font-black text-slate-900 uppercase">Hoàn Thành Thử Thách!</h3>
                                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                                         Bạn đã xuất sắc chinh phục tất cả câu hỏi ôn luyện trong bài học hôm nay!
                                                      </p>
                                                   </div>

                                                   {/* Score summary panel */}
                                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tỷ lệ chính xác</span>
                                                         <p className="text-3xl font-black text-[#2E3192]">
                                                            {exercises.length > 0 ? Math.round((practiceScores.filter(s => s).length / exercises.length) * 100) : 0}%
                                                         </p>
                                                         <span className="text-[10px] font-bold text-slate-500">
                                                            ({practiceScores.filter(s => s).length} / {exercises.length} câu đúng)
                                                         </span>
                                                      </div>
                                                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Điểm kinh nghiệm</span>
                                                         <p className="text-3xl font-black text-emerald-600">
                                                            +{practiceScores.filter(s => s).length * 25} XP
                                                         </p>
                                                         <span className="text-[10px] font-bold text-slate-500">
                                                            Tích lũy vào tài khoản
                                                         </span>
                                                      </div>
                                                   </div>

                                                   {/* Detailed evaluation list */}
                                                   <div className="max-w-lg mx-auto bg-slate-50/50 border border-slate-100 rounded-3xl p-6 text-left space-y-4">
                                                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chi tiết câu trả lời:</h4>
                                                      <div className="space-y-3">
                                                         {exercises.map((item: any, i: number) => (
                                                            <div key={i} className="flex items-start justify-between gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                                                               <div className="space-y-1">
                                                                  <p className="text-xs font-black text-slate-800 line-clamp-1">
                                                                     {i + 1}. {item.question}
                                                                  </p>
                                                                  <p className="text-[10px] font-bold text-indigo-500">
                                                                     Đáp án đúng: {item.options ? item.options[item.correctIndex] : ''}
                                                                  </p>
                                                               </div>
                                                               <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg shrink-0 ${practiceScores[i] ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                                  {practiceScores[i] ? 'Đúng' : 'Sai'}
                                                               </span>
                                                            </div>
                                                         ))}
                                                      </div>
                                                   </div>

                                                   {/* Action buttons */}
                                                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto pt-4 border-t border-slate-100">
                                                      <button 
                                                         onClick={() => {
                                                            setCurrentExIdx(0);
                                                            setSelectedOpt(null);
                                                            setShowExplain(false);
                                                            setQuizCompleted(false);
                                                            setPracticeScores([]);
                                                         }}
                                                         className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                                                      >
                                                         Luyện tập lại
                                                      </button>
                                                      <button 
                                                         onClick={() => setActiveTab('apply')}
                                                         className="w-full sm:w-auto px-8 py-3.5 bg-[#2E3192] hover:bg-[#2E3192]/95 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all"
                                                      >
                                                         Chuyển sang Ứng dụng
                                                      </button>
                                                   </div>
                                                </div>
                                             ) : (
                                                <div className="space-y-8">
                                                   {/* Accent header */}
                                                   <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                                      <div className="space-y-1">
                                                         <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Thử thách {currentExIdx + 1}/{exercises.length}</span>
                                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trắc nghiệm thực tế</p>
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                         {exercises.map((_, i) => (
                                                            <span key={i} className={`w-6 h-1.5 rounded-full transition-all ${i === currentExIdx ? 'bg-[#2E3192] w-8' : i < currentExIdx ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                                         ))}
                                                      </div>
                                                   </div>
                                                   
                                                   <div className="space-y-3">
                                                      <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight whitespace-pre-line">{ex?.question}</h3>
                                                   </div>
                                                   
                                                   <div className="grid grid-cols-1 gap-4">
                                                      {ex?.options?.map((opt: string, i: number) => {
                                                         const isCorrect = i === ex.correctIndex;
                                                         const isSelected = selectedOpt === i;
                                                         
                                                         let btnStyle = "bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-slate-100/50";
                                                         if (showExplain) {
                                                            if (isCorrect) {
                                                               btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/10";
                                                            } else if (isSelected) {
                                                               btnStyle = "bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-500/10";
                                                            } else {
                                                               btnStyle = "opacity-40 border-slate-100 bg-slate-50";
                                                            }
                                                         } else if (isSelected) {
                                                            btnStyle = "bg-[#2E3192] text-white border-[#2E3192] shadow-xl shadow-indigo-500/20";
                                                         }
                                                         
                                                         return (
                                                            <button 
                                                               key={i} 
                                                               onClick={() => !showExplain && setSelectedOpt(i)} 
                                                               className={`w-full p-6 rounded-2xl border-2 text-left text-sm md:text-base font-black transition-all flex items-center justify-between ${btnStyle}`}
                                                            >
                                                               <span>{opt}</span>
                                                               {showExplain && isCorrect && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
                                                               {showExplain && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0" />}
                                                            </button>
                                                         );
                                                      })}
                                                   </div>
                                                   
                                                   {/* Explanation block */}
                                                   {showExplain && ex?.explain && (
                                                      <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 animate-in slide-in-from-bottom-2">
                                                         <h5 className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest">Giải thích đáp án:</h5>
                                                         <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{ex.explain}</p>
                                                      </div>
                                                   )}
                                                   
                                                   <div className="flex justify-end pt-4 border-t border-slate-50">
                                                      {!showExplain ? (
                                                         <button 
                                                            onClick={() => { 
                                                               setShowExplain(true); 
                                                               if (selectedOpt === ex.correctIndex) {
                                                                  setEarnedXP(prev => prev + 25);
                                                                  setPracticeScores(prev => [...prev, true]);
                                                               } else {
                                                                  setPracticeScores(prev => [...prev, false]);
                                                               }
                                                            }} 
                                                            disabled={selectedOpt === null} 
                                                            className="px-10 py-4 bg-[#2E3192] hover:bg-[#2E3192]/95 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 disabled:opacity-20 transition-all"
                                                         >
                                                            Kiểm tra
                                                         </button>
                                                      ) : (
                                                         <button 
                                                            onClick={() => { 
                                                               if (currentExIdx < exercises.length - 1) { 
                                                                  setCurrentExIdx(prev => prev + 1); 
                                                                  setSelectedOpt(null); 
                                                                  setShowExplain(false); 
                                                               } else { 
                                                                  setQuizCompleted(true); 
                                                               } 
                                                            }} 
                                                            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-600/95 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all"
                                                         >
                                                            Tiếp tục <ArrowRight className="w-4 h-4" />
                                                         </button>
                                                      )}
                                                   </div>
                                                </div>
                                             )}
                                          </div>
                                       )}
                                       
                                       {activeTab === 'apply' && (
                                          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 animate-in zoom-in-95">
                                             <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-4 gap-4">
                                                <div className="space-y-1">
                                                   <span className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest">Sa bàn hội thoại AI thực chiến</span>
                                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Áp dụng kiến thức vào kịch bản công xưởng thực tế</p>
                                                </div>
                                                <span className="w-fit px-3 py-1 bg-indigo-50 text-[#2E3192] border border-indigo-100 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                                                   <Bot className="w-3.5 h-3.5" /> AI Mentor Online
                                                </span>
                                             </div>

                                             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                                {/* Left column: Scenario instructions */}
                                                <div className="lg:col-span-2 space-y-4">
                                                   <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
                                                      <h4 className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest">Kịch bản tình huống:</h4>
                                                      <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                                         Xưởng trưởng Lý (李厂长 - Lǐ Chǎngzhǎng) bất ngờ đi đến dây chuyền của bạn, kiểm tra tiến độ và hỏi lớn:
                                                      </p>
                                                      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-1">
                                                         <p className="text-sm md:text-base font-black text-slate-900">“今天的生产任务完成了没有？”</p>
                                                         <p className="text-[10px] font-bold text-indigo-500 font-mono">(Jīntiān de shēngchǎn rènwu wánchéng le méiyǒu?)</p>
                                                         <p className="text-[10px] font-black text-slate-500 italic">“Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?”</p>
                                                      </div>
                                                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                                         <strong className="text-[#2E3192]">Yêu cầu:</strong> Đóng vai là Tổ trưởng, soạn câu trả lời bằng chữ Hán để báo cáo với sếp rằng tất cả công việc đã hoàn thành tốt đẹp trước thời hạn.
                                                      </p>
                                                   </div>
                                                </div>

                                                {/* Right column: Interactive prompt and submission */}
                                                <div className="lg:col-span-3 space-y-4">
                                                   <div className="space-y-2">
                                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Soạn câu trả lời của bạn:</label>
                                                      <textarea 
                                                         value={rehearsalInput}
                                                         onChange={(e) => setRehearsalInput(e.target.value)}
                                                         placeholder="Nhập câu trả lời bằng tiếng Trung... (Gợi ý: Sử dụng cấu trúc '完成' hoặc '做完' và bắt đầu bằng xưng hô '李厂长')"
                                                         className="w-full h-32 p-4 bg-slate-50 border border-slate-200 focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192] rounded-2xl text-xs font-medium resize-none transition-all outline-none"
                                                         disabled={rehearsalLoading || rehearsalResult !== null}
                                                      />
                                                   </div>

                                                   {/* Actions panel */}
                                                   <div className="flex items-center justify-between gap-4">
                                                      {rehearsalResult ? (
                                                         <button 
                                                            onClick={() => {
                                                               setRehearsalInput('');
                                                               setRehearsalResult(null);
                                                            }}
                                                            className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all"
                                                         >
                                                            Luyện tập lại
                                                         </button>
                                                      ) : (
                                                         <button 
                                                            onClick={handleRehearsalSubmit}
                                                            disabled={!rehearsalInput.trim() || rehearsalLoading}
                                                            className="px-6 py-3.5 bg-[#2E3192] hover:bg-[#2E3192]/95 text-white disabled:opacity-20 rounded-xl font-black text-[9px] uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                                         >
                                                            {rehearsalLoading ? (
                                                               <>
                                                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang thẩm định...
                                                               </>
                                                            ) : (
                                                               <>
                                                                  <Send className="w-3.5 h-3.5" /> Gửi AI Mentor thẩm định
                                                               </>
                                                            )}
                                                         </button>
                                                      )}

                                                      <button 
                                                         onClick={() => setActiveZone('zone3')}
                                                         className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-[#2E3192] transition-all flex items-center gap-2"
                                                      >
                                                         Mở Phiếu Bài Tập <FileText className="w-3.5 h-3.5" />
                                                      </button>
                                                   </div>

                                                   {/* AI Assessment Result card */}
                                                   {rehearsalResult && (
                                                      <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4 animate-in zoom-in-95 pl-6">
                                                         <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                                                            <div className="flex items-center gap-2">
                                                               <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                                                               <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Đánh giá kết quả từ AI Mentor</span>
                                                            </div>
                                                            <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black tracking-widest shrink-0">
                                                               ĐIỂM SỐ: {rehearsalResult.score}%
                                                            </span>
                                                         </div>

                                                         <div className="space-y-3">
                                                            <div className="space-y-1">
                                                               <h5 className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Nhận xét ngữ pháp & Văn phong:</h5>
                                                               <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                                                                  {rehearsalResult.grammarFeedback}
                                                               </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                               <h5 className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Khuyến nghị cải thiện:</h5>
                                                               <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                                                                  {rehearsalResult.suggestions}
                                                               </p>
                                                            </div>
                                                            <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[9px] font-black uppercase text-emerald-700">
                                                               <span>Điểm thưởng:</span>
                                                               <span>+{rehearsalResult.xpReward} XP đã tích lũy</span>
                                                            </div>
                                                         </div>
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 {/* Column 4: Sổ Tay Phòng Học / Cheat Sheet */}
                                 <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 h-fit relative overflow-hidden">
                                       {/* Decorative circle */}
                                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full blur-2xl pointer-events-none" />
                                       
                                       <div className="space-y-2 relative z-10 border-b border-slate-50 pb-4">
                                          <div className="flex items-center gap-2">
                                             <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-inner">
                                                <Ear className="w-4 h-4" />
                                             </div>
                                             <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Sổ Tay Phòng Học</h4>
                                          </div>
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Từ vựng & Cách dùng nhanh</p>
                                       </div>
                                       
                                       <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
                                          {activeLesson.content_json?.vocabulary && activeLesson.content_json.vocabulary.length > 0 ? (
                                             (activeLesson.content_json.vocabulary || []).map((v: any, idx: number) => (
                                                <div 
                                                   key={idx}
                                                   onClick={() => {
                                                      const u = new SpeechSynthesisUtterance(v.hanzi);
                                                      u.lang = 'zh-CN';
                                                      u.rate = 0.85;
                                                      speechSynthesis.speak(u);
                                                   }}
                                                   className="p-4 bg-slate-50/50 hover:bg-[#2E3192]/5 rounded-2xl border border-slate-100 hover:border-[#2E3192]/10 cursor-pointer transition-all space-y-1 text-left relative group/item"
                                                   title="Bấm để phát âm"
                                                >
                                                   <div className="flex items-center justify-between">
                                                      <span className="text-sm font-black text-slate-900 group-hover/item:text-[#2E3192] transition-colors">{v.hanzi}</span>
                                                      <Volume2 className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-[#2E3192] transition-colors" />
                                                   </div>
                                                   <p className="text-[10px] font-bold text-indigo-500 font-mono leading-none">{v.pinyin}</p>
                                                   <div className="pt-1.5 flex flex-col gap-1">
                                                      <p className="text-xs font-bold text-slate-600"><span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Nghĩa:</span> {v.meaning}</p>
                                                      {v.usage && (
                                                         <p className="text-[10px] text-slate-400 font-medium italic"><span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Ví dụ:</span> {v.usage}</p>
                                                      )}
                                                   </div>
                                                </div>
                                             ))
                                          ) : (
                                             <div className="text-center py-10 space-y-2">
                                                <BookOpen className="w-10 h-10 text-slate-200 mx-auto" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang cập nhật từ vựng...</p>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
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

                                 {/* Yêu cầu hoàn thành bài học */}
                                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/80 space-y-4">
                                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                       <Activity className="w-3.5 h-3.5 text-[#2E3192]" /> Điều kiện để hoàn thành bài giảng:
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                       {/* Điều kiện 1: Từ vựng SRS */}
                                       <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${(!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0 || srsSessionCompleted) ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-red-50/50 border-red-100 text-red-800'}`}>
                                          <span className="text-sm shrink-0">{(!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0 || srsSessionCompleted) ? '🟢' : '🔒'}</span>
                                          <div className="space-y-0.5">
                                             <p className="text-[8px] font-black uppercase tracking-wider">Học từ vựng SRS</p>
                                             <p className="text-[10px] font-bold text-slate-500">
                                                {(!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0) ? 'Không yêu cầu' : srsSessionCompleted ? 'Đã thuộc từ vựng' : 'Chưa thuộc từ (Xem Phòng học)'}
                                             </p>
                                          </div>
                                       </div>

                                       {/* Điều kiện 2: Nộp bài tập */}
                                       <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${(submissions && submissions.length > 0) ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-red-50/50 border-red-100 text-red-800'}`}>
                                          <span className="text-sm shrink-0">{(submissions && submissions.length > 0) ? '🟢' : '🔒'}</span>
                                          <div className="space-y-0.5">
                                             <p className="text-[8px] font-black uppercase tracking-wider">Nộp bài tập chính thức</p>
                                             <p className="text-[10px] font-bold text-slate-500">
                                                {(submissions && submissions.length > 0) ? `Đã nộp (${submissions.length} bản)` : 'Chưa nộp bài tập chính thức'}
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 <button 
                                    onClick={handleCompleteLesson} 
                                    disabled={!((!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0 || srsSessionCompleted) && (submissions && submissions.length > 0))}
                                    className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.01] ${((!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0 || srsSessionCompleted) && (submissions && submissions.length > 0)) ? 'bg-gradient-to-r from-[#2E3192] to-indigo-600 text-white shadow-indigo-900/20' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none opacity-80'}`}
                                 >
                                    {((!activeLesson?.content_json?.vocabulary || activeLesson.content_json.vocabulary.length === 0 || srsSessionCompleted) && (submissions && submissions.length > 0)) ? 'Lưu nháp & Hoàn thành bài học' : '🔒 Hãy hoàn thành các điều kiện để hoàn tất'}
                                 </button>
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
