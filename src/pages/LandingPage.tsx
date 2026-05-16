import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Target, Sparkles, Smartphone, Star, X, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../lib/api/crm';
import PublicNav from '../components/PublicNav';

const COURSES = [
  { id: 'hsk-1-2', title: 'Tiếng Trung Giao Tiếp (HSK 1-2)', level: 'Sơ cấp', duration: '3 tháng', desc: 'Phát âm chuẩn Pinyin, từ vựng sinh hoạt, giao tiếp cơ bản hàng ngày.' },
  { id: 'hsk-3-4', title: 'Tiếng Trung Tổng Hợp (HSK 3-4)', level: 'Trung cấp', duration: '4 tháng', desc: 'Thành thạo 4 kỹ năng, đủ năng lực thi HSK 4 và giao tiếp công sở.' },
  { id: 'hsk-5-6', title: 'Luyện Thi HSK 5-6 Chuyên Sâu', level: 'Nâng cao', duration: '6 tháng', desc: 'Chiến thuật làm bài, đề thi thử bám sát thực tế, chinh phục chứng chỉ quốc tế.' },
];

function RegisterModal({ isOpen, onClose, preSelectedCourse }: { isOpen: boolean; onClose: () => void; preSelectedCourse?: string }) {
  const [formData, setFormData] = useState({ fullName: '', phone: '', courseId: COURSES[0].id, courseTitle: COURSES[0].title, studyMode: 'online' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preSelectedCourse) {
      const c = COURSES.find(c => c.id === preSelectedCourse);
      if (c) setFormData(prev => ({ ...prev, courseId: c.id, courseTitle: c.title }));
    }
  }, [preSelectedCourse]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) { setError('Vui lòng nhập đầy đủ họ tên và số điện thoại.'); return; }
    setLoading(true); setError('');
    try {
      await crmApi.createLead({
        full_name: formData.fullName, phone: formData.phone, source: 'Landing Page',
        status: 'new', potential_score: 80,
        notes: `Đăng ký: ${formData.courseTitle} | ${formData.studyMode === 'online' ? 'Online' : 'Offline'}`
      });
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); setFormData(prev => ({ ...prev, fullName: '', phone: '' })); }, 3000);
    } catch (err: any) { setError(err.message || 'Đã có lỗi. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full max-w-md overflow-hidden rounded-sm clip-diagonal">
        <div className="bg-gradient-to-br from-[#1A237E] to-[#311B92] p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white z-10"><X className="w-5 h-5" /></button>
          <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center mb-4 clip-diagonal"><BookOpen className="w-6 h-6 text-[#FF9800]" /></div>
          <h3 className="text-xl font-heading font-black tracking-tight">Đăng ký nhận tư vấn</h3>
          <p className="text-indigo-100 text-sm mt-1">TOXI sẽ liên hệ tư vấn lộ trình phù hợp nhất trong 24h.</p>
        </div>
        <div className="p-8 border border-t-0 border-slate-200">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Đăng ký thành công!</h4>
              <p className="text-sm text-slate-500">Chuyên viên TOXI sẽ gọi lại trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/10 transition-all" placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/10 transition-all" placeholder="Số điện thoại liên hệ" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hình thức học</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: 'online', label: '🖥️ Trực tuyến' }, { val: 'offline', label: '🏫 Trực tiếp' }].map(m => (
                    <button key={m.val} type="button" onClick={() => setFormData({ ...formData, studyMode: m.val })}
                      className={`py-3 rounded-sm border text-xs font-bold transition-all ${formData.studyMode === m.val ? 'bg-indigo-50 border-[#1A237E] text-[#1A237E]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Khóa học quan tâm</label>
                <select value={formData.courseId} onChange={e => { const c = COURSES.find(c => c.id === e.target.value); setFormData({ ...formData, courseId: e.target.value, courseTitle: c?.title || '' }); }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/10 transition-all">
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1A237E] hover:bg-[#000051] text-white font-heading font-black py-4 rounded-sm text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-900/20 clip-diagonal-hover">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Gửi thông tin</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const openModal = (courseId = '') => { setSelectedCourse(courseId); setModalOpen(true); };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#2E3192] selection:text-white animate-in fade-in duration-1000">
      <RegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} preSelectedCourse={selectedCourse} />

      <PublicNav onRegisterClick={() => openModal()} />

      {/* Premium Hero */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1A237E_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_#4A148C_0%,_transparent_60%)] opacity-60" />
        
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Cultural Accent Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] md:text-[400px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap">学以致用</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/20 text-[#FF9800] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 clip-diagonal">
            <Sparkles className="w-4 h-4 text-[#FF9800]" /> Nền tảng tiếng Trung thực chiến
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black text-white tracking-tighter mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Chinh phục ngôn ngữ bằng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] via-amber-200 to-[#FF9800]">
              Công nghệ & Trí tuệ
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base lg:text-xl text-slate-300 font-medium mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Không học vẹt, không học đối phó. TOXI EDU kết hợp tư duy gốc rễ và AI tạo sinh để giúp bạn làm chủ tiếng Trung trong thời gian kỷ lục.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button onClick={() => openModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#1A237E] hover:bg-slate-100 px-8 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-2xl hover:-translate-y-1 clip-diagonal">
              Nhận tư vấn lộ trình <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/method" className="w-full sm:w-auto flex items-center justify-center gap-2 tech-zen-glass hover:bg-white/10 text-white px-8 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all clip-diagonal">
              Khám phá phương pháp
            </Link>
          </div>

          {/* Floating Stats Board */}
          <div className="mt-20 max-w-4xl mx-auto grid grid-cols-3 gap-4 p-6 tech-zen-glass shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 relative overflow-hidden clip-diagonal">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
            {[{ n: '500+', l: 'Học viên thành công' }, { n: 'HSK 1-6', l: 'Lộ trình toàn diện' }, { n: '24/7', l: 'Gia sư ảo AI' }].map((s, i) => (
              <div key={i} className="text-center relative z-10 border-r border-white/10 last:border-0">
                <div className="text-2xl lg:text-4xl font-heading font-black text-white">{s.n}</div>
                <div className="text-[10px] sm:text-xs text-indigo-200 font-bold uppercase tracking-widest mt-1 opacity-80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech-Zen Grid Features */}
      <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle Line Pattern Background */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #1A237E 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-[#1A237E]/20 text-[#1A237E] text-[10px] font-black uppercase tracking-widest mb-4 clip-diagonal">
              <Sparkles className="w-3.5 h-3.5" /> Hệ sinh thái công nghệ
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4">Học tập đa chiều</h2>
            <p className="text-slate-500 font-medium text-lg">Cam kết đầu ra theo giá trị cốt lõi <strong className="text-[#1A237E] font-culture text-2xl px-1">学以致用</strong> (Học để áp dụng).</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Large Bento (Spans 2 columns) */}
            <div className="md:col-span-2 tech-zen-glass-light p-10 relative overflow-hidden group clip-diagonal hover:-translate-y-1 transition-transform duration-500">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 -z-10 group-hover:scale-110 transition-transform duration-700" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
              <div className="w-16 h-16 bg-[#1A237E] flex items-center justify-center mb-8 shadow-lg shadow-indigo-900/20 clip-diagonal">
                <Sparkles className="w-8 h-8 text-[#FF9800]" />
              </div>
              <h3 className="text-3xl font-heading font-black text-slate-900 mb-4 tracking-tight">Toxi Tech & AI 24/7</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-lg max-w-md">
                Hệ thống tích hợp trực tiếp Toxi AI, Doubao, và Gemini. Chấm điểm phát âm chuẩn bản xứ, sửa lỗi ngữ pháp thời gian thực và đóng vai đối tác đàm phán bất cứ lúc nào bạn cần.
              </p>
            </div>

            {/* Feature 2: Vertical Box */}
            <div className="bg-gradient-to-br from-[#FF9800] to-[#E65100] p-10 text-white relative overflow-hidden group clip-diagonal hover:-translate-y-1 transition-transform duration-500 shadow-xl shadow-orange-500/20">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 group-hover:scale-150 transition-transform duration-700" style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)' }} />
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mb-8 backdrop-blur-sm clip-diagonal">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-black mb-3 tracking-tight">Phương pháp Tongxiao</h3>
              <p className="text-orange-50 font-medium leading-relaxed">
                Đánh giá năng lực liên tục, cá nhân hóa lộ trình. Học sâu từ First Principles (Tư duy gốc rễ) để nhớ lâu.
              </p>
            </div>

            {/* Feature 3: Wide Box */}
            <div className="md:col-span-3 bg-slate-900 p-10 text-white relative overflow-hidden group flex flex-col md:flex-row items-center gap-10 clip-diagonal hover:-translate-y-1 transition-transform duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_#1A237E_0%,_transparent_60%)] opacity-50" />
              <div className="relative z-10 flex-shrink-0">
                <div className="w-20 h-20 bg-[#FF9800] flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500 clip-diagonal">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="text-3xl font-heading font-black mb-4 tracking-tight">Thực chiến Siêu ứng dụng</h3>
                <p className="text-slate-300 font-medium leading-relaxed text-lg max-w-2xl">
                  Giáo trình không nằm trên giấy. Bạn sẽ học cách thao tác mua hàng trên Taobao, đặt phòng qua Ctrip, điều hướng Gaode Map và chat WeChat như người bản địa ngay trong buổi học đầu tiên.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Courses Preview */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#FF9800] text-[10px] font-black uppercase tracking-widest mb-4 clip-diagonal">
                <Star className="w-3.5 h-3.5" /> Khóa học tuyển chọn
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4">Lộ trình đột phá</h2>
              <p className="text-slate-500 font-medium text-lg max-w-lg">Được thiết kế tinh gọn, bám sát khung năng lực HSK 3.0 mới nhất và tập trung 100% vào kỹ năng thực chiến.</p>
            </div>
            <Link to="/courses" className="flex items-center gap-2 text-[#1A237E] font-heading font-black hover:text-[#FF9800] uppercase tracking-widest text-sm transition-colors shrink-0">
              Xem tất cả lộ trình <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {COURSES.map((course, idx) => {
              const isPopular = idx === 1; // Highlight the middle course
              return (
                <div key={course.id} className={`relative flex flex-col p-1 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl clip-diagonal ${isPopular ? 'bg-gradient-to-b from-[#1A237E] to-[#4A148C] shadow-xl shadow-indigo-900/20 z-10 md:-translate-y-4 md:hover:-translate-y-6' : 'bg-slate-200 hover:bg-[#1A237E]'}`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF9800] text-white px-6 py-1.5 text-[10px] font-heading font-black uppercase tracking-widest shadow-lg z-20 clip-diagonal">
                      Phổ biến nhất
                    </div>
                  )}
                  <div className={`flex flex-col flex-grow p-8 clip-diagonal ${isPopular ? 'bg-[#1A237E]' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border clip-diagonal ${isPopular ? 'bg-white/10 text-white border-white/20' : 'bg-indigo-50 text-[#1A237E] border-indigo-100'}`}>
                        {course.level}
                      </span>
                      <span className={`text-xs font-bold ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {course.duration}
                      </span>
                    </div>
                    
                    <h3 className={`text-2xl font-heading font-black tracking-tight mb-4 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                      {course.title}
                    </h3>
                    
                    <p className={`font-medium text-sm mb-8 flex-grow ${isPopular ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {course.desc}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {['Giáo án điện tử tương tác', 'Luyện tập AI 24/7', 'Thi thử định kỳ'].map((item, i) => (
                        <li key={i} className={`flex items-center gap-3 text-sm font-medium ${isPopular ? 'text-indigo-50' : 'text-slate-600'}`}>
                          <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 clip-diagonal ${isPopular ? 'bg-indigo-400/20' : 'bg-orange-50'}`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isPopular ? 'text-[#FF9800]' : 'text-[#FF9800]'}`} />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                    <button onClick={() => openModal(course.id)} className={`w-full py-4 text-xs font-heading font-black uppercase tracking-widest transition-all clip-diagonal-hover ${isPopular ? 'bg-[#FF9800] text-white hover:bg-orange-600 shadow-lg' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-[#1A237E] hover:text-white hover:border-[#1A237E]'}`}>
                      Nhận tư vấn
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-[#1A237E] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4A148C_0%,_transparent_70%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight mb-6">Bắt đầu hành trình ngay hôm nay?</h2>
          <p className="text-indigo-100 font-medium text-xl mb-10 max-w-2xl mx-auto">Gia nhập hàng trăm học viên đang chinh phục tiếng Trung thực chiến cùng TOXI EDU mỗi ngày.</p>
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 bg-[#FF9800] text-white hover:bg-orange-600 px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105 clip-diagonal">
            Đăng ký tư vấn miễn phí <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-[200px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap translate-y-1/4 translate-x-1/4">知行合一</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1A237E] flex items-center justify-center clip-diagonal"><BookOpen className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-heading font-black text-white tracking-tight uppercase">TOXI EDU</span>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-sm text-slate-500">Hệ thống giáo dục thông minh thuộc Toxi Group. Đào tạo ngoại ngữ thực chiến, cung cấp trải nghiệm học tập tốt nhất cho người Việt.</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-[#FF9800]" /><a href="tel:0384468736" className="hover:text-white transition-colors">0384.468.736</a></div>
                <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-[#FF9800]" /><a href="mailto:toxichinese.center@gmail.com" className="hover:text-white transition-colors">toxichinese.center@gmail.com</a></div>
                <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-[#FF9800] mt-0.5 flex-shrink-0" /><span>TDP Chợ Rủn, Phường Đông Sơn, Thanh Hóa</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-heading font-black mb-5 uppercase tracking-wider text-xs border-l-2 border-[#FF9800] pl-2">Khám phá</h4>
              <ul className="space-y-3">
                <li><Link to="/about/chinese" className="hover:text-white transition-colors text-sm font-medium">Tiếng Trung Toxi</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors text-sm font-medium">Danh sách khóa học</Link></li>
                <li><Link to="/method" className="hover:text-white transition-colors text-sm font-medium">Phương pháp học</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-heading font-black mb-5 uppercase tracking-wider text-xs border-l-2 border-[#1A237E] pl-2">Học viên</h4>
              <ul className="space-y-3">
                <li><Link to="/edu/login" className="hover:text-white transition-colors text-sm font-medium">Đăng nhập hệ thống</Link></li>
                <li><button onClick={() => openModal()} className="hover:text-white transition-colors text-sm font-medium text-left">Đăng ký tư vấn</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600">
            <span>&copy; {new Date().getFullYear()} TOXI EDU. All rights reserved.</span>
            <span>Sản phẩm của Công ty TNHH TOXI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
