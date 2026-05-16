import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
   ArrowLeft, Clock, Upload, Mic, Play, 
   CheckCircle2, AlertCircle, FileText, Send, Paperclip,
   Brain, Volume2, BookOpen, MessageSquare, Trash2, StopCircle, ExternalLink,
   Info, Loader2, Download, Calendar
} from 'lucide-react';
import { academicApi } from '../../lib/api/academic';
import { supabase } from '../../lib/supabase';

export default function EduHomework() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissionType, setSubmissionType] = useState<'upload' | 'record' | 'text' | 'link'>('record');
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<boolean>(false); // Mock audio presence
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cls, setCls] = useState<any>(null);
  
  // MOCK HW DATA
  const hw = {
    title: 'Nộp bài tập Bài 4 - Google Drive',
    class: 'Lớp Tối 2-4-6',
    deadline: 'Trước buổi học 2 tiếng',
    sessionTime: '20:00 Hôm nay', // Example session time
    description: 'Vui lòng hoàn thành bài tập viết vào file Doc hoặc PDF, tải lên Google Drive cá nhân và nộp link tại đây. Đảm bảo đã mở quyền truy cập cho giáo viên.',
    type: 'link',
    referenceText: [
       { pinyin: 'Nǐ hǎo, zhè shì nǐ de fángkǎ.', hanzi: '你好，这是你的房卡。', vi: 'Xin chào, đây là thẻ phòng của bạn.' },
       { pinyin: 'Xièxiè. Qǐngwèn zǎocān zài jǐ lóu?', hanzi: '谢谢。请问早餐 en zài jǐ lóu?', vi: 'Cảm ơn. Cho hỏi bữa sáng ở tầng mấy?' },
       { pinyin: 'Zǎocān zài èr lóu, qī diǎn zhì jiǔ diǎn.', hanzi: '早餐在二楼，七点至九点.', vi: 'Bữa sáng ở tầng 2, từ 7 giờ đến 9 giờ.' }
    ]
  };

  const [lesson, setLesson] = useState<any>(null);
  
  useEffect(() => {
    fetchClassInfo();
    fetchLessonInfo();
  }, [id]);

  async function fetchLessonInfo() {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setLesson(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchClassInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('edu_class_members')
        .select('*, edu_classes(*)')
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (member?.edu_classes) {
        setCls(member.edu_classes);
      }
    } catch (err) {
      console.error(err);
    }
  }

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

  const handleSubmit = async () => {
    // Deadline check logic (Dynamic for testing)
    const now = new Date();
    const sessionDate = new Date();
    sessionDate.setHours(23, 59, 59, 0); // Set to end of day for testing
    
    const diffMs = sessionDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // In production, we would fetch the actual class schedule
    if (diffHours < 0) {
      setError("Rất tiếc! Đã quá hạn nộp bài.");
      return;
    }

    if (submissionType === 'link' && (!googleDriveLink || !googleDriveLink.includes('drive.google.com'))) {
      setError("Vui lòng nhập link Google Drive hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Bạn cần đăng nhập để nộp bài.");

      let content = '';
      if (submissionType === 'link') content = googleDriveLink;
      else if (submissionType === 'record') content = 'Audio Submission';
      else if (submissionType === 'upload') content = uploadedFileUrl || 'File Submission';
      
      await academicApi.submitHomework(
        id || 'unknown',
        user.id,
        submissionType,
        content
      );

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Lỗi khi nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
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
              <span className={`px-3 py-1 ${error ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'} rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1`}>
                 <Clock className="w-3 h-3" /> Hạn: {hw.deadline}
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                 <Calendar className="w-3 h-3" /> Buổi học: {hw.sessionTime}
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
                  <h1 className="text-3xl font-black text-[#2E3192] leading-snug mb-4">{lesson?.title || hw.title}</h1>
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-slate-600 text-sm leading-relaxed font-medium">
                     <strong className="text-blue-800">📌 Hướng dẫn:</strong> {hw.description}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                     <FileText className="w-5 h-5 text-orange-500" /> Nội dung tham khảo
                  </h3>
                  
                  {/* Worksheet Download Area */}
                  {(lesson?.content_json?.worksheet_url || cls?.syllabus_url) && (
                     <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-between mb-6 group hover:border-[#2E3192]/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2E3192] shadow-sm">
                              <Download className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-xs font-black text-[#2E3192] uppercase">Tải Phiếu Bài Tập</p>
                              <p className="text-[10px] font-bold text-slate-400">File đính kèm cho bài học này</p>
                           </div>
                        </div>
                        <a href={lesson?.content_json?.worksheet_url || cls.syllabus_url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-[#2E3192] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-900/10">
                           Tải xuống
                        </a>
                     </div>
                  )}

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
                     <Upload className="w-5 h-5" /> File
                   </button>
                   <button onClick={() => setSubmissionType('link')} className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${submissionType === 'link' ? 'border-[#2E3192] bg-[#2E3192]/5 text-[#2E3192]' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                     <Paperclip className="w-5 h-5" /> Link Drive
                   </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

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
                  <label className={`flex-1 flex flex-col justify-center items-center bg-slate-50 border-2 border-dashed rounded-[2.5rem] p-10 transition-colors cursor-pointer group animate-in fade-in slide-in-from-right-8 ${uploadedFileUrl ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#2E3192] hover:bg-blue-50/50'}`}>
                     <input 
                        type="file" 
                        className="hidden" 
                        onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (!file) return;
                           
                           setIsUploading(true);
                           setError(null);
                           
                           try {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) throw new Error("Vui lòng đăng nhập.");
                              
                              const fileName = `submissions/${user.id}/${Date.now()}_${file.name}`;
                              const { error: uploadError } = await supabase.storage
                                 .from('exam-assets')
                                 .upload(fileName, file);
                              
                              if (uploadError) throw uploadError;
                              
                              const { data: { publicUrl } } = supabase.storage
                                 .from('exam-assets')
                                 .getPublicUrl(fileName);
                              
                              setUploadedFileUrl(publicUrl);
                              setUploadedFileName(file.name);
                           } catch (err: any) {
                              setError(err.message || "Lỗi khi tải file.");
                           } finally {
                              setIsUploading(false);
                           }
                        }}
                     />
                     <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 transition-colors ${uploadedFileUrl ? 'text-emerald-500' : 'text-slate-400 group-hover:text-[#2E3192]'}`}>
                        {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : (uploadedFileUrl ? <CheckCircle2 className="w-10 h-10" /> : <Paperclip className="w-8 h-8" />)}
                     </div>
                     <p className="font-black text-xl text-[#2E3192] mb-2">{uploadedFileName || 'Chọn File bài tập'}</p>
                     <p className="text-sm font-medium text-slate-400 text-center max-w-xs">
                        {uploadedFileUrl ? 'Sẵn sàng để nộp!' : 'Hỗ trợ ảnh (.jpg, .png) để nộp vở viết, hoặc file âm thanh/video (.mp3, .mp4). Tối đa 50MB.'}
                     </p>
                  </label>
               )}

                {/* LINK UI */}
                {submissionType === 'link' && (
                  <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-8">
                    <div className="bg-white rounded-[2.5rem] border-2 border-[#EADBC8] p-8 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <ExternalLink className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-[#2E3192]">Dán Link Google Drive</h3>
                          <p className="text-xs font-medium text-slate-400">Đảm bảo link ở chế độ "Bất kỳ ai có liên kết đều có thể xem"</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <input 
                            type="text" 
                            value={googleDriveLink}
                            onChange={(e) => {
                              setGoogleDriveLink(e.target.value);
                              setError(null);
                            }}
                            placeholder="https://drive.google.com/..."
                            className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-[#2E3192] focus:bg-white focus:border-[#2E3192] outline-none transition-all"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                             <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Trạng thái Link</p>
                             <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                               {googleDriveLink.includes('drive.google.com') ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                               {googleDriveLink.includes('drive.google.com') ? 'Định dạng hợp lệ' : 'Đang chờ nhập'}
                             </p>
                          </div>
                          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                             <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Thời gian nộp</p>
                             <p className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                               <Clock className="w-3 h-3" /> Đúng hạn
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                       <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                       <div className="space-y-1">
                          <p className="text-xs font-black text-blue-800">Mẹo nhỏ Toxi AI:</p>
                          <p className="text-xs font-medium text-blue-700 leading-relaxed">
                            Nộp bài trước ít nhất 2 tiếng giúp giáo viên có thời gian xem kỹ lỗi sai của bạn và chuẩn bị tài liệu sửa lỗi riêng cho bạn trong buổi học.
                          </p>
                       </div>
                    </div>
                  </div>
                )}

               {/* SUBMIT BUTTON */}
               <div className="shrink-0 mt-8">
                   <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || (submissionType === 'record' && !recordedAudio) || (submissionType === 'link' && !googleDriveLink)}
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
