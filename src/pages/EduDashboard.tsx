import React, { useState, useEffect } from 'react';
import {
   BookOpen, Brain, Zap, Clock, CheckCircle2,
   ArrowRight, FileText, Upload, Mic,
   MessageSquare, Layout, Sparkles, BookMarked,
   CalendarDays, AlertCircle, FileAudio, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
         // Clean up URL to prevent showing modal again on refresh
         window.history.replaceState({}, '', window.location.pathname);
      }
      fetchEnrolledClasses();
   }, []);

   async function fetchEnrolledClasses() {
      setLoading(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         // Fetch all enrollment-related data in parallel
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

         if (classesRes.error) console.error('Classes Error:', classesRes.error);
         
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
      <div className="animate-in fade-in duration-700 space-y-10 pb-32 font-sans bg-slate-50 min-h-screen">
         {/* 1. WELCOME HEADER - TẬP TRUNG VÀO NHIỆM VỤ */}
         <section className="relative overflow-hidden p-10 lg:p-16 clip-diagonal bg-[#1A237E] text-white shadow-2xl mx-4 mt-4">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 clip-diagonal blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-6 max-w-2xl text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <div className="px-3 py-1 bg-white/10 clip-diagonal border border-white/20 text-[10px] font-heading font-black uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-3 h-3" /> Toxi Blended Learning
                     </div>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
                     Không gian Học tập & <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] to-yellow-400">Nộp bài thông minh.</span>
                  </h1>
                  <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg">
                     Hệ thống được thiết kế để đồng hành cùng lớp học của bạn. Làm bài tập, ôn luyện kiến thức giáo trình và thực hành giao tiếp AI ngay tại đây.
                  </p>
               </div>

               <div className="w-full md:w-[450px] shrink-0">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 clip-diagonal space-y-6">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-heading font-black uppercase tracking-widest text-[#FF9800]">Không gian học tập</p>
                        {enrolledClasses.length > 1 && <span className="text-[9px] font-bold text-white/40 italic">+{enrolledClasses.length - 1} lớp khác</span>}
                     </div>

                     {(enrolledClasses.length > 0 || approvedCourses.length > 0) ? (
                        <>
                           {/* Show first active class OR first approved course */}
                           {(() => {
                              const activeClass = enrolledClasses.length > 0 ? enrolledClasses[0] : null;
                              const courseItem = activeClass ? activeClass.courses : approvedCourses[0].courses;
                              const isClass = !!activeClass;

                              return (
                                 <>
                                    <div className="flex gap-5 items-center">
                                       <div className="w-20 h-20 clip-diagonal overflow-hidden shrink-0 border-2 border-white/10 shadow-xl">
                                          <img src={courseItem?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} alt="Course" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="space-y-2">
                                          <h3 className="font-heading font-black text-lg leading-tight line-clamp-2">{isClass ? activeClass.name : courseItem?.title}</h3>
                                          <p className="text-xs font-medium text-white/50">{isClass ? courseItem?.title : 'Khóa học đã sẵn sàng'}</p>
                                       </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                                       <div className="flex justify-between items-center text-[10px]">
                                          <span className="flex items-center gap-2 text-white/60 font-heading font-black uppercase tracking-widest"><CalendarDays className="w-4 h-4" /> Trạng thái:</span>
                                          <span className="font-heading font-black text-white">{isClass ? (activeClass.schedule || 'Đang học') : 'Sẵn sàng học ngay'}</span>
                                       </div>
                                       <button
                                          onClick={() => {
                                             if (isClass) {
                                                navigate(`/edu/classroom/${activeClass.id}`);
                                             } else {
                                                navigate(`/edu/course/${approvedCourses[0].course_id}`);
                                             }
                                          }}
                                          className="w-full py-4 bg-[#FF9800] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                       >
                                          <Play className="w-4 h-4 fill-current" /> Vào không gian học tập
                                       </button>
                                    </div>
                                 </>
                              );
                           })()}
                        </>
                     ) : (
                        <div className="py-10 text-center space-y-4">
                           <BookMarked className="w-10 h-10 text-white/20 mx-auto" />
                           <p className="text-sm font-medium text-white/60 italic">Bạn chưa tham gia lớp học nào.</p>
                           <button onClick={() => navigate('/edu/explore')} className="px-6 py-2 bg-white/10 hover:bg-white/20 clip-diagonal text-[10px] font-heading font-black uppercase tracking-widest transition-all">Khám phá khóa học</button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </section>

         <div className="px-4 max-w-7xl mx-auto space-y-8 pb-20">
            {pendingEnrollments.length > 0 && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                     <Clock className="w-4 h-4 text-[#FF9800]" />
                     <h2 className="text-sm font-heading font-black uppercase tracking-widest text-slate-400">Khóa học đang chờ kích hoạt ({pendingEnrollments.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {pendingEnrollments.map((enroll) => (
                        <div key={enroll.id} className="bg-white p-6 clip-diagonal border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-3">
                              <span className="px-2 py-1 bg-orange-50 text-[#FF9800] clip-diagonal text-[8px] font-heading font-black uppercase tracking-widest">Đang chờ duyệt</span>
                           </div>
                           <div className="w-16 h-16 clip-diagonal overflow-hidden shrink-0">
                              <img src={enroll.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} className="w-full h-full object-cover opacity-60" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-heading font-black text-slate-800 text-sm leading-tight">{enroll.courses?.title}</h4>
                              <p className="text-[10px] font-medium text-slate-400">Đã đăng ký ngày {new Date(enroll.enrolled_at).toLocaleDateString('vi-VN')}</p>
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
                     <h2 className="text-sm font-heading font-black uppercase tracking-widest text-slate-400">Khóa học đã sẵn sàng ({approvedCourses.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {approvedCourses.map((enroll) => (
                        <div key={enroll.id} className="bg-white p-6 clip-diagonal border border-slate-200 shadow-xl flex items-center gap-5 relative overflow-hidden group hover:border-[#1A237E]/50 transition-all">
                           <div className="absolute top-0 right-0 p-3">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 clip-diagonal text-[8px] font-heading font-black uppercase tracking-widest shadow-lg">Đã kích hoạt</span>
                           </div>
                           <div className="w-20 h-20 clip-diagonal overflow-hidden shrink-0 border border-slate-100">
                              <img src={enroll.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} className="w-full h-full object-cover" />
                           </div>
                           <div className="space-y-3 flex-1 min-w-0">
                              <h4 className="font-heading font-black text-[#1A237E] text-base leading-tight truncate">{enroll.courses?.title}</h4>
                              <button
                                 onClick={async () => {
                                    // Fetch the first lesson for this course to start learning
                                    const { data: firstLesson } = await supabase
                                       .from('course_lessons')
                                       .select('id')
                                       .eq('course_id', enroll.course_id)
                                       .order('order_index', { ascending: true })
                                       .limit(1)
                                       .maybeSingle();
                                    
                                    if (firstLesson) {
                                       navigate(`/edu/course/${enroll.course_id}/lesson/${firstLesson.id}`);
                                    } else {
                                       alert("Khóa học này chưa có bài học nào. Vui lòng quay lại sau.");
                                    }
                                 }}
                                 className="flex items-center gap-2 text-[10px] font-heading font-black text-[#FF9800] uppercase tracking-widest hover:translate-x-1 transition-transform"
                              >
                                 Vào học ngay <ArrowRight className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
               <div className="bg-white clip-diagonal p-10 border border-slate-200 shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-indigo-50 text-[#1A237E] clip-diagonal flex items-center justify-center">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-[#1A237E]">Bắt đầu ngày mới với Toxi AI</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     Luyện tập 15 phút mỗi ngày cùng trợ lý AI để duy trì phản xạ tiếng Trung và tích lũy điểm thưởng Toxi Coins.
                  </p>
                  <button onClick={() => navigate('/edu/practice')} className="px-8 py-4 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                     Luyện tập ngay
                  </button>
               </div>

               <div className="bg-white clip-diagonal p-10 border border-slate-200 shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-orange-50 text-[#FF9800] clip-diagonal flex items-center justify-center">
                     <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-[#1A237E]">Khám phá thêm lộ trình</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     Bạn muốn mở rộng kỹ năng? Khám phá hàng chục khóa học tiếng Trung Ứng Dụng thực chiến khác tại Toxi.
                  </p>
                  <button onClick={() => navigate('/edu/explore')} className="px-8 py-4 bg-[#FF9800] text-white clip-diagonal-hover font-heading font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                     Tìm kiếm khóa học
                  </button>
               </div>
            </div>
         </div>

         {/* SUCCESS CELEBRATION MODAL */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white clip-diagonal w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative">
                  <div className="relative p-12 text-center space-y-8">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A237E] to-[#FF9800]" />
                     
                     <div className="mx-auto w-24 h-24 bg-emerald-50 clip-diagonal flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                     </div>

                     <div className="space-y-4">
                        <h2 className="text-3xl font-heading font-black text-[#1A237E] tracking-tight">Thanh toán Thành công!</h2>
                        <p className="text-slate-500 font-bold leading-relaxed">
                           Chào mừng bạn đến với <span className="text-[#FF9800]">Toxi Edu</span>. Khóa học của bạn đã được kích hoạt và sẵn sàng để bắt đầu ngay bây giờ.
                        </p>
                     </div>

                     <div className="pt-4 space-y-3">
                        <button 
                           onClick={() => setShowSuccessModal(false)}
                           className="w-full py-5 bg-[#1A237E] text-white clip-diagonal-hover font-heading font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                           Bắt đầu học ngay
                        </button>
                        <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest">Hệ thống đã tự động gán lớp học cho bạn</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
