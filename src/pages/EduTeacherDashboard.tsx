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
  ChevronLeft, Info, Edit, Download, History
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  
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
      const { data: finalClassesData } = await query;

      if (finalClassesData && finalClassesData.length > 0) {
        setClasses(finalClassesData);
        setActiveClass(finalClassesData[0]);
        await fetchClassDetails(finalClassesData[0].id);
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
        .from('edu_homework_submissions')
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

  async function fetchClassDetails(classId: string) {
    // 1. Fetch Students
    console.log('Fetching students for class:', classId);
    const { data: membersData, error: membersErr } = await supabase
      .from('edu_class_members')
      .select('*, toxi_profiles!student_id(id, full_name, avatar_url, email)')
      .eq('class_id', classId);
    
    if (membersErr) console.error('Error fetching members:', membersErr);
    console.log('Members found:', membersData);
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
        task: `Bài nộp #${s.id.slice(0,4)}`,
        time: new Date(s.created_at).toLocaleString('vi-VN')
      })));
    }

    const initialAttendance: Record<string, boolean> = {};
    membersData?.forEach((m: any) => initialAttendance[m.student_id] = true);
    setAttendance(initialAttendance);

    // 4. Fetch Unassigned Students (Enrolled in course but not in this class)
    if (activeClass?.course_id) {
       const { data: enrolled } = await supabase
         .from('edu_enrollments')
         .select('*, toxi_profiles!user_id(id, full_name, avatar_url, email)')
         .eq('course_id', activeClass.course_id)
         .eq('status', 'active');
       
       if (enrolled) {
          const memberIds = new Set(membersData?.map(m => m.student_id));
          const unassigned = enrolled
            .filter(e => !memberIds.has(e.user_id))
            .map(e => ({ ...e.toxi_profiles, enrollment_id: e.id }));
          setPendingStudents(unassigned);
       }
    }
  }

  const handleAddMemberToClass = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('edu_class_members')
        .insert({ class_id: activeClass.id, student_id: studentId });
      
      if (error) throw error;
      alert('Đã thêm học viên vào lớp!');
      fetchClassDetails(activeClass.id);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSub) return;
    try {
      const { error } = await supabase
        .from('edu_homework_submissions')
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
      fetchClassDetails(activeClass.id); // Refresh
    } catch (err: any) {
      alert(`Lỗi khi lưu điểm: ${err.message}`);
    }
  };

  const saveAttendance = async () => {
    if (!activeClass) return;
    try {
      const records = students.map(s => ({
        class_id: activeClass.id,
        student_id: s.student_id,
        status: attendance[s.student_id] ? 'present' : 'absent',
        attendance_date: new Date().toISOString().split('T')[0]
      }));

      const { error } = await supabase
        .from('edu_attendance')
        .upsert(records, { onConflict: 'class_id, student_id, attendance_date' });

      if (error) throw error;
      alert('Đã lưu điểm danh thành công!');
    } catch (err: any) {
      alert(`Lỗi khi lưu điểm danh: ${err.message}`);
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
                 <div className="w-12 h-12 bg-[#2E3192] rounded-2xl flex items-center justify-center text-white shadow-lg"><GraduationCap className="w-7 h-7" /></div>
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
                    <button key={cls.id} onClick={() => { setActiveClass(cls); fetchClassDetails(cls.id); }}
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
              <StatItem icon={Clock} label="Cần chấm" value={submissions.filter(s=>s.status==='pending').length} sub="Bài nộp" color="text-purple-600" bg="bg-purple-50" />
              <StatItem icon={FileText} label="Lớp học" value={classes.length} sub="Lớp đang dạy" color="text-orange-600" bg="bg-orange-50" />
              <StatItem icon={TrendingUp} label="Tiến độ" value={`${Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / (students.length || 1))}%`} sub="Trung bình" color="text-emerald-600" bg="bg-emerald-50" />
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/30">
                 <div className="flex flex-wrap items-center gap-6">
                    <TabButton active={activeTab === 'submissions'} label="Chấm bài" icon={PenTool} count={submissions.filter(s=>s.status==='pending').length} onClick={() => setActiveTab('submissions')} />
                    <TabButton active={activeTab === 'lessons'} label="Bài giảng" icon={BookOpen} onClick={() => setActiveTab('lessons')} />
                    <TabButton active={activeTab === 'roster'} label="Học viên" icon={Users} onClick={() => setActiveTab('roster')} />
                    <TabButton active={activeTab === 'attendance'} label="Điểm danh" icon={UserCheck} onClick={() => setActiveTab('attendance')} />
                    <TabButton active={activeTab === 'scores'} label="Bảng điểm" icon={ClipboardList} onClick={() => setActiveTab('scores')} />
                    <TabButton active={activeTab === 'analytics'} label="Phân tích" icon={BarChart2} onClick={() => setActiveTab('analytics')} />
                    <TabButton active={activeTab === 'history'} label="Lịch sử" icon={History} onClick={() => setActiveTab('history')} />
                    <TabButton active={activeTab === 'profile'} label="Hồ sơ" icon={Settings} onClick={() => setActiveTab('profile')} />
                 </div>
              </div>

              <div className="p-8">
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
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sub.type === 'audio' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                      {sub.type === 'audio' ? <Mic className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
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
                    <div className="space-y-6">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Kế hoạch bài giảng: {activeClass?.courses?.title}</h3>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Thêm bài giảng</button>
                       </div>
                       <div className="space-y-4">
                          {(activeClass?.courses?.syllabus_json || []).map((lesson: any, i: number) => (
                             <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-indigo-600 transition-all shadow-sm">
                                <div className="flex items-center gap-6">
                                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm">
                                      {i + 1}
                                   </div>
                                   <div>
                                      <h4 className="font-black text-slate-800 text-sm">{lesson.title}</h4>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trọng tâm: {lesson.focus || 'Ngữ pháp & Từ vựng'}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Edit className="w-4 h-4" /></button>
                                   <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><PlayCircle className="w-4 h-4" /></button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {activeTab === 'roster' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {students.length === 0 ? (
                          <div className="col-span-full py-20 text-center space-y-4">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300"><Users className="w-8 h-8" /></div>
                             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Chưa có học viên nào trong lớp này</p>
                             <p className="text-[10px] text-slate-300">ID Lớp: {activeClass?.id}</p>
                          </div>
                       ) : students.map(s => (
                          <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 hover:border-indigo-600 transition-all shadow-sm group">
                             <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-50 shadow-inner">
                                <img src={s.toxi_profiles?.avatar_url || `https://i.pravatar.cc/150?u=${s.student_id}`} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1">
                                <h4 className="font-black text-slate-800 text-sm">{s.toxi_profiles?.full_name}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{s.toxi_profiles?.email}</p>
                             </div>
                             <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"><MessageSquare className="w-5 h-5" /></button>
                          </div>
                       ))}
                    </div>
                 )}

                 {activeTab === 'roster' && pendingStudents.length > 0 && (
                    <div className="mt-12 space-y-6">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> Học viên đang chờ xếp lớp ({pendingStudents.length})
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingStudents.map(s => (
                             <div key={s.id} className="p-6 bg-white border border-dashed border-slate-200 rounded-3xl flex items-center justify-between hover:border-indigo-300 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-300">{s.full_name?.charAt(0)}</div>
                                   <div>
                                      <h4 className="font-black text-slate-700 text-sm">{s.full_name}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold">{s.email}</p>
                                   </div>
                                </div>
                                <button onClick={() => handleAddMemberToClass(s.id)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Thêm vào lớp</button>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {activeTab === 'attendance' && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Điểm danh ngày {new Date().toLocaleDateString('vi-VN')}</h3>
                          <button onClick={saveAttendance} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Lưu điểm danh</button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {students.map(s => (
                             <div key={s.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center font-black text-[10px] text-indigo-600">{s.toxi_profiles?.full_name?.charAt(0)}</div>
                                   <h4 className="font-black text-slate-800 text-xs">{s.toxi_profiles?.full_name}</h4>
                                </div>
                                <button onClick={() => setAttendance({...attendance, [s.student_id]: !attendance[s.student_id]})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${attendance[s.student_id] ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-transparent'}`}>
                                   {attendance[s.student_id] ? 'Hiện diện' : 'Vắng mặt'}
                                </button>
                             </div>
                          ))}
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
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                             <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Tỷ lệ hoàn thành bài tập</h4>
                                <Activity className="w-5 h-5 text-emerald-500" />
                             </div>
                             <div className="h-48 flex items-end justify-between gap-2 px-4">
                                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                                   <div key={i} className="flex-1 bg-slate-50 rounded-t-xl relative group">
                                      <div 
                                        className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-t-xl transition-all duration-1000 group-hover:bg-indigo-600" 
                                        style={{ height: `${h}%` }}
                                      />
                                   </div>
                                ))}
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Dữ liệu 7 ngày gần nhất</p>
                          </div>
                          
                          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Top học viên tích cực</h4>
                             <div className="space-y-4">
                                {students.slice(0, 4).map((s, i) => (
                                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-indigo-600 transition-all">
                                      <div className="flex items-center gap-3">
                                         <span className="text-xs font-black text-slate-400 group-hover:text-white/60 tabular-nums">#{i+1}</span>
                                         <p className="text-xs font-black text-slate-900 group-hover:text-white">{s.toxi_profiles?.full_name}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         <Star className="w-3.5 h-3.5 text-orange-500 fill-current group-hover:text-white" />
                                         <span className="text-xs font-black text-slate-600 group-hover:text-white">{(1200 - i * 150)} XP</span>
                                      </div>
                                   </div>
                                ))}
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
                          {selectedSub.type === 'audio' ? (
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
                          onChange={(e)=>setGradingScore(e.target.value)}
                          placeholder="Ví dụ: 95" 
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-xl font-black focus:bg-white focus:border-indigo-600 transition-all text-center" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Lời nhận xét (Feedback)</label>
                       <textarea 
                          rows={4} 
                          value={gradingFeedback}
                          onChange={(e)=>setGradingFeedback(e.target.value)}
                          placeholder="Nhập nhận xét cho học sinh..." 
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-600 transition-all" 
                       />
                    </div>
                 </div>

                 <div className="mt-auto space-y-3">
                    <button onClick={handleGradeSubmission} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> Hoàn tất chấm bài
                    </button>
                    <button onClick={()=>setSelectedSub(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Để sau</button>
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
