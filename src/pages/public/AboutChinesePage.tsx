import { useState, useEffect } from 'react';
import { BookOpen, Target, Sparkles, Smartphone, ArrowRight, Compass, Trophy, CheckCircle2, GraduationCap, X, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../../lib/api/crm';
import PublicNav from '../../components/public/PublicNav';

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
    <div className="min-h-screen bg-white font-sans selection:bg-[#1A237E] selection:text-white animate-in fade-in duration-1000">

      {/* Register Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white shadow-2xl w-full max-w-md overflow-hidden clip-diagonal">
            <div className="bg-gradient-to-br from-[#1A237E] to-[#311B92] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white z-10"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-white/10 clip-diagonal flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-[#FF9800]" /></div>
              <h3 className="text-xl font-heading font-black tracking-tight">Đăng ký nhận tư vấn</h3>
              <p className="text-indigo-100 text-sm mt-1">TOXI sẽ liên hệ tư vấn lộ trình phù hợp nhất trong 24h.</p>
            </div>
            <div className="p-8 border border-t-0 border-slate-200">
              {success ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 clip-diagonal flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
                  <h4 className="text-lg font-heading font-black text-slate-900 mb-2">Đăng ký thành công!</h4>
                  <p className="text-sm text-slate-500">Chuyên viên TOXI sẽ gọi lại sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-sm text-center">{error}</div>}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E] transition-all" placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E] transition-all" placeholder="Số điện thoại liên hệ" />
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E] transition-all">
                      {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#1A237E] hover:bg-[#000051] text-white font-heading font-black py-4 clip-diagonal-hover uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Gửi thông tin</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <PublicNav onRegisterClick={() => setModalOpen(true)} />

      {/* Premium Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1A237E_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#4A148C_0%,_transparent_50%)]" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        
        {/* Animated decorative shapes */}
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-[#FF9800]/20 blur-[100px] animate-pulse clip-diagonal" />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-indigo-500/20 blur-[100px] animate-pulse delay-700 clip-diagonal" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap">
          学以致用
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative mb-10 group">
            <div className="absolute -inset-10 bg-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 clip-diagonal" />
            <img src="/assets/images/toxi_chinese_vertical.png" alt="Tiếng Trung Toxi" className="relative h-40 md:h-56 object-contain group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl brightness-0 invert" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 shadow-sm text-white text-xs font-heading font-black uppercase tracking-[0.2em] mb-8 hover:shadow-md transition-all clip-diagonal backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-[#FF9800]" /> Phân hiệu ngôn ngữ trực thuộc TOXI EDU
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-white tracking-tighter mb-6 leading-[1.1]">
            Nền tảng đào tạo<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] to-yellow-400 drop-shadow-sm">
              Tiếng Trung Thực Chiến
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-indigo-100 font-medium leading-relaxed mb-10">
            Không học để đối phó thi cử. Ngôn ngữ là công cụ sinh tồn, là cầu nối văn hóa và chìa khóa mở ra cơ hội toàn cầu cho sự nghiệp của bạn.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-600 text-white px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1 clip-diagonal">
              Đăng ký tư vấn lộ trình <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/courses" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-1 clip-diagonal backdrop-blur-md">
              Khám phá khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Philosophy Bento */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4">Triết Lý Đào Tạo</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Tư duy tinh gọn (Lean) kết hợp học từ nền tảng gốc rễ (First Principles) — không học vẹt, không học tủ.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300">
            {/* Big card */}
            <div className="md:col-span-2 bg-slate-50 clip-diagonal p-12 border border-slate-200 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:border-[#1A237E]/30">
              <div className="absolute right-0 top-0 w-80 h-80 bg-orange-100/50 clip-diagonal transition-transform duration-700 group-hover:scale-110 translate-x-10 -translate-y-10" />
              <div className="w-20 h-20 bg-[#FF9800] clip-diagonal flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-orange-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Compass className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-heading font-black text-slate-900 mb-6 relative z-10 tracking-tight">
                Học để ứng dụng <br className="hidden sm:block" />
                <span className="text-[#FF9800] font-culture text-5xl leading-tight">(学以致用)</span>
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-lg relative z-10 max-w-lg">
                Học viên TOXI không chỉ thi đỗ HSK. Mục tiêu tối thượng là tự tin đàm phán hợp đồng, order Taobao, làm chủ Gaode Map và thấu hiểu văn hóa doanh nghiệp Trung Quốc.
              </p>
            </div>

            {/* Dark card */}
            <div className="bg-gradient-to-b from-[#1A237E] to-[#4A148C] clip-diagonal p-12 shadow-xl relative overflow-hidden flex flex-col justify-end text-white min-h-[360px] group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-indigo-500/30">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF9800]/20 blur-2xl group-hover:scale-150 transition-transform duration-700 clip-diagonal" />
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md clip-diagonal flex items-center justify-center mb-auto relative z-10">
                <Trophy className="w-8 h-8 text-[#FF9800]" />
              </div>
              <h3 className="text-3xl font-heading font-black mb-4 relative z-10 tracking-tight">Lộ trình <br /> 3 Chặng</h3>
              <p className="text-indigo-100 font-medium leading-relaxed relative z-10">
                Trục xương sống HSK 1–9. Xuyên suốt từ sinh tồn sơ cấp, công sở trung cấp, đến học thuật cao cấp.
              </p>
            </div>

            {/* Wide card */}
            <div className="md:col-span-3 bg-white clip-diagonal p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-200 flex flex-col md:flex-row items-center gap-12 group hover:-translate-y-2 transition-transform duration-500">
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[#1A237E] clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-6">Chuẩn hóa chất lượng</span>
                <h3 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-6 tracking-tight">Cấu trúc 5 Giai đoạn</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 text-lg">
                  Từ bước "Xóa mù chữ Hán" đến "Dự án Tốt nghiệp" thực tế — học viên bắt buộc phải thuyết trình và bảo vệ Business Pitching 100% bằng tiếng Trung trước hội đồng.
                </p>
                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 text-[#1A237E] font-heading font-black hover:text-[#FF9800] text-sm uppercase tracking-widest transition-colors">
                  Đăng ký tìm hiểu lộ trình <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-50 clip-diagonal p-8 md:p-10 border border-slate-200">
                <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Tiến trình chuẩn hóa</p>
                <ul className="space-y-5">
                  {['Chuẩn hóa âm & Xóa mù chữ Hán', 'Tư duy ngôn ngữ & Đời sống', 'Survival Chinese – Thực chiến tình huống', 'Tăng tốc HSK 3.0 & Chiến thuật thi', 'Dự án Tốt nghiệp – Business Pitching'].map((s, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 clip-diagonal bg-[#1A237E] flex items-center justify-center flex-shrink-0 text-xs font-black text-white shadow-md">{i + 1}</div>
                      <span className="text-base font-bold text-slate-700">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Ecosystem */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1A237E]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 clip-diagonal bg-indigo-100/50 border border-indigo-200 text-[#1A237E] text-[10px] font-heading font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4" /> Khác biệt công nghệ
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black text-slate-900 tracking-tighter mb-6 leading-tight">Hệ Sinh Thái Độc Quyền</h2>
            <p className="text-slate-500 font-medium text-lg lg:text-xl leading-relaxed">
              Khai thác tối đa sức mạnh của AI và các siêu ứng dụng thực tế để mang lại trải nghiệm học ngôn ngữ hiệu quả nhất tại Việt Nam.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="w-10 h-10 text-emerald-500" />, bg: 'bg-emerald-50', border: 'hover:border-emerald-200', title: 'Phương pháp Tongxiao', desc: 'Đánh giá năng lực liên tục, cá nhân hóa lộ trình. Đảm bảo tiếp thu từ gốc rễ, không để hổng kiến thức cốt lõi.' },
              { icon: <Sparkles className="w-10 h-10 text-[#1A237E]" />, bg: 'bg-indigo-50', border: 'hover:border-indigo-200', title: 'Gia sư ảo AI 24/7', desc: 'Toxi AI, Doubao, Gemini được tích hợp sâu vào nền tảng. Luyện phát âm, sửa lỗi, hội thoại như người bản xứ bất cứ lúc nào.' },
              { icon: <Smartphone className="w-10 h-10 text-[#FF9800]" />, bg: 'bg-orange-50', border: 'hover:border-orange-200', title: 'Siêu ứng dụng thực tế', desc: 'Taobao, Alipay, 1688, Gaode Map là học liệu chính thức. Học mua bán, đàm phán kinh doanh thực tế ngay tại lớp học.' },
            ].map((item, idx) => (
              <div key={idx} className={`p-10 md:p-12 clip-diagonal border border-slate-200 bg-white shadow-xl shadow-slate-200/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${item.border} group relative overflow-hidden`}>
                <div className={`absolute -right-6 -top-6 w-32 h-32 ${item.bg} clip-diagonal blur-xl group-hover:scale-150 transition-transform duration-700 opacity-50`} />
                <div className={`w-20 h-20 ${item.bg} clip-diagonal flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-heading font-black text-slate-900 mb-4 tracking-tight group-hover:text-[#1A237E] transition-colors relative z-10">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-base relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo identity + CTA Premium */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF9800]/20 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#1A237E]/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

        <div className="relative max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
          {/* Logo */}
          <div className="relative mb-12 group">
            <div className="absolute -inset-10 bg-white/10 clip-diagonal blur-2xl group-hover:bg-white/20 transition-colors duration-500" />
            <img
              src="/assets/images/toxi_chinese_vertical.png"
              alt="Tiếng Trung Toxi"
              className="relative h-48 md:h-64 object-contain hover:scale-105 transition-transform duration-700 drop-shadow-2xl brightness-0 invert"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-2 clip-diagonal bg-white/10 border border-white/20 text-[#FF9800] text-xs font-heading font-black uppercase tracking-[0.2em] mb-6 shadow-sm backdrop-blur-sm">
            ✦ Kiến tạo tương lai toàn cầu
          </div>

          <h2 className="text-4xl md:text-6xl font-heading font-black text-white mb-6 tracking-tight">Bắt đầu hành trình của bạn</h2>
          <p className="text-indigo-100 font-medium mb-12 max-w-2xl text-lg md:text-xl leading-relaxed">
            Hãy để chuyên gia ngôn ngữ của TOXI thiết kế riêng lộ trình học bám sát mục tiêu nghề nghiệp của bạn — hoàn toàn miễn phí.
          </p>
          
          <button onClick={() => setModalOpen(true)} className="group relative flex items-center justify-center gap-3 bg-[#FF9800] text-white px-12 py-5 clip-diagonal-hover text-sm md:text-base font-heading font-black uppercase tracking-widest transition-all shadow-2xl shadow-orange-500/40 hover:-translate-y-2 hover:shadow-orange-500/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10">Nhận tư vấn 1:1 miễn phí</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-[150px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap translate-y-1/4 translate-x-1/4">知行合一</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 clip-diagonal bg-[#1A237E] flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-heading font-black text-white uppercase tracking-tight">TOXI EDU</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center text-sm">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#FF9800]" /><a href="tel:0384468736" className="hover:text-white transition-colors">0384.468.736</a></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF9800]" /><a href="mailto:toxichinese.center@gmail.com" className="hover:text-white transition-colors">toxichinese.center@gmail.com</a></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF9800]" /><span>TDP Chợ Rủn, P. Đông Sơn, Thanh Hóa</span></div>
          </div>
          <p className="text-xs font-medium text-slate-600">&copy; {new Date().getFullYear()} TOXI EDU. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
