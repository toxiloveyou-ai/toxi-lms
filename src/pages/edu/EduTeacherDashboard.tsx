import React, { useState, useEffect } from 'react';
import {
   Users, BookOpen, Award, CheckCircle2,
   Clock, Megaphone, Settings, Plus,
   Search, Filter, MoreHorizontal, MessageSquare,
   TrendingUp, Star, ChevronRight, Mic,
   ShieldCheck, AlertCircle, ShieldAlert, Calendar, ArrowUpRight,
   Play, FileAudio, FileText, Check, X, BookmarkPlus,
   BarChart2, Activity, UserPlus, GraduationCap, PlayCircle,
   UserCheck, ClipboardList, PenTool, Save, Send, Trash2,
   ChevronLeft, Info, Edit, Download, History, Sparkles, Loader2, Brain, Paperclip, Target
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toxiAIEngine } from '../../lib/toxi-ai-engine';

type TabType = 'roster' | 'attendance' | 'submissions' | 'scores' | 'lessons' | 'analytics' | 'history' | 'profile';

export default function EduTeacherDashboard() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<TabType>('submissions');
   const [loading, setLoading] = useState(true);
   const [isAdmin, setIsAdmin] = useState(false);
   const [totalStudents, setTotalStudents] = useState(0);
   const [classes, setClasses] = useState<any[]>([]);
   const [pendingStudents, setPendingStudents] = useState<any[]>([]);
   const [activeClass, setActiveClass] = useState<any>(null);
   const [students, setStudents] = useState<any[]>([]);
   const [submissions, setSubmissions] = useState<any[]>([]);
   const [selectedSub, setSelectedSub] = useState<any>(null);
   const [gradingScore, setGradingScore] = useState('');
   const [gradingFeedback, setGradingFeedback] = useState('');
   const [teacherProfile, setTeacherProfile] = useState<any>(null);
   const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
   const [attendance, setAttendance] = useState<Record<string, string>>({});
   const [courseLessons, setCourseLessons] = useState<any[]>([]);
   const [subLoading, setSubLoading] = useState(false);
   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

   // Toxi AI State
   const [aiAnalysis, setAiAnalysis] = useState('');
   const [analyzing, setAnalyzing] = useState(false);

   useEffect(() => { fetchTeacherData(); }, []);

   async function fetchTeacherData() {
      setLoading(true);
      try {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session) {
            navigate('/edu/login');
            return;
         }

         // Role check (Super Admin bypass)
         const isSuperAdmin = session.user.email === 'toxiloveyou@gmail.com';
         setIsAdmin(isSuperAdmin);
         const { data: profile } = await supabase.from('toxi_profiles').select('role').eq('id', session.user.id).maybeSingle();

         if (profile?.role !== 'teacher' && !isSuperAdmin) {
            navigate('/edu/overview');
            return;
         }

         let query = supabase.from('edu_classes').select('*, courses(*)');
         if (!isSuperAdmin) query = query.eq('teacher_id', session.user.id);
         const { data: finalClassesData, error: classErr } = await query.order('created_at', { ascending: false });
      if (classErr) console.error('Error fetching classes:', classErr);

         if (finalClassesData && finalClassesData.length > 0) {
            setClasses(finalClassesData);
            setActiveClass(finalClassesData[0]);
            await fetchClassDetails(finalClassesData[0]); // pass full object
            await fetchGlobalStats(finalClassesData.map(c => c.id));
            await fetchTeacherProfile(session.user.id);
         }
      } catch (err) { console.error(err); } finally { setLoading(false); }
   }

   async function fetchTeacherProfile(uid: string) {
      const { data } = await supabase.from('toxi_profiles').select('*').eq('id', uid).single();
      setTeacherProfile(data);
   }

   async function fetchGlobalStats(classIds: string[]) {
      try {
         // 1. Total Students (Unique)
         const { data: members } = await supabase
            .from('edu_class_members')
            .select('student_id')
            .in('class_id', classIds);
         const count = new Set(members?.map(m => m.student_id)).size;
         setTotalStudents(count);

         // 2. Pending Submissions
         const { count: pendingCount } = await supabase
            .from('lesson_submissions')
            .select('id', { count: 'exact', head: true })
            .in('class_id', classIds)
            .eq('status', 'pending');

         // 3. Avg Progress (Mocked for now as it's expensive to calc here)
         const avgProg = 72;

         // 4. Update Stats State
         // Note: We don't have a formal stats state, we are using StatItem directly with variables.
         // But let's look at StatItem usage. It uses students.length, submissions.filter...
      } catch (err) {
         console.error('Error fetching global stats:', err);
      }
   }

   async function fetchClassDetails(classObj: any) {
      if (!classObj) return;
      setSubLoading(true);
      const classId = classObj.id;

      try {
         // 1. Fetch Students
         const { data: membersData } = await supabase
            .from('edu_class_members')
            .select('*, toxi_profiles!student_id(id, full_name, avatar_url, phone, target_exam, created_at)')
            .eq('class_id', classId);

         setStudents(membersData || []);

         // 2. Fetch Real Submissions for this class
         const { data: subsData } = await supabase
            .from('edu_homework_submissions')
            .select('*, toxi_profiles!student_id(full_name)')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

         if (subsData) {
            setSubmissions(subsData.map(s => ({
               ...s,
               student: s.toxi_profiles?.full_name || 'Học viên',
               task: `Bài nộp #${s.id.slice(0, 4)}`,
               time: new Date(s.created_at).toLocaleString('vi-VN')
            })));
         }

         const initialAttendance: Record<string, string> = {};
         membersData?.forEach((m: any) => initialAttendance[m.student_id] = 'present');
         setAttendance(initialAttendance);
         await fetchAttendanceForDate(classId, selectedDate);

         // 4. Fetch Unassigned Students
         if (classObj.course_id) {
            const { data: enrolled } = await supabase
               .from('edu_enrollments')
               .select('*, toxi_profiles!user_id(id, full_name, avatar_url, email)')
               .eq('course_id', classObj.course_id)
               .eq('status', 'active');

            if (enrolled) {
               const memberIds = new Set(membersData?.map(m => m.student_id));
               const unassigned = enrolled
                  .filter(e => !memberIds.has(e.user_id))
                  .map(e => ({ ...e.toxi_profiles, enrollment_id: e.id }));
               setPendingStudents(unassigned);
            }

            // 5. Fetch Database Lessons
            const { data: dbLessons } = await supabase
               .from('course_lessons')
               .select('*')
               .eq('course_id', classObj.course_id)
               .order('order_index');
            setCourseLessons(dbLessons || []);
         }
      } catch (err) {
         console.error(err);
      } finally {
         setSubLoading(false);
      }
   }

   const handleAddMemberToClass = async (studentId: string) => {
      try {
         const { error } = await supabase
            .from('edu_class_members')
            .insert({ class_id: activeClass.id, student_id: studentId });

         if (error) throw error;
         alert('Đã thêm học viên vào lớp!');
         fetchClassDetails(activeClass);
      } catch (err: any) {
         alert(`Lỗi: ${err.message}`);
      }
   };

  const handleRemoveStudent = async (studentId: string, name: string) => {
    if (!confirm(`Xóa ${name} khỏi lớp?`)) return;
    try {
      const { error } = await supabase
        .from('edu_class_members')
        .delete()
        .eq('class_id', activeClass.id)
        .eq('student_id', studentId);
      if (error) throw error;
      fetchClassDetails(activeClass);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleGradeSubmission = async () => {
      if (!selectedSub) return;
      try {
         const { error } = await supabase
            .from('lesson_submissions')
            .update({
               teacher_score: parseInt(gradingScore),
               teacher_feedback: gradingFeedback,
               status: 'reviewed'
            })
            .eq('id', selectedSub.id);

         if (error) throw error;

         alert(`Đã hoàn tất chấm điểm bài nộp của ${selectedSub.student}`);
         setSelectedSub(null);
         setGradingScore('');
         setGradingFeedback('');
         fetchClassDetails(activeClass); // Refresh
      } catch (err: any) {
         alert(`Lỗi khi lưu điểm: ${err.message}`);
      }
   };

   async function fetchAttendanceForDate(classId: string, date: string) {
      const { data } = await supabase
         .from('edu_attendance')
         .select('*')
         .eq('class_id', classId)
         .eq('attendance_date', date);

      const newAttendance: Record<string, string> = {};
      data?.forEach(rec => {
         newAttendance[rec.student_id] = rec.status;
      });
      setAttendance(newAttendance);
   }

   const saveAttendance = async () => {
      if (!activeClass) return;
      try {
         const records = students.map(s => ({
            class_id: activeClass.id,
            student_id: s.student_id,
            status: attendance[s.student_id] || 'present',
            attendance_date: selectedDate
         }));

         const { error } = await supabase
            .from('edu_attendance')
            .upsert(records, { onConflict: 'class_id, student_id, attendance_date' });

         if (error) throw error;
         alert('Đã lưu điểm danh thành công!');
         fetchAttendanceHistory(activeClass.id);
      } catch (err: any) {
         alert(`Lỗi khi lưu điểm danh: ${err.message}`);
      }
   };

   async function fetchAttendanceHistory(classId: string) {
      const { data } = await supabase
         .from('edu_attendance')
         .select('attendance_date, status')
         .eq('class_id', classId);

      if (data) {
         setAttendanceHistory(data);
      }
   }

   const handleAIAnalysis = async () => {
      if (!activeClass || students.length === 0) return;
      setAnalyzing(true);
      try {
         const prompt = `Bạn là Trợ lý AI phân tích dữ liệu học tập chuyên sâu của hệ thống Toxi Edu. Hãy phân tích lớp học này và đưa ra nhận xét, đánh giá ngắn gọn theo 3 khía cạnh: "Tổng quan chung", "Vấn đề cần lưu ý", và "Gợi ý hành động". Dữ liệu hiện tại:
       - Số lượng học viên: ${students.length}
       - Tiến độ trung bình: ${Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / (students.length || 1))}%
       - Số bài tập chưa chấm: ${submissions.filter(s => s.status === 'pending').length}
       - Số bài tập đã chấm: ${submissions.filter(s => s.status === 'reviewed').length}
       - Điểm trung bình AI chấm cho các bài nộp gần đây: ${submissions.length > 0 ? Math.round(submissions.reduce((acc, s) => acc + (s.ai_score || 0), 0) / submissions.length) : 'Chưa có dữ liệu'}
       - Học viên chuyên cần: Rất tốt (Dữ liệu giả lập 95%)`;

         const result = await toxiAIEngine.chat(prompt, {
            profile: { id: 'teacher', name: 'Giáo viên', level: 'Advanced', goal: 'hsk_prep', interests: [], learningStyle: '' }
         });
         setAiAnalysis(result);
      } catch (err) {
         console.error(err);
         setAiAnalysis('Rất tiếc, đã có lỗi khi gọi AI. Hãy thử lại sau ít phút.');
      } finally {
         setAnalyzing(false);
      }
   };

   if (loading) return <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center"><div className="w-12 h-12 border-4 border-t-indigo-600 rounded-full animate-spin" /></div>;

   return (
      <div className="min-h-screen bg-[#FDFDFF] font-sans pb-32 relative">
         <div className="max-w-[1700px] mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 xl:grid-cols-12 gap-10">

            {/* SIDEBAR */}
            <div className="xl:col-span-3 space-y-6">
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 sticky top-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100">
                        <img src="/assets/images/toxi_edu_logo.png" alt="Logo" className="w-full h-full object-cover" />
                     </div>
                     <div><h2 className="text-lg font-black text-slate-900 leading-none">Edu Management</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Teacher Dashboard</p></div>
                  </div>
                  {isAdmin && (
                     <button onClick={() => navigate('/edu/admin')} className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
                        <ShieldAlert className="w-4 h-4" /> Master Admin Workspace
                     </button>
                  )}
                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Lớp đang dạy</p>
                     {classes.map(cls => (
                        <button key={cls.id} onClick={() => { setActiveClass(cls); fetchClassDetails(cls); }}
                           className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${activeClass?.id === cls.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200'}`}>
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeClass?.id === cls.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}><BookOpen className="w-5 h-5" /></div>
                           <div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase tracking-widest opacity-60 truncate">{cls.courses?.title}</p><h3 className="font-black text-xs truncate">{cls.name}</h3></div>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* MAIN AREA */}
            <div className="xl:col-span-9 space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatItem icon={Users} label="Tổng học viên" value={totalStudents} sub="Người" color="text-indigo-600" bg="bg-indigo-50" />
                  <StatItem icon={Clock} label="Cần chấm" value={submissions.filter(s => s.status === 'pending').length} sub="Bài nộp" color="text-purple-600" bg="bg-purple-50" />
                  <StatItem icon={FileText} label="Lớp học" value={classes.length} sub="Lớp đang dạy" color="text-orange-600" bg="bg-orange-50" />
                  <StatItem icon={TrendingUp} label="Tiến độ" value={`${Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / (students.length || 1))}%`} sub="Trung bình" color="text-emerald-600" bg="bg-emerald-50" />
               </div>

               <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
                  <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/30">
                     <div className="flex flex-wrap items-center gap-6">
                        <TabButton active={activeTab === 'submissions'} label="Chấm bài" icon={PenTool} count={submissions.filter(s => s.status === 'pending').length} onClick={() => setActiveTab('submissions')} />
                        <TabButton active={activeTab === 'lessons'} label="Bài giảng" icon={BookOpen} onClick={() => setActiveTab('lessons')} />
                        <TabButton active={activeTab === 'roster'} label="Học viên" icon={Users} onClick={() => setActiveTab('roster')} />
                        <TabButton active={activeTab === 'attendance'} label="Điểm danh" icon={UserCheck} onClick={() => setActiveTab('attendance')} />
                        <TabButton active={activeTab === 'scores'} label="Bảng điểm" icon={ClipboardList} onClick={() => setActiveTab('scores')} />
                        <TabButton active={activeTab === 'analytics'} label="Phân tích" icon={BarChart2} onClick={() => setActiveTab('analytics')} />
                        <TabButton active={activeTab === 'history'} label="Lịch sử" icon={History} onClick={() => setActiveTab('history')} />
                        <TabButton active={activeTab === 'profile'} label="Hồ sơ" icon={Settings} onClick={() => setActiveTab('profile')} />
                     </div>
                  </div>

                  <div className="p-8 relative min-h-[400px]">
                     {subLoading && (
                        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                           <div className="flex flex-col items-center gap-4">
                              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Đang đồng bộ dữ liệu lớp...</p>
                           </div>
                        </div>
                     )}
                     {/* GRADING / SUBMISSIONS TAB */}
                     {activeTab === 'submissions' && (
                        <div className="space-y-4 animate-in fade-in">
                           <div className="flex items-center justify-between mb-4">
                              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Bài nộp chờ chấm điểm</h3>
                              <div className="flex gap-2">
                                 <button className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Tất cả</button>
                                 <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Chưa chấm</button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-4">
                              {submissions.map((sub) => (
                                 <div key={sub.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-600 transition-all shadow-sm">
                                    <div className="flex items-center gap-5">
                                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sub.submission_type === 'link' ? 'bg-blue-50 text-blue-600' : sub.type === 'audio' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                          {sub.submission_type === 'link' ? <ExternalLink className="w-6 h-6" /> : sub.type === 'audio' ? <Mic className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                       </div>
                                       <div>
                                          <h4 className="font-black text-slate-800 text-sm">{sub.student} - <span className="text-indigo-600">{sub.task}</span></h4>
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Nộp bài: {sub.time}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                       <div className="text-center px-4 border-l border-slate-100">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AI đề xuất</p>
                                          <span className="text-xs font-black text-emerald-600">{sub.ai_score}/100</span>
                                       </div>
                                       {sub.status === 'pending' ? (
                                          <button onClick={() => setSelectedSub(sub)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Chấm bài ngay</button>
                                       ) : (
                                          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Đã chấm</span>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {activeTab === 'lessons' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                           {/* Phiếu bài tập & Tài liệu lớp section */}
                           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Giáo trình & Phiếu bài tập từng bài</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Cập nhật học liệu và bài tập riêng cho từng buổi học</p>
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 {courseLessons.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                          <BookOpen className="w-8 h-8" />
                                       </div>
                                       <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Chưa có dữ liệu bài giảng cho khóa này</p>
                                    </div>
                                 ) : courseLessons.map((lesson, idx) => (
                                    <div key={lesson.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] space-y-6 group hover:bg-white hover:border-indigo-600/30 transition-all">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-6">
                                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm">
                                                {idx + 1}
                                             </div>
                                             <div>
                                                <h4 className="font-black text-slate-900 text-base">{lesson.title}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lesson.module_name || 'Chương chưa phân loại'}</p>
                                             </div>
                                          </div>
                                          {lesson.content_json?.worksheet_url && (
                                             <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Đã giao phiếu
                                             </span>
                                          )}
                                       </div>

                                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                             <label className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest ml-2 flex items-center gap-2">
                                                <ExternalLink className="w-3 h-3" /> Link Phiếu Bài Tập (Drive/Direct)
                                             </label>
                                             <input
                                                type="text"
                                                defaultValue={lesson.content_json?.worksheet_url || ''}
                                                placeholder="Dán link Drive..."
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:border-indigo-600 outline-none transition-all"
                                                onBlur={async (e) => {
                                                   const newJson = { ...(lesson.content_json || {}), worksheet_url: e.target.value };
                                                   const { error } = await supabase.from('course_lessons').update({ content_json: newJson }).eq('id', lesson.id);
                                                   if (!error) alert('Đã cập nhật link bài tập bài ' + (idx + 1));
                                                }}
                                             />
                                          </div>
                                          <div className="space-y-2">
                                             <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                                                <Plus className="w-3 h-3" /> Hoặc Upload File
                                             </label>
                                             <label className="w-full h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10 gap-2">
                                                <Download className="w-4 h-4" /> Chọn tệp bài tập
                                                <input
                                                   type="file"
                                                   className="hidden"
                                                   onChange={async (e) => {
                                                      const file = e.target.files?.[0];
                                                      if (!file) return;
                                                      try {
                                                         const path = `worksheets/${activeClass.id}/${Date.now()}_${file.name}`;
                                                         const { error: uploadErr } = await supabase.storage.from('exam-assets').upload(path, file);
                                                         if (uploadErr) throw uploadErr;
                                                         const { data: { publicUrl } } = supabase.storage.from('exam-assets').getPublicUrl(path);
                                                         const newJson = { ...(lesson.content_json || {}), worksheet_url: publicUrl };
                                                         await supabase.from('course_lessons').update({ content_json: newJson }).eq('id', lesson.id);
                                                         alert('Tải lên thành công!');
                                                         fetchClassDetails(activeClass);
                                                      } catch (err: any) {
                                                         alert(`Lỗi: ${err.message}`);
                                                      }
                                                   }}
                                                />
                                             </label>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Tài liệu lớp học dùng chung */}
                           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Tài liệu lớp dùng chung (Syllabus)</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Giáo trình tổng quát cho toàn khóa học</p>
                                 </div>
                                 <label className="cursor-pointer px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Thay đổi
                                    <input
                                       type="file"
                                       className="hidden"
                                       onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file || !activeClass) return;
                                          const fileName = `worksheets/${activeClass.id}/syllabus_${Date.now()}_${file.name}`;
                                          const { error } = await supabase.storage.from('exam-assets').upload(fileName, file);
                                          if (error) { alert(`Lỗi: ${error.message}`); return; }
                                          const { data: { publicUrl } } = supabase.storage.from('exam-assets').getPublicUrl(fileName);
                                          await supabase.from('edu_classes').update({ syllabus_url: publicUrl }).eq('id', activeClass.id);
                                          setActiveClass({ ...activeClass, syllabus_url: publicUrl });
                                          alert('Đã cập nhật Syllabus!');
                                       }}
                                    />
                                 </label>
                              </div>
                              {activeClass?.syllabus_url && (
                                 <div className="p-4 bg-indigo-50/50 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <FileText className="w-5 h-5 text-indigo-600" />
                                       <span className="text-xs font-black text-indigo-900">Syllabus_Global.pdf</span>
                                    </div>
                                    <a href={activeClass.syllabus_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:scale-110 transition-transform"><ExternalLink className="w-4 h-4" /></a>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {activeTab === 'roster' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                           {/* Header */}
                           <div className="bg-gradient-to-r from-slate-900 to-[#2E3192] rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-10"><Users className="w-40 h-40" /></div>
                              <div className="relative z-10 flex items-center gap-5">
                                 <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20"><GraduationCap className="w-8 h-8" /></div>
                                 <div>
                                    <h3 className="text-xl font-black tracking-tight">Danh sách Học viên</h3>
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Lớp: {activeClass?.name} &bull; {students.length} thành viên</p>
                                 </div>
                              </div>
                              <div className="relative z-10 px-5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                                 {students.length} / {students.length + pendingStudents.length} học viên
                              </div>
                           </div>
                           {/* Stats */}
                           <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-indigo-600" /></div>
                                 <div><p className="text-2xl font-black text-slate-800">{students.length}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đang học</p></div>
                              </div>
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                 <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center"><UserPlus className="w-6 h-6 text-orange-500" /></div>
                                 <div><p className="text-2xl font-black text-slate-800">{pendingStudents.length}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chờ xếp lớp</p></div>
                              </div>
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center"><Award className="w-6 h-6 text-emerald-500" /></div>
                                 <div><p className="text-2xl font-black text-slate-800">{submissions.filter(s => s.status === 'reviewed').length}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bài đã chấm</p></div>
                              </div>
                           </div>
                           {/* Student Cards */}
                           {students.length === 0 ? (
                              <div className="py-20 text-center space-y-4">
                                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><Users className="w-10 h-10" /></div>
                                 <p className="text-sm font-bold text-slate-400">Chưa có học viên nào trong lớp này</p>
                                 <p className="text-[10px] text-slate-300 font-mono">{activeClass?.id}</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {students.map((s, idx) => (
                                    <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col gap-4">
                                       <div className="flex items-center gap-4">
                                          <div className="relative shrink-0">
                                             <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shadow">
                                                <img src={s.toxi_profiles?.avatar_url || `https://i.pravatar.cc/150?u=${s.student_id}`} alt="" className="w-full h-full object-cover" />
                                             </div>
                                             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <h4 className="font-black text-slate-800 text-sm truncate">{s.toxi_profiles?.full_name || 'Học viên'}</h4>
                                             <p className="text-[9px] text-slate-400 font-bold truncate">{s.toxi_profiles?.phone || 'Chưa có SĐT'}</p>
                                          </div>
                                          <button onClick={() => handleRemoveStudent(s.student_id, s.toxi_profiles?.full_name)} className="w-9 h-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                       <div className="flex flex-wrap gap-2">
                                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">#{idx + 1}</span>
                                          {s.toxi_profiles?.target_exam && <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase">🎯 {s.toxi_profiles.target_exam}</span>}
                                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-bold">Tham gia: {s.joined_at ? new Date(s.joined_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                       </div>
                                       <div className="space-y-1">
                                          <div className="flex items-center justify-between">
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tiến độ học tập</span>
                                             <span className="text-[10px] font-black text-indigo-600">{s.progress || 0}%</span>
                                          </div>
                                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                             <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${s.progress || 0}%` }} />
                                          </div>
                                       </div>
                                       <div className="flex gap-2 pt-1">
                                          <button className="flex-1 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Nhắn tin</button>
                                          <button className="flex-1 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Xem điểm</button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                           {/* Pending Section */}
                           {pendingStudents.length > 0 && (
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 py-4 border-t border-slate-100">
                                    <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><UserPlus className="w-4 h-4 text-orange-500" /></div>
                                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Học viên chờ xếp lớp</h3>
                                    <span className="px-2.5 py-1 bg-orange-100 text-orange-600 rounded-lg text-[9px] font-black">{pendingStudents.length} người</span>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingStudents.map(s => (
                                       <div key={s.id} className="p-5 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-[2rem] flex items-center justify-between hover:border-orange-400 transition-all">
                                          <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-2xl overflow-hidden border border-orange-200">
                                                <img src={s.avatar_url || `https://i.pravatar.cc/150?u=${s.id}`} className="w-full h-full object-cover" alt="" />
                                             </div>
                                             <div>
                                                <h4 className="font-black text-slate-800 text-sm">{s.full_name}</h4>
                                                <p className="text-[9px] text-slate-400 font-bold">{s.email}</p>
                                             </div>
                                          </div>
                                          <button onClick={() => handleAddMemberToClass(s.id)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Thêm vào lớp</button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     {activeTab === 'attendance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                           {/* Header */}
                           <div className="bg-gradient-to-r from-[#1E293B] to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Calendar className="w-40 h-40" /></div>
                              <div className="relative z-10 flex items-center gap-5">
                                 <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm"><UserCheck className="w-8 h-8" /></div>
                                 <div>
                                    <h3 className="text-xl font-black tracking-tight">Điểm danh lớp học</h3>
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Lớp: {activeClass?.name} &bull; {students.length} học viên</p>
                                 </div>
                              </div>
                              <div className="relative z-10 flex items-center gap-3">
                                 <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                                    <Calendar className="w-4 h-4 text-white/60" />
                                    <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); if(activeClass) fetchAttendanceForDate(activeClass.id, e.target.value); }} className="bg-transparent text-white text-xs font-black outline-none border-none [color-scheme:dark] min-w-0" />
                                 </div>
                                 <button onClick={saveAttendance} className="px-8 py-3 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Save className="w-4 h-4" /> Lưu điểm danh</button>
                              </div>
                           </div>
                           {/* Stats */}
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                 { label: 'Có mặt', count: students.filter(s => (attendance[s.student_id] || 'present') === 'present').length, bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', icon: <CheckCircle2 className="w-5 h-5" /> },
                                 { label: 'Vắng mặt', count: students.filter(s => attendance[s.student_id] === 'absent').length, bg: 'bg-red-50', text: 'text-red-500', bar: 'bg-red-500', icon: <X className="w-5 h-5" /> },
                                 { label: 'Đi muộn', count: students.filter(s => attendance[s.student_id] === 'late').length, bg: 'bg-orange-50', text: 'text-orange-500', bar: 'bg-orange-500', icon: <Clock className="w-5 h-5" /> },
                                 { label: 'Có phép', count: students.filter(s => attendance[s.student_id] === 'excused').length, bg: 'bg-blue-50', text: 'text-blue-500', bar: 'bg-blue-500', icon: <ShieldCheck className="w-5 h-5" /> },
                              ].map((stat, i) => (
                                 <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                       <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.text}`}>{stat.icon}</div>
                                       <span className={`text-[9px] font-black uppercase tracking-widest ${stat.text}`}>{stat.label}</span>
                                    </div>
                                    <p className={`text-3xl font-black ${stat.text}`}>{stat.count}</p>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                       <div className={`${stat.bar} h-full rounded-full`} style={{ width: students.length > 0 ? `${(stat.count/students.length)*100}%` : '0%' }} />
                                    </div>
                                 </div>
                              ))}
                           </div>
                           {/* Quick Actions */}
                           <div className="flex flex-wrap gap-3 items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn nhanh:</span>
                              <button onClick={() => { const a: Record<string,string>={}; students.forEach(s=>a[s.student_id]='present'); setAttendance(a); }} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tất cả có mặt</button>
                              <button onClick={() => { const a: Record<string,string>={}; students.forEach(s=>a[s.student_id]='absent'); setAttendance(a); }} className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Tất cả vắng</button>
                              <div className="ml-auto text-[10px] font-bold text-slate-400">Ngày: <span className="text-slate-700 font-black">{new Date(selectedDate+'T00:00:00').toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</span></div>
                           </div>
                           {/* Student Cards */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {students.map(s => {
                                 const status = attendance[s.student_id] || 'present';
                                 const cfg: Record<string,{label:string;bg:string;badge:string;dot:string}> = {
                                    present: {label:'Có mặt',bg:'border-emerald-200 bg-emerald-50/30',badge:'bg-emerald-100 text-emerald-700',dot:'bg-emerald-500'},
                                    absent:  {label:'Vắng mặt',bg:'border-red-200 bg-red-50/30',badge:'bg-red-100 text-red-600',dot:'bg-red-500'},
                                    late:    {label:'Đi muộn',bg:'border-orange-200 bg-orange-50/30',badge:'bg-orange-100 text-orange-600',dot:'bg-orange-500'},
                                    excused: {label:'Có phép',bg:'border-blue-200 bg-blue-50/30',badge:'bg-blue-100 text-blue-600',dot:'bg-blue-500'},
                                 };
                                 const c = cfg[status] || cfg.present;
                                 return (
                                    <div key={s.id} className={`p-5 bg-white border-2 rounded-[2rem] flex flex-col gap-4 transition-all duration-300 shadow-sm ${c.bg}`}>
                                       <div className="flex items-center gap-4">
                                          <div className="relative shrink-0">
                                             <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                                <img src={s.toxi_profiles?.avatar_url || `https://i.pravatar.cc/150?u=${s.student_id}`} alt="" className="w-full h-full object-cover" />
                                             </div>
                                             <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${c.dot} rounded-full border-2 border-white`} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <h4 className="font-black text-slate-800 text-sm truncate">{s.toxi_profiles?.full_name}</h4>
                                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide truncate">{s.toxi_profiles?.phone || 'Chưa có SĐT'}</p>
                                          </div>
                                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 ${c.badge}`}>{c.label}</span>
                                       </div>
                                       <div className="grid grid-cols-4 gap-2">
                                          {[
                                             {id:'present',label:'Có mặt',a:'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'},
                                             {id:'absent', label:'Vắng',   a:'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'},
                                             {id:'late',   label:'Muộn',   a:'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'},
                                             {id:'excused',label:'Phép',   a:'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'},
                                          ].map(opt => (
                                             <button key={opt.id} onClick={() => setAttendance(prev => ({...prev, [s.student_id]: opt.id}))} className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border-2 ${status===opt.id ? opt.a : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{opt.label}</button>
                                          ))}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                           {/* Bottom Save */}
                           <div className="flex justify-end pt-2">
                              <button onClick={saveAttendance} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                 <Save className="w-5 h-5" /> Lưu điểm danh ngày {new Date(selectedDate+'T00:00:00').toLocaleDateString('vi-VN')}
                              </button>
                           </div>
                        </div>
                     )}

                     {activeTab === 'scores' && (
                        <div className="space-y-6">
                           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"><ClipboardList className="w-6 h-6" /></div>
                                 <div>
                                    <h3 className="text-xl font-black tracking-tight">Bảng điểm tổng hợp</h3>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tự động cập nhật từ bài thi & bài tập</p>
                                 </div>
                              </div>
                              <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Download className="w-4 h-4" /> Xuất File Excel</button>
                           </div>

                           <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Học viên</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Chuyên cần</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">BTVN</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Kiểm tra</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Thi HK</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng kết</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {students.map((s, i) => (
                                       <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                          <td className="px-6 py-5">
                                             <div className="flex items-center gap-3">
                                                <p className="text-xs font-black text-slate-800">{s.toxi_profiles?.full_name}</p>
                                             </div>
                                          </td>
                                          <td className="px-6 py-5 text-center font-bold text-xs text-slate-600">95%</td>
                                          <td className="px-6 py-5 text-center font-bold text-xs text-slate-600">8.5</td>
                                          <td className="px-6 py-5 text-center font-bold text-xs text-slate-600">9.0</td>
                                          <td className="px-6 py-5 text-center font-bold text-xs text-slate-600">8.0</td>
                                          <td className="px-6 py-5 text-right"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-xs">8.6</span></td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}

                     {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                           {/* Header Section */}
                           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12"><Activity className="w-40 h-40" /></div>
                              <div className="relative z-10 flex items-center gap-5">
                                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30"><BarChart2 className="w-8 h-8" /></div>
                                 <div>
                                    <h3 className="text-xl font-black tracking-tight">Trung tâm Phân tích Dữ liệu</h3>
                                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Chỉ số Hiệu suất & Insights AI cho Lớp {activeClass?.name}</p>
                                 </div>
                              </div>
                              <button
                                 onClick={handleAIAnalysis}
                                 disabled={analyzing}
                                 className="relative z-10 px-8 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-80 disabled:cursor-wait"
                              >
                                 {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                 {analyzing ? 'AI đang phân tích...' : 'Phân tích lớp bằng AI'}
                              </button>
                           </div>

                           {/* Toxi AI Analysis Result Card */}
                           {aiAnalysis && (
                              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4">
                                 <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                       <Brain className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Báo cáo từ Toxi AI</h4>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">DeepSeek Intelligence</p>
                                    </div>
                                 </div>
                                 <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed">
                                    {aiAnalysis.split('\n').map((line, idx) => {
                                       if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                          return <li key={idx} className="ml-4 my-1 text-sm">{line.replace(/^[-*]\s/, '')}</li>;
                                       } else if (line.trim().match(/^\d+\./)) {
                                          return <p key={idx} className="font-black text-indigo-600 mt-4 mb-2">{line}</p>;
                                       } else if (line.trim() !== '') {
                                          return <p key={idx} className="my-2">{line}</p>;
                                       }
                                       return null;
                                    })}
                                 </div>
                              </div>
                           )}

                           {/* Stats Grid */}
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tỷ lệ chuyên cần</p>
                                    <p className="text-2xl font-black text-slate-800">95%</p>
                                 </div>
                                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
                                    <div className="bg-emerald-500 h-full w-[95%] rounded-full"></div>
                                 </div>
                              </div>
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Target className="w-5 h-5 text-blue-500" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm TB Lớp</p>
                                    <p className="text-2xl font-black text-slate-800">8.4<span className="text-xs text-slate-400 font-bold ml-1">/ 10</span></p>
                                 </div>
                                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
                                    <div className="bg-blue-500 h-full w-[84%] rounded-full"></div>
                                 </div>
                              </div>
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                 <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-purple-500" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian tự học TB</p>
                                    <p className="text-2xl font-black text-slate-800">4.5<span className="text-xs text-slate-400 font-bold ml-1">giờ/tuần</span></p>
                                 </div>
                                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
                                    <div className="bg-purple-500 h-full w-[60%] rounded-full"></div>
                                 </div>
                              </div>
                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                 <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><AlertCircle className="w-5 h-5 text-orange-500" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nộp bài muộn</p>
                                    <p className="text-2xl font-black text-slate-800">12%</p>
                                 </div>
                                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
                                    <div className="bg-orange-500 h-full w-[12%] rounded-full"></div>
                                 </div>
                              </div>
                           </div>

                           {/* Bottom Charts & Lists */}
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Left: Homework Completion Chart */}
                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 flex flex-col">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Tỷ lệ hoàn thành bài tập</h4>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dữ liệu 7 ngày gần nhất</p>
                                    </div>
                                    <div className="p-2 bg-emerald-50 rounded-xl"><Activity className="w-5 h-5 text-emerald-500" /></div>
                                 </div>
                                 <div className="flex-1 flex items-end justify-between gap-3 px-2 min-h-[160px]">
                                    {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                                       <div key={i} className="w-full bg-slate-50 rounded-t-xl relative group flex flex-col justify-end">
                                          <div
                                             className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-700 ease-out group-hover:from-indigo-600 group-hover:to-indigo-400 relative"
                                             style={{ height: `${h}%` }}
                                          >
                                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                {h}%
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                                 <div className="flex justify-between px-4 text-[9px] font-black text-slate-300 uppercase">
                                    <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                                 </div>
                              </div>

                              {/* Right: Top Students List */}
                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Bảng vàng Học viên</h4>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dựa trên điểm XP và độ chuyên cần</p>
                                    </div>
                                    <div className="p-2 bg-orange-50 rounded-xl"><Award className="w-5 h-5 text-orange-500" /></div>
                                 </div>
                                 <div className="space-y-4">
                                    {students.slice(0, 4).length > 0 ? students.slice(0, 4).map((s, i) => (
                                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group">
                                          <div className="flex items-center gap-4">
                                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-400'}`}>
                                                #{i + 1}
                                             </div>
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm">
                                                   <img src={s.toxi_profiles?.avatar_url || `https://i.pravatar.cc/150?u=${s.student_id}`} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-xs font-black text-slate-800">{s.toxi_profiles?.full_name}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                                             <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />
                                             <span className="text-[10px] font-black text-slate-600">{(1200 - i * 150)}</span>
                                          </div>
                                       </div>
                                    )) : (
                                       <div className="py-10 text-center">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chưa có dữ liệu học viên</p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* GRADING MODAL */}
         {selectedSub && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
               <div className="absolute inset-0 bg-[#161922]/80 backdrop-blur-sm" onClick={() => setSelectedSub(null)} />
               <div className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[800px] animate-in zoom-in duration-300">

                  <div className="flex-1 bg-slate-50 p-10 flex flex-col">
                     <button onClick={() => setSelectedSub(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest mb-8"><ChevronLeft className="w-4 h-4" /> Quay lại</button>
                     <div className="flex-1 flex flex-col justify-center">
                        <div className="text-center space-y-6">
                           <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl">
                              {selectedSub.type === 'audio' ? <Mic className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
                           </div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSub.task}</h3>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Nộp bởi: {selectedSub.student}</p>
                           </div>

                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Nội dung bài nộp:</p>
                              {selectedSub.submission_type === 'link' ? (
                                 <div className="space-y-4">
                                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                          <Paperclip className="w-6 h-6" />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-xs font-black text-slate-900 truncate">{selectedSub.content || selectedSub.google_drive_link || 'Google Drive Link'}</p>
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tệp đính kèm bên ngoài</p>
                                       </div>
                                    </div>
                                    <a
                                       href={selectedSub.content || selectedSub.google_drive_link}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                       <ExternalLink className="w-4 h-4" /> Mở Link Google Drive
                                    </a>
                                 </div>
                              ) : selectedSub.type === 'audio' ? (
                                 <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl">
                                    <button className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><Play className="w-6 h-6 fill-current" /></button>
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                                       <div className="absolute top-0 left-0 h-full w-1/3 bg-indigo-600 rounded-full" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 tabular-nums">0:45</span>
                                 </div>
                              ) : (
                                 <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-100 pl-6">"{selectedSub.content}"</p>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-full md:w-[350px] p-10 bg-white border-l border-slate-100 flex flex-col gap-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="w-6 h-6 text-emerald-500" />
                           <h4 className="text-lg font-black text-slate-900 tracking-tight">Công cụ chấm điểm</h4>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Gợi ý điểm:</span>
                           <span className="text-lg font-black text-emerald-600">{selectedSub.ai_score}/100</span>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Điểm số cuối cùng</label>
                           <input
                              type="number"
                              value={gradingScore}
                              onChange={(e) => setGradingScore(e.target.value)}
                              placeholder="Ví dụ: 95"
                              className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-xl font-black focus:bg-white focus:border-indigo-600 transition-all text-center"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Lời nhận xét (Feedback)</label>
                           <textarea
                              rows={4}
                              value={gradingFeedback}
                              onChange={(e) => setGradingFeedback(e.target.value)}
                              placeholder="Nhập nhận xét cho học sinh..."
                              className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-600 transition-all"
                           />
                        </div>
                     </div>

                     <div className="mt-auto space-y-3">
                        <button onClick={handleGradeSubmission} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> Hoàn tất chấm bài
                        </button>
                        <button onClick={() => setSelectedSub(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Để sau</button>
                     </div>
                  </div>

               </div>
            </div>
         )}
      </div>
   );
}

function TabButton({ active, label, count, icon: Icon, onClick }: any) {
   return (
      <button onClick={onClick} className={`relative pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
         {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-300'}`} />}
         {label}
         {count !== undefined && count > 0 && <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white rounded text-[8px]">{count}</span>}
         {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full animate-in zoom-in duration-300" />}
      </button>
   );
}

function ExternalLink({ className }: { className?: string }) {
   return (
      <svg
         className={className}
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
         <polyline points="15 3 21 3 21 9" />
         <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
   );
}

function StatItem({ icon: Icon, label, value, sub, color, bg }: any) {
   return (
      <div className={`p-6 ${bg} rounded-[2.5rem] border border-white shadow-sm space-y-3 hover:-translate-y-1 transition-all group`}>
         <div className="flex items-center justify-between">
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:rotate-12 transition-transform`}><Icon className="w-5 h-5" /></div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
         </div>
         <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
               <p className={`text-2xl font-black ${color} tracking-tighter`}>{value}</p>
               <p className="text-[9px] font-bold text-slate-400">{sub}</p>
            </div>
         </div>
      </div>
   );
}
