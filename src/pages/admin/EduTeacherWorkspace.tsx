import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Trophy, Settings, Plus, Search, 
  Edit, Trash2, Video, FileText, CheckCircle2, AlertCircle,
  GraduationCap, Upload, Mic, Layout, Sparkles, ShieldAlert,
  ChevronLeft, Save, X, Play, Loader2, Bot, AppWindow, 
  Layers, Terminal, BarChart3, Kanban, Image as ImageIcon,
  MessageSquare, Copy, Check, Filter, Database,
  UserPlus, UserCheck, Key, ArrowRight, Download, Info, Award,
  CreditCard, Wallet, RefreshCw, Target, Zap, ShieldCheck,
  Calendar, Clock, Star, MessageCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---
type TabType = 'dashboard' | 'my_classes' | 'curriculum' | 'student_progress' | 'submissions';

export default function EduTeacherWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const navigate = useNavigate();

  // Data States
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    pendingSubmissions: 0,
    avgProgress: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (teacherProfile) {
      fetchTabData();
    }
  }, [activeTab, teacherProfile]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch teacher profile
      const { data: profile } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setTeacherProfile(profile);
      } else {
        // If not found in teachers table, maybe check toxi_profiles and role
        const { data: p } = await supabase
          .from('toxi_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (p?.role === 'teacher') {
           setTeacherProfile({ ...p, full_name: p.full_name, user_id: p.id });
        }
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTabData() {
    if (!teacherProfile) return;
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        // Fetch stats
        const { data: classes } = await supabase
          .from('edu_classes')
          .select('id, name, edu_class_members(count)')
          .eq('teacher_id', teacherProfile.id);
        
        const totalStudents = classes?.reduce((acc, curr: any) => acc + (curr.edu_class_members?.[0]?.count || 0), 0) || 0;
        
        setStats({
          totalStudents,
          activeClasses: classes?.length || 0,
          pendingSubmissions: 5, // Mocked for now
          avgProgress: 68 // Mocked
        });
      } else if (activeTab === 'my_classes') {
        const { data } = await supabase
          .from('edu_classes')
          .select('*, courses(title, level), edu_class_members(count)')
          .eq('teacher_id', teacherProfile.id)
          .order('created_at', { ascending: false });
        setMyClasses(data || []);
      } else if (activeTab === 'curriculum') {
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', teacherProfile.id);
        setCourses(data || []);
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClassDetails(cls: any) {
    setSelectedClass(cls);
    setLoading(true);
    try {
      const { data } = await supabase
        .from('edu_class_members')
        .select('*, toxi_profiles(full_name, avatar_url, email)')
        .eq('class_id', cls.id);
      
      // For each member, we could fetch their progress in the course
      const membersWithProgress = await Promise.all((data || []).map(async (m: any) => {
        const { data: progress } = await supabase
          .from('edu_lesson_progress')
          .select('count')
          .eq('user_id', m.student_id)
          .eq('course_id', cls.course_id);
        
        return { ...m, progress_count: progress?.[0]?.count || 0 };
      }));

      setClassMembers(membersWithProgress);
      setActiveTab('student_progress');
    } catch (err) {
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans selection:bg-indigo-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Toxi <span className="text-indigo-600">Teacher</span></h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Portal Giảng viên v1.0</p>
            </div>
          </div>

          <div className="space-y-1">
             {[
               { id: 'dashboard', icon: Layout, label: 'Bảng điều khiển' },
               { id: 'my_classes', icon: Users, label: 'Lớp học của tôi' },
               { id: 'curriculum', icon: BookOpen, label: 'Giáo trình & Bài giảng' },
               { id: 'submissions', icon: FileText, label: 'Bài tập học viên' },
             ].map(item => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id as TabType)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                   activeTab === item.id 
                   ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                 }`}
               >
                 <item.icon className="w-5 h-5" />
                 {item.label}
               </button>
             ))}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
           <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-indigo-600">
                 {teacherProfile?.full_name?.charAt(0) || 'T'}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black text-slate-900 truncate">{teacherProfile?.full_name || 'Teacher'}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Giảng viên</p>
              </div>
              <button onClick={() => navigate('/')} className="text-slate-400 hover:text-red-500 transition-colors">
                 <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-10">
           <div className="flex items-center gap-4">
              {activeTab === 'student_progress' && (
                <button onClick={() => setActiveTab('my_classes')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                   <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-black text-slate-900">
                 {activeTab === 'dashboard' && 'Tổng quan giảng dạy'}
                 {activeTab === 'my_classes' && 'Quản lý lớp học'}
                 {activeTab === 'curriculum' && 'Quản lý bài giảng'}
                 {activeTab === 'student_progress' && `Tiến độ lớp: ${selectedClass?.name}`}
                 {activeTab === 'submissions' && 'Chấm bài & Phản hồi'}
              </h2>
           </div>

           <div className="flex items-center gap-3">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   placeholder="Tìm kiếm nhanh..." 
                   className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600 w-64 transition-all"
                 />
              </div>
              <button className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all">
                 <Star className="w-5 h-5 fill-current" />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Đang tải dữ liệu...</p>
             </div>
           ) : (
             <div className="animate-in fade-in duration-500">
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                          { label: 'Học viên của tôi', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
                          { label: 'Lớp học đang dạy', value: stats.activeClasses, icon: Layout, color: 'bg-indigo-500' },
                          { label: 'Bài tập chờ chấm', value: stats.pendingSubmissions, icon: FileText, color: 'bg-orange-500' },
                          { label: 'Tiến độ trung bình', value: `${stats.avgProgress}%`, icon: BarChart3, color: 'bg-emerald-500' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-indigo-600 transition-all">
                             <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <s.icon className="w-6 h-6" />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                             <p className="text-2xl font-black text-slate-900">{s.value}</p>
                          </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                           <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-indigo-600" /> Lịch dạy hôm nay
                           </h3>
                           <div className="space-y-4">
                              {myClasses.slice(0, 3).map((cls, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between group hover:shadow-xl transition-all">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">
                                         0{i+1}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900">{cls.name}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase">{cls.courses?.title} • {cls.schedule || 'Chưa có lịch'}</p>
                                      </div>
                                   </div>
                                   <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                                      Vào lớp
                                   </button>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <MessageCircle className="w-5 h-5 text-orange-500" /> Thông báo mới
                           </h3>
                           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                              <div className="flex gap-4">
                                 <div className="w-1 h-10 bg-indigo-600 rounded-full" />
                                 <div>
                                    <p className="text-xs font-black text-slate-900">Lớp HSK 1 khai giảng tuần sau</p>
                                    <p className="text-[10px] font-bold text-slate-400">Vui lòng chuẩn bị giáo trình</p>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <div className="w-1 h-10 bg-emerald-500 rounded-full" />
                                 <div>
                                    <p className="text-xs font-black text-slate-900">Hệ thống cập nhật tính năng chấm AI</p>
                                    <p className="text-[10px] font-bold text-slate-400">Xem tài liệu hướng dẫn</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'my_classes' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myClasses.map((cls, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                           <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 flex flex-col justify-end relative">
                              <div className="absolute top-6 right-6 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[8px] font-black uppercase tracking-widest">
                                 {cls.status}
                              </div>
                              <h3 className="text-white font-black text-lg">{cls.name}</h3>
                           </div>
                           <div className="p-8 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Khóa học</p>
                                    <p className="text-xs font-black text-slate-900">{cls.courses?.title}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Học viên</p>
                                    <p className="text-xs font-black text-slate-900">{cls.edu_class_members?.[0]?.count || 0} Bạn</p>
                                 </div>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lịch học</p>
                                 <p className="text-xs font-black text-slate-600">{cls.schedule || 'Chưa cập nhật'}</p>
                              </div>
                              <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-3">
                                 <button onClick={() => fetchClassDetails(cls)} className="px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all">
                                    Tiến độ
                                 </button>
                                 <button className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                                    Quản lý <ChevronRight className="w-3 h-3" />
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                      <button className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all group">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                            <Plus className="w-8 h-8" />
                         </div>
                         <p className="text-xs font-black uppercase tracking-widest">Tạo lớp mới</p>
                      </button>
                   </div>
                )}

                {activeTab === 'student_progress' && (
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Học viên</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bài học đã hoàn thành</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiến độ</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                           </tr>
                        </thead>
                        <tbody>
                           {classMembers.map((member, i) => (
                             <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600 text-xs">
                                         {member.toxi_profiles?.full_name?.charAt(0)}
                                      </div>
                                      <p className="text-sm font-black text-slate-900">{member.toxi_profiles?.full_name}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-slate-500">{member.toxi_profiles?.email}</td>
                                <td className="px-8 py-5 text-center font-black text-slate-900">{member.progress_count}</td>
                                <td className="px-8 py-5">
                                   <div className="flex flex-col gap-2">
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                           className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                           style={{ width: `${Math.min(100, (member.progress_count / 30) * 100)}%` }}
                                         />
                                      </div>
                                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest text-center">
                                         {Math.round(Math.min(100, (member.progress_count / 30) * 100))}%
                                      </p>
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all">
                                      <MessageSquare className="w-5 h-5" />
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course, i) => (
                         <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                            <div className="p-8 space-y-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                     <BookOpen className="w-7 h-7" />
                                  </div>
                                  <div>
                                     <h3 className="text-base font-black text-slate-900 tracking-tight">{course.title}</h3>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{course.level} • {course.category}</p>
                                  </div>
                               </div>
                               <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">{course.description}</p>
                               <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                  <div className="flex -space-x-2">
                                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">L1</div>
                                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">L2</div>
                                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">+</div>
                                  </div>
                                  <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                                     Xem bài giảng
                                  </button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}

                {activeTab === 'submissions' && (
                   <div className="bg-white rounded-[3rem] p-12 border border-slate-200 text-center space-y-6 shadow-sm">
                      <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-100 animate-pulse">
                         <Bot className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                         <h2 className="text-2xl font-black text-slate-900">AI Submission Lab</h2>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto">Hệ thống đang tích hợp AI để tự động nhận diện và chấm điểm bài tập ghi âm/viết của học viên.</p>
                      </div>
                      <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <Mic className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-slate-900 uppercase">Voice Analysis</p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <Sparkles className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-slate-900 uppercase">Smart Feedback</p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <Award className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-slate-900 uppercase">XP Awarding</p>
                         </div>
                      </div>
                   </div>
                )}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
