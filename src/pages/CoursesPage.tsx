import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Search, X, Loader2, Star, Clock, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../lib/api/crm';
import PublicNav from '../components/PublicNav';

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const mockCourses = [
    { id: 'hsk-1-2', title: 'Tiếng Trung Giao Tiếp (HSK 1-2)', description: 'Khóa học dành cho người mới bắt đầu, tập trung vào kỹ năng nghe nói cơ bản, phát âm chuẩn và từ vựng giao tiếp hàng ngày.', level: 'Cơ bản', duration: '3 Tháng', lessons: 24 },
    { id: 'hsk-3-4', title: 'Tiếng Trung Tổng Hợp (HSK 3-4)', description: 'Nâng cao toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết. Đủ năng lực thi chứng chỉ HSK 4 và giao tiếp thành thạo trong môi trường công sở.', level: 'Trung cấp', duration: '4 Tháng', lessons: 36 },
    { id: 'hsk-5-6', title: 'Luyện Thi HSK 5-6 Chuyên Sâu', description: 'Chương trình luyện thi cường độ cao, chiến thuật làm bài chuẩn xác. Hệ thống đề thi thử bám sát đề thi thật.', level: 'Nâng cao', duration: '6 Tháng', lessons: 48 },
    { id: 'business', title: 'Tiếng Trung Thương Mại', description: 'Khóa học thiết kế riêng cho người đi làm, đàm phán hợp đồng, từ vựng chuyên ngành xuất nhập khẩu và kinh doanh.', level: 'Ứng dụng', duration: '3 Tháng', lessons: 20 },
    { id: 'kids', title: 'Tiếng Trung Trẻ Em', description: 'Phương pháp học thông qua trò chơi và bài hát, giúp bé tiếp xúc với tiếng Trung một cách tự nhiên và vui vẻ nhất.', level: 'Trẻ em', duration: '6 Tháng', lessons: 48 },
  ];

  const [courses] = useState(mockCourses);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    courseId: courses[0].id,
    courseTitle: courses[0].title,
    studyMode: 'online'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = courses.find(c => c.id === e.target.value);
    setFormData({
      ...formData,
      courseId: e.target.value,
      courseTitle: selectedCourse ? selectedCourse.title : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.fullName || !formData.phone) {
      setError('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
      setLoading(false);
      return;
    }

    try {
      await crmApi.createLead({
        full_name: formData.fullName,
        phone: formData.phone,
        source: 'Courses Page',
        status: 'new',
        potential_score: 80,
        notes: `Đăng ký khóa học từ Trang Khóa Học: ${formData.courseTitle} | Hình thức: ${formData.studyMode === 'online' ? 'Trực tuyến (Online)' : 'Trực tiếp (Offline)'}`
      });
      
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setFormData(prev => ({ ...prev, fullName: '', phone: '' }));
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#2E3192] selection:text-white">
      <PublicNav onRegisterClick={() => setIsModalOpen(true)} />

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-[#2E3192]" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Đăng ký nhận tư vấn</h3>
              <p className="text-sm text-slate-500 mt-1">Để lại thông tin, TOXI sẽ liên hệ tư vấn lộ trình học phù hợp nhất.</p>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Đăng ký thành công!</h4>
                <p className="text-sm text-slate-600">Cảm ơn bạn. Chuyên viên tư vấn của TOXI sẽ gọi lại cho bạn sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center">{error}</div>}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192]" placeholder="Nhập họ và tên của bạn" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192]" placeholder="Nhập số điện thoại liên hệ" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hình thức học</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, studyMode: 'online'})}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${formData.studyMode === 'online' ? 'bg-indigo-50 border-[#2E3192] text-[#2E3192]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      Trực tuyến (Online)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, studyMode: 'offline'})}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${formData.studyMode === 'offline' ? 'bg-indigo-50 border-[#2E3192] text-[#2E3192]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      Trực tiếp (Offline)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khóa học quan tâm</label>
                  <select value={formData.courseId} onChange={handleCourseChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-1 focus:ring-[#2E3192]">
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#2E3192] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2 hover:bg-[#1B1D55] transition-colors disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi thông tin tư vấn'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-32 pb-16 bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Khám phá lộ trình <span className="text-[#2E3192]">Tiếng Trung</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10">
            Lựa chọn khóa học phù hợp với mục tiêu của bạn. Từ giao tiếp cơ bản, luyện thi HSK đến tiếng Trung thương mại.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm khóa học..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-medium focus:outline-none focus:border-[#2E3192] focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredCourses.length === 0 ? (
           <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-slate-500 font-medium">Vui lòng thử lại với từ khóa khác.</p>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="flex items-center justify-between mb-4">
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest">
                    {course.level || 'Đào tạo'}
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-[#2E3192] transition-colors">{course.title}</h3>
                
                <p className="text-slate-500 font-medium text-sm mb-6 flex-grow leading-relaxed">
                  {course.description || 'Khóa học được thiết kế chuyên sâu giúp học viên nhanh chóng đạt mục tiêu ngôn ngữ.'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-50">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Thời lượng</p>
                      <p className="text-xs font-bold text-slate-700">{course.duration || 'Liên hệ'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <Book className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Bài học</p>
                      <p className="text-xs font-bold text-slate-700">{course.lessons ? `${course.lessons} bài` : 'Đầy đủ'}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setFormData(prev => ({...prev, courseId: course.id, courseTitle: course.title}));
                    setIsModalOpen(true);
                  }}
                  className="w-full py-3.5 bg-[#2E3192] hover:bg-[#1B1D55] text-white text-center rounded-xl text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  Đăng ký nhận tư vấn
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-lg font-black text-white">TOXI EDU</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <a href="tel:0384468736" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span>📞</span> 0384.468.736
              </a>
              <a href="mailto:toxichinese.center@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span>✉️</span> toxichinese.center@gmail.com
              </a>
              <span className="flex items-center gap-1.5">
                <span>📍</span> TDP Chợ Rủn, P. Đông Sơn, Thanh Hóa
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} TOXI EDU. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
