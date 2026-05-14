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

         // 1. Fetch Active Classes (via class_members)
         // We use a safer select that doesn't fail if one relation is missing
         const { data: classesData, error: classesError } = await supabase
            .from('edu_class_members')
            .select(`
               *,
               edu_classes (
                  *,
                  courses (*)
               )
            `)
            .eq('student_id', user.id);

         if (classesError) {
            console.error('Classes Error:', classesError);
         }
         
         // Filter out any members where edu_classes might be null due to RLS or deletion
         const validClasses = classesData?.filter(m => m.edu_classes).map(m => m.edu_classes) || [];
         setEnrolledClasses(validClasses);

         // 2. Fetch Pending Enrollments (not yet in a class)
         const { data: pendingData, error: pendingError } = await supabase
            .from('course_enrollments')
            .select('*, courses(*)')
            .eq('user_id', user.id)
            .eq('status', 'pending');

         if (pendingError) throw pendingError;
         setPendingEnrollments(pendingData || []);

         // 3. Fetch Approved Enrollments (Active but maybe not in a class member yet)
         const { data: approvedData, error: approvedError } = await supabase
            .from('course_enrollments')
            .select('*, courses(*)')
            .eq('user_id', user.id)
            .eq('status', 'active');

         if (approvedError) throw approvedError;

         // Filter out courses that are already in enrolledClasses to avoid duplicates
         const enrolledCourseIds = classesData?.map(m => m.edu_classes?.course_id) || [];
         const standaloneApproved = approvedData?.filter(a => !enrolledCourseIds.includes(a.course_id)) || [];
         setApprovedCourses(standaloneApproved);

      } catch (err) {
         console.error('Error fetching data:', err);
      } finally {
         setLoading(false);
      }
   }

   return (
      <div className="animate-in fade-in duration-700 space-y-10 pb-32 font-sans bg-[#F9F6ED] min-h-screen">
         {/* 1. WELCOME HEADER - TẬP TRUNG VÀO NHIỆM VỤ */}
         <section className="relative overflow-hidden p-10 lg:p-16 rounded-[3rem] bg-[#2E3192] text-white shadow-2xl mx-4 mt-4">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-6 max-w-2xl text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-3 h-3" /> Toxi Blended Learning
                     </div>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                     Không gian Học tập & <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">Nộp bài thông minh.</span>
                  </h1>
                  <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg">
                     Hệ thống được thiết kế để đồng hành cùng lớp học của bạn. Làm bài tập, ôn luyện kiến thức giáo trình và thực hành giao tiếp AI ngay tại đây.
                  </p>
               </div>

               <div className="w-full md:w-[450px] shrink-0">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Không gian học tập</p>
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
                                       <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 border-2 border-white/10 shadow-xl">
                                          <img src={courseItem?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} alt="Course" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="space-y-2">
                                          <h3 className="font-black text-lg leading-tight line-clamp-2">{isClass ? activeClass.name : courseItem?.title}</h3>
                                          <p className="text-xs font-medium text-white/50">{isClass ? courseItem?.title : 'Khóa học đã sẵn sàng'}</p>
                                       </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                                       <div className="flex justify-between items-center text-[10px]">
                                          <span className="flex items-center gap-2 text-white/60 font-black uppercase tracking-widest"><CalendarDays className="w-4 h-4" /> Trạng thái:</span>
                                          <span className="font-black text-white">{isClass ? (activeClass.schedule || 'Đang học') : 'Sẵn sàng học ngay'}</span>
                                       </div>
                                       <button
                                          onClick={() => {
                                             if (isClass) {
                                                navigate(`/edu/classroom/${activeClass.id}`);
                                             } else {
                                                navigate(`/edu/course/${approvedCourses[0].course_id}`);
                                             }
                                          }}
                                          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
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
                           <button onClick={() => navigate('/edu/explore')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Khám phá khóa học</button>
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
                     <Clock className="w-4 h-4 text-orange-500" />
                     <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Khóa học đang chờ kích hoạt ({pendingEnrollments.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {pendingEnrollments.map((enroll) => (
                        <div key={enroll.id} className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-3">
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Đang chờ duyệt</span>
                           </div>
                           <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                              <img src={enroll.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} className="w-full h-full object-cover opacity-60" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-black text-slate-800 text-sm leading-tight">{enroll.courses?.title}</h4>
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
                     <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Khóa học đã sẵn sàng ({approvedCourses.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {approvedCourses.map((enroll) => (
                        <div key={enroll.id} className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-xl flex items-center gap-5 relative overflow-hidden group hover:border-emerald-500 transition-all">
                           <div className="absolute top-0 right-0 p-3">
                              <span className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">Đã kích hoạt</span>
                           </div>
                           <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 border border-emerald-50">
                              <img src={enroll.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'} className="w-full h-full object-cover" />
                           </div>
                           <div className="space-y-3 flex-1 min-w-0">
                              <h4 className="font-black text-[#2E3192] text-base leading-tight truncate">{enroll.courses?.title}</h4>
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
                                 className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
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
               <div className="bg-white rounded-[2.5rem] p-10 border border-[#EADBC8] shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-indigo-50 text-[#2E3192] rounded-2xl flex items-center justify-center">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-[#2E3192]">Bắt đầu ngày mới với Toxi AI</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     Luyện tập 15 phút mỗi ngày cùng trợ lý AI để duy trì phản xạ tiếng Trung và tích lũy điểm thưởng Toxi Coins.
                  </p>
                  <button onClick={() => navigate('/edu/practice')} className="px-8 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                     Luyện tập ngay
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] p-10 border border-[#EADBC8] shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                     <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-[#2E3192]">Khám phá thêm lộ trình</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     Bạn muốn mở rộng kỹ năng? Khám phá hàng chục khóa học tiếng Trung Ứng Dụng thực chiến khác tại Toxi.
                  </p>
                  <button onClick={() => navigate('/edu/explore')} className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                     Tìm kiếm khóa học
                  </button>
               </div>
            </div>
         </div>

         {/* SUCCESS CELEBRATION MODAL */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="relative p-12 text-center space-y-8">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
                     
                     <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                     </div>

                     <div className="space-y-4">
                        <h2 className="text-3xl font-black text-[#2E3192] tracking-tight">Thanh toán Thành công!</h2>
                        <p className="text-slate-500 font-bold leading-relaxed">
                           Chào mừng bạn đến với <span className="text-orange-500">Toxi Edu</span>. Khóa học của bạn đã được kích hoạt và sẵn sàng để bắt đầu ngay bây giờ.
                        </p>
                     </div>

                     <div className="pt-4 space-y-3">
                        <button 
                           onClick={() => setShowSuccessModal(false)}
                           className="w-full py-5 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                           Bắt đầu học ngay
                        </button>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hệ thống đã tự động gán lớp học cho bạn</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
