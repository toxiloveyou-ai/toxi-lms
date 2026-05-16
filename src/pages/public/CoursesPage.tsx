import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Search, X, Loader2, Star, Clock, Book, Flame, Tag, Timer, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../../lib/api/crm';
import PublicNav from '../../components/public/PublicNav';

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const mockCourses = [
    { 
      id: 'hsk-1-2', 
      title: 'Tiếng Trung Giao Tiếp (HSK 1-2)', 
      description: 'Khóa học dành cho người mới bắt đầu, tập trung vào kỹ năng nghe nói cơ bản, phát âm chuẩn và từ vựng giao tiếp.', 
      level: 'Cơ bản', 
      duration: '3 Tháng', 
      lessons: 24, 
      originalPrice: '2.500.000đ', 
      salePrice: '1.750.000đ', 
      discount: '30%',
      students: 1240,
      benefits: ['Phát âm chuẩn ngay từ đầu', '500+ từ vựng thông dụng', 'Giao tiếp tình huống thực tế']
    },
    { 
      id: 'hsk-3-4', 
      title: 'Tiếng Trung Tổng Hợp (HSK 3-4)', 
      description: 'Nâng cao toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết. Đủ năng lực thi HSK 4 và giao tiếp thành thạo.', 
      level: 'Trung cấp', 
      duration: '4 Tháng', 
      lessons: 36, 
      originalPrice: '3.200.000đ', 
      salePrice: '2.240.000đ', 
      discount: '30%',
      students: 850,
      benefits: ['Luyện dịch văn bản chuyên sâu', 'Tư duy ngôn ngữ linh hoạt', '1200+ từ vựng HSK 4']
    },
    { 
      id: 'hsk-5-6', 
      title: 'Luyện Thi HSK 5-6 Chuyên Sâu', 
      description: 'Chương trình luyện thi cường độ cao, chiến thuật làm bài chuẩn xác. Hệ thống đề thi thử sát đề thật.', 
      level: 'Nâng cao', 
      duration: '6 Tháng', 
      lessons: 48, 
      originalPrice: '4.500.000đ', 
      salePrice: '3.600.000đ', 
      discount: '20%',
      students: 420,
      benefits: ['Chiến thuật đạt điểm cao', 'Phân tích ngữ pháp phức tạp', 'Viết luận chuyên sâu']
    },
    { 
      id: 'business', 
      title: 'Tiếng Trung Thương Mại', 
      description: 'Thiết kế riêng cho người đi làm, đàm phán hợp đồng, từ vựng chuyên ngành xuất nhập khẩu và kinh doanh.', 
      level: 'Ứng dụng', 
      duration: '3 Tháng', 
      lessons: 20, 
      originalPrice: '3.800.000đ', 
      salePrice: '2.660.000đ', 
      discount: '30%',
      students: 310,
      benefits: ['Tiếng Trung công sở chuyên nghiệp', 'Kỹ năng đàm phán thương mại', 'Soạn thảo email, hợp đồng']
    },
    { 
      id: 'kids', 
      title: 'Tiếng Trung Trẻ Em', 
      description: 'Phương pháp học qua trò chơi và bài hát, giúp bé tiếp xúc tiếng Trung tự nhiên và vui vẻ nhất.', 
      level: 'Trẻ em', 
      duration: '6 Tháng', 
      lessons: 48, 
      originalPrice: '3.000.000đ', 
      salePrice: '2.400.000đ', 
      discount: '20%',
      students: 560,
      benefits: ['Học qua bài hát, trò chơi', 'Xây dựng phản xạ tự nhiên', 'Nhận diện mặt chữ sớm']
    },
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
  const [timeLeft, setTimeLeft] = useState({ days: '02', hours: '14', mins: '30', secs: '45' });

  // Live Countdown Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let s = parseInt(prev.secs) - 1;
        let m = parseInt(prev.mins);
        let h = parseInt(prev.hours);
        let d = parseInt(prev.days);

        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        if (d < 0) { clearInterval(timer); return prev; }

        return {
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          mins: m.toString().padStart(2, '0'),
          secs: s.toString().padStart(2, '0')
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1A237E] selection:text-white">
      <PublicNav onRegisterClick={() => setIsModalOpen(true)} />

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 rounded-sm clip-diagonal">
            <div className="bg-gradient-to-br from-[#1A237E] to-[#311B92] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white z-10">
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-white/10 rounded-sm clip-diagonal flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[#FF9800]" />
              </div>
              <h3 className="text-xl font-heading font-black tracking-tight">Đăng ký nhận tư vấn</h3>
              <p className="text-indigo-100 text-sm mt-1">Để lại thông tin, TOXI sẽ liên hệ tư vấn lộ trình học phù hợp nhất.</p>
            </div>

            <div className="p-8 border border-t-0 border-slate-200">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-sm clip-diagonal flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-heading font-black text-slate-900 mb-2">Đăng ký thành công!</h4>
                  <p className="text-sm text-slate-600">Cảm ơn bạn. Chuyên viên tư vấn của TOXI sẽ gọi lại cho bạn sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-sm text-center">{error}</div>}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E]" placeholder="Nhập họ và tên của bạn" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E]" placeholder="Nhập số điện thoại liên hệ" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hình thức học</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, studyMode: 'online'})}
                        className={`py-3 rounded-sm border text-xs font-bold transition-all ${formData.studyMode === 'online' ? 'bg-indigo-50 border-[#1A237E] text-[#1A237E]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        Trực tuyến (Online)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, studyMode: 'offline'})}
                        className={`py-3 rounded-sm border text-xs font-bold transition-all ${formData.studyMode === 'offline' ? 'bg-indigo-50 border-[#1A237E] text-[#1A237E]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        Trực tiếp (Offline)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Khóa học quan tâm</label>
                    <select value={formData.courseId} onChange={handleCourseChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E]">
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#1A237E] hover:bg-[#000051] text-white font-heading font-black py-4 rounded-sm uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-70 clip-diagonal-hover shadow-lg shadow-indigo-900/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi thông tin tư vấn'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header & Flash Sale Banner */}
      <div className="pt-28 pb-12 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #1A237E 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Flash Sale Banner */}
          <div className="mb-12 bg-gradient-to-r from-orange-500 to-rose-600 p-1 sm:p-2 shadow-2xl shadow-orange-500/20 transform hover:-translate-y-1 transition-transform duration-300 clip-diagonal">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative clip-diagonal">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-3xl animate-pulse" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white flex items-center justify-center shadow-inner shrink-0 clip-diagonal animate-bounce">
                  <Flame className="w-8 h-8 text-[#FF9800]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-[10px] font-heading font-black uppercase tracking-widest mb-2 border border-white/30 clip-diagonal">
                    <Tag className="w-3.5 h-3.5" /> Siêu ưu đãi tháng này
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                    Giảm đến <span className="text-yellow-300 text-4xl">30%</span> học phí
                  </h2>
                  <p className="text-white/80 font-medium mt-1">Tặng kèm trọn bộ giáo trình độc quyền TOXI EDU</p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3 relative z-10">
                <div className="flex items-center gap-2 text-white/90 text-sm font-heading font-black uppercase tracking-widest">
                  <Timer className="w-4 h-4" /> Ưu đãi kết thúc sau
                </div>
                <div className="flex gap-2">
                  {[ 
                    {l: 'Ngày', v: timeLeft.days}, 
                    {l: 'Giờ', v: timeLeft.hours}, 
                    {l: 'Phút', v: timeLeft.mins},
                    {l: 'Giây', v: timeLeft.secs} 
                  ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-rose-600 flex items-center justify-center text-lg sm:text-xl font-heading font-black shadow-lg clip-diagonal">
                        {t.v}
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-white/70 font-bold uppercase tracking-wider mt-1">{t.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mt-16">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight mb-4">
              Khám phá lộ trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A237E] to-blue-600">Tiếng Trung</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium mb-10">
              Lựa chọn khóa học phù hợp với mục tiêu của bạn. Từ giao tiếp cơ bản, luyện thi HSK đến tiếng Trung thương mại.
            </p>
            
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1A237E] to-orange-400 blur opacity-20 group-hover:opacity-40 transition duration-500 clip-diagonal"></div>
              <div className="relative bg-white clip-diagonal border border-slate-200">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm khóa học..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-700 font-medium focus:outline-none transition-colors relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        {filteredCourses.length === 0 ? (
           <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 clip-diagonal flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-slate-500 font-medium">Vui lòng thử lại với từ khóa khác.</p>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white clip-diagonal p-1 border border-slate-200 hover:border-[#1A237E]/30 hover:shadow-2xl hover:shadow-[#1A237E]/10 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full group relative">
                
                {/* Discount Badge */}
                {course.discount && (
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-red-500 to-rose-600 text-white px-3 py-3 clip-diagonal flex items-center justify-center font-heading font-black text-sm shadow-lg shadow-red-500/30 z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    -{course.discount}
                  </div>
                )}

                <div className="bg-slate-50 clip-diagonal p-6 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A237E]/5 -z-10 clip-diagonal transform rotate-12 translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="px-3 py-1 bg-[#1A237E]/10 text-[#1A237E] border border-[#1A237E]/20 clip-diagonal text-[10px] font-black uppercase tracking-widest">
                      {course.level || 'Đào tạo'}
                    </div>
                    <div className="flex items-center gap-1 text-[#FF9800] bg-orange-50 px-2 py-1 clip-diagonal border border-orange-100">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-black">4.9</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-heading font-black text-slate-900 mb-2 group-hover:text-[#1A237E] transition-colors tracking-tight relative z-10">{course.title}</h3>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mb-4 relative z-10">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.students.toLocaleString()} học viên</span>
                    <span className="w-1 h-1 bg-slate-300"></span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#FF9800]" /> Cấp chứng nhận</span>
                  </div>

                  <p className="text-slate-500 font-medium text-sm mb-6 flex-grow leading-relaxed relative z-10">
                    {course.description}
                  </p>

                  {/* Key Benefits */}
                  <div className="mb-6 space-y-2 relative z-10">
                    {course.benefits?.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                        <div className="w-1.5 h-1.5 bg-[#FF9800] mt-1.5 flex-shrink-0 clip-diagonal"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pricing Details */}
                  {course.salePrice && (
                    <div className="mb-6 p-4 bg-white clip-diagonal border border-slate-100 shadow-sm group-hover:border-[#1A237E]/20 transition-colors relative z-10">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá độc quyền hôm nay</div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-heading font-black text-rose-600">{course.salePrice}</span>
                        <span className="text-sm font-bold text-slate-400 line-through">{course.originalPrice}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    <div className="flex items-center gap-2 bg-white p-3 clip-diagonal border border-slate-100">
                      <div className="w-8 h-8 bg-slate-50 flex items-center justify-center shrink-0 clip-diagonal">
                        <Clock className="w-4 h-4 text-[#1A237E]" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Lộ trình</p>
                        <p className="text-xs font-heading font-black text-slate-700">{course.duration || 'Liên hệ'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-3 clip-diagonal border border-slate-100">
                      <div className="w-8 h-8 bg-slate-50 flex items-center justify-center shrink-0 clip-diagonal">
                        <Book className="w-4 h-4 text-[#1A237E]" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bài giảng</p>
                        <p className="text-xs font-heading font-black text-slate-700">{course.lessons ? `${course.lessons} bài` : 'Đầy đủ'}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setFormData(prev => ({...prev, courseId: course.id, courseTitle: course.title}));
                      setIsModalOpen(true);
                    }}
                    className="w-full py-4 bg-[#1A237E] group-hover:bg-[#FF9800] text-white text-center clip-diagonal-hover text-xs font-heading font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10 active:scale-95 relative z-10"
                  >
                    Đăng ký ưu đãi ngay
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Choose Toxi */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1A237E]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#1A237E 1px, transparent 1px), linear-gradient(90deg, #1A237E 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight mb-4">Tại sao nên chọn Toxi Edu?</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">Chúng tôi không chỉ dạy ngôn ngữ, chúng tôi xây dựng nền tảng để bạn thành công trong môi trường quốc tế.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '🎯', title: 'Lộ trình Thực chiến', desc: 'Học những gì bạn thực sự cần dùng trong công việc và cuộc sống.' },
              { icon: '🚀', title: 'AI-Powered Learning', desc: 'Ứng dụng công nghệ AI tiên tiến giúp luyện phát âm và sửa lỗi 24/7.' },
              { icon: '💎', title: 'Giảng viên Chuyên gia', desc: 'Đội ngũ giáo viên giàu kinh nghiệm, tận tâm và am hiểu văn hóa.' },
              { icon: '📜', title: 'Chứng chỉ Uy tín', desc: 'Nhận chứng chỉ hoàn thành khóa học có giá trị xác thực cao.' }
            ].map((feature, i) => (
              <div key={i} className="text-center p-6 clip-diagonal hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-lg font-heading font-black text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-8 sm:p-12 bg-[#1A237E] clip-diagonal text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4A148C_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white mb-4">Bạn vẫn đang băn khoăn?</h3>
              <p className="text-indigo-100 font-medium mb-8 max-w-xl mx-auto">Hãy để các chuyên gia giáo dục của chúng tôi giúp bạn thiết kế lộ trình học tập tối ưu nhất dựa trên mục tiêu của bạn.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#FF9800] text-white px-10 py-4 text-sm font-heading font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-1 clip-diagonal"
              >
                Nhận tư vấn lộ trình 1:1 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-[150px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap translate-y-1/4 translate-x-1/4">知行合一</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1A237E] flex items-center justify-center clip-diagonal">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-heading font-black text-white uppercase tracking-tight">TOXI EDU</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <a href="tel:0384468736" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#FF9800]" /> 0384.468.736
              </a>
              <a href="mailto:toxichinese.center@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#FF9800]" /> toxichinese.center@gmail.com
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF9800]" /> TDP Chợ Rủn, P. Đông Sơn, Thanh Hóa
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs font-medium text-slate-600">
            &copy; {new Date().getFullYear()} TOXI EDU. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
