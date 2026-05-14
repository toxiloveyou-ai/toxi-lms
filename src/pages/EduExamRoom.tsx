import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Timer, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Sparkles,
  Trophy,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getFinalExam, submitExamResult, issueCertificate } from '../lib/api/eduLifecycle';
import { supabase } from '../lib/supabase';


interface Question {
  id: string;
  type: 'mcq' | 'text' | 'order';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  pinyin?: string;
}

export default function EduExamRoom() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    loadExam();
  }, [courseId]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && exam && !isFinished) {
      handleSubmit();
    }
  }, [timeLeft, isFinished, exam]);

  async function loadExam() {
    try {
      setLoading(true);
      const [examRes, courseRes] = await Promise.all([
        getFinalExam(courseId!),
        supabase.from('courses').select('title').eq('id', courseId).single()
      ]);


      if (courseRes.data) setCourse(courseRes.data);

      if (examRes.data) {
        setExam(examRes.data);
        setQuestions(examRes.data.questions_json || []);
        setTimeLeft(examRes.data.duration_minutes * 60);
      } else {
        // Mock data if no exam exists yet for development
        const mockQuestions: Question[] = [
          { id: 'q1', type: 'mcq', question: 'Chọn từ đúng cho "Chào buổi sáng":', options: ['你好', '早上好', '晚安', '谢谢'], correctAnswer: 1, pinyin: 'Zǎoshang hǎo' },
          { id: 'q2', type: 'mcq', question: 'Dịch câu: "Tôi là học viên Toxi"', options: ['我是Toxi的学生', '我是老师', '我不去', '你呢'], correctAnswer: 0 },
          { id: 'q3', type: 'text', question: 'Viết từ "Học tập" bằng Hán tự:', correctAnswer: '学习' },
        ];
        setQuestions(mockQuestions);
        setTimeLeft(30 * 60);
        setExam({ title: 'Bài thi cuối khóa', passing_score: 70 });
      }
    } catch (err) {
      console.error('Error loading exam:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: value }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Calculate Score
      let correct = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) correct++;
      });
      
      const score = Math.round((correct / questions.length) * 100);
      const isScoreHighEnough = score >= (exam?.passing_score || 70);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { passed, error } = await submitExamResult(
        user.id,
        exam?.id || '00000000-0000-0000-0000-000000000000',
        score,
        answers
      );


      if (error) throw error;

      setResult({ score, correct, total: questions.length, passed });
      setIsFinished(true);

      if (passed) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2E3192', '#F7931E', '#FFD700']
        });
        
        // Auto-generate certificate
        await generateCertificate(user.id, courseId!, score);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function generateCertificate(userId: string, courseId: string, score: number) {
    try {
      await issueCertificate(userId, courseId, score);
    } catch (err) {
      console.error('Cert generation error:', err);
    }
  }


  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (isFinished) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center space-y-8 animate-in zoom-in duration-500">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${result.passed ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
          {result.passed ? <Trophy className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">{result.passed ? 'Chúc mừng bạn!' : 'Cố gắng lần sau nhé!'}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            {result.passed ? `Bạn đã vượt qua kỳ thi ${course?.title}` : 'Bạn chưa đạt điểm đỗ kỳ thi này'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Điểm số</p>
            <p className="text-3xl font-black text-indigo-600">{result.score}%</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đúng</p>
            <p className="text-3xl font-black text-slate-800">{result.correct}/{result.total}</p>
          </div>
        </div>

        <div className="pt-6 space-y-3">
          {result.passed ? (
            <button onClick={() => navigate('/edu/profile')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-indigo-200 transition-all">
              Xem chứng chỉ ngay
            </button>
          ) : (
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">
              Thi lại
            </button>
          )}
          <button onClick={() => navigate('/edu/dashboard')} className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight">{exam?.title || 'Bài thi cuối khóa'}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-colors ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
            <Timer className="w-5 h-5" />
            <span className="text-lg font-black tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={handleSubmit} className="px-8 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
            Nộp bài
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto p-8 py-12 space-y-10">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>Câu hỏi {currentIdx + 1} / {questions.length}</span>
            <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Hoàn thành</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg">Question #{currentIdx + 1}</span>
                 {q.pinyin && <span className="text-slate-400 font-bold text-xs italic">{q.pinyin}</span>}
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">{q.question}</h2>
            </div>

            {q.type === 'mcq' && (
              <div className="grid grid-cols-1 gap-4">
                {q.options?.map((opt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(idx)}
                    className={`p-6 rounded-[2rem] border-2 text-left font-black transition-all group/opt flex items-center gap-5 ${answers[q.id] === idx ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-400 hover:bg-slate-50'}`}>
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-colors ${answers[q.id] === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-300 group-hover/opt:border-indigo-400'}`}>
                      <span className="text-xs font-black">{String.fromCharCode(65 + idx)}</span>
                    </div>
                    <span className="text-lg">{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {q.type === 'text' && (
              <div className="space-y-4">
                <textarea 
                  className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-2xl font-black min-h-[200px] focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                  placeholder="Nhập câu trả lời của bạn..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                />
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-700">
                   <Sparkles className="w-5 h-5 shrink-0" />
                   <p className="text-[10px] font-bold">Mẹo: Chú ý viết đúng bộ thủ và thứ tự nét nếu có thể.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-3 px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-all disabled:opacity-0">
            <ChevronLeft className="w-5 h-5" /> Câu trước
          </button>
          
          <div className="flex gap-4">
            {currentIdx < questions.length - 1 ? (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-3 px-10 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                Câu tiếp theo <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-3 px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Hoàn thành bài thi</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <footer className="bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Hệ thống giám sát tự động: ON</span>
            <span className="flex items-center gap-2 text-indigo-500"><Sparkles className="w-4 h-4" /> AI Grading Engine v1.0</span>
         </div>
         <div>© 2024 TOXI EDU INTELLIGENCE</div>
      </footer>
    </div>
  );
}
