import { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Brain, Zap, RotateCcw, Mic, Bot, CheckCircle2, ChevronDown, ChevronUp, Trophy, MapPin, Sparkles, X, Loader2, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../../lib/api/crm';
import PublicNav from '../../components/public/PublicNav';

const COURSES = [
  { id: 'hsk-1-2', title: 'Tiếng Trung Giao Tiếp (HSK 1-2)' },
  { id: 'hsk-3-4', title: 'Tiếng Trung Tổng Hợp (HSK 3-4)' },
  { id: 'hsk-5-6', title: 'Luyện Thi HSK 5-6 Chuyên Sâu' },
];

const pillars = [
  {
    hanzi: '学而时习之',
    label: 'Học đi đôi với Hành',
    origin: 'Khổng Tử – Luận Ngữ',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    desc: 'Áp dụng vòng lặp Học → Hành → Phản hồi liên tục. Mỗi khái niệm ngôn ngữ được luyện tập ngay trong bối cảnh thực tế (đặt hàng, hội họp, đàm phán) trước khi tiến sang cấp độ mới.',
    points: ['Luyện ngay sau mỗi bài học', 'Phản hồi tức thì từ AI Tutor', 'Ôn luyện theo vòng lặp Spaced Repetition'],
  },
  {
    hanzi: '学而不思则罔',
    label: 'Suy ngẫm & Gốc rễ',
    origin: 'Khổng Tử – Luận Ngữ',
    color: 'from-[#2E3192] to-blue-600',
    lightBg: 'bg-indigo-50',
    textColor: 'text-[#2E3192]',
    borderColor: 'border-indigo-200',
    desc: 'Sử dụng tư duy First Principles để hiểu gốc rễ chữ Hán và logic cấu trúc ngôn ngữ. Học bộ thủ, ngữ căn để tự giải mã từ mới thay vì học thuộc lòng vô nghĩa.',
    points: ['Giải mã chữ Hán qua bộ thủ', 'Hiểu cấu trúc câu từ nguyên tắc đầu tiên', 'Xây dựng tư duy ngôn ngữ chủ động'],
  },
  {
    hanzi: '思而不学则殆',
    label: 'Hệ thống & Phương pháp',
    origin: 'Khổng Tử – Luận Ngữ',
    color: 'from-orange-500 to-amber-600',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    desc: 'Lộ trình chuẩn hóa 5 giai đoạn từ Nhập môn đến Thông thạo, được thiết kế khoa học và liên tục tinh chỉnh bằng dữ liệu từ hàng trăm học viên thực tế.',
    points: ['5 giai đoạn học chuẩn hóa', 'Lộ trình cá nhân hóa theo năng lực', 'Đánh giá đầu ra định lượng rõ ràng'],
  },
];

const aiFeatures = [
  { 
    icon: <RotateCcw className="w-7 h-7 text-indigo-500" />, 
    bg: 'bg-indigo-50', 
    title: 'Spaced Repetition (SRS)', 
    desc: 'Thuật toán nhắc lại từ vựng và ngữ pháp đúng thời điểm não bộ chuẩn bị quên. Tối ưu hóa bộ nhớ dài hạn, giúp ghi nhớ 2000+ từ vựng chỉ trong 6 tháng.' 
  },
  { 
    icon: <Bot className="w-7 h-7 text-emerald-500" />, 
    bg: 'bg-emerald-50', 
    title: 'Gia sư ảo Tongxiao', 
    desc: 'Tích hợp mô hình ngôn ngữ lớn (LLM) được tinh chỉnh chuyên biệt cho tiếng Trung. Giải thích ngữ pháp theo tư duy First Principles, không chỉ là dịch nghĩa.' 
  },
  { 
    icon: <Mic className="w-7 h-7 text-orange-500" />, 
    bg: 'bg-orange-50', 
    title: 'Voice Feedback AI', 
    desc: 'Công nghệ nhận diện giọng nói (ASR) phân tích thanh điệu (tones) thời gian thực. Sửa lỗi phát âm ngay lập tức theo mô hình chuẩn Phổ Thông.' 
  },
];

const stages = [
  { n: '01', icon: <Mic className="w-6 h-6" />, title: 'Chuẩn hóa Âm', desc: 'Làm chủ hệ thống Pinyin, nhận diện bộ thủ và quy tắc bút thuận. Xây dựng "phản xạ âm thanh" chuẩn ngay từ những ngày đầu.' },
  { n: '02', icon: <Brain className="w-6 h-6" />, title: 'Tư duy Ngôn ngữ', desc: 'Giải mã logic ngữ pháp qua tư duy First Principles. Nắm vững cấu trúc câu và cách hình thành tư duy bằng tiếng Trung.' },
  { n: '03', icon: <MapPin className="w-6 h-6" />, title: 'Survival Chinese', desc: 'Thực chiến trong các tình huống sinh tồn: sân bay, bệnh viện, đàm phán mua hàng và giao lưu văn hóa bản địa.' },
  { n: '04', icon: <Zap className="w-6 h-6" />, title: 'Tăng tốc HSK 3.0', desc: 'Hệ thống hóa kiến thức chuyên sâu, luyện đề thực tế và làm chủ 1200+ từ vựng theo khung năng lực mới nhất.' },
  { n: '05', icon: <Trophy className="w-6 h-6" />, title: 'Dự án Tốt nghiệp', desc: 'Thuyết trình và bảo vệ dự án cá nhân (Business Pitching) hoàn toàn bằng tiếng Trung trước hội đồng chuyên gia.' },
];

export default function MethodPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', courseId: COURSES[0].id, courseTitle: COURSES[0].title, studyMode: 'online' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
        source: 'Method Page', status: 'new', potential_score: 85,
        notes: `Tư vấn từ trang Phương pháp: ${formData.courseTitle} | ${formData.studyMode === 'online' ? 'Online' : 'Offline'}`
      });
      setSuccess(true);
      setTimeout(() => { setModalOpen(false); setSuccess(false); setFormData(prev => ({ ...prev, fullName: '', phone: '' })); }, 3000);
    } catch (err: any) { setError(err.message || 'Đã có lỗi. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  };

  const demoScenarios = [
    {
      label: 'Phân tích câu',
      hanzi: '学而时习之，不亦说乎？',
      pinyin: 'Xué ér shí xí zhī, bù yì yuè hū?',
      analysis: 'Toxi AI phân tích: "而" ở đây là liên từ nối. "之" là đại từ chỉ kiến thức đã học. Cấu trúc câu hỏi tu từ mang tính triết lý.'
    },
    {
      label: 'Sửa phát âm',
      hanzi: '老师',
      pinyin: 'Lǎoshī',
      analysis: 'Phát âm của bạn: "Lǎo sī" ➔ AI Feedback: Lỗi âm đầu "sh" (quặt lưỡi) bị phát thành "s". Vui lòng nâng lưỡi lên vòm họng.'
    },
    {
      label: 'Ứng dụng thực tế',
      hanzi: '打折',
      pinyin: 'Dǎzhé',
      analysis: 'Tư duy Tongxiao: "打" (đánh/làm) + "折" (gãy/bẻ). Ý nghĩa: Bẻ gãy giá gốc ➔ Giảm giá. AI gợi ý bối cảnh: Đi mua sắm tại Taobao.'
    }
  ];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const faqs = [
    { q: 'Phương pháp Tongxiao khác gì so với học truyền thống?', a: 'Thay vì học thuộc lòng theo giáo trình tuyến tính, Tongxiao tập trung vào vòng lặp Học – Hành – Phản hồi, hiểu gốc rễ từ First Principles và ứng dụng ngay vào tình huống thực tế. AI liên tục cá nhân hóa tốc độ và nội dung học cho từng người.' },
    { q: 'Tôi cần bao nhiêu thời gian mỗi ngày để thấy hiệu quả?', a: 'Chỉ cần 30–45 phút/ngày nếu áp dụng đúng vòng lặp Spaced Repetition và thực hành hội thoại với AI Tutor. Nhiều học viên đạt HSK 3 sau 3 tháng với lịch học này.' },
    { q: 'Công nghệ AI có thể thay thế hoàn toàn giáo viên không?', a: 'Không. AI đóng vai trò "giàn giáo thông minh" (scaffolding) — hỗ trợ tối đa việc luyện tập lặp lại, phân tích lỗi và gợi ý bước tiếp theo. Giáo viên TOXI đảm nhiệm vai trò hướng dẫn chiến lược, sửa lỗi tư duy và truyền cảm hứng — điều AI chưa thể làm được.' },
    { q: 'Tongxiao có phù hợp với người bận rộn không có nhiều thời gian?', a: 'Hoàn toàn phù hợp. Hệ thống chia nhỏ bài học (micro-learning), cho phép học trên mobile bất cứ lúc nào, và AI Tutor nhắc bạn ôn đúng thời điểm để không bao giờ "học trước quên sau".' },
  ];

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

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_#1A237E_0%,_transparent_50%),radial-gradient(circle_at_80%_70%,_#4A148C_0%,_transparent_50%)] opacity-60" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FF9800]/20 blur-[100px] animate-pulse clip-diagonal" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/20 blur-[100px] animate-pulse delay-1000 clip-diagonal" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap">
          通晓
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 clip-diagonal bg-white/5 backdrop-blur-md border border-white/10 text-indigo-200 text-[10px] sm:text-xs font-heading font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Brain className="w-4 h-4 text-[#FF9800]" /> Phương pháp đào tạo độc quyền
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-heading font-black text-white tracking-tighter mb-4 leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Tongxiao
          </h1>
          <div className="flex items-center justify-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#FF9800]"></div>
            <p className="text-2xl sm:text-4xl font-culture text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] via-yellow-200 to-[#FF9800]">
              通晓学习法
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#FF9800]"></div>
          </div>
          <p className="max-w-2xl mx-auto text-base lg:text-xl text-indigo-100 font-medium mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            Khai phá tiềm năng ngôn ngữ thông qua sự giao thoa giữa <span className="text-white font-bold">triết lý phương Đông</span>, <span className="text-white font-bold">tư duy gốc rễ</span> và <span className="text-white font-bold">công nghệ AI</span> đột phá.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link to="/courses" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF9800] text-white hover:bg-orange-600 px-10 py-4 clip-diagonal-hover text-sm font-heading font-black uppercase tracking-widest transition-all shadow-2xl hover:-translate-y-1">
              Bắt đầu hành trình <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#pillars" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm px-10 py-4 clip-diagonal-hover text-sm font-heading font-black uppercase tracking-widest transition-all">
              Khám phá trụ cột
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 clip-diagonal bg-red-50 text-red-500 text-xs font-heading font-black uppercase tracking-widest mb-6">Nghịch lý phổ biến</div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight mb-6">
                Vì sao có <span className="text-red-500">HSK cao</span> mà vẫn lúng túng trong thực tế?
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-8 text-lg">
                Hàng nghìn học viên có chứng chỉ HSK 4, HSK 5 nhưng vẫn bật Google Dịch khi vào phòng họp, vẫn không đặt được đồ ăn ở nhà máy hay hiểu đồng nghiệp Trung Quốc nói gì.
              </p>
              <div className="space-y-4">
                {['Học từ vựng rời rạc, không có ngữ cảnh', 'Luyện thi theo khuôn mẫu, không luyện tư duy', 'Không có môi trường thực hành thực tế'].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-red-50/50 clip-diagonal border border-red-100">
                    <div className="w-5 h-5 clip-diagonal bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs font-black">✕</span>
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1A237E] to-[#4A148C] clip-diagonal p-10 text-white relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 clip-diagonal rotate-12" />
              <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-[#FF9800]/10 clip-diagonal -rotate-12" />
              <div className="relative z-10">
                <div className="text-5xl font-culture mb-2 text-white/20">通晓</div>
                <h3 className="text-2xl font-heading font-black mb-4">Giải pháp Tongxiao</h3>
                <p className="text-indigo-100 leading-relaxed mb-8">"Thông Suốt" không chỉ là biết — mà là am hiểu đến tận gốc rễ. Hiểu tại sao chữ đó có nghĩa vậy, tại sao câu đó được cấu trúc vậy, và ứng dụng được ngay lập tức trong đời thực.</p>
                <div className="space-y-3">
                  {['Học trong bối cảnh thực tế ngay từ đầu', 'Tư duy gốc rễ thay vì học thuộc', 'AI hỗ trợ thực hành 24/7'].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#FF9800] flex-shrink-0" />
                      <span className="text-sm font-medium text-indigo-100">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="pillars" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 clip-diagonal bg-indigo-50 text-[#1A237E] text-[10px] font-heading font-black uppercase tracking-widest mb-4">
              Hệ thống hóa tri thức
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight mb-4">Ba Trụ Cột Cốt Lõi</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Sự kết hợp hoàn mỹ giữa tư duy cổ điển và công nghệ tương lai.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-2 bg-gradient-to-r ${p.color} clip-diagonal opacity-0 group-hover:opacity-10 transition duration-500`} />
                <div className={`relative h-full clip-diagonal border bg-white p-8 sm:p-10 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 ${p.borderColor}`}>
                  <div className={`inline-flex items-center justify-center px-5 py-2.5 clip-diagonal bg-gradient-to-r ${p.color} text-white text-3xl font-culture mb-8 shadow-lg transform group-hover:scale-105 transition-transform duration-500`}>
                    {p.hanzi}
                  </div>
                  <div className={`text-[10px] font-heading font-black ${p.textColor} uppercase tracking-[0.2em] mb-3`}>{p.origin}</div>
                  <h3 className="text-2xl font-heading font-black text-slate-900 mb-5">{p.label}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">{p.desc}</p>
                  <ul className="space-y-4">
                    {p.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                        <div className={`w-5 h-5 clip-diagonal ${p.lightBg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <CheckCircle2 className={`w-3 h-3 ${p.textColor}`} />
                        </div>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Stage Roadmap - Elite Redesign */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-40 left-10 w-64 h-64 bg-[#1A237E]/5 blur-3xl opacity-60 clip-diagonal" />
          <div className="absolute bottom-40 right-10 w-64 h-64 bg-[#FF9800]/5 blur-3xl opacity-60 clip-diagonal" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 clip-diagonal bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-heading font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#1A237E]" /> Lộ trình cá nhân hóa
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black text-slate-900 tracking-tighter mb-6 leading-tight">Lộ Trình Tinh Anh</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">Được thiết kế để đưa bạn từ con số 0 đến khả năng sử dụng tiếng Trung chuyên nghiệp trong mọi tình huống.</p>
          </div>

          <div className="relative space-y-12 lg:space-y-0">
            {/* Desktop Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-indigo-200 to-slate-200 hidden lg:block -translate-x-1/2" />
            
            {stages.map((s, i) => (
              <div key={i} className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-0 ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                {/* Content Card */}
                <div className="w-full lg:w-[45%] group">
                  <div className={`relative bg-white clip-diagonal p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-indigo-200 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`flex items-center gap-4 mb-6 ${i % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                      <div className="w-12 h-12 clip-diagonal bg-indigo-50 flex items-center justify-center text-[#1A237E] group-hover:bg-[#1A237E] group-hover:text-white transition-all duration-500 shadow-inner">
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-heading font-black text-[#FF9800] uppercase tracking-[0.2em] mb-1">Giai đoạn {s.n}</div>
                        <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">{s.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                      {s.desc}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] font-heading font-black text-emerald-500 uppercase tracking-widest ${i % 2 === 0 ? 'lg:justify-end' : ''}`}>
                      <CheckCircle2 className="w-4 h-4" /> Hoàn thành mục tiêu đầu ra
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative z-20 hidden lg:flex items-center justify-center w-[10%] group">
                  <div className="w-12 h-12 clip-diagonal bg-white border-4 border-slate-100 shadow-xl flex items-center justify-center group-hover:scale-125 transition-all duration-500">
                    <div className="w-4 h-4 clip-diagonal bg-[#1A237E] animate-pulse" />
                  </div>
                  {/* Glowing halo */}
                  <div className="absolute inset-0 bg-[#FF9800]/20 clip-diagonal blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Empty Space for layout */}
                <div className="hidden lg:block lg:w-[45%]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Engine & Synergy Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1A237E_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 clip-diagonal bg-white/10 border border-white/20 text-indigo-100 text-xs font-heading font-black uppercase tracking-widest mb-4">
              <Zap className="w-3.5 h-3.5 text-[#FF9800]" /> Công nghệ hội tụ
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tight mb-4">Toxi AI ✕ Tongxiao Method</h2>
            <p className="text-slate-400 font-medium text-lg max-w-3xl mx-auto leading-relaxed">
              Sự kết hợp hoàn hảo giữa phương pháp học truyền thống và trí tuệ nhân tạo. 
              AI không chỉ là công cụ, mà là "Hệ điều hành" vận hành toàn bộ lộ trình học của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {aiFeatures.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 clip-diagonal p-8 hover:bg-white/10 transition-all duration-500 group hover:-translate-y-2">
                <div className={`w-16 h-16 ${f.bg} clip-diagonal flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>{f.icon}</div>
                <h3 className="text-xl font-heading font-black text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Demo Simulator */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 clip-diagonal overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="text-[10px] font-heading font-black text-white/30 uppercase tracking-[0.2em]">Toxi AI Simulation Mode</div>
                <div className="w-6"></div>
              </div>
              
              <div className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-indigo-300 text-xs font-heading font-black uppercase tracking-widest mb-4">Chọn kịch bản trải nghiệm</h3>
                    <div className="space-y-3">
                      {demoScenarios.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setDemoStep(i)}
                          className={`w-full text-left p-4 clip-diagonal border transition-all duration-300 ${demoStep === i ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                          <div className="text-[10px] font-bold opacity-60 uppercase mb-1">{s.label}</div>
                          <div className="font-bold text-sm">{s.hanzi}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 clip-diagonal p-8 border border-white/10 relative group">
                    <div className="absolute top-4 right-4 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">{demoScenarios[demoStep].hanzi}</div>
                        <div className="text-indigo-400 font-bold italic">{demoScenarios[demoStep].pinyin}</div>
                      </div>
                      <div className="h-px bg-white/10"></div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 clip-diagonal bg-[#FF9800] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                          "{demoScenarios[demoStep].analysis}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center mt-8 text-slate-500 text-sm font-medium italic">
              * Đây là minh họa cách Toxi AI áp dụng triết lý Tongxiao vào từng tương tác nhỏ nhất của học viên.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1A237E]/5 clip-diagonal blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#1A237E 1px, transparent 1px), linear-gradient(90deg, #1A237E 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight mb-4">Câu hỏi thường gặp</h2>
            <p className="text-slate-500 font-medium">Giải đáp thắc mắc về phương pháp Tongxiao.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 clip-diagonal overflow-hidden shadow-sm bg-white hover:border-[#1A237E]/30 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#FF9800] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed border-t border-slate-50 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1A237E] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4A148C_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">Trải nghiệm Tongxiao ngay hôm nay</h2>
          <p className="text-indigo-100 font-medium text-lg mb-10 max-w-xl mx-auto">Đăng ký tư vấn miễn phí — chuyên viên TOXI sẽ thiết kế lộ trình Tongxiao phù hợp riêng cho bạn.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-[#FF9800] text-white px-10 py-4 clip-diagonal-hover text-sm font-heading font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-1">
            Xem các khóa học <ArrowRight className="w-4 h-4" />
          </Link>
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
