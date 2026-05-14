import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Upload, Mic, Play, 
  CheckCircle2, AlertCircle, FileText, Send, Paperclip,
  Brain, Volume2, BookOpen, MessageSquare, Trash2, StopCircle
} from 'lucide-react';

export default function EduHomework() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissionType, setSubmissionType] = useState<'upload' | 'record' | 'text'>('record');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<boolean>(false); // Mock audio presence
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [isAiGrading, setIsAiGrading] = useState(false);
  
  // MOCK HW DATA
  const hw = {
    title: 'Nộp file ghi âm Bài khóa 4',
    class: 'Lớp Tối 2-4-6',
    deadline: '23:59 Hôm nay',
    description: 'Nghe Audio mẫu trong tab Ôn luyện, sau đó tự đọc lại toàn bộ Đoạn hội thoại 1 (Trang 45, Giáo trình Tongxiao). Thu âm rõ ràng, đặc biệt chú ý thanh 4.',
    type: 'audio',
    referenceText: [
       { pinyin: 'Nǐ hǎo, zhè shì nǐ de fángkǎ.', hanzi: '你好，这是你的房卡。', vi: 'Xin chào, đây là thẻ phòng của bạn.' },
       { pinyin: 'Xièxiè. Qǐngwèn zǎocān zài jǐ lóu?', hanzi: '谢谢。请问早餐在几楼？', vi: 'Cảm ơn. Cho hỏi bữa sáng ở tầng mấy?' },
       { pinyin: 'Zǎocān zài èr lóu, qī diǎn zhì jiǔ diǎn.', hanzi: '早餐在二楼，七点至九点。', vi: 'Bữa sáng ở tầng 2, từ 7 giờ đến 9 giờ.' }
    ]
  };

  // Timer logic for recording mock
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecord = () => {
    setAiFeedback(null);
    setRecordedAudio(false);
    setRecordingTime(0);
    setIsRecording(true);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    setRecordedAudio(true);
  };

  const handleAiPregrade = () => {
    setIsAiGrading(true);
    setTimeout(() => {
      setIsAiGrading(false);
      setAiFeedback({
        score: 85,
        fluency: 'Khá tốt',
        issues: [
          { word: '房卡 (fángkǎ)', feedback: 'Âm "fáng" thanh 2 bạn đọc hơi giống thanh 1. Hãy kéo dài và nâng giọng lên một chút.' },
          { word: '二楼 (èr lóu)', feedback: 'Thanh 4 của "èr" rất dứt khoát, làm tốt lắm!' }
        ]
      });
    }, 2000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
     return (
        <div className="flex flex-col h-screen bg-[#F9F6ED] items-center justify-center p-6">
           <div className="w-full max-w-md bg-white rounded-[3rem] p-10 text-center shadow-2xl border border-[#EADBC8] animate-in zoom-in-95">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                 <CheckCircle2 className="w-12 h-12 relative z-10" />
                 <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
              </div>
              <h2 className="text-3xl font-black text-[#2E3192] mb-4">Nộp bài thành công!</h2>
              <p className="text-slate-500 font-medium mb-8">Bài tập của bạn đã được lưu vào hệ thống và gửi đến Giảng viên. Kết quả chấm sẽ được thông báo sớm nhất.</p>
              <button onClick={() => navigate('/edu/dashboard')} className="w-full py-4 bg-[#2E3192] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#1E2060] transition-colors shadow-[0_10px_30px_rgba(46,49,146,0.3)]">
                 Về Không Gian Học Tập
              </button>
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9F6ED] text-[#2E3192] font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-20 bg-white border-b border-[#EADBC8] px-6 md:px-10 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest">
             <ArrowLeft className="w-4 h-4" /> Thoát
           </button>
           <div className="h-8 w-px bg-slate-200 mx-6"></div>
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                 <Clock className="w-3 h-3" /> Hạn: {hw.deadline}
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
           <BookOpen className="w-4 h-4" /> {hw.class}
        </div>
      </header>

      {/* MAIN WORKSPACE (SPLIT PANE) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         
         {/* LEFT PANE: CONTEXT & REFERENCE */}
         <div className="w-full lg:w-1/2 p-6 md:p-8 overflow-y-auto custom-scrollbar border-r border-[#EADBC8] bg-white/50">
            <div className="max-w-xl mx-auto space-y-8">
               
               <div>
                  <h1 className="text-3xl font-black text-[#2E3192] leading-snug mb-4">{hw.title}</h1>
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-slate-600 text-sm leading-relaxed font-medium">
                     <strong className="text-blue-800">📌 Hướng dẫn:</strong> {hw.description}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                     <FileText className="w-5 h-5 text-orange-500" /> Nội dung tham khảo
                  </h3>
                  <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-6">
                     {hw.referenceText.map((line, idx) => (
                        <div key={idx} className="group relative">
                           <button className="absolute -left-3 top-2 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#2E3192] hover:bg-[#2E3192] hover:text-white">
                              <Play className="w-3 h-3 ml-0.5" />
                           </button>
                           <div className="pl-8">
                              <p className="text-xs font-bold text-slate-400 mb-1 font-mono tracking-wide">{line.pinyin}</p>
                              <p className="text-2xl font-black text-[#2E3192] mb-1">{line.hanzi}</p>
                              <p className="text-sm font-medium text-slate-500">{line.vi}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT PANE: SUBMISSION TOOL */}
         <div className="w-full lg:w-1/2 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white">
            <div className="max-w-xl mx-auto h-full flex flex-col">
               
               <div className="flex gap-4 mb-8 shrink-0">
                  <button onClick={() => setSubmissionType('record')} className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${submissionType === 'record' ? 'border-[#2E3192] bg-[#2E3192]/5 text-[#2E3192]' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                     <Mic className="w-5 h-5" /> Ghi âm
                  </button>
                  <button onClick={() => setSubmissionType('upload')} className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${submissionType === 'upload' ? 'border-[#2E3192] bg-[#2E3192]/5 text-[#2E3192]' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                     <Upload className="w-5 h-5" /> Tải File
                  </button>
               </div>

               {/* RECORDING UI */}
               {submissionType === 'record' && (
                  <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8">
                     
                     {/* Bảng ghi âm */}
                     <div className={`flex-1 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center p-8 relative overflow-hidden ${isRecording ? 'border-red-400 bg-red-50/50 shadow-[0_0_50px_rgba(248,113,113,0.1)]' : recordedAudio ? 'border-emerald-400 bg-emerald-50/50' : 'border-[#EADBC8] bg-slate-50'}`}>
                        
                        {!isRecording && !recordedAudio && (
                           <div className="text-center">
                              <button onClick={handleStartRecord} className="w-28 h-28 rounded-full bg-white border-4 border-[#2E3192] text-[#2E3192] flex items-center justify-center hover:bg-[#2E3192] hover:text-white transition-all shadow-xl group relative mx-auto mb-6">
                                 <Mic className="w-12 h-12 group-hover:scale-110 transition-transform" />
                              </button>
                              <h3 className="font-black text-xl text-[#2E3192]">Bấm để bắt đầu thu âm</h3>
                              <p className="text-sm font-medium text-slate-400 mt-2">Hệ thống sẽ lọc tiếng ồn tự động</p>
                           </div>
                        )}

                        {isRecording && (
                           <div className="text-center w-full relative z-10">
                              <p className="text-5xl font-black text-red-500 font-mono tracking-widest mb-12">{formatTime(recordingTime)}</p>
                              
                              {/* Fake Audio Waveform */}
                              <div className="flex items-center justify-center gap-1 h-16 mb-12">
                                 {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-2 bg-red-400 rounded-full animate-wave" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 0.1}s` }} />
                                 ))}
                              </div>

                              <button onClick={handleStopRecord} className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-105 transition-all shadow-xl mx-auto">
                                 <StopCircle className="w-10 h-10" />
                              </button>
                           </div>
                        )}

                        {recordedAudio && (
                           <div className="text-center w-full">
                              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                                 <Volume2 className="w-10 h-10" />
                              </div>
                              <h3 className="font-black text-xl text-[#2E3192] mb-2">Đã thu âm xong ({formatTime(recordingTime)})</h3>
                              
                              <div className="flex items-center justify-center gap-4 mt-8">
                                 <button onClick={handleStartRecord} className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                                    <Trash2 className="w-4 h-4" /> Thu lại
                                 </button>
                                 <button className="px-6 py-3 rounded-xl bg-[#2E3192] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 shadow-lg">
                                    <Play className="w-4 h-4" /> Nghe lại
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* AI PRE-GRADE SECTION */}
                     {recordedAudio && !aiFeedback && (
                        <div className="mt-6 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-between">
                           <div>
                              <p className="font-black text-[#2E3192] flex items-center gap-2 mb-1">
                                 <Brain className="w-5 h-5 text-indigo-500" /> Chấm điểm AI nháp
                              </p>
                              <p className="text-xs font-medium text-slate-500">Kiểm tra lỗi phát âm trước khi gửi cho giáo viên.</p>
                           </div>
                           <button onClick={handleAiPregrade} disabled={isAiGrading} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors disabled:opacity-50">
                              {isAiGrading ? 'Đang phân tích...' : 'Phân tích ngay'}
                           </button>
                        </div>
                     )}

                     {aiFeedback && (
                        <div className="mt-6 p-6 bg-white border border-[#EADBC8] rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
                           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                                    {aiFeedback.score}
                                 </div>
                                 <div>
                                    <p className="font-black text-[#2E3192]">Điểm phát âm</p>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Đạt yêu cầu</p>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-4">
                              {aiFeedback.issues.map((issue: any, idx: number) => (
                                 <div key={idx} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                                    <div>
                                       <span className="font-black text-[#2E3192] text-sm">{issue.word}</span>
                                       <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">{issue.feedback}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* UPLOAD UI */}
               {submissionType === 'upload' && (
                  <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-[2.5rem] p-10 hover:border-[#2E3192] hover:bg-blue-50/50 transition-colors cursor-pointer group">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#2E3192] shadow-sm mb-6 transition-colors">
                        <Paperclip className="w-8 h-8" />
                     </div>
                     <p className="font-black text-xl text-[#2E3192] mb-2">Kéo thả File vào đây</p>
                     <p className="text-sm font-medium text-slate-400 text-center max-w-xs">
                        Hỗ trợ ảnh (.jpg, .png) để nộp vở viết, hoặc file âm thanh/video (.mp3, .mp4). Tối đa 50MB.
                     </p>
                  </div>
               )}

               {/* SUBMIT BUTTON */}
               <div className="shrink-0 mt-8">
                  <button 
                     onClick={handleSubmit} 
                     disabled={isSubmitting || (submissionType === 'record' && !recordedAudio)}
                     className="w-full py-5 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                     {isSubmitting ? 'Đang mã hóa & gửi...' : 'Nộp bài chính thức'} <Send className="w-5 h-5" />
                  </button>
                  <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
                     <CheckCircle2 className="w-3 h-3" /> Tự động lưu bản nháp
                  </p>
               </div>

            </div>
         </div>

      </div>
      
      {/* Waveform Animation Style */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
