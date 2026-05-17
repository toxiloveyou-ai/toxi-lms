import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Play, BookOpen, 
  MessageCircle, Sparkles, Target, Zap, Check,
  Volume2, BookmarkPlus, Info, ChevronRight, ChevronLeft,
  X, Send, AudioLines, RefreshCw, Flame, Lock, BookMarked,
  Cpu, CornerDownRight, Smartphone, Laptop, Ear, Compass, PlayCircle, Trophy,
  GraduationCap, Activity, Bot, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_LESSON = {
  id: 'l1',
  title: 'Bài học thử: Giao tiếp thực chiến tại Nhà máy Foxconn',
  progress: 35,
  vocabulary: [
    { id: 1, hanzi: '生产', pinyin: 'shēngchǎn', meaning: 'Sản xuất', usage: '生产车间 (Xưởng sản xuất)' },
    { id: 2, hanzi: '任务', pinyin: 'rènwu', meaning: 'Nhiệm vụ', usage: '完成任务 (Hoàn thành nhiệm vụ)' },
    { id: 3, hanzi: '完成', pinyin: 'wánchéng', meaning: 'Hoàn thành', usage: '完成任务 (Hoàn thành nhiệm vụ)' }
  ]
};

const PRACTICE_EXERCISES = [
  {
    type: 'listen_select',
    question: 'Nghe đoạn hội thoại thực tế của quản lý xưởng và chọn đáp án tương ứng:',
    options: ['今天的生产任务完成了吗？', '明天的生产任务完成了吗？', '今天的工厂任务完成了吗？', '现在的生产任务完成了吗？'],
    correctIndex: 0,
    audioText: '今天的生产任务完成了吗？',
    explain: 'Đáp án đúng là A. Câu "今天的生产任务完成了吗？" (jīntiān de shēngchǎn rènwu wánchéng le ma) nghĩa là "Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?". Đây là câu hỏi kinh điển của các quản lý người Hoa tại nhà máy.'
  },
  {
    type: 'fill_blank',
    question: 'Điền từ khóa cốt lõi còn thiếu vào mẫu báo cáo tiến độ: \n今天的生产____完成了吗？',
    options: ['任务 (rènwu) - Nhiệm vụ', '工作 (gōngzuò) - Công việc', '时间 (shíjiān) - Thời gian', '计划 (jìhuà) - Kế hoạch'],
    correctIndex: 0,
    explain: '任务 (rènwu) nghĩa là nhiệm vụ. Cụm từ "生产任务" nghĩa là Nhiệm vụ sản xuất, thường xuất hiện trong các báo cáo vận hành.'
  },
  {
    type: 'order_sentence',
    question: 'Sắp xếp các khối từ vựng sau thành câu báo cáo chuẩn Hán ngữ:',
    words: ['完成', '任务', '生产', '了', '今天', ' của ', '吗'], // 'của' is represented by '的' in original logic
    wordsChinese: ['完成', '任务', '生产', '了', '今天', '的', '吗'],
    correctOrder: ['今天', '的', '生产', '任务', '完成', '了', '吗'],
    explain: 'Cấu trúc đúng: Trạng từ thời gian (今天) + 的 + Danh từ chính (生产任务) + Động từ kết quả (完成) + Bổ ngữ hoàn thành (了) + Từ nghi vấn (吗)？'
  },
  {
    type: 'translate',
    question: 'Dịch câu giao tiếp thực chiến sau sang chữ Hán: \n"Tôi đã viết xong báo cáo sản xuất rồi."',
    expected: '我写完生产报告了',
    expectedAlt: '我写完报告了',
    hints: ['我 (tôi)', '写 (viết)', '完 (xong)', '生产 (sản xuất)', '报告 (báo cáo)', '了 (rồi)'],
    explain: 'Cấu trúc bổ ngữ kết quả: Chủ ngữ + Động từ chính (写) + Bổ ngữ kết quả (完) + Tân ngữ chính (生产报告) + Trợ từ hoàn thành (了).'
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

export default function EduLearn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'understand' | 'practice' | 'apply'>('understand');
  const [zone1Tab, setZone1Tab] = useState<'core' | 'general'>('core');
  const [aiInput, setAiInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Chào bạn! Mình là Tongxiao AI. Bạn đang trải nghiệm Phòng học thử miễn phí. Bạn có câu hỏi nào về từ vựng hay cấu trúc ngữ pháp thực chiến của bài này không? Cứ hỏi mình nhé!' }
  ]);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [playingWordId, setPlayingWordId] = useState<any>(null);
  const [isSpeakingSentence, setIsSpeakingSentence] = useState(false);
  const [savedWords, setSavedWords] = useState<any[]>([]);
  
  // Roleplay Chat State
  const [roleplayInput, setRoleplayInput] = useState('');
  const [roleplayChat, setRoleplayChat] = useState([
    { role: 'ai', content: '你好，请问今天的生产任务完成了吗？', vi: 'AI Quản lý xưởng: Xin chào, cho hỏi nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?' }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Practice State
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [translateText, setTranslateText] = useState('');
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  const ex = PRACTICE_EXERCISES[currentExIdx];

  useEffect(() => {
    if (ex.type === 'order_sentence') {
      const wordsToUse = ex.wordsChinese || ex.words || [];
      setAvailableWords([...wordsToUse].sort(() => Math.random() - 0.5));
      setOrderedWords([]);
    }
  }, [currentExIdx, ex]);

  // Premium feature: Native speech synthesis
  const speakChinese = (text: string, voiceType: 'word' | 'sentence' = 'word', wordId?: any) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.split(' ')[0]; // Remove translations if present
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';
      utterance.rate = voiceType === 'word' ? 0.75 : 0.9;
      
      if (wordId !== undefined) {
        setPlayingWordId(wordId);
        utterance.onend = () => setPlayingWordId(null);
      } else {
        setIsSpeakingSentence(true);
        utterance.onend = () => setIsSpeakingSentence(false);
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ phát âm tự động.");
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput('');
    setIsAiTyping(true);

    // AI dynamic feedback simulator
    setTimeout(() => {
      let aiResponse = "Tongxiao AI gợi ý: Cấu trúc câu này rất hữu dụng. Bạn hãy ghi nhớ cách dùng từ '生产任务' (nhiệm vụ sản xuất) nhé.";
      if (userMsg.toLowerCase().includes('ngữ pháp') || userMsg.toLowerCase().includes('cấu trúc')) {
        aiResponse = "Cấu trúc 'V + 完 + 了' dùng để diễn tả hành động đã hoàn tất. Ví dụ: '吃完了' (ăn xong rồi), '写完了' (viết xong rồi). Trong nhà máy, cấu trúc này cực kỳ quan trọng để báo cáo tiến độ nhanh chóng cho sếp.";
      } else if (userMsg.toLowerCase().includes('ví dụ') || userMsg.toLowerCase().includes('thêm')) {
        aiResponse = "Thêm ví dụ thực tế cho bạn:\n1. '我们完成这个生产任务 rồi' -> '我们完成这个生产任务了' (Chúng tôi đã hoàn thành nhiệm vụ sản xuất này).\n2. '报告写完了吗' (Báo cáo đã viết xong chưa?).";
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const askAssistantDirectly = (questionText: string, promptText: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: questionText }]);
    setIsAiTyping(true);
    setTimeout(() => {
      let aiResponse = "Tongxiao AI gợi ý: Đây là một chủ đề cực kỳ quan trọng trong giao tiếp thực tế tại nhà máy Foxconn.";
      const lower = promptText.toLowerCase();
      if (lower.includes('smt')) {
        aiResponse = "Thuật ngữ SMT (表面贴装技术) nghĩa là Công nghệ dán bề mặt linh kiện. Trong xưởng SMT, công việc chính là điều khiển máy gắp đặt linh kiện (Mounter) bo mạch. Các lỗi thường gặp gồm: 偏位 (Piānwèi - Lệch linh kiện), 漏贴 (Lòutiē - Dán thiếu). Báo cáo mẫu: 'SMT线有不良品' (Dây chuyền SMT có phế phẩm).";
      } else if (lower.includes('xưng hô')) {
        aiResponse = "Cách xưng hô chuẩn trong nhà máy người Hoa:\n1. 组长 (Zǔzhǎng - Tổ trưởng): Quản lý trực tiếp tổ sản xuất.\n2. 课长 (Kèzhǎng - Khóa trưởng/Trưởng bộ phận): Quản lý cấp trung.\n3. 厂长 (Chǎngzhǎng - Giám đốc nhà máy): Quản lý tối cao tại xưởng.\nCách dùng: [Họ sếp] + [Chức danh]. Ví dụ: 王课长 (Khóa trưởng Vương), 李组 trưởng (Tổ trưởng Lý).";
      } else if (lower.includes('sự cố')) {
        aiResponse = "Khi báo cáo sự cố chất lượng (质量问题), hãy dùng cấu trúc:\n'报告[Sếp], [Sự cố] + [Giải pháp]'.\nVí dụ: '报告王课长，生产线有不良品，我已经通知IPQC了' (Báo cáo Khóa trưởng Vương, dây chuyền sản xuất có phế phẩm, tôi đã thông báo cho IPQC rồi).";
      }
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleRoleplaySubmit = () => {
    if (!roleplayInput.trim()) return;
    const userResponse = roleplayInput;
    setRoleplayChat(prev => [...prev, { role: 'user', content: userResponse, vi: '' }]);
    setRoleplayInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      // Intelligent grading simulator
      let aiReply = "很好！你说的很自然。";
      let viReply = "AI Chấm điểm: Xuất sắc! Phát âm và ngữ pháp chính xác. Bạn đạt 95/100 điểm phản xạ thực chiến.";
      
      if (!userResponse.includes('完') && !userResponse.includes('了')) {
        aiReply = "你可以说：'我已经做完了' 或者 '完成了'。";
        viReply = "AI Gợi ý: Để câu nói chuẩn văn phong công nghiệp, hãy dùng bổ ngữ kết quả '完' hoặc trợ từ '了' để khẳng định đã hoàn thành nhé!";
      }

      setRoleplayChat(prev => [...prev, { role: 'ai', content: aiReply, vi: viReply }]);
      setIsAiTyping(false);
      speakChinese(aiReply, 'sentence');
    }, 1500);
  };

  const checkPracticeAnswer = () => {
    setShowExplain(true);
  };

  const nextPractice = () => {
    if (currentExIdx < PRACTICE_EXERCISES.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
      setSelectedOpt(null);
      setShowExplain(false);
      setTranslateText('');
    } else {
      handleCompletePhase();
    }
  };

  const handleWordSelect = (word: string, isAvailable: boolean) => {
    if (showExplain) return;
    if (isAvailable) {
      setAvailableWords(prev => prev.filter(w => w !== word));
      setOrderedWords(prev => [...prev, word]);
    } else {
      setOrderedWords(prev => prev.filter(w => w !== word));
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleCompletePhase = () => {
    if (activeTab === 'understand') setActiveTab('practice');
    else if (activeTab === 'practice') setActiveTab('apply');
    else setShowProgressPopup(true);
  };

  const isPracticeAnswerReady = () => {
    if (ex.type === 'listen_select' || ex.type === 'fill_blank') return selectedOpt !== null;
    if (ex.type === 'order_sentence') return availableWords.length === 0;
    if (ex.type === 'translate') return translateText.trim().length > 0;
    return false;
  };

  const toggleSaveWord = (id: number) => {
    setSavedWords(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFF] text-slate-900 font-sans overflow-hidden">
      
      {/* 1. TOP INTERACTIVE DASHBOARD HEADER */}
      <header className="h-20 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] transition-all uppercase tracking-widest bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-100 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát học thử
          </button>
          <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-[8px] font-black uppercase tracking-widest">Free Trial</span>
              <h1 className="text-sm font-black text-slate-900 leading-none">{MOCK_LESSON.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2E3192] to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${MOCK_LESSON.progress}%` }}></div>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{MOCK_LESSON.progress}% Hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Dynamic Capsule Phase Steps */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {[
            { key: 'understand', label: '1. Hiểu sâu', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100/50' },
            { key: 'practice', label: '2. Luyện nhuyễn', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100/50' },
            { key: 'apply', label: '3. Thực chiến', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100/50' }
          ].map((step) => {
            const isActive = activeTab === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setActiveTab(step.key as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? `bg-white text-slate-900 shadow-md border border-slate-200/50` 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <step.icon className={`w-3.5 h-3.5 ${isActive ? step.color : 'text-slate-300'}`} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. MAIN SIMULATOR CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT WORKSPACE (70%) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC] custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-24">
            
            <AnimatePresence mode="wait">
              {/* TAB 1: HIỂU SÂU (UNDERSTAND) */}
              {activeTab === 'understand' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Sub-tab navigation inside trial player */}
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/60 mb-2">
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

                  <AnimatePresence mode="wait">
                                                            {zone1Tab === 'core' ? (
                      <motion.div
                        key="core"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {/* Futuristic Interactive Scenario */}
                        <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-2 h-full bg-[#2E3192]"></div>
                          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                            <Cpu className="w-40 h-40" />
                          </div>

                          <div className="flex flex-col md:flex-row items-start gap-6">
                            <div 
                              onClick={() => speakChinese('今天的生产任务完成了吗？', 'sentence')}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer shadow-lg transition-all ${
                                isSpeakingSentence 
                                  ? 'bg-[#2E3192] text-white animate-pulse scale-105' 
                                  : 'bg-indigo-50 text-[#2E3192] hover:bg-[#2E3192] hover:text-white hover:scale-105'
                              }`}
                              title="Nghe phát âm cả câu"
                            >
                              {isSpeakingSentence ? (
                                <div className="flex items-center gap-0.5">
                                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                </div>
                              ) : (
                                <Play className="w-6 h-6 ml-0.5 fill-current" />
                              )}
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 Tình huống thực chiến tại nhà máy Foxconn</p>
                              </div>
                              <p className="text-slate-600 font-medium leading-relaxed">
                                Bạn đang kiểm tra tiến độ tại xưởng. Quản lý người Trung Quốc đột ngột bước đến, chỉ tay vào dây chuyền và hỏi bạn:
                              </p>
                              
                              {/* Interactive audio display */}
                              <div 
                                onClick={() => speakChinese('今天的生产任务完成了吗？', 'sentence')}
                                className="bg-slate-900 text-white p-6 rounded-[1.5rem] shadow-inner cursor-pointer hover:bg-slate-800 transition-colors relative group/card"
                              >
                                <div className="absolute top-4 right-4 text-[8px] font-black uppercase text-white/30 tracking-widest flex items-center gap-1.5">
                                  <Ear className="w-3.5 h-3.5 text-orange-400" /> Nhấn để nghe sếp nói
                                </div>
                                <p className="text-2xl md:text-3xl font-black tracking-tight text-white group-hover/card:text-orange-400 transition-colors">"今天的生产任务完成了吗?"</p>
                                <p className="text-xs text-slate-400 font-medium mt-2 tracking-wide font-mono">jīntiān de shēngchǎn rènwu wánchéng le ma?</p>
                                <p className="text-xs text-emerald-400 font-bold mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                                  <CornerDownRight className="w-4 h-4" /> Nghĩa: "Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?"
                                </p>
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* SMART 3-COLUMN LAYOUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* COLUMN 1: TỪ VỰNG TRONG BÀI */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#2E3192]" /> Từ vựng trong bài
                              </h3>
                              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">Lõi</span>
                            </div>
                            
                            <div className="space-y-4">
                              {MOCK_LESSON.vocabulary.map((word) => {
                                const isPlaying = playingWordId === word.id;
                                const isSaved = savedWords.includes(word.id);
                                return (
                                  <div 
                                    key={word.id} 
                                    className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col justify-between group hover:border-[#2E3192] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <button 
                                          onClick={() => speakChinese(word.hanzi, 'word', word.id)} 
                                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                            isPlaying 
                                              ? 'bg-[#2E3192] text-white animate-pulse' 
                                              : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-[#2E3192]'
                                          }`}
                                        >
                                          <Volume2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setSavedWords(prev => 
                                              isSaved ? prev.filter(id => id !== word.id) : [...prev, word.id]
                                            );
                                          }}
                                          className={`p-1.5 rounded-lg transition-colors ${
                                            isSaved 
                                              ? 'text-orange-500 bg-orange-50' 
                                              : 'text-slate-300 hover:text-orange-500'
                                          }`}
                                        >
                                          <BookmarkPlus className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <div>
                                        <h4 className="text-2xl font-black text-slate-900 font-heading tracking-tight">{word.hanzi}</h4>
                                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">{word.pinyin}</p>
                                        <p className="text-xs font-black text-[#2E3192] mt-1">{word.meaning}</p>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-50 text-[9px] text-slate-400 font-bold">
                                      <span className="text-[7px] font-black uppercase text-slate-300 block mb-0.5">Cách dùng:</span>
                                      <span className="text-slate-600">{word.usage}</span>
                                    </div>
                                  </div>
                                );
                              })}
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
                              {[
                                { id: 'ext-1', hanzi: '不良品', pinyin: 'bùliángpǐn', meaning: 'Sản phẩm lỗi, phế phẩm', usage: '发现不良品应立即停止作业。 (Phát hiện phế phẩm cần ngừng thao tác ngay.)' },
                                { id: 'ext-2', hanzi: '修机', pinyin: 'xiūjī', meaning: 'Bảo trì, sửa chữa máy', usage: '通知技术员来修机。 (Thông báo kỹ thuật viên đến sửa máy.)' },
                                { id: 'ext-3', hanzi: '加班', pinyin: 'jiābān', meaning: 'Tăng ca', usage: '今天晚上需要加班两小时。 (Tối nay cần tăng ca hai tiếng.)' }
                              ].map((word) => {
                                const isPlaying = playingWordId === word.id;
                                return (
                                  <div 
                                    key={word.id} 
                                    className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col justify-between group hover:border-orange-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <button 
                                          onClick={() => speakChinese(word.hanzi, 'word', word.id)} 
                                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                            isPlaying 
                                              ? 'bg-orange-500 text-white animate-pulse' 
                                              : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'
                                          }`}
                                        >
                                          <Volume2 className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <div>
                                        <h4 className="text-2xl font-black text-slate-900 font-heading tracking-tight">{word.hanzi}</h4>
                                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">{word.pinyin}</p>
                                        <p className="text-xs font-black text-orange-500 mt-1">{word.meaning}</p>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-50 text-[9px] text-slate-500 font-bold">
                                      <span className="text-[7px] font-black uppercase text-slate-300 block mb-0.5">Cách dùng:</span>
                                      <span className="text-slate-600">{word.usage}</span>
                                    </div>
                                  </div>
                                );
                              })}
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

                            <section className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group h-fit">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700" />
                              
                              <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-[7px] font-black uppercase tracking-widest border border-white/10">Cấu trúc</span>
                                  <h4 className="text-xs font-black text-white italic">Bổ ngữ: V + 完 + 了</h4>
                                </div>
                                
                                <p className="text-white/60 text-[10px] leading-relaxed">
                                  Trong môi trường xưởng, sếp chỉ quan tâm đến kết quả. Thêm chữ <strong className="text-orange-400">完 (wán - xong)</strong> ngay sau động từ để khẳng định công việc đã hoàn thành 100%.
                                </p>

                                <div className="bg-white/5 border border-white/10 p-4 rounded-[1.5rem] backdrop-blur-md">
                                  <div className="flex items-center justify-around gap-2 text-center text-xs font-black">
                                    <div>
                                      <p className="text-sm font-black text-white">写 (xiě)</p>
                                      <p className="text-[6px] text-white/40 uppercase mt-0.5">Viết</p>
                                    </div>
                                    <span className="text-orange-400 text-sm font-black">+</span>
                                    <div>
                                      <p className="text-sm font-black text-orange-400">完 (wán)</p>
                                      <p className="text-[6px] text-white/40 uppercase mt-0.5">Xong</p>
                                    </div>
                                    <span className="text-orange-400 text-sm font-black">+</span>
                                    <div>
                                      <p className="text-sm font-black text-white">了 (le)</p>
                                      <p className="text-[6px] text-white/40 uppercase mt-0.5">Rồi</p>
                                    </div>
                                    <span className="text-orange-400 text-sm font-black">=</span>
                                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                                      <p className="text-xs font-black text-emerald-400">写完了</p>
                                      <p className="text-[6px] text-white/40 uppercase mt-0.5">Xong rồi</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </section>
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
                                           onClick={() => speakChinese(item.cn, 'word')}
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
                                     Nhấn vào các chủ đề dưới đây để yêu cầu **Tongxiao AI** giải thích chi tiết và đưa ra thêm ví dụ thực tế:
                                  </p>
                                  <div className="space-y-2.5">
                                     {GENERAL_KNOWLEDGE_MOCKS.questions.map((q, idx) => (
                                        <button
                                           key={idx}
                                           onClick={() => askAssistantDirectly(q.text, q.prompt)}
                                           className="w-full text-left p-3 bg-white/5 border border-white/10 hover:bg-[#2E3192]/20 hover:border-[#2E3192]/30 rounded-xl transition-all text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-between group/btn"
                                        >
                                           <span className="truncate pr-4">{q.text}</span>
                                           <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-orange-400 group-hover/btn:translate-x-0.5 transition-all shrink-0" />
                                        </button>
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

              {/* TAB 2: LUYỆN NHUYỄN (PRACTICE) */}
              {activeTab === 'practice' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                       <Target className="w-6 h-6 text-orange-500 animate-pulse" /> Sát hạch thử thách phản xạ
                     </h2>
                     <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {PRACTICE_EXERCISES.map((_, idx) => (
                           <div 
                             key={idx} 
                             className={`h-2.5 rounded-full transition-all duration-500 ${
                               idx === currentExIdx 
                                 ? 'w-8 bg-orange-500 shadow-md shadow-orange-500/20' 
                                 : idx < currentExIdx 
                                   ? 'w-4 bg-emerald-500' 
                                   : 'w-4 bg-slate-200'
                             }`} 
                           />
                        ))}
                     </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-2.5 h-full bg-orange-500"></div>
                     
                     <div className="mb-8 space-y-4">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                           Thực hành {currentExIdx + 1}/4
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 whitespace-pre-line leading-snug">
                           {ex.question}
                        </h3>
                        {ex.type === 'listen_select' && (
                          <button 
                            onClick={() => speakChinese(ex.audioText || '', 'sentence')}
                            className="mt-4 px-5 py-3 bg-[#2E3192] text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-900/10"
                          >
                            <AudioLines className="w-5 h-5" /> Phát âm thanh mẫu
                          </button>
                        )}
                     </div>

                     {/* RENDER DYNAMIC PRACTICE INTERFACE */}
                     {/* TYPE 1 & 2: MULTIPLE CHOICE */}
                     {(ex.type === 'listen_select' || ex.type === 'fill_blank') && (
                        <div className="grid grid-cols-1 gap-4 mb-8">
                           {ex.options?.map((opt, idx) => {
                              const isCorrectAns = idx === ex.correctIndex;
                              let btnStyle = 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 bg-white shadow-sm';
                              
                              if (showExplain) {
                                 btnStyle = isCorrectAns 
                                   ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-emerald-100/50 shadow-md' 
                                   : selectedOpt === idx 
                                     ? 'border-rose-500 bg-rose-50 text-rose-800' 
                                     : 'border-slate-100 text-slate-400 opacity-60';
                              } else if (selectedOpt === idx) {
                                 btnStyle = 'border-[#2E3192] bg-indigo-50/50 text-[#2E3192] shadow-indigo-100/50 shadow-md';
                              }

                              return (
                                <button 
                                  key={idx} 
                                  onClick={() => !showExplain && setSelectedOpt(idx)} 
                                  disabled={showExplain} 
                                  className={`p-5 rounded-2xl border-2 text-left font-black transition-all active:scale-98 flex items-center justify-between ${btnStyle}`}
                                >
                                   <div className="flex items-center gap-4">
                                      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 font-mono text-xs ${
                                        showExplain && isCorrectAns 
                                          ? 'border-emerald-500 bg-emerald-500 text-white' 
                                          : selectedOpt === idx 
                                            ? 'border-[#2E3192] bg-[#2E3192] text-white' 
                                            : 'border-slate-300 text-slate-400'
                                      }`}>
                                         {showExplain && isCorrectAns ? <Check className="w-4 h-4 stroke-[3px]" /> : String.fromCharCode(65 + idx)}
                                      </div>
                                      <span className="text-sm md:text-base">{opt}</span>
                                   </div>
                                </button>
                              );
                           })}
                        </div>
                     )}

                     {/* TYPE 3: WORD BLOCK PUZZLE */}
                     {ex.type === 'order_sentence' && (
                       <div className="space-y-8 mb-8">
                          <div className="min-h-[6rem] p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-wrap gap-3 items-center justify-center">
                             {orderedWords.length === 0 && <span className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Nhấp chọn các thẻ chữ Hán bên dưới</span>}
                             {orderedWords.map((word, idx) => (
                               <button 
                                 key={idx} 
                                 onClick={() => handleWordSelect(word, false)} 
                                 disabled={showExplain} 
                                 className="px-5 py-3.5 bg-[#2E3192] text-white font-black rounded-xl shadow-lg shadow-indigo-900/20 active:scale-95 transition-all text-base border border-indigo-700"
                               >
                                 {word}
                               </button>
                             ))}
                          </div>
                          <div className="flex flex-wrap gap-3 justify-center">
                             {availableWords.map((word, idx) => (
                               <button 
                                 key={idx} 
                                 onClick={() => handleWordSelect(word, true)} 
                                 disabled={showExplain} 
                                 className="px-5 py-3.5 bg-white border-2 border-slate-100 text-slate-700 font-black rounded-xl hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all active:scale-95 text-base"
                               >
                                 {word}
                               </button>
                             ))}
                          </div>
                       </div>
                     )}

                     {/* TYPE 4: TRANSLATION CONSOLE */}
                     {ex.type === 'translate' && (
                       <div className="mb-8 space-y-5">
                          <div className="relative group">
                            <textarea 
                               value={translateText} 
                               onChange={(e) => setTranslateText(e.target.value)} 
                               disabled={showExplain}
                               placeholder="Nhập câu dịch chữ Hán của bạn vào đây..."
                               className="w-full p-6 rounded-3xl border-2 border-slate-100 focus:outline-none focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192] resize-none h-36 text-lg font-black transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300">Toxi Input Engine</div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-400 items-center px-1">
                            <span className="uppercase text-[9px] font-black tracking-widest text-[#2E3192]">Gợi ý từ vựng:</span>
                            {ex.hints?.map((hint, i) => <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">{hint}</span>)}
                          </div>
                       </div>
                     )}

                     {/* Action Buttons & AI Explanations */}
                     {showExplain ? (
                        <div className="animate-in fade-in duration-500 space-y-6">
                           {(ex.type === 'translate' || ex.type === 'order_sentence') && (
                              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                                 <div>
                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Đáp án mẫu chuẩn hóa</p>
                                    <p className="text-2xl font-black text-emerald-800">
                                      {ex.type === 'translate' ? ex.expected : ex.correctOrder?.join('')}
                                    </p>
                                 </div>
                                 <button 
                                   onClick={() => speakChinese(ex.type === 'translate' ? ex.expected || '' : ex.correctOrder?.join('') || '', 'sentence')}
                                   className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                 >
                                   <Volume2 className="w-5 h-5" />
                                 </button>
                              </div>
                           )}
                           
                           <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100/50 flex items-start gap-4">
                              <Info className="w-6 h-6 text-[#2E3192] shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black text-[#2E3192] uppercase tracking-widest">Phân tích chuyên gia AI</p>
                                 <p className="text-slate-600 text-sm font-medium leading-relaxed">{ex.explain}</p>
                              </div>
                           </div>
                           
                           <button 
                             onClick={nextPractice} 
                             className="w-full py-4.5 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:scale-101 hover:bg-indigo-900 transition-all flex items-center justify-center gap-2 active:scale-98"
                           >
                              {currentExIdx < PRACTICE_EXERCISES.length - 1 ? 'Thử thách tiếp theo' : 'Hoàn thành chặng'} <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>
                     ) : (
                        <button 
                           onClick={checkPracticeAnswer} 
                           disabled={!isPracticeAnswerReady()}
                           className="w-full py-4.5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-40 disabled:pointer-events-none hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-98"
                        >
                           Kiểm tra kết quả
                        </button>
                     )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: THỰC CHIẾN (APPLY - AI ROLEPLAY) */}
              {activeTab === 'apply' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <section className="bg-white rounded-[3rem] border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col h-[650px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none">
                      <Compass className="w-96 h-96" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-6 shrink-0">
                       <div>
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                             <Zap className="w-5 h-5 text-emerald-500" /> Báo cáo thực tế với Sếp Tổng
                          </h3>
                          <p className="text-xs text-slate-400 font-bold mt-1">Đóng vai báo cáo tiến độ bằng tiếng Trung để AI Quản lý chấm điểm.</p>
                       </div>
                       <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 flex items-center gap-1.5">
                         <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} /> AI Simulator
                       </span>
                    </div>
                    
                    {/* Futuristic Simulator Screen */}
                    <div className="flex-1 bg-slate-950 rounded-[2rem] border border-slate-800 p-6 overflow-y-auto custom-scrollbar space-y-6 mb-4 shadow-inner">
                       {roleplayChat.map((msg, i) => (
                          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-xs shadow-md border ${
                               msg.role === 'user' 
                                 ? 'bg-orange-500 border-orange-400 shadow-orange-500/20' 
                                 : 'bg-[#2E3192] border-indigo-700 shadow-indigo-900/20'
                             }`}>
                                {msg.role === 'user' ? 'ME' : 'BOSS'}
                             </div>
                             <div className={`max-w-[80%] p-5 rounded-[1.5rem] shadow-md relative ${
                               msg.role === 'user' 
                                 ? 'bg-orange-500 text-white rounded-tr-none' 
                                 : 'bg-slate-900 text-white rounded-tl-none border border-slate-800'
                             }`}>
                                <p className="font-black text-base md:text-lg leading-relaxed">{msg.content}</p>
                                {msg.vi && (
                                  <p className={`text-xs mt-3 pt-3 border-t font-medium leading-relaxed ${
                                    msg.role === 'user' ? 'border-orange-400/30 text-orange-100' : 'border-slate-800 text-slate-400'
                                  }`}>
                                    {msg.vi}
                                  </p>
                                )}
                             </div>
                          </div>
                       ))}
                       
                       {isAiTyping && (
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-black text-xs animate-pulse">AI</div>
                             <div className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] rounded-tl-none text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-2">AI Boss đang chấm câu...</span>
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Speech Input Terminal */}
                    <div className="shrink-0 space-y-3">
                       <div className="relative group">
                         <textarea 
                            value={roleplayInput}
                            onChange={(e) => setRoleplayInput(e.target.value)}
                            placeholder="Gõ câu báo cáo của bạn bằng chữ Hán (Ví dụ: 我写完报告了 / 完成了)..." 
                            className="w-full p-4.5 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192] resize-none h-24 text-base font-black transition-all bg-white"
                         />
                         <div className="absolute bottom-3 right-4 text-[9px] font-black uppercase text-slate-300 tracking-wider">Hỗ trợ gõ Pinyin</div>
                       </div>
                       <div className="flex justify-between items-center">
                          <button 
                            onClick={() => setRoleplayChat([{ role: 'ai', content: '你好，请问今天的生产任务完成了吗？', vi: 'AI Quản lý xưởng: Xin chào, cho hỏi nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?' }])}
                            className="text-slate-400 hover:text-rose-500 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                          >
                             <RefreshCw className="w-4 h-4" /> Reset hội thoại
                          </button>
                          <button 
                            onClick={handleRoleplaySubmit} 
                            disabled={!roleplayInput.trim() || isAiTyping} 
                            className="px-6 py-3.5 bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                             <Send className="w-4 h-4" /> Gửi báo cáo cho Sếp
                          </button>
                       </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

        {/* RIGHT SIDEBAR (30%) - TONGXIAO INTELLIGENCE MENTOR */}
        <aside className="w-80 lg:w-96 bg-white border-l border-slate-100 flex flex-col shrink-0 z-10 shadow-sm relative">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2E3192] to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="w-6 h-6 text-orange-400 relative z-10 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Tongxiao AI Assistant</h2>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Trực tuyến hỗ trợ học thử
              </p>
            </div>
          </div>

          {/* AI Chat History */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-white">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[9px] font-black ${
                  msg.role === 'user' ? 'bg-orange-500' : 'bg-slate-900'
                }`}>
                  {msg.role === 'user' ? 'ME' : 'AI'}
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-orange-50 text-orange-900 border border-orange-100 rounded-tr-none' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isAiTyping && chatHistory[chatHistory.length - 1].role === 'user' && (
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white text-[9px] font-black animate-pulse flex items-center justify-center">AI</div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* AI Quick Interaction Terminal */}
          <div className="p-5 border-t border-slate-50 bg-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setAiInput('Giải thích cấu trúc V + 完 + 了')} 
                className="text-[9px] px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#2E3192] text-slate-500 rounded-lg font-black uppercase tracking-widest border border-slate-100 transition-all"
              >
                Giải thích cấu trúc
              </button>
              <button 
                onClick={() => setAiInput('Cho mình xin thêm 3 ví dụ trong nhà máy')} 
                className="text-[9px] px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#2E3192] text-slate-500 rounded-lg font-black uppercase tracking-widest border border-slate-100 transition-all"
              >
                Xin thêm ví dụ
              </button>
            </div>
            
            <form onSubmit={handleAiSubmit} className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Tra từ hoặc hỏi ngữ pháp..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192] pr-10"
              />
              <button 
                type="submit" 
                disabled={!aiInput.trim()} 
                className="absolute right-2 p-1.5 bg-slate-900 disabled:opacity-30 text-white rounded-lg hover:bg-[#2E3192] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </aside>

      </div>

      {/* 3. SIMULATOR STEER-BOARD FOOTER */}
      <footer className="h-20 bg-white border-t border-slate-100 px-6 flex items-center justify-between shrink-0 z-40 shadow-sm">
        <button 
          onClick={() => {
            if (activeTab === 'practice') setActiveTab('understand');
            else if (activeTab === 'apply') setActiveTab('practice');
          }}
          disabled={activeTab === 'understand'}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] disabled:opacity-30 disabled:pointer-events-none transition-colors uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Quay lại chặng
        </button>
        
        <button 
          onClick={handleCompletePhase} 
          className="px-8 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:scale-105 hover:bg-indigo-900 shadow-xl shadow-indigo-950/10 transition-all flex items-center gap-2 active:scale-95"
        >
          {activeTab === 'understand' ? 'Tiếp tục: Luyện phản xạ' : activeTab === 'practice' ? 'Tiếp tục: Thực chiến AI' : 'Báo cáo hoàn thành'} <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* POPUP: EVOLUTION COMPLETED SUCCESS MODAL */}
      {showProgressPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 transform rotate-6 border border-emerald-100">
              <Trophy className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Tuyệt vời!</h3>
              <p className="text-slate-500 font-medium">Bạn đã hoàn thành xuất sắc bài học thử nghiệm!</p>
            </div>
            
            {/* Visual stats bento */}
            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-100 text-left">
               <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span className="text-slate-400">Từ vựng lĩnh hội</span>
                  <span className="text-slate-900 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-[#2E3192]" /> 3 từ cốt lõi</span>
               </div>
               <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span className="text-slate-400">Thời gian phản xạ</span>
                  <span className="text-slate-900 flex items-center gap-1.5"><Ear className="w-3.5 h-3.5 text-orange-500" /> 0.8 giây</span>
               </div>
               <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider pt-3 border-t border-slate-200/60">
                  <span className="text-slate-400">Điểm kinh nghiệm</span>
                  <span className="text-emerald-600 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 fill-current" /> +100 XP</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowProgressPopup(false); navigate(-1); }} 
                className="w-full py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-950/20 hover:scale-105 active:scale-95 transition-all"
              >
                Đăng ký khóa học ngay
              </button>
              <button 
                onClick={() => { setShowProgressPopup(false); setActiveTab('understand'); }} 
                className="w-full py-3.5 text-slate-400 hover:text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Xem lại bài học
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
