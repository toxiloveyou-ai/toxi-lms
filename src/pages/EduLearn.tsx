import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Play, BookOpen, 
  MessageCircle, Sparkles, Target, Zap, Check,
  Volume2, BookmarkPlus, Info, ChevronRight, ChevronLeft,
  X, Send, AudioLines, RefreshCw
} from 'lucide-react';

const MOCK_LESSON = {
  id: 'l1',
  title: 'Bài 3: Giao tiếp tại nhà máy',
  progress: 35,
  vocabulary: [
    { id: 1, hanzi: '生产', pinyin: 'shēngchǎn', meaning: 'Sản xuất', audio: '#' },
    { id: 2, hanzi: '任务', pinyin: 'rènwu', meaning: 'Nhiệm vụ', audio: '#' },
    { id: 3, hanzi: '完成', pinyin: 'wánchéng', meaning: 'Hoàn thành', audio: '#' }
  ]
};

const PRACTICE_EXERCISES = [
  {
    type: 'listen_select',
    question: 'Nghe đoạn âm thanh sau và chọn đáp án tương ứng:',
    options: ['今天的生产任务完成了吗？', '明天的生产任务完成了吗？', '今天的工厂任务完成了吗？', '现在的生产任务完成了吗？'],
    correctIndex: 0,
    explain: 'Đáp án đúng là A. Câu "今天的生产任务完成了吗？" (jīntiān de shēngchǎn rènwu wánchéng le ma) nghĩa là "Nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?".'
  },
  {
    type: 'fill_blank',
    question: 'Điền từ còn thiếu vào chỗ trống: \n今天的生产____完成了吗？',
    options: ['任务 (rènwu)', '工作 (gōngzuò)', '时间 (shíjiān)', '计划 (jìhuà)'],
    correctIndex: 0,
    explain: '任务 (rènwu) nghĩa là nhiệm vụ. Cụm từ "生产任务" nghĩa là Nhiệm vụ sản xuất.'
  },
  {
    type: 'order_sentence',
    question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
    words: ['完成', '任务', '生产', '了', '今天', '的', '吗'],
    correctOrder: ['今天', '的', '生产', '任务', '完成', '了', '吗'],
    explain: 'Cấu trúc đúng: Thời gian (今天) + 的 + Danh từ (生产任务) + Động từ (完成) + 了吗？'
  },
  {
    type: 'translate',
    question: 'Dịch câu sau sang tiếng Trung: \n"Tôi đã viết xong báo cáo rồi."',
    expected: '我写完报告了',
    hints: ['写 (viết)', '完 (xong)', '报告 (báo cáo)', '了 (rồi)'],
    explain: 'Cấu trúc ngữ pháp: Chủ ngữ + Động từ (写) + Bổ ngữ kết quả (完) + Tân ngữ (报告) + 了.'
  }
];

export default function EduLearn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'understand' | 'practice' | 'apply'>('understand');
  const [aiInput, setAiInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Chào bạn! Mình là Tongxiao AI. Bạn đang học Bài 3: Giao tiếp tại nhà máy. Bạn có câu hỏi nào về từ vựng hay ngữ pháp bài này không?' }
  ]);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  
  // Roleplay Chat State
  const [roleplayInput, setRoleplayInput] = useState('');
  const [roleplayChat, setRoleplayChat] = useState([
    { role: 'ai', content: '你好，请问今天的生产任务完成了吗？', vi: 'Xin chào, cho hỏi nhiệm vụ sản xuất hôm nay đã hoàn thành chưa?' }
  ]);

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
      setAvailableWords([...(ex.words || [])].sort(() => Math.random() - 0.5));
      setOrderedWords([]);
    }
  }, [currentExIdx, ex]);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setChatHistory([...chatHistory, { role: 'user', content: aiInput }]);
    setAiInput('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Tongxiao AI gợi ý: Bạn có thể sử dụng cấu trúc này trong thực tế công việc một cách tự nhiên hơn.` }]);
    }, 1000);
  };

  const handleRoleplaySubmit = () => {
    if (!roleplayInput.trim()) return;
    setRoleplayChat(prev => [...prev, { role: 'user', content: roleplayInput, vi: '' }]);
    setRoleplayInput('');
    setTimeout(() => {
      setRoleplayChat(prev => [...prev, { 
        role: 'ai', 
        content: '很好！你说的很自然。', 
        vi: 'Gợi ý AI: Rất tốt! Bạn nói rất tự nhiên. Hãy thêm từ "没问题" (Không thành vấn đề) để chuyên nghiệp hơn nhé!' 
      }]);
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

  return (
    <div className="flex flex-col h-screen bg-[#F9F6ED] text-[#2E3192] font-sans overflow-hidden">
      {/* 1. HEADER THÔNG MINH */}
      <header className="h-16 bg-white border-b border-[#EADBC8] px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-sm font-black tracking-tight">{MOCK_LESSON.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${MOCK_LESSON.progress}%` }}></div>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase">{MOCK_LESSON.progress}% Khóa học</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker (Hiểu -> Luyện -> Dùng ngay) */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${activeTab === 'understand' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Hiểu</span>
          </div>
          <div className="w-8 h-px bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${activeTab === 'practice' ? 'text-orange-500' : 'text-slate-400'}`}>
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Luyện</span>
          </div>
          <div className="w-8 h-px bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${activeTab === 'apply' ? 'text-[#2E3192]' : 'text-slate-400'}`}>
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Dùng ngay</span>
          </div>
        </div>
      </header>

      {/* 2. BODY: VÙNG NỘI DUNG (70%) & SIDEBAR (30%) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* VÙNG NỘI DUNG CHÍNH (70%) */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            
            {/* TAB: HIỂU */}
            {activeTab === 'understand' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Tình huống mở đầu */}
                <section className="bg-white rounded-3xl p-8 border border-[#EADBC8] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#2E3192]"></div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-[#2E3192] rounded-2xl flex items-center justify-center shrink-0">
                      <Play className="w-6 h-6 ml-1" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">📍 Tình huống thực tế</p>
                      <p className="text-slate-600 font-medium mb-4">Bạn đang làm việc tại nhà máy Foxconn. Quản lý người Trung hỏi:</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xl font-black text-[#2E3192]">"今天的生产任务完成了吗?"</p>
                        <p className="text-sm text-slate-500 mt-1">jīntiān de shēngchǎn rènwu wánchéng le ma?</p>
                      </div>
                      <p className="text-sm font-bold text-orange-500 mt-4 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Mục tiêu bài học: Bạn cần hiểu và trả lời được câu này.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Từ vựng chính */}
                <section className="space-y-4">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-500" /> Từ vựng cốt lõi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_LESSON.vocabulary.map((word) => (
                      <div key={word.id} className="bg-white p-5 rounded-2xl border border-[#EADBC8] flex items-center justify-between group hover:border-[#2E3192] transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <button className="w-10 h-10 bg-blue-50 text-[#2E3192] rounded-xl flex items-center justify-center group-hover:bg-[#2E3192] group-hover:text-white transition-colors">
                            <Volume2 className="w-5 h-5" />
                          </button>
                          <div>
                            <p className="text-2xl font-black">{word.hanzi}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-slate-500">{word.pinyin}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span className="text-xs font-bold text-orange-500">{word.meaning}</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-slate-300 hover:text-[#2E3192]" title="Thêm vào Sổ Tay">
                          <BookmarkPlus className="w-6 h-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Ngữ pháp */}
                <section className="bg-[#2E3192] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                  <Sparkles className="absolute top-4 right-4 w-24 h-24 text-white opacity-5" />
                  <h3 className="text-lg font-black mb-4">Cấu trúc: Động từ + 完 + (了) + (O)</h3>
                  <p className="text-white/80 font-medium mb-6">Diễn tả hành động đã được hoàn tất một cách trọn vẹn.</p>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                    <div className="flex items-center justify-between text-center">
                      <div className="flex-1"><p className="text-xl font-black">写</p><p className="text-xs text-white/60">xiě (viết)</p></div>
                      <div className="text-orange-400 font-black">+</div>
                      <div className="flex-1"><p className="text-xl font-black">完</p><p className="text-xs text-white/60">wán (xong)</p></div>
                      <div className="text-orange-400 font-black">+</div>
                      <div className="flex-1"><p className="text-xl font-black">了</p><p className="text-xs text-white/60">le</p></div>
                      <div className="text-orange-400 font-black">=</div>
                      <div className="flex-1"><p className="text-xl font-black text-emerald-400">写完了</p><p className="text-xs text-white/60">viết xong rồi</p></div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* TAB: LUYỆN */}
            {activeTab === 'practice' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black flex items-center gap-2"><Target className="w-6 h-6 text-orange-500" /> Thực Hành Thông Minh</h2>
                   <div className="flex gap-2">
                      {PRACTICE_EXERCISES.map((_, idx) => (
                         <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentExIdx ? 'w-8 bg-orange-500' : idx < currentExIdx ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-200'}`} />
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-[#EADBC8] shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
                   
                   <div className="mb-8">
                      <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                         Bài tập {currentExIdx + 1}/4
                      </span>
                      <h3 className="text-xl font-bold whitespace-pre-line leading-relaxed">
                         {ex.question}
                      </h3>
                      {ex.type === 'listen_select' && (
                        <button className="mt-4 px-6 py-3 bg-blue-50 text-[#2E3192] rounded-xl flex items-center gap-3 font-bold hover:bg-[#2E3192] hover:text-white transition-colors">
                          <AudioLines className="w-5 h-5" /> Nghe đoạn hội thoại
                        </button>
                      )}
                   </div>

                   {/* RENDER EXERCISE TYPE */}
                   {/* TYPE 1 & 2: MULTIPLE CHOICE */}
                   {(ex.type === 'listen_select' || ex.type === 'fill_blank') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         {ex.options?.map((opt, idx) => {
                            const isCorrectAns = idx === ex.correctIndex;
                            let style = 'border-slate-100 hover:border-slate-300 text-slate-700 bg-white';
                            if (showExplain) {
                               style = isCorrectAns ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : selectedOpt === idx ? 'border-red-500 bg-red-50 text-red-700' : style;
                            } else if (selectedOpt === idx) {
                               style = 'border-[#2E3192] bg-blue-50 text-[#2E3192]';
                            }
                            return (
                              <button key={idx} onClick={() => !showExplain && setSelectedOpt(idx)} disabled={showExplain} className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${style}`}>
                                 <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${showExplain && isCorrectAns ? 'border-emerald-500 bg-emerald-500 text-white' : selectedOpt === idx ? 'border-[#2E3192] bg-[#2E3192] text-white' : 'border-slate-300'}`}>
                                       {showExplain && isCorrectAns ? <Check className="w-3 h-3" /> : <span className="text-[10px]">{String.fromCharCode(65 + idx)}</span>}
                                    </div>
                                    {opt}
                                 </div>
                              </button>
                            );
                         })}
                      </div>
                   )}

                   {/* TYPE 3: ORDER SENTENCE */}
                   {ex.type === 'order_sentence' && (
                     <div className="space-y-6 mb-8">
                        <div className="min-h-[4rem] p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-wrap gap-2 items-center justify-center">
                           {orderedWords.length === 0 && <span className="text-slate-400 font-medium text-sm">Bấm vào các từ bên dưới để sắp xếp</span>}
                           {orderedWords.map((word, idx) => (
                             <button key={idx} onClick={() => handleWordSelect(word, false)} disabled={showExplain} className="px-4 py-2 bg-[#2E3192] text-white font-bold rounded-lg shadow-sm hover:bg-[#1E2060] transition-colors transform active:scale-95">
                               {word}
                             </button>
                           ))}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                           {availableWords.map((word, idx) => (
                             <button key={idx} onClick={() => handleWordSelect(word, true)} disabled={showExplain} className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg hover:border-orange-500 transition-colors transform active:scale-95">
                               {word}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* TYPE 4: TRANSLATE */}
                   {ex.type === 'translate' && (
                     <div className="mb-8 space-y-4">
                        <textarea 
                           value={translateText} onChange={(e) => setTranslateText(e.target.value)} disabled={showExplain}
                           placeholder="Nhập câu dịch tiếng Trung của bạn vào đây..."
                           className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-[#2E3192] resize-none h-32 text-lg disabled:bg-slate-50 disabled:text-slate-600"
                        />
                        <div className="flex gap-2 text-sm font-bold text-slate-500">
                          Gợi ý từ vựng: {ex.hints?.map((hint, i) => <span key={i} className="px-2 py-1 bg-slate-100 rounded-md">{hint}</span>)}
                        </div>
                     </div>
                   )}

                   {/* Explaination & Actions */}
                   {showExplain ? (
                      <div className="animate-in fade-in slide-in-from-top-4">
                         {ex.type === 'translate' || ex.type === 'order_sentence' ? (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Đáp án mẫu chính xác</p>
                               <p className="text-xl font-black text-emerald-800">{ex.type === 'translate' ? ex.expected : ex.correctOrder?.join('')}</p>
                            </div>
                         ) : null}
                         <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                            <p className="flex items-start gap-3 text-[#2E3192]"><Info className="w-5 h-5 shrink-0 mt-0.5" /> <span className="font-medium text-sm leading-relaxed">{ex.explain}</span></p>
                         </div>
                         <button onClick={nextPractice} className="w-full py-4 bg-[#2E3192] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#1E2060] transition-colors flex items-center justify-center gap-2">
                            {currentExIdx < PRACTICE_EXERCISES.length - 1 ? 'Bài tập tiếp theo' : 'Hoàn thành luyện tập'} <ChevronRight className="w-5 h-5" />
                         </button>
                      </div>
                   ) : (
                      <button 
                         onClick={checkPracticeAnswer} 
                         disabled={!isPracticeAnswerReady()}
                         className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-600 transition-colors"
                      >
                         Kiểm tra đáp án
                      </button>
                   )}
                </div>
              </div>
            )}

            {/* TAB: DÙNG NGAY */}
            {activeTab === 'apply' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <section className="bg-white rounded-3xl p-8 border border-[#EADBC8] shadow-sm flex flex-col h-[600px]">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                     <div>
                        <h3 className="text-xl font-black flex items-center gap-2 text-[#2E3192]">
                           <Zap className="w-6 h-6 text-orange-500" /> Nhập vai Thực chiến
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Đóng vai Quản lý nhà máy và sử dụng các câu vừa học.</p>
                     </div>
                     <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Roleplay</span>
                  </div>
                  
                  {/* Chat Container */}
                  <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-6 overflow-y-auto custom-scrollbar space-y-6 mb-4">
                     {roleplayChat.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${msg.role === 'user' ? 'bg-orange-500' : 'bg-[#2E3192]'}`}>
                              {msg.role === 'user' ? 'Bạn' : 'AI'}
                           </div>
                           <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-[#2E3192]'} p-4 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none border border-slate-200'} shadow-sm`}>
                              <p className={`font-bold text-lg ${msg.role === 'user' ? 'text-white' : 'text-[#2E3192]'}`}>{msg.content}</p>
                              {msg.vi && <p className={`text-xs mt-2 pt-2 border-t ${msg.role === 'user' ? 'border-orange-400 text-orange-100' : 'border-slate-100 text-slate-500'}`}>{msg.vi}</p>}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Chat Input */}
                  <div className="shrink-0">
                     <textarea 
                        value={roleplayInput}
                        onChange={(e) => setRoleplayInput(e.target.value)}
                        placeholder="Gõ câu trả lời của bạn bằng tiếng Trung..." 
                        className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none h-24 text-base"
                     ></textarea>
                     <div className="flex justify-between items-center mt-3">
                        <button className="text-slate-400 hover:text-[#2E3192] text-sm font-bold flex items-center gap-2 transition-colors">
                           <RefreshCw className="w-4 h-4" /> Bắt đầu lại
                        </button>
                        <button onClick={handleRoleplaySubmit} disabled={!roleplayInput.trim()} className="px-8 py-3 bg-[#2E3192] disabled:bg-slate-300 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#1E2060] transition-colors shadow-md">
                           <Send className="w-4 h-4" /> Gửi để AI chấm
                        </button>
                     </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>

        {/* SIDEBAR TONGXIAO AI (30%) */}
        <aside className="w-80 lg:w-96 bg-white border-l border-[#EADBC8] flex flex-col shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-[#EADBC8] flex items-center gap-3 bg-slate-50">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-[#2E3192] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#2E3192]">Tongxiao AI Mentor</h2>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sẵn sàng hỗ trợ
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-black ${msg.role === 'user' ? 'bg-orange-500' : 'bg-[#2E3192]'}`}>
                  {msg.role === 'user' ? 'Bạn' : 'AI'}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-orange-50 text-orange-900 border border-orange-100 rounded-tr-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#EADBC8] bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => setAiInput('Giải thích thêm ngữ pháp này')} className="text-[10px] px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-colors">Giải thích ngữ pháp</button>
              <button onClick={() => setAiInput('Cho thêm ví dụ thực tế')} className="text-[10px] px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-colors">Thêm ví dụ</button>
            </div>
            <form onSubmit={handleAiSubmit} className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Hỏi Tongxiao AI..." 
                className="w-full bg-slate-50 border border-[#EADBC8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20"
              />
              <button type="submit" disabled={!aiInput.trim()} className="absolute right-2 p-1.5 bg-[#2E3192] text-white rounded-lg disabled:opacity-50 hover:bg-[#1E2060] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>

      </div>

      {/* 3. FOOTER ĐIỀU HƯỚNG */}
      <footer className="h-16 bg-white border-t border-[#EADBC8] px-6 flex items-center justify-between shrink-0 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <button className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-[#2E3192] transition-colors">
          <ChevronLeft className="w-5 h-5" /> Bài trước
        </button>
        
        <button onClick={handleCompletePhase} className="px-8 py-3 bg-[#2E3192] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#1E2060] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
          {activeTab === 'understand' ? 'Tiếp tục: Luyện tập' : activeTab === 'practice' ? 'Tiếp tục: Dùng ngay' : 'Hoàn thành bài học'} <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* POPUP THÔNG BÁO HOÀN THÀNH */}
      {showProgressPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E3192]/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <Target className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-black text-[#2E3192]">Tuyệt vời!</h3>
              <p className="text-slate-500 font-medium">Bạn vừa hoàn thành {MOCK_LESSON.title}</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-8 border border-slate-100">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Từ mới đã học</span>
                  <span className="text-[#2E3192]">3 từ</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Từ đã lưu sổ tay</span>
                  <span className="text-[#2E3192]">2 từ</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-200">
                  <span className="text-slate-500">Kinh nghiệm (XP)</span>
                  <span className="text-orange-500 flex items-center gap-1">+45 <Zap className="w-3 h-3" /></span>
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowProgressPopup(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                Nghỉ ngơi
              </button>
              <button onClick={() => { setShowProgressPopup(false); navigate(-1); }} className="flex-1 py-3 bg-[#2E3192] text-white font-black rounded-xl hover:bg-[#1E2060] transition-colors shadow-lg">
                Học bài tiếp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
