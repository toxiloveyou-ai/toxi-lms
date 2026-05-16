import React, { useState, useEffect } from 'react';
import {
   BookOpen, Brain, Zap, Clock, CheckCircle2,
   ArrowRight, FileText, Upload, Mic,
   MessageSquare, Layout, Sparkles, BookMarked,
   CalendarDays, AlertCircle, FileAudio, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function EduDashboard() {
   const navigate = useNavigate();
   const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
   const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
   const [approvedCourses, setApprovedCourses] = useState<any[]>([]);
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
         setShowSuccessModal(true);
         window.history.replaceState({}, '', window.location.pathname);
      }
      fetchEnrolledClasses();
   }, []);

   async function fetchEnrolledClasses() {
      setLoading(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const [classesRes, pendingRes, approvedRes] = await Promise.all([
            supabase
               .from('edu_class_members')
               .select('*, edu_classes(*, courses(*))')
               .eq('student_id', user.id),
            supabase
               .from('course_enrollments')
               .select('*, courses(*)')
               .eq('user_id', user.id)
               .eq('status', 'pending'),
            supabase
               .from('course_enrollments')
               .select('*, courses(*)')
               .eq('user_id', user.id)
               .eq('status', 'active')
         ]);

         const validClasses = classesRes.data?.filter(m => m.edu_classes).map(m => m.edu_classes) || [];
         setEnrolledClasses(validClasses);
         setPendingEnrollments(pendingRes.data || []);

         const enrolledCourseIds = classesRes.data?.map(m => m.edu_classes?.course_id) || [];
         const standaloneApproved = approvedRes.data?.filter(a => !enrolledCourseIds.includes(a.course_id)) || [];
         setApprovedCourses(standaloneApproved);

      } catch (err) {
         console.error('Error fetching data:', err);
      } finally {
         setLoading(false);
      }
   }

   return (
      <div className="animate-in fade-in duration-700 space-y-6 md:space-y-10 pb-32 font-sans bg-slate-50 min-h-screen px-2 md:px-0">
         {/* 1. WELCOME HEADER */}
         <section className="relative overflow-hidden p-6 md:p-10 lg:p-16 rounded-2xl md:clip-diagonal bg-[#2E3192] text-white shadow-2xl mx-2 md:mx-4 mt-2 md:mt-4">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 md:bg-indigo-500/20 md:clip-diagonal blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-4 md:space-y-6 max-w-2xl text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <div className="px-3 py-1 bg-white/10 rounded-full md:clip-diagonal border border-white/20 text-[9px] md:text-[10px] font-heading font-black uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-3 h-3" /> Toxi Blended Learning
                     </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
                     Không gian Học tập & <br />
                     <span className="text-[#FF9800]">Nộp bài thông minh.</span>
                  </h1>
                  <p className="text-white/70 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
                     Hệ thống đồng hành cùng lớp học của bạn. Làm bài tập, ôn luyện giáo trình và thực hành giao tiếp AI ngay tại đây.
                  </p>
               </div>

               <div className="w-full md:w-[450px] shrink-0">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-xl md:clip-diagonal space-y-6">
                     <div className="flex items-center justify-between">
                        <p className="text-[9px] md:text-[10px] font-heading font-black uppercase tracking-widest text-[#FF9800]">Không gian học tập</p>
                        {enrolledClasses.length > 1 && <span className="text-[8px] md:text-[9px] font-bold text-white/40 italic">+{enrolledClasses.length - 1} lớp khác</span>}
                     </div>

                     {(enrolledClasses.length > 0 || approvedCourses.length > 0) ? (
                        <>
                           {(() => {
                              const activeClass = enrolledClasses.length > 0 ? enrolledClasses[0] : null;
                              const courseItem = activeClass ? activeClass.courses : approvedCourses[0].courses;
                              const isClass = !!activeClass;

                              return (
                                 <>
                                    <div className="flex gap-4 md:gap-5 items-center">
                                       <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:clip-diagonal overflow-hidden shrink-0 border-2 border-white/10 shadow-xl">
                                          <img src={courseItem?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} alt="Course" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="space-y-1.5 md:space-y-2">
                                          <h3 className="font-heading font-black text-base md:text-lg leading-tight line-clamp-2">{isClass ? activeClass.name : courseItem?.title}</h3>
                                          <p className="text-[10px] md:text-xs font-medium text-white/50">{isClass ? courseItem?.title : 'Khóa học sẵn sàng'}</p>
                                       </div>
                                    </div>
                                    <div className="pt-4 md:pt-6 border-t border-white/10 flex flex-col gap-3 md:gap-4">
                                       <div className="flex justify-between items-center text-[9px] md:text-[10px]">
                                          <span className="flex items-center gap-2 text-white/60 font-heading font-black uppercase tracking-widest"><CalendarDays className="w-4 h-4" /> Trạng thái:</span>
                                          <span className="font-heading font-black text-white">{isClass ? (activeClass.schedule || 'Đang học') : 'Học ngay'}</span>
                                       </div>
                                       <button
                                          onClick={() => {
                                             if (isClass) {
                                                navigate(`/edu/classroom/${activeClass.id}`);
                                             } else {
                                                navigate(`/edu/course/${approvedCourses[0].course_id}`);
                                             }
                                          }}
                                          className="w-full py-3 md:py-4 bg-[#FF9800] text-white rounded-lg md:clip-diagonal font-heading font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                       >
                                          <Play className="w-4 h-4 fill-current" /> Vào học tập
                                       </button>
                                    </div>
                                 </>
                              );
                           })()}
                        </>
                     ) : (
                        <div className="py-8 text-center space-y-4">
                           <BookMarked className="w-10 h-10 text-white/20 mx-auto" />
                           <p className="text-xs md:text-sm font-medium text-white/60 italic">Bạn chưa tham gia lớp học nào.</p>
                           <button onClick={() => navigate('/edu/explore')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full md:clip-diagonal text-[9px] md:text-[10px] font-heading font-black uppercase tracking-widest transition-all">Khám phá ngay</button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </section>

         <div className="px-2 md:px-4 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
            {pendingEnrollments.length > 0 && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                     <Clock className="w-4 h-4 text-[#FF9800]" />
                     <h2 className="text-xs md:text-sm font-heading font-black uppercase tracking-widest text-slate-400">Đang chờ kích hoạt ({pendingEnrollments.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                     {pendingEnrollments.map((enroll) => (
                        <div key={enroll.id} className="bg-white p-4 md:p-6 rounded-xl md:clip-diagonal border border-slate-200 shadow-sm flex items-center gap-4 md:gap-5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2">
                              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9800] rounded-full text-[7px] md:text-[8px] font-heading font-black uppercase tracking-widest">Chờ duyệt</span>
                           </div>
                           <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:clip-diagonal overflow-hidden shrink-0">
                              <img src={enroll.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} className="w-full h-full object-cover opacity-60" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-heading font-black text-slate-800 text-xs md:text-sm leading-tight">{enroll.courses?.title}</h4>
                              <p className="text-[9px] md:text-[10px] font-medium text-slate-400">Đăng ký: {new Date(enroll.enrolled_at).toLocaleDateString('vi-VN')}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {approvedCourses.length > 0 && (
               <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 px-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     <h2 className="text-xs md:text-sm font-heading font-black uppercase tracking-widest text-slate-400">Đã sẵn sàng ({approvedCourses.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                     {approvedCourses.map((enroll) => (
                        <div key={enroll.id} className="bg-white p-4 md:p-6 rounded-xl md:clip-diagonal border border-slate-200 shadow-xl flex items-center gap-4 md:gap-5 relative overflow-hidden group hover:border-[#2E3192]/50 transition-all">
                           <div className="absolute top-0 right-0 p-2">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[7px] md:text-[8px] font-heading font-black uppercase tracking-widest">Kích hoạt</span>
                           </div>
                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:clip-diagonal overflow-hidden shrink-0 border border-slate-100">
                              <img src={enroll.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} className="w-full h-full object-cover" />
                           </div>
                           <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                              <h4 className="font-heading font-black text-[#2E3192] text-sm md:text-base leading-tight truncate">{enroll.courses?.title}</h4>
                              <button
                                 onClick={async () => {
                                    const { data: firstLesson } = await supabase
                                       .from('course_lessons')
                                       .select('id')
                                       .eq('course_id', enroll.course_id)
                                       .order('order_index', { ascending: true })
                                       .limit(1)
                                       .maybeSingle();
                                    
                                    if (firstLesson) {
                                       navigate(`/edu/course/${enroll.course_id}/lesson/${firstLesson.id}`);
                                    }
                                 }}
                                 className="flex items-center gap-2 text-[9px] md:text-[10px] font-heading font-black text-[#FF9800] uppercase tracking-widest"
                              >
                                 Vào học ngay <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-4">
               <div className="bg-white rounded-2xl md:clip-diagonal p-6 md:p-10 border border-slate-200 shadow-sm space-y-4 md:space-y-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-[#2E3192] rounded-lg md:clip-diagonal flex items-center justify-center">
                     <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-heading font-black text-[#2E3192]">Luyện tập cùng Toxi AI</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                     Luyện tập 15 phút mỗi ngày cùng trợ lý AI để duy trì phản xạ và tích lũy điểm thưởng.
                  </p>
                  <button onClick={() => navigate('/edu/practice')} className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#2E3192] text-white rounded-lg md:clip-diagonal font-heading font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95 transition-all">
                     Luyện tập ngay
                  </button>
               </div>

               <div className="bg-white rounded-2xl md:clip-diagonal p-6 md:p-10 border border-slate-200 shadow-sm space-y-4 md:space-y-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 text-[#FF9800] rounded-lg md:clip-diagonal flex items-center justify-center">
                     <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-heading font-black text-[#2E3192]">Khám phá thêm lộ trình</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                     Bạn muốn mở rộng kỹ năng? Khám phá thêm hàng chục khóa học thực chiến khác tại Toxi.
                  </p>
                  <button onClick={() => navigate('/edu/explore')} className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#FF9800] text-white rounded-lg md:clip-diagonal font-heading font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95 transition-all">
                     Tìm khóa học
                  </button>
               </div>
            </div>
         </div>

         {/* CELEBRATION MODAL */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white rounded-2xl md:clip-diagonal w-full max-w-lg overflow-hidden shadow-2xl relative">
                  <div className="relative p-8 md:p-12 text-center space-y-6 md:space-y-8">
                     <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                     </div>
                     <div className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-heading font-black text-[#2E3192]">Thành công!</h2>
                        <p className="text-xs md:text-sm text-slate-500 font-bold">Khóa học của bạn đã được kích hoạt. Hãy bắt đầu ngay nhé!</p>
                     </div>
                     <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#2E3192] text-white rounded-lg font-heading font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                        Học ngay bây giờ
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
