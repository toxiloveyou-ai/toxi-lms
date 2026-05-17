import { useState, useEffect } from 'react';
import { 
  BookOpen, Target, Sparkles, Smartphone, ArrowRight, 
  Compass, Trophy, CheckCircle2, GraduationCap, X, 
  Loader2, Phone, Mail, MapPin, Award, Users, 
  ShieldCheck, Landmark, HeartHandshake, Eye, Briefcase 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { crmApi } from '../../lib/api/crm';
import PublicNav from '../../components/public/PublicNav';

const COURSES = [
  { id: 'hsk-1-2', title: 'Tiếng Trung Giao Tiếp (HSK 1-2)' },
  { id: 'hsk-3-4', title: 'Tiếng Trung Tổng Hợp (HSK 3-4)' },
  { id: 'hsk-5-6', title: 'Luyện Thi HSK 5-6 Chuyên Sâu' },
  { id: 'business', title: 'Tiếng Trung Thương Mại' },
  { id: 'kids', title: 'Tiếng Trung Trẻ Em' },
];

const TEACHERS = [
  { 
    id: 't1', 
    name: 'Thầy Lê Đình Hiểu', 
    title: 'Founder of TOXI | Chuyên gia Hán ngữ HSK 6', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    bio: 'Chuyên gia Hán ngữ ứng dụng với hơn 10 năm nghiên cứu và giảng dạy. Ông là người đặt viên gạch đầu tiên cho phương pháp giáo dục độc quyền Tongxiao - kết hợp tinh hoa của tư duy ngôn ngữ gốc rễ và công nghệ trí tuệ nhân tạo AI.',
    experience: '10+ năm thực chiến',
    students: '15,000+ Học viên',
    rating: 4.9,
    achievements: [
      'Chứng chỉ HSK 6 cấp độ cao nhất toàn diện',
      'Tác giả bộ giáo trình Tongxiao Method độc quyền',
      'Cố vấn chiến lược EdTech tại nhiều doanh nghiệp FDI'
    ]
  },
  { 
    id: 't2', 
    name: 'Cô Minh Anh', 
    title: 'Thạc sĩ Ngôn ngữ học - ĐH Bắc Kinh', 
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    bio: 'Nhiệt huyết, sáng tạo và tận tâm tuyệt đối. Cô Minh Anh có chuyên môn sâu sắc về phương pháp tiếp cận ngôn ngữ tự nhiên thông qua ngữ cảnh sống động và là chuyên gia phát triển tư duy tiếng Trung thương mại cho người đi làm.',
    experience: '6 năm giảng dạy',
    students: '5,000+ Học viên',
    rating: 4.9,
    achievements: [
      'Thạc sĩ xuất sắc chuyên ngành ngôn ngữ tại ĐH Bắc Kinh (PKU)',
      'Tác giả chuỗi bài giảng thực chiến Taobao & Alipay Eco',
      'Top 10 Giáo viên xuất sắc đổi mới phương pháp giảng dạy'
    ]
  }
];

export default function AboutChinesePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    courseId: COURSES[0].id, 
    courseTitle: COURSES[0].title, 
    studyMode: 'online' 
  });
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
    if (!formData.fullName || !formData.phone) { 
      setError('Vui lòng điền đầy đủ họ tên và số điện thoại liên hệ.'); 
      return; 
    }
    setLoading(true); 
    setError('');
    try {
      await crmApi.createLead({
        full_name: formData.fullName, 
        phone: formData.phone,
        source: 'About Chinese Page', 
        status: 'new', 
        potential_score: 85,
        notes: `Tư vấn từ trang Tiếng Trung TOXI: ${formData.courseTitle} | Hình thức: ${formData.studyMode === 'online' ? 'Online' : 'Offline'}`
      });
      setSuccess(true);
      setTimeout(() => { 
        setModalOpen(false); 
        setSuccess(false); 
        setFormData(prev => ({ ...prev, fullName: '', phone: '' })); 
      }, 3000);
    } catch (err: any) { 
      setError(err.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1A237E] selection:text-white animate-in fade-in duration-1000">

      {/* Register Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white shadow-2xl w-full max-w-md overflow-hidden clip-diagonal animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-[#1A237E] to-[#311B92] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white z-10"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-white/10 clip-diagonal flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-[#FF9800]" /></div>
              <h3 className="text-xl font-heading font-black tracking-tight uppercase">Đăng ký nhận tư vấn</h3>
              <p className="text-indigo-100 text-sm mt-1">TOXI sẽ thiết kế lộ trình thực chiến tối ưu nhất cho bạn trong 24h.</p>
            </div>
            <div className="p-8 border border-t-0 border-slate-200">
              {success ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 clip-diagonal flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
                  <h4 className="text-lg font-heading font-black text-slate-900 mb-2">Đăng ký thành công!</h4>
                  <p className="text-sm text-slate-500">Chuyên viên tư vấn của TOXI sẽ gọi lại cho bạn sớm nhất.</p>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1A237E_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_#4A148C_0%,_transparent_55%)]" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        
        {/* Animated decorative elements */}
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-[#FF9800]/10 blur-[120px] animate-pulse clip-diagonal" />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-indigo-500/10 blur-[120px] animate-pulse delay-700 clip-diagonal" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap">
          学以致用
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative mb-8 group">
            <div className="absolute -inset-10 bg-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 clip-diagonal" />
            <img src="/assets/images/toxi_chinese_vertical.png" alt="Tiếng Trung TOXI" className="relative h-40 md:h-52 object-contain group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl brightness-0 invert" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 shadow-sm text-white text-xs font-heading font-black uppercase tracking-[0.2em] mb-8 hover:shadow-md transition-all clip-diagonal backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-[#FF9800]" /> Phân hiệu ngôn ngữ & công nghệ trực thuộc TOXI EDU
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-white tracking-tighter mb-6 leading-[1.1]">
            Chinh Phục Ngôn Ngữ Bằng<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] via-amber-300 to-yellow-400 drop-shadow-sm">
              Trí Tuệ Nhân Tạo & AI
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-indigo-100 font-medium leading-relaxed mb-10">
            Không học vẹt để đối phó thi cử. Tại TOXI EDU, chúng tôi coi ngôn ngữ là công cụ sinh tồn trong kỷ nguyên số, mở rộng tư duy thực chiến và kết nối cơ hội sự nghiệp toàn cầu.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-600 text-white px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1 clip-diagonal">
              Đăng ký nhận lộ trình 1:1 <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/courses" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-1 clip-diagonal backdrop-blur-md">
              Danh sách khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Stats Overview */}
      <section className="relative z-20 -mt-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200 p-8 sm:p-10 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 rounded-sm clip-diagonal relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A237E]/5 clip-diagonal" />
          {[
            { value: '15,000+', label: 'Học viên thành công', icon: <Users className="w-5 h-5 text-[#FF9800]" /> },
            { value: '98%', label: 'Tỷ lệ đỗ HSK 3-6', icon: <Trophy className="w-5 h-5 text-[#FF9800]" /> },
            { value: '24/7', label: 'Gia sư ảo AI đồng hành', icon: <Sparkles className="w-5 h-5 text-[#FF9800]" /> },
            { value: '100%', label: 'Cam kết chuẩn đầu ra', icon: <ShieldCheck className="w-5 h-5 text-[#FF9800]" /> }
          ].map((stat, idx) => (
            <div key={idx} className="text-center space-y-2 border-r border-slate-100 last:border-0 md:last:border-0 sm:border-r-0 md:border-r">
              <div className="flex items-center justify-center gap-2">
                {stat.icon}
                <span className="text-3xl sm:text-4xl font-heading font-black text-slate-900">{stat.value}</span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Philosophy Bento */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[#1A237E] clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Giá trị cốt lõi</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4">Triết Lý Giáo Dục Đột Phá</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Kết hợp tư duy tinh gọn (Lean) cùng học hỏi từ nền tảng gốc rễ (First Principles) — không học vẹt, nhớ sâu dài hạn.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300">
            
            {/* Bento Card 1: Main Philosophy */}
            <div className="md:col-span-2 bg-slate-50 clip-diagonal p-12 border border-slate-200 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:border-[#1A237E]/30">
              <div className="absolute right-0 top-0 w-80 h-80 bg-orange-100/50 clip-diagonal transition-transform duration-700 group-hover:scale-110 translate-x-10 -translate-y-10" />
              <div className="w-20 h-20 bg-[#FF9800] clip-diagonal flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-orange-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Compass className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-heading font-black text-slate-900 mb-6 relative z-10 tracking-tight">
                Học để ứng dụng thực tế <br className="hidden sm:block" />
                <span className="text-[#FF9800] font-culture text-5xl leading-tight">(学以致用)</span>
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-lg relative z-10 max-w-xl">
                Tại TOXI, chúng tôi loại bỏ các kiến thức hàn lâm rườm rà. Mục tiêu cốt lõi là học viên có thể tự tin đàm phán hợp đồng thương mại, đặt hàng Taobao, dẫn đường trên Gaode Map và thấu hiểu văn hóa doanh nghiệp Trung Quốc ngay lập tức.
              </p>
            </div>

            {/* Bento Card 2: Vision & Mission */}
            <div className="bg-gradient-to-b from-[#1A237E] to-[#311B92] clip-diagonal p-12 shadow-xl relative overflow-hidden flex flex-col justify-end text-white min-h-[360px] group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-indigo-500/30">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF9800]/20 blur-2xl group-hover:scale-150 transition-transform duration-700 clip-diagonal" />
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md clip-diagonal flex items-center justify-center mb-auto relative z-10">
                <Target className="w-8 h-8 text-[#FF9800]" />
              </div>
              <h3 className="text-3xl font-heading font-black mb-4 relative z-10 tracking-tight">Sứ Mệnh &<br />Tầm Nhìn</h3>
              <p className="text-indigo-100 font-medium leading-relaxed relative z-10 text-sm">
                Xây dựng thế hệ người Việt làm chủ tiếng Trung bằng công nghệ AI, nâng cao vị thế và năng lực cạnh tranh trong thị trường kinh tế quốc tế sôi động.
              </p>
            </div>

            {/* Bento Card 3: 5 Stages Roadmap */}
            <div className="md:col-span-3 bg-white clip-diagonal p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-200 flex flex-col md:flex-row items-center gap-12 group hover:-translate-y-2 transition-transform duration-500">
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[#1A237E] clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-6">Chất lượng học thuật</span>
                <h3 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-6 tracking-tight">Quy Trình Chuẩn Hóa 5 Giai Đoạn</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 text-base">
                  TOXI thiết lập quy trình kiểm soát học tập chặt chẽ. Học viên trải qua từng chặng thử thách rõ ràng, kết thúc bằng một <strong>"Dự án Tốt nghiệp Thực tế"</strong> — thuyết trình hoặc pitching cơ hội kinh doanh hoàn toàn bằng tiếng Trung trước ban giám khảo chuyên gia.
                </p>
                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 text-[#1A237E] font-heading font-black hover:text-[#FF9800] text-sm uppercase tracking-widest transition-colors">
                  Tìm hiểu lộ trình giảng dạy <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-50 clip-diagonal p-8 md:p-10 border border-slate-200">
                <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Xương sống chặng đường học tập</p>
                <ul className="space-y-4">
                  {[
                    { title: 'Chuẩn hóa Phát âm & Cơ bản chữ Hán', desc: 'Làm chủ hệ âm Pinyin và quy tắc bút thuận nền tảng.' },
                    { title: 'Tư duy Ngôn ngữ & Giao tiếp Đời sống', desc: 'Tự tin phản xạ tự nhiên trong đời sống sinh hoạt thường ngày.' },
                    { title: 'Survival Chinese - Thực chiến Tình huống', desc: 'Thao tác các siêu ứng dụng Taobao, Alipay, Gaode Map.' },
                    { title: 'Tăng tốc HSK 3.0 & Chiến thuật thi cử', desc: 'Chinh phục chứng chỉ quốc tế HSK 3-6 với điểm số tối đa.' },
                    { title: 'Business Pitching & Dự án Tốt nghiệp', desc: 'Thuyết trình kế hoạch kinh doanh & Đàm phán trực tiếp.' }
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 clip-diagonal bg-[#1A237E] flex items-center justify-center flex-shrink-0 text-xs font-black text-white shadow-md mt-1">{i + 1}</div>
                      <div>
                        <span className="text-sm font-black text-slate-800 block">{s.title}</span>
                        <span className="text-xs text-slate-500 font-medium">{s.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Tech Ecosystem */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1A237E]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 clip-diagonal bg-indigo-100/50 border border-indigo-200 text-[#1A237E] text-[10px] font-heading font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4" /> Hệ sinh thái tiên phong
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-6 leading-tight">Mô Hình Học Tập Tích Hợp AI 24/7</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              TOXI EDU là đơn vị tiên phong ứng dụng sâu Trí tuệ nhân tạo (AI Generative) kết hợp giáo trình số tương tác thực chiến tại Việt Nam.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Sparkles className="w-10 h-10 text-[#1A237E]" />, 
                bg: 'bg-indigo-50', 
                border: 'hover:border-indigo-200', 
                title: 'Trợ lý AI Mentor 24/7', 
                desc: 'Hệ thống AI chuyên biệt chấm chữa phát âm Pinyin chuẩn bản xứ, phân tích lỗi sai ngữ pháp, và đóng vai đối tác hội thoại tiếng Trung bất cứ khi nào bạn rảnh.' 
              },
              { 
                icon: <Smartphone className="w-10 h-10 text-[#FF9800]" />, 
                bg: 'bg-orange-50', 
                border: 'hover:border-orange-200', 
                title: 'Học Liệu Số Đa Phương Tiện', 
                desc: 'Khóa học không giới hạn ở trang sách. Học viên được trực tiếp đàm phán trên Taobao/1688, dẫn đường qua Gaode Map, lập tài khoản Alipay ngay trong hệ thống học.' 
              },
              { 
                icon: <Target className="w-10 h-10 text-emerald-500" />, 
                bg: 'bg-emerald-50', 
                border: 'hover:border-emerald-200', 
                title: 'Phương Pháp Tongxiao Độc Quyền', 
                desc: 'Nghiên cứu bởi các chuyên gia ngôn ngữ hàng đầu, cá nhân hóa lộ trình dựa trên dữ liệu đánh giá liên tục, lấp đầy các khoảng trống kiến thức ngay lập tức.' 
              },
            ].map((item, idx) => (
              <div key={idx} className={`p-10 md:p-12 clip-diagonal border border-slate-200 bg-white shadow-xl shadow-slate-200/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${item.border} group relative overflow-hidden`}>
                <div className={`absolute -right-6 -top-6 w-32 h-32 ${item.bg} clip-diagonal blur-xl group-hover:scale-150 transition-transform duration-700 opacity-50`} />
                <div className={`w-20 h-20 ${item.bg} clip-diagonal flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-heading font-black text-slate-900 mb-4 tracking-tight group-hover:text-[#1A237E] transition-colors relative z-10">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Faculty Team */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block px-4 py-1.5 bg-orange-50 text-[#FF9800] clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Đội ngũ sáng lập & giảng huấn</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4">Chuyên Gia Đồng Hành</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Quy tụ các chuyên gia Hán ngữ giàu kinh nghiệm thực chiến, tận tâm, sở hữu trình độ học thuật cao và khả năng ứng dụng công nghệ vượt trội.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {TEACHERS.map((teacher, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-8 md:p-12 clip-diagonal flex flex-col md:flex-row items-center md:items-start gap-8 group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:border-[#1A237E]/20">
                <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-lg relative group-hover:scale-105 transition-transform duration-500">
                  <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4 text-center md:text-left flex-1">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-1 text-[#FF9800] mb-1">
                      <Award className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-black uppercase tracking-widest">Giảng viên xuất sắc</span>
                    </div>
                    <h3 className="text-2xl font-heading font-black text-slate-900">{teacher.name}</h3>
                    <p className="text-xs font-bold text-[#1A237E] uppercase tracking-widest mt-1">{teacher.title}</p>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{teacher.bio}</p>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Thành tựu tiêu biểu</p>
                    <ul className="space-y-2">
                      {teacher.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy Statement */}
          <div className="mt-20 p-10 bg-gradient-to-br from-[#1A237E] to-[#311B92] clip-diagonal text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4A148C_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
              <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-wide">"Biến ngôn ngữ thành lợi thế cạnh tranh tuyệt đối"</h3>
              <p className="text-indigo-100 font-medium text-base sm:text-lg leading-relaxed italic max-w-3xl mx-auto">
                "Chúng tôi không cam kết sẽ dạy bạn thuộc lòng hàng vạn từ vựng vô nghĩa. Nhưng chúng tôi cam kết sẽ rèn luyện cho bạn tư duy tự học từ gốc rễ, khả năng đàm phán sắc bén và tư thế tự tin nhất trước đối tác Trung Quốc."
              </p>
              <div className="pt-2">
                <p className="text-sm font-heading font-black text-[#FF9800] uppercase tracking-widest">- Ban Điều Hành & Hội Đồng Khoa Học TOXI EDU -</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Legitimacy / Enterprise Standards */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[#1A237E] clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Thông tin pháp lý chính thức</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4">Bảo Chứng Hoạt Động Doanh Nghiệp</h2>
            <p className="text-slate-500 font-medium text-lg">TOXI EDU hoạt động minh bạch dưới sự quản lý trực tiếp của Công ty TNHH TOXI, tuân thủ nghiêm ngặt các quy định pháp luật.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-8 clip-diagonal hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-50 clip-diagonal flex items-center justify-center mb-6">
                <Landmark className="w-6 h-6 text-[#1A237E]" />
              </div>
              <h4 className="text-lg font-heading font-black text-slate-900 uppercase mb-3">Pháp nhân chủ quản</h4>
              <p className="text-sm font-bold text-slate-800">CÔNG TY TNHH TOXI</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Đăng ký kinh doanh và hoạt động đào tạo chính quy, định hướng công nghệ giáo dục.</p>
            </div>
            
            <div className="bg-white border border-slate-200 p-8 clip-diagonal hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-50 clip-diagonal flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-[#1A237E]" />
              </div>
              <h4 className="text-lg font-heading font-black text-slate-900 uppercase mb-3">Lĩnh vực hoạt động</h4>
              <p className="text-sm font-bold text-slate-800">EdTech - Đào tạo Ngoại ngữ & Nghiên cứu AI</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Nghiên cứu ứng dụng trí tuệ nhân tạo (AI) vào việc tối ưu hóa giảng dạy tiếng Trung và ngôn ngữ.</p>
            </div>

            <div className="bg-white border border-slate-200 p-8 clip-diagonal hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-50 clip-diagonal flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6 text-[#1A237E]" />
              </div>
              <h4 className="text-lg font-heading font-black text-slate-900 uppercase mb-3">Cam kết vàng 100%</h4>
              <p className="text-sm font-bold text-slate-800">Cam kết chuẩn đầu ra bằng hợp đồng</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Hoàn trả học phí hoặc hỗ trợ học lại miễn phí 100% nếu học viên đi học đầy đủ nhưng không đạt chứng chỉ/phản xạ mong muốn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section & Inline Form */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF9800]/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#1A237E]/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="relative mb-10 group">
            <div className="absolute -inset-10 bg-white/10 clip-diagonal blur-2xl group-hover:bg-white/20 transition-colors duration-500" />
            <img
              src="/assets/images/toxi_chinese_vertical.png"
              alt="Tiếng Trung TOXI"
              className="relative h-44 md:h-56 object-contain hover:scale-105 transition-transform duration-700 drop-shadow-2xl brightness-0 invert"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-2 clip-diagonal bg-white/10 border border-white/20 text-[#FF9800] text-xs font-heading font-black uppercase tracking-[0.2em] mb-6 shadow-sm backdrop-blur-sm">
            ✦ CHUẨN BỊ VẬN HÀNH CHÍNH THỨC ✦
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 tracking-tight">Nhận Thiết Kế Lộ Trình Thực Chiến</h2>
          <p className="text-indigo-100 font-medium mb-12 max-w-2xl text-base md:text-lg leading-relaxed">
            Hãy để các chuyên gia giáo dục của TOXI EDU phân tích kỹ năng và thiết kế riêng lộ trình bám sát mục tiêu sự nghiệp của bạn — hoàn toàn miễn phí.
          </p>
          
          <button onClick={() => setModalOpen(true)} className="group relative flex items-center justify-center gap-3 bg-[#FF9800] text-white px-12 py-5 clip-diagonal-hover text-sm md:text-base font-heading font-black uppercase tracking-widest transition-all shadow-2xl shadow-orange-500/40 hover:-translate-y-2 hover:shadow-orange-500/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10">Đăng ký tư vấn lộ trình 1:1</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-[150px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap translate-y-1/4 translate-x-1/4">知行合一</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 clip-diagonal bg-[#1A237E] flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
            <div>
              <span className="text-lg font-heading font-black text-white uppercase tracking-tight block leading-none">TOXI EDU</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Smart Learning Platform</span>
            </div>
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
