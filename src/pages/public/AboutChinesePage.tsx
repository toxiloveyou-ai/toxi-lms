import { useState, useEffect } from 'react';
import {
  BookOpen, Target, Sparkles, Smartphone, ArrowRight,
  Compass, Trophy, CheckCircle2, GraduationCap, X,
  Loader2, Phone, Mail, MapPin, Award, Users,
  ShieldCheck, Landmark, HeartHandshake, Eye, Briefcase,
  ChevronRight, ChevronDown, ChevronUp, Mic, RefreshCw,
  BarChart2, Volume2, AlertCircle, FileText, Send, HelpCircle
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    bio: 'Chuyên gia Hán ngữ ứng dụng với hơn 5 năm nghiên cứu và giảng dạy. Ông là người đặt viên gạch đầu tiên cho phương pháp giáo dục độc quyền Tongxiao - kết hợp tinh hoa của tư duy ngôn ngữ gốc rễ và công nghệ trí tuệ nhân tạo AI.',
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
    studyMode: 'online',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Scientific Methodology Tabs State
  const [activeSciTab, setActiveSciTab] = useState<'memory' | 'principles' | 'hsk3'>('memory');
  const [activeDecodedChar, setActiveDecodedChar] = useState<'ming' | 'xiu' | 'qi'>('ming');

  // 2. Interactive AI Simulator State
  const [simTab, setSimTab] = useState<'pronounce' | 'firstprinciples' | 'taobao'>('pronounce');
  const [simVoiceState, setSimVoiceState] = useState<'idle' | 'recording' | 'analyzing' | 'done'>('idle');
  const [simVoiceScore, setSimVoiceScore] = useState<number | null>(null);

  // 3. Smart Level & Goal Advisor State
  const [advisorStep, setAdvisorStep] = useState<number>(0); // 0: Start, 1: Goal, 2: Commitment, 3: Level, 4: Result
  const [advGoal, setAdvGoal] = useState<string>('');
  const [advCommitment, setAdvCommitment] = useState<string>('');
  const [advLevel, setAdvLevel] = useState<string>('');

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
        notes: formData.notes || `Tư vấn từ trang Tiếng Trung TOXI: ${formData.courseTitle} | Hình thức: ${formData.studyMode === 'online' ? 'Online' : 'Offline'}`
      });
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        setFormData(prev => ({ ...prev, fullName: '', phone: '', notes: '' }));
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill form from Smart Advisor Result
  const handleApplyAdvisorResult = (recommendedCourseId: string, courseTitle: string, customNotes: string) => {
    setFormData({
      fullName: '',
      phone: '',
      courseId: recommendedCourseId,
      courseTitle: courseTitle,
      studyMode: 'online',
      notes: customNotes
    });
    setError('');
    setModalOpen(true);
  };

  // Reset Advisor
  const resetAdvisor = () => {
    setAdvisorStep(0);
    setAdvGoal('');
    setAdvCommitment('');
    setAdvLevel('');
  };

  // Simulate speaking interaction
  const triggerVoiceSimulation = () => {
    setSimVoiceState('recording');
    setTimeout(() => {
      setSimVoiceState('analyzing');
      setTimeout(() => {
        setSimVoiceState('done');
        setSimVoiceScore(94);
      }, 1500);
    }, 2000);
  };

  // Get dynamic advisor results
  const getAdvisorResult = () => {
    let title = '';
    let duration = '';
    let recommendedCourseId = 'hsk-1-2';
    let courseTitle = COURSES[0].title;
    let desc = '';
    let steps: string[] = [];

    if (advGoal === 'taobao') {
      recommendedCourseId = 'business';
      courseTitle = 'Tiếng Trung Thương Mại';
      title = 'TOXI Taobao & Sourcing Speed-Up';
      duration = '60 - 90 ngày';
      desc = 'Lộ trình tối ưu hóa cực hạn cho việc đàm phán nhà cung cấp 1688/Taobao, kiểm soát logistics, mặc cả giá và xử lý vận đơn hoàn toàn bằng tiếng Trung thực tế.';
      steps = [
        'Làm chủ 200 từ vựng và thuật ngữ chuyên ngành mua bán, xuất nhập khẩu.',
        'Thực hành đóng vai đàm phán 1-1 với AI Mentor trong 30 kịch bản ép giá, khiếu nại hàng lỗi.',
        'Hoàn thành dự án thực tế: Thực hiện một giao dịch nhập khẩu ủy thác ảo trực tiếp.'
      ];
    } else if (advGoal === 'business') {
      recommendedCourseId = 'business';
      courseTitle = 'Tiếng Trung Thương Mại';
      title = 'TOXI Business FDI Master';
      duration = '120 ngày';
      desc = 'Chương trình thiết kế riêng cho người đi làm trong các tập đoàn đa quốc gia, văn phòng đại diện hoặc doanh nghiệp FDI lớn.';
      steps = [
        'Chuẩn hóa kỹ năng giao tiếp công sở, thuyết trình báo cáo và viết Email chuyên nghiệp.',
        'Xây dựng tư duy phản xạ tiếng Trung trong các buổi họp, đối thoại với đối tác quốc tế.',
        'Bảo vệ dự án tốt nghiệp: Thuyết trình kế hoạch kinh doanh trước hội đồng chuyên gia.'
      ];
    } else if (advGoal === 'hsk') {
      recommendedCourseId = 'hsk-3-4';
      courseTitle = 'Tiếng Trung Tổng Hợp (HSK 3-4)';
      title = 'TOXI HSK 3.0 Standard Track';
      duration = advLevel === 'zero' ? '180 ngày' : '120 ngày';
      desc = 'Lộ trình bám sát 100% khung năng lực HSK 3.0 mới nhất của Bộ Giáo dục Trung Quốc, phát triển toàn diện nghe-nói-đọc-viết-dịch.';
      steps = [
        'Làm chủ 1200+ từ vựng cốt lõi và 80 điểm ngữ pháp trọng điểm của HSK 3-4.',
        'Hệ thống luyện đề thông minh với AI phân tích lỗi sai và đề xuất câu hỏi cải thiện.',
        'Cam kết đạt chứng chỉ HSK & HSKK với điểm số xuất sắc ngay lần thi đầu.'
      ];
    } else {
      recommendedCourseId = 'hsk-1-2';
      courseTitle = 'Tiếng Trung Giao Tiếp (HSK 1-2)';
      title = 'TOXI Active Daily Speaking';
      duration = '75 ngày';
      desc = 'Tập trung phá vỡ rào cản phát âm và phản xạ nghe nói tự nhiên trong các ngữ cảnh đời sống thường nhật.';
      steps = [
        'Chuẩn hóa tuyệt đối hệ thống ngữ âm Pinyin và thanh điệu chuẩn Phổ Thông Bắc Kinh.',
        'Luyện tập phản xạ nghe nói thông qua hơn 50 chủ đề giao tiếp cơ bản.',
        'Tương tác trực tiếp 24/7 với AI Voice Assistant để xây dựng sự tự tin tuyệt đối.'
      ];
    }

    const customNotes = `Đăng ký Lộ trình tư vấn từ Smart Advisor: [Goal: ${advGoal}] [Time: ${advCommitment}] [Level: ${advLevel}] -> Đề xuất Lộ trình: ${title} | Khóa: ${courseTitle}`;

    return { title, duration, recommendedCourseId, courseTitle, desc, steps, customNotes };
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-[#FF9800] selection:text-slate-950 animate-in fade-in duration-1000">

      {/* Register Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden clip-diagonal animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-[#1A237E] to-[#311B92] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white z-10"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-white/10 clip-diagonal flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-[#FF9800]" /></div>
              <h3 className="text-xl font-heading font-black tracking-tight uppercase">Đăng ký nhận tư vấn</h3>
              <p className="text-indigo-100 text-sm mt-1">TOXI sẽ thiết kế lộ trình thực chiến tối ưu nhất cho bạn trong 24h.</p>
            </div>
            <div className="p-8 bg-slate-900/90">
              {success ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 clip-diagonal flex items-center justify-center mx-auto mb-4 border border-emerald-500"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
                  <h4 className="text-lg font-heading font-black text-white mb-2">Đăng ký thành công!</h4>
                  <p className="text-sm text-slate-400">Chuyên viên tư vấn của TOXI sẽ gọi lại cho bạn sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-950/80 border border-red-500 text-red-400 text-xs font-bold rounded-sm text-center">{error}</div>}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-sm text-sm text-white focus:outline-none focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800] transition-all" placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-sm text-sm text-white focus:outline-none focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800] transition-all" placeholder="Số điện thoại liên hệ" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Hình thức học</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ val: 'online', label: '🖥️ Trực tuyến' }, { val: 'offline', label: '🏫 Trực tiếp' }].map(m => (
                        <button key={m.val} type="button" onClick={() => setFormData({ ...formData, studyMode: m.val })}
                          className={`py-3 rounded-sm border text-xs font-bold transition-all ${formData.studyMode === m.val ? 'bg-indigo-950/80 border-[#FF9800] text-[#FF9800]' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-750'}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Khóa học quan tâm</label>
                    <select value={formData.courseId} onChange={e => { const c = COURSES.find(c => c.id === e.target.value); setFormData({ ...formData, courseId: e.target.value, courseTitle: c?.title || '' }); }}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-sm text-sm text-white focus:outline-none focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800] transition-all">
                      {COURSES.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.title}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#FF9800] hover:bg-orange-600 text-slate-950 font-heading font-black py-4 clip-diagonal-hover uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-orange-500/20">
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1A237E_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_#4A148C_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Animated decorative elements */}
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-[#FF9800]/5 blur-[120px] animate-pulse clip-diagonal" />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-indigo-500/5 blur-[120px] animate-pulse delay-700 clip-diagonal" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap">
          学以致用
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative mb-8 group">
            <div className="absolute -inset-10 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 clip-diagonal" />
            <img src="/assets/images/toxi_chinese_vertical.png" alt="Tiếng Trung TOXI" className="relative h-40 md:h-52 object-contain group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl brightness-0 invert" />
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 shadow-sm text-white text-xs font-heading font-black uppercase tracking-[0.2em] mb-8 hover:shadow-md transition-all clip-diagonal backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-[#FF9800]" /> Phân hiệu ngôn ngữ & công nghệ trực thuộc TOXI EDU
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-white tracking-tighter mb-6 leading-[1.1]">
            Chinh Phục Ngôn Ngữ Bằng<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] via-amber-300 to-yellow-400 drop-shadow-sm">
              Trí Tuệ - Thực Chiến - AI
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-350 font-medium leading-relaxed mb-10">
            Không học vẹt để đối phó thi cử. Tại TOXI EDU, chúng tôi coi ngôn ngữ là công cụ sinh tồn trong kỷ nguyên số, mở rộng tư duy thực chiến và kết nối cơ hội sự nghiệp toàn cầu.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <a href="#advisor" className="flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-600 text-slate-950 px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-1 clip-diagonal">
              Tư vấn lộ trình thông minh <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#simulator" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-10 py-4 text-sm font-heading font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-1 clip-diagonal backdrop-blur-md">
              Trải nghiệm thử AI Mentor
            </a>
          </div>
        </div>
      </section>

      {/* Trust Stats Overview */}
      <section className="relative z-20 -mt-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-850 border border-slate-700 p-8 sm:p-10 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 rounded-sm clip-diagonal relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 clip-diagonal" />
          {[
            { value: '50+', label: 'Học viên thành công', icon: <Users className="w-5 h-5 text-[#FF9800]" /> },
            { value: '98%', label: 'Tỷ lệ đỗ HSK 3-6', icon: <Trophy className="w-5 h-5 text-[#FF9800]" /> },
            { value: '24/7', label: 'Gia sư ảo AI đồng hành', icon: <Sparkles className="w-5 h-5 text-[#FF9800]" /> },
            { value: '100%', label: 'Cam kết chuẩn đầu ra', icon: <ShieldCheck className="w-5 h-5 text-[#FF9800]" /> }
          ].map((stat, idx) => (
            <div key={idx} className="text-center space-y-2 border-r border-slate-800 last:border-0 md:last:border-0 sm:border-r-0 md:border-r">
              <div className="flex items-center justify-center gap-2">
                {stat.icon}
                <span className="text-3xl sm:text-4xl font-heading font-black text-white">{stat.value}</span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SMART LEVEL & GOAL ADVISOR */}
      <section id="advisor" className="py-24 lg:py-32 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#1A237E_0%,_transparent_40%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-[#FF9800] border border-orange-500/20 clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Hệ thống gợi ý thông minh</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tighter mb-4">Nhận Thiết Kế Lộ Trình 10 Giây</h2>
            <p className="text-slate-400 font-medium text-lg">Hệ thống thuật toán của TOXI sẽ phân tích mục tiêu và năng lực hiện tại của bạn để thiết lập sơ đồ chặng đường học tập tối ưu nhất.</p>
          </div>

          <div className="bg-slate-850 border border-slate-750 p-8 sm:p-12 shadow-2xl rounded-sm clip-diagonal max-w-3xl mx-auto relative">

            {/* Step indicators */}
            <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border ${advisorStep >= step
                    ? 'bg-[#FF9800] border-[#FF9800] text-slate-950 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${advisorStep > step ? 'bg-[#FF9800]' : 'bg-slate-800'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Wizard Content */}
            {advisorStep === 0 && (
              <div className="text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center rounded-full mx-auto text-[#FF9800]">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-black text-white">Bắt đầu thiết kế Lộ Trình Học</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Lộ trình được tinh chỉnh để bám sát mục tiêu thực tiễn, phân phối bài học khoa học giúp tối thiểu 45% thời gian học lý thuyết suông.
                </p>
                <button onClick={() => setAdvisorStep(1)} className="px-8 py-3.5 bg-[#FF9800] text-slate-950 font-heading font-black uppercase text-xs tracking-widest clip-diagonal hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10">
                  Khởi động ngay
                </button>
              </div>
            )}

            {advisorStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h4 className="text-lg font-heading font-black text-white text-center">Bước 1: Mục tiêu tối cao của bạn là gì?</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { id: 'taobao', title: 'Nhập hàng Taobao/1688 & Logistics', desc: 'Tìm hàng, thương thảo giá cả, thanh toán & ký gửi.' },
                    { id: 'business', title: 'Thăng tiến Doanh nghiệp FDI', desc: 'Thuyết trình, đàm phán, viết email & giao tiếp công sở.' },
                    { id: 'hsk', title: 'Thi HSK 3-6 để Du học / Việc làm', desc: 'Bám sát khung HSK 3.0 mới, cam kết đỗ 100%.' },
                    { id: 'daily', title: 'Giao tiếp Phản xạ đời sống', desc: 'Làm chủ phát âm bản xứ, tự tin giao tiếp cơ bản.' }
                  ].map((g) => (
                    <button key={g.id} onClick={() => { setAdvGoal(g.id); setAdvisorStep(2); }}
                      className={`p-6 text-left border rounded-sm transition-all duration-300 hover:border-[#FF9800] group relative ${advGoal === g.id ? 'bg-indigo-950/20 border-[#FF9800]' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}>
                      <h5 className="font-bold text-white text-sm flex items-center justify-between">
                        {g.title}
                        <ChevronRight className="w-4 h-4 text-[#FF9800] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h5>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {advisorStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h4 className="text-lg font-heading font-black text-white text-center">Bước 2: Thời gian bạn có thể cam kết ôn tập mỗi ngày?</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { id: 'short', title: '15 - 30 phút/ngày', label: 'Micro-Learning', desc: 'Học chia nhỏ, nhắc nhở liên tục qua ứng dụng di động.' },
                    { id: 'medium', title: '30 - 60 phút/ngày', label: 'Standard Path', desc: 'Tốc độ tiêu chuẩn, cân bằng tuyệt đối giữa lý thuyết và thực hành.' },
                    { id: 'long', title: 'Trên 60 phút/ngày', label: 'Speed-Run', desc: 'Cường độ cao, bứt phá phản xạ và chứng chỉ thần tốc.' }
                  ].map((c) => (
                    <button key={c.id} onClick={() => { setAdvCommitment(c.id); setAdvisorStep(3); }}
                      className={`p-6 text-left border rounded-sm transition-all duration-300 hover:border-[#FF9800] ${advCommitment === c.id ? 'bg-indigo-950/20 border-[#FF9800]' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}>
                      <span className="inline-block px-2 py-0.5 bg-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-wider mb-2">{c.label}</span>
                      <h5 className="font-bold text-white text-sm">{c.title}</h5>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <button onClick={() => setAdvisorStep(1)} className="text-xs text-slate-450 hover:text-white transition-colors underline">Quay lại bước trước</button>
                </div>
              </div>
            )}

            {advisorStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h4 className="text-lg font-heading font-black text-white text-center">Bước 3: Trình độ tiếng Trung hiện tại của bạn?</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { id: 'zero', title: 'Chưa biết gì', desc: 'Hoàn toàn mới bắt đầu từ con số 0 tròn trĩnh.' },
                    { id: 'basic', title: 'Biết Pinyin cơ bản', desc: 'Đã nhận biết được hệ âm phát âm cơ bản, chưa tự ghép câu.' },
                    { id: 'inter', title: 'Đã có nền tảng HSK', desc: 'Nắm được 300+ từ vựng, muốn nâng cao lên đàm phán/chuyên sâu.' }
                  ].map((l) => (
                    <button key={l.id} onClick={() => { setAdvLevel(l.id); setAdvisorStep(4); }}
                      className={`p-6 text-left border rounded-sm transition-all duration-300 hover:border-[#FF9800] ${advLevel === l.id ? 'bg-indigo-950/20 border-[#FF9800]' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}>
                      <h5 className="font-bold text-white text-sm">{l.title}</h5>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{l.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <button onClick={() => setAdvisorStep(2)} className="text-xs text-slate-450 hover:text-white transition-colors underline">Quay lại bước trước</button>
                </div>
              </div>
            )}

            {advisorStep === 4 && (() => {
              const res = getAdvisorResult();
              return (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5" /> Thiết lập lộ trình thành công
                    </span>
                    <h4 className="text-2xl font-heading font-black text-white">{res.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Thời gian dự kiến để làm chủ: <strong className="text-white">{res.duration}</strong></p>
                  </div>

                  <div className="bg-slate-900 border border-slate-750 p-6 clip-diagonal">
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{res.desc}</p>

                    <div className="border-t border-slate-800 pt-4">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Các mốc chặng đường học tập của bạn:</h5>
                      <ul className="space-y-3">
                        {res.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/30 flex items-center justify-center text-[10px] font-black text-[#FF9800] shrink-0 mt-0.5">{idx + 1}</span>
                            <span className="text-xs text-slate-350 font-medium leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={resetAdvisor} className="flex-1 py-4 border border-slate-750 text-slate-300 text-xs font-heading font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all clip-diagonal">
                      Tính toán lại
                    </button>
                    <button onClick={() => handleApplyAdvisorResult(res.recommendedCourseId, res.courseTitle, res.customNotes)}
                      className="flex-1 py-4 bg-[#FF9800] hover:bg-orange-600 text-slate-950 text-xs font-heading font-black uppercase tracking-widest transition-all clip-diagonal shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                      Nhận chi tiết lộ trình này <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* INTERACTIVE AI TUTOR SIMULATOR */}
      <section id="simulator" className="py-24 lg:py-32 relative overflow-hidden bg-slate-950 border-t border-b border-slate-800">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 clip-diagonal bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-heading font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4 text-[#FF9800]" /> Trải nghiệm công nghệ tiên phong
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter mb-6 leading-tight">Trình Giả Lập Gia Sư Ảo AI</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              TOXI EDU là đơn vị đi đầu trong tích hợp mô hình Generative AI tương tác thực tế. Hãy trải nghiệm trực tiếp cách AI Mentor phân tích lỗi và sửa lỗi cho bạn bên dưới.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-750 clip-diagonal overflow-hidden shadow-2xl max-w-4xl mx-auto">
            {/* Header simulation */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/40"></div>
              </div>
              <div className="text-[10px] font-heading font-black text-slate-550 uppercase tracking-[0.2em]">Toxi AI Sandbox Terminal v2.1</div>
              <div className="w-6"></div>
            </div>

            <div className="grid md:grid-cols-3">
              {/* Sidebar Tabs */}
              <div className="border-r border-slate-850 p-6 bg-slate-950/50 space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Danh mục tương tác:</span>
                {[
                  { id: 'pronounce', label: '🎙️ Luyện Phát Âm (ASR)', desc: 'Phân tích thanh điệu.' },
                  { id: 'firstprinciples', label: '🧩 Phân Tích Gốc Rễ', desc: 'Giải cấu trúc chữ Hán.' },
                  { id: 'taobao', label: '💬 Đàm thoại Taobao', desc: 'Thương lượng giá cả.' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setSimTab(tab.id as any); setSimVoiceState('idle'); setSimVoiceScore(null); }}
                    className={`w-full text-left p-4 clip-diagonal border transition-all duration-300 ${simTab === tab.id ? 'bg-[#1A237E]/45 border-[#FF9800] text-white' : 'bg-slate-900/40 border-slate-800 text-slate-450 hover:bg-slate-900'}`}
                  >
                    <div className="font-bold text-xs">{tab.label}</div>
                    <div className="text-[9px] text-slate-500 mt-1">{tab.desc}</div>
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-2 p-8 sm:p-10 flex flex-col justify-center min-h-[350px]">

                {simTab === 'pronounce' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <span className="text-xs font-bold text-[#FF9800] uppercase tracking-wider block mb-1">Thử thách nói từ vựng sau:</span>
                      <h4 className="text-4xl font-heading font-black text-white tracking-tight">上海 <span className="text-indigo-400 font-bold text-lg font-sans ml-2">(Shànghǎi - Thượng Hải)</span></h4>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-sm border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${simVoiceState === 'recording' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-350'}`}>
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {simVoiceState === 'idle' && 'Bấm nút để mô phỏng phát âm'}
                            {simVoiceState === 'recording' && '🔴 Đang nghe thử âm thanh của bạn...'}
                            {simVoiceState === 'analyzing' && '⚙️ AI đang chấm điểm thanh điệu...'}
                            {simVoiceState === 'done' && '✓ Đã hoàn tất chấm điểm'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {simVoiceState === 'idle' && 'Toxi AI sẽ chấm điểm phát âm từ 0 - 100'}
                            {simVoiceState === 'recording' && 'Hãy mô phỏng phát âm "Shànghǎi" trong đầu.'}
                            {simVoiceState === 'analyzing' && 'Phân tích sóng âm tần số và trường độ.'}
                            {simVoiceState === 'done' && 'Bấm phía dưới để thử lại'}
                          </p>
                        </div>
                      </div>

                      {simVoiceState === 'idle' && (
                        <button onClick={triggerVoiceSimulation} className="px-4 py-2 bg-[#FF9800] text-slate-950 font-heading font-black uppercase text-[10px] tracking-widest clip-diagonal hover:bg-orange-600 transition-colors">
                          Nói thử
                        </button>
                      )}
                    </div>

                    {simVoiceState === 'done' && (
                      <div className="p-5 bg-indigo-950/20 border border-slate-800 space-y-4 animate-in slide-in-from-bottom-3 duration-500">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Kết quả đánh giá AI:</div>
                          <span className="text-2xl font-heading font-black text-emerald-400">{simVoiceScore}/100</span>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed italic">
                          "Phát âm của bạn rất tốt! Phụ âm đầu <strong className="text-white">sh</strong> (quặt lưỡi) đạt độ dày âm vòm họng cực chuẩn. Tuy nhiên ở thanh điệu 3 của chữ <strong className="text-white">hǎi</strong>, âm sắc cần hạ sâu xuống đáy thanh quản hơn một chút trước khi vút nhẹ lên để đạt ngữ âm hoàn hảo nhất."
                        </p>
                        <button onClick={() => { setSimVoiceState('idle'); setSimVoiceScore(null); }} className="text-[10px] font-bold text-[#FF9800] hover:underline flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin-hover" /> Nhấp để thực hiện phát âm lại
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {simTab === 'firstprinciples' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <span className="text-xs font-bold text-[#FF9800] uppercase tracking-wider block mb-2">Tự giải mã chữ Hán qua nguyên tắc First Principles:</span>
                      <p className="text-xs text-slate-400">Học từ nguyên lý cốt lõi cấu thành chữ Hán để nhớ sâu mãi mãi, loại bỏ việc viết nháp 100 lần vô ích.</p>
                    </div>

                    <div className="flex gap-2 border-b border-slate-800 pb-3">
                      {[
                        { id: 'ming', label: '明 (Sáng)' },
                        { id: 'xiu', label: '休 (Nghỉ ngơi)' },
                        { id: 'qi', label: '企 (Doanh nghiệp)' }
                      ].map((char) => (
                        <button key={char.id} onClick={() => setActiveDecodedChar(char.id as any)}
                          className={`px-3 py-1.5 border text-xs font-bold transition-all ${activeDecodedChar === char.id ? 'bg-[#FF9800] border-[#FF9800] text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                          {char.label}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-950 p-6 rounded-sm border border-slate-800 min-h-[160px] flex flex-col justify-center">
                      {activeDecodedChar === 'ming' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl font-heading font-black text-white">明</span>
                            <div className="text-slate-400 text-2xl font-light font-sans">= 日 (Mặt trời) + 月 (Mặt trăng)</div>
                          </div>
                          <p className="text-xs text-slate-350 leading-relaxed">
                            💡 <strong>Tư duy giải nghĩa:</strong> Sự kết hợp giữa hai nguồn phát sáng mạnh nhất của vũ trụ: Nhật (Mặt trời - ban ngày) và Nguyệt (Mặt trăng - ban đêm). Hai thực thể ánh sáng giao thoa đại diện cho sự <strong>rõ ràng, tươi sáng, thông thái</strong> và <strong>minh triết</strong>.
                          </p>
                        </div>
                      )}

                      {activeDecodedChar === 'xiu' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl font-heading font-black text-white">休</span>
                            <div className="text-slate-400 text-2xl font-light font-sans">= 人 (Người) + 木 (Cây)</div>
                          </div>
                          <p className="text-xs text-slate-350 leading-relaxed">
                            💡 <strong>Tư duy giải nghĩa:</strong> Hình ảnh trực quan của một con <strong>Người (人)</strong> đang ngả lưng tựa vào một <strong>Gốc cây (木)</strong> mát mẻ bên đường. Chữ Hán được vẽ ra để thể hiện trực tiếp trạng thái <strong>nghỉ ngơi, hồi phục năng lượng</strong> và thư thái sau những giờ làm việc mệt mỏi.
                          </p>
                        </div>
                      )}

                      {activeDecodedChar === 'qi' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl font-heading font-black text-white">企</span>
                            <div className="text-slate-400 text-2xl font-light font-sans">= 人 (Người) + 止 (Bàn chân/Dừng lại)</div>
                          </div>
                          <p className="text-xs text-slate-350 leading-relaxed">
                            💡 <strong>Tư duy giải nghĩa:</strong> Gốc rễ chữ cổ biểu thị một con <strong>Người (人)</strong> đứng kiễng gót chân lên trên mặt đất <strong>(止 - gốc nghĩa là chân)</strong> để rướn cao người ngóng trông về phương xa. Từ đó hình thành nên nghĩa "trông ngóng, mong mỏi". Trong kinh doanh, <strong>Xí nghiệp/Doanh nghiệp (企业)</strong> chính là nơi tập hợp những con người luôn có tầm nhìn xa trông rộng.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {simTab === 'taobao' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div>
                      <span className="text-xs font-bold text-[#FF9800] uppercase tracking-wider block mb-1">Mô phỏng đàm thoại nhập hàng thực chiến:</span>
                      <p className="text-[10px] text-slate-400 mb-2">Thực hành đối thoại 1:1 thương lượng giá cả trực tiếp với xưởng Trung Quốc.</p>
                    </div>

                    <div className="bg-slate-950 p-4 border border-slate-800 space-y-3 max-h-[220px] overflow-y-auto text-xs font-sans">
                      <div className="flex gap-2">
                        <span className="font-bold text-[#FF9800]">Học viên:</span>
                        <span className="text-slate-300">"老板，这款衣服能打折吗？我想进货50件。"</span>
                      </div>
                      <div className="flex gap-2 border-t border-slate-900 pt-2">
                        <span className="font-bold text-indigo-400">AI Xưởng:</span>
                        <span className="text-slate-300">"亲，50件的话可以给您<strong className="text-[#FF9800]">打8折</strong>哦。能接受吗？"</span>
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 p-4 border border-slate-800 rounded-sm">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#FF9800] shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="text-xs font-bold text-white block">Tư duy phân tích Tongxiao:</span>
                          <p className="text-[11px] text-slate-350 leading-relaxed mt-1">
                            ⚠️ <strong>Cảnh giác bẫy giảm giá:</strong> Rất nhiều người Việt nhầm lẫn "打8折" (dǎ bā zhé) là giảm giá 80%. Thực tế, trong tiếng Trung: <strong className="text-[#FF9800]">"Đánh mấy chiết" tức là BÁN VỚI MỨC GIÁ BẰNG MẤY PHẦN MƯỜI giá gốc</strong>. Do đó, "打8折" tức là bán với giá 80% (chỉ giảm giá 20% mà thôi).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-medium">
              * Đây là trình mô phỏng tương tác. Khi vào học chính thức, bạn sẽ tương tác qua Micro và Camera thời gian thực trên Hệ điều hành học tập TOXI LMS.
            </div>
          </div>
        </div>
      </section>

      {/* THE SCIENTIFIC METHODOLOGY SYSTEM */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1A237E_0%,_transparent_45%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Chứng cứ khoa học</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tighter mb-4">Hệ Thống Khoa Học Đào Tạo</h2>
            <p className="text-slate-400 font-medium text-lg">TOXI loại bỏ triệt để lối học "ăn may". Chúng tôi xây dựng giáo trình dựa trên các lý thuyết và cấu trúc khoa học nhận thức hiện đại.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 items-start">

            {/* Left Nav Tabs */}
            <div className="space-y-2 lg:col-span-1">
              {[
                { id: 'memory', label: '🧠 Khoa Học Trí Nhớ (SRS)', desc: 'Forgetting Curve & Spaced Repetition' },
                { id: 'principles', label: '🧩 Tư Duy Gốc Rễ (First Principles)', desc: 'Học bộ thủ và ngữ căn ngôn ngữ' },
                { id: 'hsk3', label: '📊 Tiêu Chuẩn HSK 3.0 Mới', desc: 'Định nghĩa lại chuẩn 9 bậc toàn diện' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSciTab(tab.id as any)}
                  className={`w-full text-left p-5 border clip-diagonal transition-all duration-300 ${activeSciTab === tab.id ? 'bg-[#1A237E]/40 border-[#FF9800] text-white shadow-xl shadow-indigo-950/20' : 'bg-slate-850 border-slate-750 text-slate-400 hover:bg-slate-800'}`}
                >
                  <h4 className="font-heading font-black text-xs uppercase tracking-wide">{tab.label}</h4>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-medium">{tab.desc}</p>
                </button>
              ))}
            </div>

            {/* Right Display Board */}
            <div className="lg:col-span-3 bg-slate-850 border border-slate-750 p-8 sm:p-12 clip-diagonal min-h-[420px] flex flex-col justify-center relative">

              {activeSciTab === 'memory' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <span className="inline-block px-2 py-0.5 bg-orange-500/10 text-[#FF9800] text-[9px] font-black uppercase tracking-wider">SRS Algorithm</span>
                      <h4 className="text-2xl font-heading font-black text-white">Chống Lại Đường Cong Lãng Quên Ebbinghaus</h4>
                      <p className="text-xs text-slate-350 leading-relaxed font-medium">
                        Khi bạn tiếp nhận một từ mới, não bộ sẽ nhanh chóng quên đi 80% lượng kiến thức chỉ sau 48 giờ.
                      </p>
                      <p className="text-xs text-[#FF9800] leading-relaxed font-bold">
                        Hệ thống nhắc nhở của TOXI sẽ tự động tính toán thời điểm "vàng" (ngay trước khi não bộ chuẩn bị xóa dữ liệu) để đẩy bài tập ôn tập, giúp tái cấu trúc nơ-ron và khóa chặt kiến thức vào vùng nhớ dài hạn vĩnh viễn.
                      </p>
                    </div>

                    {/* Scientific chart rendered in gorgeous SVG */}
                    <div className="bg-slate-900 p-4 border border-slate-800 clip-diagonal relative">
                      <div className="text-[9px] font-black text-slate-550 uppercase tracking-widest mb-3 text-center">Biểu đồ ghi nhớ: SRS vs Học Vẹt</div>
                      <svg viewBox="0 0 300 180" className="w-full h-auto">
                        {/* Grid lines */}
                        <line x1="30" y1="20" x2="280" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="3" />
                        <line x1="30" y1="70" x2="280" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="3" />
                        <line x1="30" y1="120" x2="280" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="3" />
                        <line x1="30" y1="150" x2="280" y2="150" stroke="#334155" strokeWidth="2" />

                        {/* Axes */}
                        <line x1="30" y1="20" x2="30" y2="150" stroke="#334155" strokeWidth="2" />

                        {/* Labels */}
                        <text x="15" y="25" fill="#94a3b8" fontSize="8" fontWeight="bold">100%</text>
                        <text x="15" y="75" fill="#94a3b8" fontSize="8" fontWeight="bold">50%</text>
                        <text x="15" y="125" fill="#94a3b8" fontSize="8" fontWeight="bold">10%</text>
                        <text x="140" y="165" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Thời gian (Ngày học)</text>

                        {/* Traditional curve (Red) */}
                        <path d="M 30 20 Q 80 130 180 145 T 280 148" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                        <text x="75" y="110" fill="#ef4444" fontSize="8" fontWeight="black" transform="rotate(-30, 75, 110)">Lãng quên (Truyền thống)</text>

                        {/* SRS Curve (Green solid) */}
                        {/* 1st learn -> decay -> review at day 1 -> decay -> review at day 3 -> decay -> review at day 7 */}
                        <path d="M 30 20 L 60 70 L 60 20 L 110 50 L 110 20 L 180 40 L 180 20 L 280 25" fill="none" stroke="#22c55e" strokeWidth="2.5" />

                        {/* Flashpoints of review */}
                        <circle cx="60" cy="20" r="3" fill="#FF9800" />
                        <circle cx="110" cy="20" r="3" fill="#FF9800" />
                        <circle cx="180" cy="20" r="3" fill="#FF9800" />

                        <text x="200" y="45" fill="#22c55e" fontSize="9" fontWeight="black">TOXI Spaced Repetition</text>
                      </svg>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Trí nhớ dài hạn</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Quên lãng nhanh chóng</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSciTab === 'principles' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="max-w-xl">
                    <span className="inline-block px-2 py-0.5 bg-orange-500/10 text-[#FF9800] text-[9px] font-black uppercase tracking-wider mb-2">First Principles Framework</span>
                    <h4 className="text-2xl font-heading font-black text-white mb-3">Tư Duy Từ Nguyên Lý Gốc Rễ Chữ Hán</h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-medium mb-4">
                      Rất nhiều nơi dạy tiếng Trung bằng cách ép học viên viết đi viết lại một chữ 100 lần. Đó là cách học phản khoa học và tốn năng lượng của não bộ.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Phương pháp <strong className="text-white">Tongxiao Method</strong> hướng học viên nhìn nhận tiếng Trung theo hệ thống <strong className="text-white">Bộ thủ (Radicals) và Ngữ căn</strong>. Khi hiểu rõ nguồn gốc hình thành của chữ Hán (Chữ tượng hình, tượng ý), bạn chỉ cần nhìn qua một lần là có thể hiểu được bản chất ngữ nghĩa và tự suy luận từ mới cực kỳ chuẩn xác.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-slate-750 pt-6">
                    <div className="bg-slate-900 p-4 border border-slate-800 text-center">
                      <span className="text-3xl font-heading font-black text-white block mb-1">214</span>
                      <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider block">Bộ Thủ Cốt Lõi</span>
                      <span className="text-[9px] text-slate-500 mt-1 block">Xương sống tạo hình của hàng vạn chữ Hán phức tạp.</span>
                    </div>
                    <div className="bg-slate-900 p-4 border border-slate-800 text-center">
                      <span className="text-3xl font-heading font-black text-white block mb-1">80%</span>
                      <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider block">Giảm Tải Ghi Nhớ</span>
                      <span className="text-[9px] text-slate-500 mt-1 block">Không cần học vẹt nét bút, chỉ học nguyên lý ghép bộ ý nghĩa.</span>
                    </div>
                    <div className="bg-slate-900 p-4 border border-slate-800 text-center">
                      <span className="text-3xl font-heading font-black text-white block mb-1">100%</span>
                      <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider block">Tự Suy Luận Nghĩa</span>
                      <span className="text-[9px] text-slate-500 mt-1 block">Tự phân tích và đoán nghĩa từ mới chính xác trong văn bản thực tế.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSciTab === 'hsk3' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-orange-500/10 text-[#FF9800] text-[9px] font-black uppercase tracking-wider mb-2">HSK 3.0 Standard Compliance</span>
                    <h4 className="text-2xl font-heading font-black text-white mb-3">Đào Tạo Theo Chuẩn HSK 3.0 Toàn Diện Mới Nhất</h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-medium">
                      Hệ thống HSK 6 cấp cũ (HSK 2.0) đã bộc lộ nhiều điểm yếu khi chỉ thi Nghe - Đọc - Viết trên giấy, tạo ra những học viên đạt điểm cao nhưng hoàn toàn "câm điếc" trong giao tiếp thực tế.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-slate-750 bg-slate-900/60">
                          <th className="p-3 font-bold text-white uppercase tracking-wider">Tiêu chí phân biệt</th>
                          <th className="p-3 font-bold text-red-400 uppercase tracking-wider">Hệ thống cũ HSK 2.0</th>
                          <th className="p-3 font-bold text-emerald-400 uppercase tracking-wider">Hệ HSK 3.0 ✕ TOXI ĐÀO TẠO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="p-3 font-bold text-slate-300">Phân cấp trình độ</td>
                          <td className="p-3 text-slate-450">6 Cấp học đơn giản</td>
                          <td className="p-3 text-white font-medium">9 Bậc (3 Giai đoạn: Sơ - Trung - Cao cấp)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-300">Kỹ năng bắt buộc</td>
                          <td className="p-3 text-slate-450">Chỉ thi Nghe, Đọc, Viết (dễ học vẹt để đối phó)</td>
                          <td className="p-3 text-white font-medium">Tích hợp 5 kỹ năng: Nghe, Nói, Đọc, Viết, Biên-Phiên Dịch</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-300">Tính thực chiến</td>
                          <td className="p-3 text-slate-450">Nặng về học thuật, thiếu tình huống công sở đời thực</td>
                          <td className="p-3 text-white font-medium">Lấy ứng dụng làm gốc rễ: Logistics, Taobao, Gaode, Hợp đồng FDI</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Premium Philosophy Bento */}
      <section className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Giá trị cốt lõi</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tighter mb-4">Triết Lý Giáo Dục Đột Phá</h2>
            <p className="text-slate-450 font-medium text-lg max-w-2xl mx-auto">Kết hợp tư duy tinh gọn (Lean) cùng học hỏi từ nền tảng gốc rễ (First Principles) — không học vẹt, nhớ sâu dài hạn.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300">

            {/* Bento Card 1: Main Philosophy */}
            <div className="md:col-span-2 bg-slate-900 clip-diagonal p-12 border border-slate-800 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:border-[#FF9800]/30">
              <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/5 clip-diagonal transition-transform duration-700 group-hover:scale-110 translate-x-10 -translate-y-10" />
              <div className="w-20 h-20 bg-[#FF9800] clip-diagonal flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-orange-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Compass className="w-10 h-10 text-slate-950" />
              </div>
              <h3 className="text-4xl font-heading font-black text-white mb-6 relative z-10 tracking-tight">
                Học để ứng dụng thực tế <br className="hidden sm:block" />
                <span className="text-[#FF9800] font-culture text-5xl leading-tight">(学以致用)</span>
              </h3>
              <p className="text-slate-400 font-medium leading-relaxed text-lg relative z-10 max-w-xl">
                Tại TOXI, chúng tôi loại bỏ các kiến thức hàn lâm rườm rà. Mục tiêu cốt lõi là học viên có thể tự tin đàm phán hợp đồng thương mại, đặt hàng Taobao, dẫn đường trên Gaode Map và thấu hiểu văn hóa doanh nghiệp Trung Quốc ngay lập tức.
              </p>
            </div>

            {/* Bento Card 2: Vision & Mission */}
            <div className="bg-gradient-to-b from-[#1A237E] to-[#311B92] clip-diagonal p-12 shadow-xl relative overflow-hidden flex flex-col justify-end text-white min-h-[360px] group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-indigo-500/35 border border-slate-750">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF9800]/20 blur-2xl group-hover:scale-150 transition-transform duration-700 clip-diagonal" />
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md clip-diagonal flex items-center justify-center mb-auto relative z-10">
                <Target className="w-8 h-8 text-[#FF9800]" />
              </div>
              <h3 className="text-3xl font-heading font-black mb-4 relative z-10 tracking-tight">Sứ Mệnh &<br />Tầm Nhìn</h3>
              <p className="text-indigo-150 font-medium leading-relaxed relative z-10 text-sm">
                Xây dựng thế hệ người Việt làm chủ tiếng Trung bằng công nghệ AI, nâng cao vị thế và năng lực cạnh tranh trong thị trường kinh tế quốc tế sôi động.
              </p>
            </div>

            {/* Bento Card 3: 5 Stages Roadmap */}
            <div className="md:col-span-3 bg-slate-900 clip-diagonal p-10 md:p-14 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-12 group hover:-translate-y-2 transition-transform duration-500">
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-6">Chất lượng học thuật</span>
                <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-6 tracking-tight">Quy Trình Chuẩn Hóa 5 Giai Đoạn</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-8 text-base">
                  TOXI thiết lập quy trình kiểm soát học tập chặt chẽ. Học viên trải qua từng chặng thử thách rõ ràng, kết thúc bằng một <strong>"Dự án Tốt nghiệp Thực tế"</strong> — thuyết trình hoặc pitching cơ hội kinh doanh hoàn toàn bằng tiếng Trung trước ban giám khảo chuyên gia.
                </p>
                <a href="#advisor" className="inline-flex items-center gap-2 text-[#FF9800] font-heading font-black hover:text-orange-450 text-sm uppercase tracking-widest transition-colors">
                  Tìm hiểu lộ trình giảng dạy <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="flex-1 w-full bg-slate-950 clip-diagonal p-8 md:p-10 border border-slate-800">
                <p className="text-[10px] font-heading font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Xương sống chặng đường học tập</p>
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
                        <span className="text-sm font-black text-white block">{s.title}</span>
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
      <section className="py-24 lg:py-32 bg-slate-900 relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1A237E]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 clip-diagonal bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-heading font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4" /> Hệ sinh thái tiên phong
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter mb-6 leading-tight">Mô Hình Học Tập Tích Hợp AI 24/7</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              TOXI EDU là đơn vị tiên phong ứng dụng sâu Trí tuệ nhân tạo (AI Generative) kết hợp giáo trình số tương tác thực chiến tại Việt Nam.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-10 h-10 text-[#FF9800]" />,
                bg: 'bg-orange-500/10',
                border: 'hover:border-orange-550',
                title: 'Trợ lý AI Mentor 24/7',
                desc: 'Hệ thống AI chuyên biệt chấm chữa phát âm Pinyin chuẩn bản xứ, phân tích lỗi sai ngữ pháp, và đóng vai đối tác hội thoại tiếng Trung bất cứ khi nào bạn rảnh.'
              },
              {
                icon: <Smartphone className="w-10 h-10 text-indigo-400" />,
                bg: 'bg-indigo-500/10',
                border: 'hover:border-indigo-400',
                title: 'Học Liệu Số Đa Phương Tiện',
                desc: 'Khóa học không giới hạn ở trang sách. Học viên được trực tiếp đàm phán trên Taobao/1688, dẫn đường qua Gaode Map, lập tài khoản Alipay ngay trong hệ thống học.'
              },
              {
                icon: <Target className="w-10 h-10 text-emerald-450" />,
                bg: 'bg-emerald-500/10',
                border: 'hover:border-emerald-400',
                title: 'Phương Pháp Tongxiao Độc Quyền',
                desc: 'Nghiên cứu bởi các chuyên gia ngôn ngữ hàng đầu, cá nhân hóa lộ trình dựa trên dữ liệu đánh giá liên tục, lấp đầy các khoảng trống kiến thức ngay lập tức.'
              },
            ].map((item, idx) => (
              <div key={idx} className={`p-10 md:p-12 clip-diagonal border border-slate-800 bg-slate-950 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${item.border} group relative overflow-hidden`}>
                <div className={`absolute -right-6 -top-6 w-32 h-32 ${item.bg} clip-diagonal blur-xl group-hover:scale-150 transition-transform duration-700 opacity-50`} />
                <div className={`w-20 h-20 ${item.bg} clip-diagonal flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-heading font-black text-white mb-4 tracking-tight group-hover:text-[#FF9800] transition-colors relative z-10">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Faculty Team */}
      <section className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1A237E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-[#FF9800] border border-orange-500/20 clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Đội ngũ sáng lập & giảng huấn</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter mb-4">Chuyên Gia Đồng Hành</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Quy tụ các chuyên gia Hán ngữ giàu kinh nghiệm thực chiến, tận tâm, sở hữu trình độ học thuật cao và khả năng ứng dụng công nghệ vượt trội.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {TEACHERS.map((teacher, idx) => (
              <div key={idx} className="bg-slate-905/70 border border-slate-800 p-8 md:p-12 clip-diagonal flex flex-col md:flex-row items-center md:items-start gap-8 group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:border-indigo-500/20">
                {/* Temporarily hidden teacher avatar
                <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border-4 border-slate-800 shadow-lg relative group-hover:scale-105 transition-transform duration-500">
                  <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                */}
                <div className="space-y-4 text-center md:text-left flex-1">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-1 text-[#FF9800] mb-1">
                      <Award className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-black uppercase tracking-widest">Giảng viên xuất sắc</span>
                    </div>
                    <h3 className="text-2xl font-heading font-black text-white">{teacher.name}</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">{teacher.title}</p>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{teacher.bio}</p>

                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Thành tựu tiêu biểu</p>
                    <ul className="space-y-2">
                      {teacher.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-350">
                          <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
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
          <div className="mt-20 p-10 bg-gradient-to-br from-[#1A237E] to-[#311B92] border border-slate-750 clip-diagonal text-white relative overflow-hidden group shadow-2xl">
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
      <section className="py-24 bg-slate-900 relative overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 clip-diagonal text-xs font-heading font-black uppercase tracking-widest mb-4">Thông tin pháp lý chính thức</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tighter mb-4">Bảo Chứng Hoạt Động Doanh Nghiệp</h2>
            <p className="text-slate-400 font-medium text-lg">TOXI EDU hoạt động minh bạch dưới sự quản lý trực tiếp của Công ty TNHH TOXI, tuân thủ nghiêm ngặt các quy định pháp luật.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-8 clip-diagonal hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 clip-diagonal flex items-center justify-center mb-6">
                <Landmark className="w-6 h-6 text-[#FF9800]" />
              </div>
              <h4 className="text-lg font-heading font-black text-white uppercase mb-3">Pháp nhân chủ quản</h4>
              <p className="text-sm font-bold text-slate-350">CÔNG TY TNHH TOXI</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Đăng ký kinh doanh và hoạt động đào tạo chính quy, định hướng công nghệ giáo dục.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 clip-diagonal hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 clip-diagonal flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-[#FF9800]" />
              </div>
              <h4 className="text-lg font-heading font-black text-white uppercase mb-3">Lĩnh vực hoạt động</h4>
              <p className="text-sm font-bold text-slate-350">EdTech - Đào tạo Ngoại ngữ & Nghiên cứu AI</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Nghiên cứu ứng dụng trí tuệ nhân tạo (AI) vào việc tối ưu hóa giảng dạy tiếng Trung và ngôn ngữ.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 clip-diagonal hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 clip-diagonal flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6 text-[#FF9800]" />
              </div>
              <h4 className="text-lg font-heading font-black text-white uppercase mb-3">Cam kết vàng 100%</h4>
              <p className="text-sm font-bold text-slate-350">Cam kết chuẩn đầu ra bằng hợp đồng</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Hoàn trả học phí hoặc hỗ trợ học lại miễn phí 100% nếu học viên đi học đầy đủ nhưng không đạt chứng chỉ/phản xạ mong muốn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section & Inline Form */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF9800]/5 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="relative mb-10 group">
            <div className="absolute -inset-10 bg-white/5 clip-diagonal blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
            <img
              src="/assets/images/toxi_chinese_vertical.png"
              alt="Tiếng Trung TOXI"
              className="relative h-44 md:h-56 object-contain hover:scale-105 transition-transform duration-700 drop-shadow-2xl brightness-0 invert"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-2 clip-diagonal bg-white/10 border border-white/20 text-[#FF9800] text-xs font-heading font-black uppercase tracking-[0.2em] mb-6 shadow-sm backdrop-blur-sm">
            ✦ KHÁM PHÁ NĂNG LỰC TIẾNG TRUNG ✦
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 tracking-tight">Nhận Thiết Kế Lộ Trình Thực Chiến</h2>
          <p className="text-indigo-150 font-medium mb-12 max-w-2xl text-base md:text-lg leading-relaxed">
            Hãy để các chuyên gia giáo dục của TOXI EDU phân tích kỹ năng và thiết kế riêng lộ trình bám sát mục tiêu sự nghiệp của bạn — hoàn toàn miễn phí.
          </p>

          <button onClick={() => setModalOpen(true)} className="group relative flex items-center justify-center gap-3 bg-[#FF9800] text-slate-950 px-12 py-5 clip-diagonal-hover text-sm md:text-base font-heading font-black uppercase tracking-widest transition-all shadow-2xl shadow-orange-500/30 hover:-translate-y-2 hover:shadow-orange-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10">Đăng ký tư vấn lộ trình 1:1</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-[150px] font-culture text-white/5 select-none pointer-events-none whitespace-nowrap translate-y-1/4 translate-x-1/4">知行合一</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 clip-diagonal bg-[#1A237E] flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
            <div>
              <span className="text-lg font-heading font-black text-white uppercase tracking-tight block leading-none">TOXI EDU</span>
              <span className="text-[9px] font-bold text-slate-655 uppercase tracking-widest mt-1 block">Smart Learning Platform</span>
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
