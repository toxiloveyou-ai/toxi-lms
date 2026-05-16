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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-[#2E3192] to-[#1B1D55] p-8 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-white" /></div>
          <h3 className="text-xl font-black">Đăng ký nhận tư vấn</h3>
          <p className="text-indigo-100 text-sm mt-1">TOXI sẽ liên hệ tư vấn lộ trình phù hợp nhất trong 24h.</p>
        </div>
        <div className="p-8">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10 transition-all" placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10 transition-all" placeholder="Số điện thoại liên hệ" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hình thức học</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: 'online', label: '🖥️ Trực tuyến' }, { val: 'offline', label: '🏫 Trực tiếp' }].map(m => (
                    <button key={m.val} type="button" onClick={() => setFormData({ ...formData, studyMode: m.val })}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${formData.studyMode === m.val ? 'bg-indigo-50 border-[#2E3192] text-[#2E3192]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Khóa học quan tâm</label>
                <select value={formData.courseId} onChange={e => { const c = COURSES.find(c => c.id === e.target.value); setFormData({ ...formData, courseId: e.target.value, courseTitle: c?.title || '' }); }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10 transition-all">
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#2E3192] hover:bg-[#1B1D55] text-white font-bold py-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/20">
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
    <div className="min-h-screen bg-white font-sans selection:bg-[#2E3192] selection:text-white">
      <RegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} preSelectedCourse={selectedCourse} />

      <PublicNav onRegisterClick={() => openModal()} />

      {/* Hero */}
      <section className="relative py-16 lg:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#e0e7ff_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_#fff7ed_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-6">
            <Star className="w-3.5 h-3.5 fill-current" /> Tiếng Trung thực chiến hàng đầu
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-5 leading-[1.1]">
            Chinh phục <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E3192] to-blue-500">Tiếng Trung</span>
            <br />theo cách thực chiến nhất
          </h1>
          <p className="max-w-xl mx-auto text-base lg:text-xl text-slate-500 font-medium mb-8">
            TOXI EDU đào tạo tiếng Trung để bạn ứng dụng thực tế — đàm phán, kinh doanh, và phát triển sự nghiệp toàn cầu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => openModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2E3192] hover:bg-[#1B1D55] text-white px-7 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-indigo-500/30">
              Đăng ký tư vấn miễn phí <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/method" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-7 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all">
              Tìm hiểu phương pháp
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[{ n: '500+', l: 'Học viên' }, { n: '9', l: 'Cấp HSK' }, { n: '100%', l: 'Thực chiến' }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl lg:text-4xl font-black text-[#2E3192]">{s.n}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-[#2E3192] text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Hệ sinh thái công nghệ
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Phương pháp & Công nghệ tích hợp</h2>
            <p className="text-slate-500 font-medium text-base">Cam kết chất lượng đầu ra theo giá trị cốt lõi <strong className="text-[#2E3192]">"Học để áp dụng"</strong> (学以致用).</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Target className="w-7 h-7 text-emerald-500" />, bg: 'bg-emerald-50', border: 'hover:border-emerald-200', shadow: 'hover:shadow-emerald-500/10', title: 'Phương pháp Tongxiao', desc: 'Cá nhân hóa lộ trình tối đa. Đánh giá năng lực liên tục để tinh chỉnh giáo án phù hợp tốc độ tiếp thu riêng của từng học viên.' },
              { icon: <Sparkles className="w-7 h-7 text-indigo-500" />, bg: 'bg-indigo-50', border: 'hover:border-indigo-200', shadow: 'hover:shadow-indigo-500/10', title: 'Toxi Tech & AI 24/7', desc: 'Tích hợp Toxi AI, Doubao, Gemini làm gia sư ảo. Luyện phát âm, sửa lỗi ngữ pháp, hội thoại thực tế bất cứ lúc nào.' },
              { icon: <Smartphone className="w-7 h-7 text-orange-500" />, bg: 'bg-orange-50', border: 'hover:border-orange-200', shadow: 'hover:shadow-orange-500/10', title: 'Siêu ứng dụng thực tế', desc: 'Taobao, Alipay, 1688, Gaode Map là học liệu chính thức. Học viên thao tác mua bán, đặt hàng như người bản xứ ngay trong lớp.' },
            ].map((f, i) => (
              <div key={i} className={`p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/20 transition-all duration-300 group ${f.border} ${f.shadow} hover:-translate-y-2`}>
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>{f.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Khóa học nổi bật</h2>
              <p className="text-slate-500 font-medium text-lg max-w-lg">Lộ trình 3 chặng chuẩn hóa theo HSK 3.0, từ sinh tồn cơ bản đến thành thạo chuyên nghiệp.</p>
            </div>
            <Link to="/courses" className="flex items-center gap-2 text-[#2E3192] font-bold hover:underline shrink-0">Xem tất cả <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {COURSES.map((course) => (
              <div key={course.id} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest">{course.level}</span>
                  <span className="text-xs font-bold text-slate-400">{course.duration}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{course.title}</h3>
                <p className="text-slate-500 font-medium text-sm mb-6 flex-grow">{course.desc}</p>
                <ul className="space-y-2 mb-8">
                  {['Bài giảng video & tài liệu chuẩn', 'Luyện tập AI 24/7', 'Thi thử & đánh giá định kỳ'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => openModal(course.id)} className="mt-auto w-full py-3.5 bg-[#2E3192] hover:bg-[#1B1D55] text-white rounded-xl text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  Nhận tư vấn <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-[#2E3192] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4338ca_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Bắt đầu hành trình ngay hôm nay?</h2>
          <p className="text-indigo-100 font-medium text-xl mb-10 max-w-2xl mx-auto">Gia nhập hàng trăm học viên đang chinh phục tiếng Trung thực chiến cùng TOXI EDU mỗi ngày.</p>
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 bg-white text-[#2E3192] hover:bg-orange-50 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105">
            Đăng ký tư vấn miễn phí <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-black text-white tracking-tight">TOXI EDU</span>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-sm text-slate-500">Hệ thống giáo dục thông minh thuộc Toxi Group. Đào tạo ngoại ngữ thực chiến, cung cấp trải nghiệm học tập tốt nhất cho người Việt.</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-500" /><a href="tel:0384468736" className="hover:text-white transition-colors">0384.468.736</a></div>
                <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-500" /><a href="mailto:toxichinese.center@gmail.com" className="hover:text-white transition-colors">toxichinese.center@gmail.com</a></div>
                <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" /><span>TDP Chợ Rủn, Phường Đông Sơn, Thanh Hóa</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Khám phá</h4>
              <ul className="space-y-3">
                <li><Link to="/about/chinese" className="hover:text-white transition-colors text-sm font-medium">Tiếng Trung Toxi</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors text-sm font-medium">Danh sách khóa học</Link></li>
                <li><Link to="/method" className="hover:text-white transition-colors text-sm font-medium">Phương pháp học</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Học viên</h4>
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
