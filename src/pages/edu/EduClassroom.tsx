import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Video, FileText,
  ExternalLink, MessageCircle, Users,
  CheckCircle2, Clock, Megaphone, PlayCircle,
  Sparkles, Target, Zap, Mic, ArrowUpRight,
  ChevronRight, Trophy, Star, Layout, GraduationCap,
  Calendar, Info, BookOpen, Shield, Download, ArrowRight, Library
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCourseProgress } from '../../lib/api/lessonProgress';

export default function EduClassroom() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cls, setCls] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [classMembersCount, setClassMembersCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchClassData(); }, [classId]);

  async function fetchClassData() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch class
      const { data: classData, error: classError } = await supabase
        .from('edu_classes')
        .select('*, courses(*)')
        .eq('id', classId)
        .maybeSingle();

      if (classError) { setError(`Lỗi: ${classError.message}`); return; }
      if (!classData) { setError(`Không tìm thấy lớp học.`); return; }
      setCls(classData);
      setAnnouncements(classData.announcements_json || []);

      // 2. Count class members
      const { count } = await supabase
        .from('edu_class_members')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId);
      setClassMembersCount(count || 0);

      // 3. Lessons
      if (classData.course_id) {
        const { data: lessonData } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('course_id', classData.course_id)
          .order('order_index', { ascending: true });
        const lessonList = lessonData || [];
        setLessons(lessonList);

        // 4. Progress
        if (user && lessonList.length) {
          const ids = lessonList.map((l: any) => l.id);
          const prog = await getCourseProgress(user.id, ids);
          setProgressMap(prog);

          // 5. Recent activity
          const { data: recentData } = await supabase
            .from('edu_lesson_progress')
            .select('lesson_id, completed_at, xp_earned, score')
            .eq('user_id', user.id)
            .in('lesson_id', ids)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(3);
          if (recentData) {
            setRecentActivity(recentData.map(r => ({
              ...r,
              title: lessonList.find((l: any) => l.id === r.lesson_id)?.title || 'Bài học'
            })));
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-indigo-900 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading Classroom...</p>
        </div>
      </div>
    );
  }

  const completedCount = Object.values(progressMap).filter((p: any) => p.status === 'completed').length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans pb-20 selection:bg-indigo-100 overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-50/30 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

      <section className="bg-white border-b border-slate-200 px-6 py-4 lg:px-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 shadow-sm">
         <div className="flex items-center gap-5">
            <button onClick={() => navigate('/edu/dashboard')} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-10 w-px bg-slate-200 hidden lg:block" />
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[7px] font-black uppercase tracking-widest rounded-md shadow-sm">Official Class</span>
                  {cls.courses?.level && <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">• Level {cls.courses.level}</span>}
                  <span className="text-[10px] font-bold text-slate-400">• {cls.schedule || 'Active Daily'}</span>
               </div>
               <h1 className="text-xl font-black text-slate-900 tracking-tight">{cls.name}</h1>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
               <div className="text-right hidden sm:block">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tiến độ khóa</p>
                  <p className="text-sm font-black text-indigo-900 leading-none">{progressPct}%</p>
               </div>
               <div className="w-10 h-10 relative flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="20" cy="20" r="16" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                     <circle cx="20" cy="20" r="16" fill="transparent" stroke="#2E3192" strokeWidth="4" strokeDasharray={100.5} strokeDashoffset={100.5 * (1 - progressPct/100)} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8px] font-black text-indigo-900">{completedCount}/{lessons.length}</span>
               </div>
            </div>
            {cls.meeting_url && (
               <a href={cls.meeting_url} target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-gradient-to-r from-orange-500 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Video className="w-4 h-4" /> Vào học Zoom
               </a>
            )}
         </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
           <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <PlayCircle className="w-8 h-8 text-indigo-600 p-2 bg-indigo-50 rounded-xl" /> 
                    Hành trình học tập
                 </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                 {lessons.map((lesson, idx) => {
                    const prog = progressMap[lesson.id];
                    const isCompleted = prog?.status === 'completed';
                    return (
                       <div key={lesson.id} onClick={() => navigate(`/edu/course/${cls.course_id}/lesson/${lesson.id}`)}
                          className={`group flex items-center gap-5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isCompleted ? 'bg-emerald-50/30 border-emerald-100/50 hover:border-emerald-500' : 'bg-white border-slate-100 hover:border-indigo-600 hover:shadow-md'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                             {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-900 truncate">{lesson.title}</h4>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                   {lesson.lesson_type === 'video' ? <Video className="w-3 h-3 text-indigo-500" /> : <FileText className="w-3 h-3 text-orange-500" />}
                                   {lesson.lesson_type || 'Interactive'}
                                </span>
                             </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transition-all" />
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           {/* ANNOUNCEMENTS */}
           <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Bell className="w-4.5 h-4.5" /></div>
                 <h3 className="text-base font-black tracking-tight">Thông báo lớp</h3>
              </div>
              <div className="space-y-3 relative z-10">
                 {announcements.map((ann, i) => (
                    <div key={i} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                       <p className="text-[10px] font-black text-orange-600 mb-1">{ann.title}</p>
                       <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{ann.content}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* RESOURCES */}
           <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Library className="w-5 h-5" /></div>
                    <h3 className="text-base font-black tracking-tight">Thư viện số</h3>
                 </div>
                 <span className="px-2 py-0.5 bg-indigo-50 text-[#2E3192] rounded-md text-[8px] font-black uppercase">Lesson Files</span>
              </div>
              <div className="space-y-3">
                 {/* Class Main Syllabus */}
                 {cls?.syllabus_url && (
                    <a href={cls.syllabus_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 group cursor-pointer p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl transition-all hover:shadow-lg">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2E3192] shadow-sm group-hover:bg-[#2E3192] group-hover:text-white transition-all">
                          <Download className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-black text-[#2E3192] uppercase">Giáo trình lớp</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Syllabus tổng quát</p>
                       </div>
                    </a>
                 )}

                 {/* Lesson Specific Worksheets */}
                 {lessons.filter(l => l.content_json?.worksheet_url).map((l, idx) => (
                    <a key={l.id} href={l.content_json.worksheet_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 group p-3 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-2xl transition-all">
                       <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-400 border border-slate-100 group-hover:bg-orange-400 group-hover:text-white transition-all">
                          <BookOpen className="w-4 h-4" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-slate-700 truncate">{l.title}</p>
                          <p className="text-[7px] font-black text-slate-400 uppercase">Phiếu bài tập • {idx + 1}</p>
                       </div>
                       <Download className="w-3 h-3 text-slate-300 group-hover:text-[#2E3192]" />
                    </a>
                 ))}

                 {(!cls?.syllabus_url && !lessons.some(l => l.content_json?.worksheet_url)) && (
                    <div className="py-10 text-center">
                       <Info className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                       <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Chưa có tài liệu</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
