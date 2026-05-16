import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Users, BookOpen, Award, 
  Share2, Globe, MessageCircle, Play,
  CheckCircle2, Sparkles, TrendingUp
} from 'lucide-react';

const TEACHERS = [
  { 
    id: 't1', 
    name: 'Thầy Lê Đình Hiểu', 
    title: 'Founder of Toxi | HSK 6', 
    avatar: 'https://i.pravatar.cc/150?u=t1',
    bio: 'Chuyên gia Hán ngữ với hơn 10 năm kinh nghiệm giảng dạy tiếng Trung ứng dụng. Founder của phương pháp Tongxiao - kết hợp giữa tư duy ngôn ngữ và công nghệ AI.',
    experience: '10+ năm',
    students: '15,000+',
    rating: 4.9,
    coursesCount: 8,
    social: {
        linkedin: '#',
        twitter: '#',
        globe: '#'
    },
    achievements: [
        'Chứng chỉ HSK 6 cấp độ cao nhất',
        'Tác giả bộ giáo trình Tongxiao Method',
        'Diễn giả tại nhiều hội thảo ngôn ngữ quốc tế'
    ]
  },
  { 
    id: 't2', 
    name: 'Cô Minh Anh', 
    title: 'Thạc sĩ Ngôn ngữ học', 
    avatar: 'https://i.pravatar.cc/150?u=t2',
    bio: 'Nhiệt huyết và sáng tạo trong cách truyền đạt. Cô Minh Anh nổi tiếng với phương pháp học qua truyện tranh và tình huống thực tế dành cho trẻ em.',
    experience: '6 năm',
    students: '5,000+',
    rating: 4.9,
    coursesCount: 4,
    achievements: [
        'Thạc sĩ ngôn ngữ học tại ĐH Bắc Kinh',
        'Top 10 giáo viên trẻ xuất sắc năm 2023',
        'Chuyên gia tâm lý giáo dục thiếu nhi'
    ]
  }
];

export default function EduTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const teacher = TEACHERS.find(t => t.id === id) || TEACHERS[0];

  return (
    <div className="animate-in fade-in duration-700 space-y-12 pb-32">
       {/* Header / Back */}
       <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left: Bio & Profile */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 text-center space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-32 bg-[#2E3192]/5" />
                 <div className="relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto overflow-hidden">
                       <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-6 space-y-2">
                       <h1 className="text-3xl font-black text-slate-900">{teacher.name}</h1>
                       <p className="text-xs font-black text-[#2E3192] uppercase tracking-widest">{teacher.title}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                       <p className="text-xl font-black text-slate-900">{teacher.rating}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Rating</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xl font-black text-slate-900">{teacher.students}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Students</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xl font-black text-slate-900">{teacher.coursesCount}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Courses</p>
                    </div>
                 </div>

                 <div className="flex justify-center gap-4 pt-4">
                    <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#2E3192] transition-colors"><Share2 className="w-5 h-5" /></button>
                    <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#2E3192] transition-colors"><Globe className="w-5 h-5" /></button>
                    <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#2E3192] transition-colors"><Globe className="w-5 h-5" /></button>
                 </div>
              </div>

              <div className="bg-[#1E2060] rounded-[2.5rem] p-8 text-white space-y-6">
                 <h3 className="text-xl font-black flex items-center gap-3">
                    <Award className="w-6 h-6 text-orange-400" /> Thành tựu
                 </h3>
                 <ul className="space-y-4">
                    {teacher.achievements.map((ach, i) => (
                      <li key={i} className="flex gap-4 items-start text-sm font-medium text-white/70">
                         <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                         {ach}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Right: Detailed Info & Courses */}
           <div className="lg:col-span-8 space-y-12">
              <section className="space-y-6">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">Về giảng viên</h2>
                 <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-[#2E3192] pl-8">
                    "{teacher.bio}"
                 </p>
              </section>

              <section className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900">Các khóa học đang dạy</h3>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{teacher.coursesCount} khóa học</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Simplified Course Cards for Teacher Profile */}
                    {[1, 2].map(i => (
                      <div key={i} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
                         <div className="aspect-video bg-slate-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2E3192]/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                               <p className="text-[10px] font-black uppercase tracking-widest bg-orange-500 px-3 py-1 rounded-full w-fit mb-2">Bestseller</p>
                               <h4 className="text-lg font-black leading-tight">Tiếng Trung Ứng Dụng {i === 1 ? 'Sơ Cấp' : 'Trung Cấp'}</h4>
                            </div>
                         </div>
                         <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                               <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 1.2k</span>
                               <span className="flex items-center gap-1"><Star className="w-4 h-4 text-orange-400 fill-orange-400" /> 4.9</span>
                            </div>
                            <p className="font-black text-[#2E3192]">2.500.000₫</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Teaching Philosophy / Stats */}
              <div className="p-10 rounded-[3rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                       <Sparkles className="w-6 h-6 text-[#2E3192]" /> Triết lý giảng dạy
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                       "Tôi tin rằng ngôn ngữ không chỉ là công cụ để giao tiếp, mà là cánh cửa mở ra tư duy và cơ hội mới. Tại Toxi, chúng tôi biến việc học trở nên sống động và thực tế nhất có thể."
                    </p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hiệu quả đào tạo</p>
                       <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-slate-900">
                          <span>Tỷ lệ đỗ HSK</span>
                          <span>98%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[98%] rounded-full" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
}
