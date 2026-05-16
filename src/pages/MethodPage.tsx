import { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Brain, Zap, RotateCcw, Mic, Bot, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav';

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
  { icon: <RotateCcw className="w-7 h-7 text-indigo-500" />, bg: 'bg-indigo-50', title: 'Spaced Repetition', desc: 'Thuật toán nhắc lại từ vựng và ngữ pháp đúng thời điểm não bộ chuẩn bị quên. Tối ưu hóa bộ nhớ dài hạn, giảm 60% thời gian ôn luyện.' },
  { icon: <Bot className="w-7 h-7 text-emerald-500" />, bg: 'bg-emerald-50', title: 'AI Tutor 24/7', desc: 'Gia sư ảo tích hợp Toxi AI, Doubao và Gemini. Sẵn sàng giải thích ngữ pháp, phân tích câu, tạo bài tập tùy chỉnh bất cứ lúc nào.' },
  { icon: <Mic className="w-7 h-7 text-orange-500" />, bg: 'bg-orange-50', title: 'Phân tích phát âm', desc: 'Nhận xét phát âm thời gian thực theo chuẩn Phổ Thông (Putonghua). Chỉ ra chính xác thanh điệu sai, âm đầu lẫn lộn và đề xuất cách sửa.' },
];

const stages = [
  { n: '01', title: 'Chuẩn hóa Âm', desc: 'Phát âm chuẩn Pinyin, nhận diện bộ thủ, xóa mù chữ Hán từ đầu.' },
  { n: '02', title: 'Tư duy Ngôn ngữ', desc: 'Nắm vững cấu trúc câu, "tư duy lượng từ" và logic ngữ pháp cơ bản.' },
  { n: '03', title: 'Survival Chinese', desc: 'Thực chiến tình huống ẩm thực, giao thông, mua sắm, gọi món...' },
  { n: '04', title: 'Tăng tốc HSK 3.0', desc: 'Chiến thuật làm bài, hoàn thiện 500+ từ vựng, giải đề thi thực chiến.' },
  { n: '05', title: 'Dự án Tốt nghiệp', desc: 'Thuyết trình & bảo vệ dự án (Business Pitching) 100% bằng tiếng Trung.' },
];

export default function MethodPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const faqs = [
    { q: 'Phương pháp Tongxiao khác gì so với học truyền thống?', a: 'Thay vì học thuộc lòng theo giáo trình tuyến tính, Tongxiao tập trung vào vòng lặp Học – Hành – Phản hồi, hiểu gốc rễ từ First Principles và ứng dụng ngay vào tình huống thực tế. AI liên tục cá nhân hóa tốc độ và nội dung học cho từng người.' },
    { q: 'Tôi cần bao nhiêu thời gian mỗi ngày để thấy hiệu quả?', a: 'Chỉ cần 30–45 phút/ngày nếu áp dụng đúng vòng lặp Spaced Repetition và thực hành hội thoại với AI Tutor. Nhiều học viên đạt HSK 3 sau 3 tháng với lịch học này.' },
    { q: 'Công nghệ AI có thể thay thế hoàn toàn giáo viên không?', a: 'Không. AI đóng vai trò "giàn giáo thông minh" (scaffolding) — hỗ trợ tối đa việc luyện tập lặp lại, phân tích lỗi và gợi ý bước tiếp theo. Giáo viên TOXI đảm nhiệm vai trò hướng dẫn chiến lược, sửa lỗi tư duy và truyền cảm hứng — điều AI chưa thể làm được.' },
    { q: 'Tongxiao có phù hợp với người bận rộn không có nhiều thời gian?', a: 'Hoàn toàn phù hợp. Hệ thống chia nhỏ bài học (micro-learning), cho phép học trên mobile bất cứ lúc nào, và AI Tutor nhắc bạn ôn đúng thời điểm để không bao giờ "học trước quên sau".' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#2E3192] selection:text-white">

      <PublicNav />

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2E3192_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-black uppercase tracking-widest mb-8">
            <Brain className="w-4 h-4" /> Phương pháp học độc quyền
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-4 leading-[1.05]">
            Tongxiao
          </h1>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 mb-6">
            通晓学习法
          </p>
          <p className="max-w-xl mx-auto text-base lg:text-xl text-slate-300 font-medium mb-8 leading-relaxed">
            Phương pháp học "Thông Suốt" — hội tụ triết lý Đông phương, tư duy First Principles phương Tây và sức mạnh của trí tuệ nhân tạo.
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-[#2E3192] hover:bg-orange-50 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105">
            Trải nghiệm ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest mb-6">Nghịch lý phổ biến</div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
                Vì sao có <span className="text-red-500">HSK cao</span> mà vẫn lúng túng trong thực tế?
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-8 text-lg">
                Hàng nghìn học viên có chứng chỉ HSK 4, HSK 5 nhưng vẫn bật Google Dịch khi vào phòng họp, vẫn không đặt được đồ ăn ở nhà máy hay hiểu đồng nghiệp Trung Quốc nói gì.
              </p>
              <div className="space-y-4">
                {['Học từ vựng rời rạc, không có ngữ cảnh', 'Luyện thi theo khuôn mẫu, không luyện tư duy', 'Không có môi trường thực hành thực tế'].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs font-black">✕</span>
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#2E3192] to-blue-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <div className="text-5xl font-black mb-2 text-white/20">通晓</div>
                <h3 className="text-2xl font-black mb-4">Giải pháp Tongxiao</h3>
                <p className="text-indigo-100 leading-relaxed mb-8">"Thông Suốt" không chỉ là biết — mà là am hiểu đến tận gốc rễ. Hiểu tại sao chữ đó có nghĩa vậy, tại sao câu đó được cấu trúc vậy, và ứng dụng được ngay lập tức trong đời thực.</p>
                <div className="space-y-3">
                  {['Học trong bối cảnh thực tế ngay từ đầu', 'Tư duy gốc rễ thay vì học thuộc', 'AI hỗ trợ thực hành 24/7'].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
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
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-[#2E3192] text-xs font-black uppercase tracking-widest mb-4">Hội tụ Đông – Tây – AI</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Ba Trụ Cột Lý Luận</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Kết hợp triết lý Khổng Tử, tư duy phương Tây và sức mạnh AI tạo nên phương pháp học toàn diện nhất.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className={`rounded-3xl border p-8 bg-white hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-slate-200/30 ${p.borderColor} hover:shadow-2xl group`}>
                <div className={`inline-block px-4 py-2 rounded-2xl bg-gradient-to-r ${p.color} text-white text-2xl font-black mb-4 tracking-wider shadow-lg`}>{p.hanzi}</div>
                <div className={`text-xs font-bold ${p.textColor} uppercase tracking-widest mb-2`}>{p.origin}</div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{p.label}</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm">{p.desc}</p>
                <ul className="space-y-2">
                  {p.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                      <CheckCircle2 className={`w-4 h-4 ${p.textColor} flex-shrink-0 mt-0.5`} />{pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Stage Roadmap */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Lộ Trình 5 Giai Đoạn</h2>
            <p className="text-slate-500 font-medium text-lg">Từ "Xóa mù chữ" đến "Thuyết trình Business Pitching" — chuẩn hóa và đo lường được.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2E3192] via-orange-400 to-emerald-400 hidden md:block" />
            <div className="space-y-6">
              {stages.map((s, i) => (
                <div key={i} className="flex gap-8 items-start group">
                  <div className="relative flex-shrink-0 hidden md:block">
                    <div className="w-16 h-16 rounded-2xl bg-[#2E3192] flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-black text-sm">{s.n}</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 group-hover:bg-indigo-50/30">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-[#2E3192] flex items-center justify-center text-white font-black text-xs md:hidden flex-shrink-0">{s.n}</span>
                      <h3 className="text-lg font-black text-slate-900">{s.title}</h3>
                    </div>
                    <p className="text-slate-600 font-medium">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#2E3192_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-black uppercase tracking-widest mb-4">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Cánh tay đắc lực
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">Toxi AI Engine</h2>
            <p className="text-slate-300 font-medium text-lg max-w-2xl mx-auto">AI không thay giáo viên — AI là "giàn giáo thông minh" (scaffolding) giúp bạn luyện tập đúng cách, đúng lúc, đúng liều lượng.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1">
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>{f.icon}</div>
                <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Câu hỏi thường gặp</h2>
            <p className="text-slate-500 font-medium">Giải đáp thắc mắc về phương pháp Tongxiao.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
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
      <section className="py-20 bg-gradient-to-r from-[#2E3192] to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Trải nghiệm Tongxiao ngay hôm nay</h2>
          <p className="text-indigo-100 font-medium text-lg mb-10 max-w-xl mx-auto">Đăng ký tư vấn miễn phí — chuyên viên TOXI sẽ thiết kế lộ trình Tongxiao phù hợp riêng cho bạn.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-[#2E3192] hover:bg-orange-50 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105">
            Xem các khóa học <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div>
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
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs">
            &copy; {new Date().getFullYear()} TOXI EDU. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
