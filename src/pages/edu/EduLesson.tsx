import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Zap, MessageSquare, Play, 
  CheckCircle2, ChevronRight, Brain, 
  Sparkles, Headphones, PenTool, ArrowLeft,
  Video, FileText, ChevronLeft, Volume2,
  Bookmark, Share2, Info, Star, Award,
  Clock, ShieldCheck, MessageCircle, MoreVertical,
  Maximize2, Flame, Mic, ExternalLink, Download
} from 'lucide-react';

// Sub-step types
type StepType = 'video' | 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'quiz' | 'summary';

interface LessonStep {
  id: string;
  type: StepType;
  title: string;
  duration: string;
  isCompleted: boolean;
}

export default function EduLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'discussion'>('content');

  // Mock Lesson Steps
  const [steps, setSteps] = useState<LessonStep[]>([
    { id: 's1', type: 'video', title: 'Video Khởi Động: Ngữ Cảnh Thực Tế', duration: '5m', isCompleted: true },
    { id: 's2', type: 'vocabulary', title: 'Từ Vựng Cốt Lõi', duration: '10m', isCompleted: true },
    { id: 's3', type: 'grammar', title: 'Cấu Trúc Câu Đàm Phán', duration: '8m', isCompleted: false },
    { id: 's4', type: 'listening', title: 'Luyện Nghe Phản Xạ', duration: '7m', isCompleted: false },
    { id: 's5', type: 'speaking', title: 'Thực Chiến AI Simulation', duration: '10m', isCompleted: false },
    { id: 's6', type: 'quiz', title: 'Kiểm Tra Năng Lực', duration: '5m', isCompleted: false },
    { id: 's7', type: 'summary', title: 'Tổng Kết & Nhận XP', duration: '2m', isCompleted: false },
  ]);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    // Update total progress
    const completed = steps.filter(s => s.isCompleted).length;
    setProgress(Math.round((completed / steps.length) * 100));
  }, [steps]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentStepIndex].isCompleted = true;
      setSteps(newSteps);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] animate-in fade-in duration-700">
      
      {/* 1. TOP NAVIGATION BAR (LMS Style) */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[100] px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/edu/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none mb-1">
              Bài 4: Giao tiếp tại nơi làm việc
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-student-primary transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-black text-student-primary uppercase">{progress}% Hoàn thành</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs font-black">STREAK: 12</span>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 relative">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN LEARNING AREA */}
      <div className="pt-16 flex min-h-screen">
        
        {/* Left: Content Area */}
        <main className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Step Header */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3 text-student-primary">
                  <div className="p-2 bg-student-primary/10 rounded-lg">
                    {currentStep.type === 'video' && <Video className="w-5 h-5" />}
                    {currentStep.type === 'vocabulary' && <BookOpen className="w-5 h-5" />}
                    {currentStep.type === 'grammar' && <PenTool className="w-5 h-5" />}
                    {currentStep.type === 'listening' && <Headphones className="w-5 h-5" />}
                    {currentStep.type === 'speaking' && <MessageSquare className="w-5 h-5" />}
                    {currentStep.type === 'quiz' && <Award className="w-5 h-5" />}
                    {currentStep.type === 'summary' && <Star className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">
                    Bước {currentStepIndex + 1}: {currentStep.type}
                  </span>
               </div>
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                 <Clock className="w-4 h-4" /> Thời gian: {currentStep.duration}
               </div>
            </div>

            {/* Dynamic Content Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
               
               {/* VIDEO STEP EXAMPLE */}
               {currentStep.type === 'video' && (
                 <div className="flex flex-col h-full">
                    <div className="aspect-video bg-black relative group">
                       <img 
                         src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
                         className="w-full h-full object-cover opacity-60" 
                         alt="Video Placeholder"
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-all border border-white/30 group-hover:bg-student-primary group-hover:border-student-primary">
                            <Play className="w-8 h-8 fill-current ml-1" />
                          </button>
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <button className="text-white hover:text-student-primary transition-colors"><Volume2 className="w-5 h-5" /></button>
                             <span className="text-white text-xs font-bold">01:45 / 05:00</span>
                          </div>
                          <button className="text-white hover:text-student-primary transition-colors"><Maximize2 className="w-5 h-5" /></button>
                       </div>
                    </div>
                    <div className="p-8 space-y-4">
                       <h3 className="text-2xl font-black text-slate-900">Quan sát tình huống hội thoại</h3>
                       <p className="text-slate-600 font-medium leading-relaxed">
                         Trong video này, hãy chú ý cách Trương tiên sinh sử dụng cấu trúc <span className="text-student-primary font-bold italic">"刚才"</span> để phản hồi email một cách lịch sự. Đây là chìa khóa để làm chủ tiếng Trung công sở.
                       </p>
                    </div>
                 </div>
               )}

               {/* VOCABULARY STEP EXAMPLE */}
               {currentStep.type === 'vocabulary' && (
                 <div className="p-10 space-y-10">
                    <div className="text-center space-y-2">
                       <h3 className="text-3xl font-black text-[#2E3192]">Từ vựng trọng tâm</h3>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hãy bấm vào từ để nghe phát âm</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {[
                         { zh: '合同 (hétóng)', vi: 'Hợp đồng', pinyin: 'hétóng' },
                         { zh: '谈 (tán)', vi: 'Đàm phán', pinyin: 'tán' },
                         { zh: '解决 (jiějué)', vi: 'Giải quyết', pinyin: 'jiějué' },
                         { zh: '邮件 (yóujiàn)', vi: 'Email', pinyin: 'yóujiàn' }
                       ].map((item, i) => (
                         <div key={i} className="group p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-student-primary hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-student-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-student-primary/10 transition-all" />
                            <div className="flex justify-between items-start mb-6 relative z-10">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-student-primary shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                  <Volume2 className="w-7 h-7" />
                               </div>
                               <button className="w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-300 hover:text-orange-400 transition-colors">
                                  <Star className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative z-10">
                               <h4 className="text-5xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-student-primary transition-colors">{item.zh}</h4>
                               <p className="text-base text-student-primary font-black mb-6 uppercase tracking-widest opacity-60">{item.pinyin}</p>
                               <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                  <div className="w-1.5 h-1.5 bg-student-primary rounded-full" />
                                  <p className="text-xl font-bold text-slate-600">{item.vi}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* SPEAKING STEP EXAMPLE */}
               {currentStep.type === 'speaking' && (
                 <div className="flex flex-col h-full">
                    <div className="bg-[#1E2060] p-12 text-white space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-student-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                       <div className="relative z-10 flex items-center gap-6">
                          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                             <Brain className="w-10 h-10" />
                          </div>
                          <div>
                             <h3 className="text-3xl font-black">AI Voice Simulation</h3>
                             <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Kịch bản: Phản hồi email khách hàng</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-12 space-y-10 flex-1 flex flex-col items-center justify-center text-center">
                       <div className="relative">
                          <div className="w-40 h-40 bg-white rounded-full border-8 border-slate-50 flex items-center justify-center relative shadow-inner">
                             <div className="absolute inset-0 bg-student-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                             <div className="absolute inset-0 bg-student-primary/10 rounded-full animate-pulse" />
                             <Mic className="w-16 h-16 text-student-primary relative z-10" />
                          </div>
                          
                          {/* Simulated Voice Wave */}
                          <div className="flex items-center justify-center gap-1.5 h-12 mt-8">
                             {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((scale, i) => (
                               <div 
                                 key={i} 
                                 className="w-1.5 bg-student-primary rounded-full animate-pulse" 
                                 style={{ height: `${scale * 100}%`, animationDelay: `${i * 0.1}s` }} 
                               />
                             ))}
                          </div>
                       </div>

                       <div className="max-w-md space-y-6">
                          <div className="space-y-2">
                             <p className="text-2xl font-black text-slate-900 leading-tight">"Tôi vừa nhận được email của bạn, chúng ta hãy giải quyết vấn đề này."</p>
                             <p className="text-sm text-student-primary font-bold italic opacity-60">Wǒ gāngcái shōudào nǐ de yóujiàn, wǒmen lái jiějué zhège wèntí.</p>
                          </div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Hãy nhấn giữ để ghi âm câu trả lời</p>
                       </div>

                       <button className="px-16 py-6 bg-[#2E3192] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(46,49,146,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          Bắt đầu ghi âm
                       </button>
                    </div>
                 </div>
               )}

            </div>

            {/* Content Tabs (LMS Style) */}
            <div className="space-y-6">
               <div className="flex items-center gap-8 border-b border-slate-200">
                  {['Tóm tắt bài giảng', 'Tài liệu bổ trợ', 'Thảo luận (24)'].map((tab, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveTab(i === 0 ? 'content' : i === 1 ? 'resources' : 'discussion')}
                      className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                        (i === 0 && activeTab === 'content') || (i === 1 && activeTab === 'resources') || (i === 2 && activeTab === 'discussion')
                        ? 'text-student-primary'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                      {((i === 0 && activeTab === 'content') || (i === 1 && activeTab === 'resources') || (i === 2 && activeTab === 'discussion')) && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-student-primary rounded-full" />
                      )}
                    </button>
                  ))}
               </div>

               <div className="p-8 bg-white rounded-3xl border border-slate-200">
                  {activeTab === 'content' && (
                    <div className="prose prose-slate max-w-none">
                       <p className="text-slate-600 leading-relaxed font-medium">
                         Trong bài học này, chúng ta tập trung vào hai điểm ngữ pháp quan trọng: <br/>
                         1. Cách dùng trạng từ thời gian <strong>刚才 (gāngcái)</strong>: dùng để chỉ một thời gian rất ngắn trước thời điểm nói. <br/>
                         2. Cách diễn đạt giải quyết vấn đề trong công việc bằng động từ <strong>解决 (jiějué)</strong>.
                       </p>
                    </div>
                  )}
                  {activeTab === 'resources' && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-student-primary transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-student-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                <FileText className="w-7 h-7" />
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900">Phiếu Bài Tập Bài {id?.replace(/\D/g, '') || '4'}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF • 1.2 MB</p>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-student-primary hover:border-student-primary transition-all shadow-sm">
                                <Download className="w-5 h-5" />
                             </button>
                             <button onClick={() => navigate(`/edu/homework/${id}`)} className="px-6 py-3 bg-student-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-student-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" /> Nộp bài ngay
                             </button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </main>

        {/* Right: Sidebar Panel */}
        <aside className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-64px)]">
           <div className="p-6 border-b border-slate-200">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 Tiến trình bài học
              </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {steps.map((step, index) => (
                <button 
                  key={step.id}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                    index === currentStepIndex 
                    ? 'bg-student-primary/5 border border-student-primary/20' 
                    : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    step.isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : index === currentStepIndex
                      ? 'border-student-primary text-student-primary'
                      : 'border-slate-200 text-slate-300 group-hover:border-slate-300'
                  }`}>
                    {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{index + 1}</span>}
                  </div>
                  <div className="text-left flex-1 overflow-hidden">
                     <p className={`text-[11px] font-black truncate ${index === currentStepIndex ? 'text-student-primary' : 'text-slate-700'}`}>
                        {step.title}
                     </p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {step.type} • {step.duration}
                     </p>
                  </div>
                </button>
              ))}
           </div>

           <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                 </div>
                 <p className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest flex items-center gap-2">
                   <Brain className="w-4 h-4" /> AI Note-Taker
                 </p>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                   "Bạn thường hay nhầm lẫn âm 'h' và 'k'. Hãy chú ý nghe kỹ phần Vocabulary để cải thiện nhé!"
                 </p>
              </div>
           </div>
        </aside>
      </div>

      {/* 3. FLOATING ACTION FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 px-8 z-50">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button 
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                currentStepIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
               <ChevronLeft className="w-4 h-4" /> Quay Lại
            </button>

            <div className="flex items-center gap-8">
               <div className="hidden sm:flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Phần thưởng hoàn thành</p>
                     <p className="text-sm font-black text-emerald-600">+250 XP & 1 Badge</p>
                  </div>
               </div>
               
               <button 
                 onClick={handleNext}
                 className="flex items-center gap-3 px-10 py-4 bg-student-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-student-primary/30 hover:scale-105 transition-all group"
               >
                  {currentStepIndex === steps.length - 1 ? 'Hoàn Thành Bài Học' : 'Tiếp Theo'}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </footer>

      {/* Floating Notes Toggle */}
      <button 
        onClick={() => setShowNotes(!showNotes)}
        className="fixed bottom-24 right-8 w-14 h-14 bg-[#2E3192] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[60] group"
      >
        <PenTool className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Side Notes Drawer (Simplified) */}
      {showNotes && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[70] p-8 border-l border-slate-200 animate-in slide-in-from-right duration-500">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-[#2E3192] uppercase text-xs tracking-widest">Sổ tay học tập</h3>
              <button onClick={() => setShowNotes(false)} className="text-slate-400"><ChevronRight className="w-6 h-6" /></button>
           </div>
           <textarea 
             placeholder="Ghi chú nhanh kiến thức quan trọng..."
             className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-student-primary transition-all"
           />
           <button className="w-full py-4 bg-student-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4">
              Lưu ghi chú
           </button>
        </div>
      )}

    </div>
  );
}
