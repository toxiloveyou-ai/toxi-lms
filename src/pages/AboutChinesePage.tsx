import { useState, useEffect } from 'react';
import { BookOpen, Target, Sparkles, Smartphone, ArrowRight, Compass, Trophy, CheckCircle2, GraduationCap, X, Loader2, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../lib/api/crm';
import PublicNav from '../components/PublicNav';

const COURSES = [
  { id: 'hsk-1-2', title: 'Tiếng Trung Giao Tiếp (HSK 1-2)' },
  { id: 'hsk-3-4', title: 'Tiếng Trung Tổng Hợp (HSK 3-4)' },
  { id: 'hsk-5-6', title: 'Luyện Thi HSK 5-6 Chuyên Sâu' },
];

export default function AboutChinesePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', courseId: COURSES[0].id, courseTitle: COURSES[0].title, studyMode: 'online' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) { setError('Vui lòng nhập đầy đủ họ tên và số điện thoại.'); return; }
    setLoading(true); setError('');
    try {
      await crmApi.createLead({
        full_name: formData.fullName, phone: formData.phone,
        source: 'About Chinese Page', status: 'new', potential_score: 85,
        notes: `Tư vấn từ trang Tiếng Trung Toxi: ${formData.courseTitle} | ${formData.studyMode === 'online' ? 'Online' : 'Offline'}`
      });
      setSuccess(true);
      setTimeout(() => { setModalOpen(false); setSuccess(false); setFormData(prev => ({ ...prev, fullName: '', phone: '' })); }, 3000);
    } catch (err: any) { setError(err.message || 'Đã có lỗi. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#2E3192] selection:text-white">

      {/* Register Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-[#2E3192] to-[#1B1D55] p-8 text-white">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-white" /></div>
              <h3 className="text-xl font-black">Đăng ký nhận tư vấn</h3>
              <p className="text-indigo-100 text-sm mt-1">TOXI sẽ liên hệ tư vấn lộ trình phù hợp nhất trong 24h.</p>
            </div>
            <div className="p-8">
              {success ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Đăng ký thành công!</h4>
                  <p className="text-sm text-slate-500">Chuyên viên TOXI sẽ gọi lại sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">{error}</div>}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10 transition-all" placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/10 transition-all" placeholder="Số điện thoại liên hệ" />
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
                  <button type="submit" disabled={loading} className="w-full bg-[#2E3192] hover:bg-[#1B1D55] text-white font-bold py-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Gửi thông tin</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <PublicNav onRegisterClick={() => setModalOpen(true)} />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#fff7ed_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#e0e7ff_0%,_transparent_50%)]" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center py-20">
          <div className="relative mb-10 group">
            <div className="absolute -inset-8 bg-gradient-to-b from-orange-50 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <img src="/assets/images/toxi_chinese_vertical.png" alt="Tiếng Trung Toxi" className="relative h-48 md:h-60 object-contain group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-xl" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow text-slate-600 text-xs font-black uppercase tracking-widest mb-6">
            <GraduationCap className="w-4 h-4 text-[#2E3192]" /> Phân hiệu ngôn ngữ trực thuộc TOXI EDU
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
            Nền tảng đào tạo<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E3192] via-blue-600 to-orange-500">Tiếng Trung Thực Chiến</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10">
            Không học để đối phó thi cử. Ngôn ngữ là công cụ sinh tồn, là cầu nối văn hóa và chìa khóa mở ra cơ hội toàn cầu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#2E3192] hover:bg-[#1B1D55] text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/30 hover:-translate-y-1">
              Đăng ký tư vấn miễn phí <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/courses" className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-1">
              Xem khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Bento */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Triết Lý Đào Tạo</h2>
            <p className="text-slate-500 font-medium text-base max-w-2xl mx-auto">Tư duy tinh gọn (Lean) kết hợp học từ nền tảng gốc rễ (First Principles) — không học vẹt, không học tủ.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {/* Big card */}
            <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <Compass className="w-12 h-12 text-orange-500 mb-6 relative z-10" />
              <h3 className="text-3xl font-black text-slate-900 mb-4 relative z-10">
                Học để ứng dụng <span className="text-orange-400 font-serif italic text-2xl">(学以致用)</span>
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed text-lg relative z-10 max-w-lg">
                Học viên TOXI không chỉ thi đỗ HSK. Mục tiêu là tự tin đàm phán hợp đồng, order Taobao, làm chủ Gaode Map và thấu hiểu văn hóa doanh nghiệp Trung Quốc.
              </p>
            </div>
            {/* Dark card */}
            <div className="bg-[#2E3192] rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden flex flex-col justify-end text-white min-h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1D55]/80 to-transparent" />
              <Trophy className="w-12 h-12 text-orange-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-black mb-3 relative z-10">Lộ trình 3 Chặng</h3>
              <p className="text-indigo-100 font-medium text-sm leading-relaxed relative z-10">Trục xương sống HSK 1–9. Từ sinh tồn sơ cấp, công sở trung cấp, đến học thuật cao cấp.</p>
            </div>
            {/* Wide card */}
            <div className="md:col-span-3 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 flex flex-col md:flex-row items-start gap-10">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-widest mb-4">Chuẩn hóa chất lượng</span>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Cấu trúc 5 Giai đoạn trong mỗi khóa học</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6">Từ "Xóa mù chữ Hán" đến "Dự án Tốt nghiệp" — học viên phải thuyết trình và bảo vệ dự án thực tế 100% bằng tiếng Trung.</p>
                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 text-[#2E3192] font-bold hover:underline text-sm">
                  Đăng ký tìm hiểu lộ trình <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Lộ trình chuẩn hóa</p>
                <ul className="space-y-4">
                  {['Chuẩn hóa âm & Xóa mù chữ Hán', 'Tư duy ngôn ngữ & Đời sống', 'Survival Chinese – Thực chiến tình huống', 'Tăng tốc HSK 3.0 & Chiến thuật thi', 'Dự án Tốt nghiệp – Business Pitching'].map((s, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#2E3192] flex items-center justify-center flex-shrink-0 text-xs font-black text-white">{i + 1}</div>
                      <span className="text-sm font-bold text-slate-700">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Hệ Sinh Thái Độc Quyền</h2>
            <p className="text-slate-500 font-medium text-lg">Khai thác AI và các siêu ứng dụng để mang trải nghiệm học thực tế nhất.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="w-8 h-8 text-emerald-500" />, bg: 'bg-emerald-50', border: 'hover:border-emerald-200', title: 'Phương pháp Tongxiao', desc: 'Đánh giá năng lực liên tục, cá nhân hóa lộ trình. Đảm bảo tiếp thu từ gốc rễ, không để hổng kiến thức.' },
              { icon: <Sparkles className="w-8 h-8 text-[#2E3192]" />, bg: 'bg-indigo-50', border: 'hover:border-indigo-200', title: 'Gia sư ảo AI 24/7', desc: 'Toxi AI, Doubao, Gemini tích hợp vào nền tảng học. Luyện phát âm, sửa lỗi, hội thoại bất cứ lúc nào.' },
              { icon: <Smartphone className="w-8 h-8 text-orange-500" />, bg: 'bg-orange-50', border: 'hover:border-orange-200', title: 'Siêu ứng dụng thực tế', desc: 'Taobao, Alipay, 1688, Gaode Map là học liệu chính thức. Học mua bán, kinh doanh thực tế ngay trong lớp.' },
            ].map((item, idx) => (
              <div key={idx} className={`p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/30 transition-all duration-500 hover:-translate-y-2 ${item.border} group`}>
                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>{item.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo identity + CTA */}
      <section className="py-20 relative overflow-hidden" style={{background: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 100%)'}}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-200/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
          {/* Logo */}
          <div className="relative mb-8">
            <div className="absolute -inset-6 bg-white/60 rounded-[2rem] blur-2xl" />
            <img
              src="/assets/images/toxi_chinese_horizontal.png"
              alt="Tiếng Trung Toxi"
              className="relative h-52 md:h-64 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-xl"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2E3192]/10 border border-[#2E3192]/20 text-[#2E3192] text-xs font-black uppercase tracking-widest mb-5">
            ✦ Đào tạo tiếng Trung thực chiến
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Bắt đầu hành trình của bạn</h2>
          <p className="text-slate-600 font-medium mb-10 max-w-xl leading-relaxed">Hãy để chuyên viên Tiếng Trung Toxi thiết kế lộ trình học phù hợp nhất cho bạn — hoàn toàn miễn phí.</p>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-[#2E3192] hover:bg-[#1B1D55] text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/30 hover:scale-105">
            Nhận tư vấn miễn phí <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-black text-white">TOXI EDU</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center text-sm">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><a href="tel:0384468736" className="hover:text-white transition-colors">0384.468.736</a></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href="mailto:toxichinese.center@gmail.com" className="hover:text-white transition-colors">toxichinese.center@gmail.com</a></div>
            <div className="flex items-center gap-2"><span className="text-slate-600">|</span><span>TDP Chợ Rủn, P. Đông Sơn, Thanh Hóa</span></div>
          </div>
          <p className="text-xs font-medium text-slate-600">&copy; {new Date().getFullYear()} TOXI EDU. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
