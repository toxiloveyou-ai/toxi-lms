import React, { useState } from 'react';
import { 
  Search, BookOpen, Library, FileText, 
  Headphones, Globe, BookMarked, Sparkles, 
  ArrowRight, Download, Filter, BookmarkPlus,
  PlayCircle, ScrollText, Landmark, FileCheck,
  Zap, Clock, History, Star, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'grammar', title: 'Ngữ pháp Cốt lõi', icon: BookOpen, desc: 'Hơn 500+ cấu trúc ngữ pháp từ cơ bản đến nâng cao.', color: 'from-blue-600 to-indigo-700', count: '520+ Bài học' },
  { id: 'idioms', title: 'Thành ngữ & Tục ngữ', icon: ScrollText, desc: 'Giải nghĩa và nguồn gốc của 10,000+ câu Thành ngữ (Chengyu).', color: 'from-orange-500 to-rose-600', count: '10K+ Câu' },
  { id: 'hsk', title: 'Kho Đề thi HSK/TOCFL', icon: FileCheck, desc: 'Bộ đề thi thật qua các năm, kèm giải thích chi tiết.', color: 'from-emerald-500 to-teal-700', count: '120+ Bộ đề' },
  { id: 'audio', title: 'Podcast & Audio', icon: Headphones, desc: 'Luyện nghe thụ động với hàng ngàn giờ Audio/Podcast.', color: 'from-pink-500 to-purple-600', count: '850+ Giờ' },
  { id: 'books', title: 'Thư viện Sách & PDF', icon: Library, desc: 'Giáo trình, truyện song ngữ, sách học thuật.', color: 'from-violet-500 to-fuchsia-700', count: '300+ Tài liệu' },
  { id: 'culture', title: 'Văn hóa & Lịch sử', icon: Landmark, desc: 'Khám phá chiều sâu văn hóa Trung Hoa ngàn năm.', color: 'from-amber-500 to-orange-600', count: '50+ Chủ đề' },
];

const FEATURED_RESOURCES = [
  {
    id: 'r1',
    title: 'Bộ 5000 Từ vựng HSK 1-6 (Bản chuẩn Hán Biểu)',
    type: 'PDF / Flashcard',
    downloads: '12.5K',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
    tag: 'Bán chạy',
    difficulty: 'Mọi trình độ'
  },
  {
    id: 'r2',
    title: 'Giải mã 100 Câu Thành Ngữ Thường Dùng Nhất',
    type: 'E-Book & Audio',
    downloads: '8.2K',
    thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800',
    tag: 'Xu hướng',
    difficulty: 'Trung cấp'
  },
  {
    id: 'r3',
    title: 'Tổng hợp Đề thi HSK 4 (Năm 2023 - Có giải thích)',
    type: 'Đề thi Mẫu',
    downloads: '15.1K',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    tag: 'Nổi bật',
    difficulty: 'HSK 4'
  }
];

export default function EduLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative px-4 md:px-8 pt-8 md:pt-12">
        <div className="max-w-[1600px] mx-auto relative overflow-hidden bg-[#2E3192] rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-indigo-900/20">
          
          {/* Neural/Cultural Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[200px]" />
            <svg className="w-full h-full" viewBox="0 0 100 100">
               <defs>
                  <pattern id="chinesePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                     <text x="5" y="5" className="text-white text-[1px] font-black opacity-20" dominantBaseline="middle" textAnchor="middle">文</text>
                  </pattern>
               </defs>
               <rect width="100" height="100" fill="url(#chinesePattern)" />
            </svg>
          </div>

          <div className="relative z-10 px-6 md:px-16 pt-16 pb-24 md:pt-24 md:pb-36 flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-8"
            >
              <Globe className="w-4 h-4" /> Toxi Knowledge Engine
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-[0.95] max-w-4xl mb-8 uppercase"
            >
              Kho Tàng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-indigo-300">Tri Thức Hán Ngữ</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-sm md:text-lg font-medium max-w-2xl leading-relaxed mb-12 italic"
            >
              "Lấy tri thức làm bệ phóng." Truy cập vào kho dữ liệu khổng lồ gồm hơn 100,000+ tài liệu, đề thi và kiến thức chuyên sâu về văn hóa Trung Hoa.
            </motion.p>

            {/* Smart Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-3xl relative group"
            >
               <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-hover:duration-200" />
               <div className="relative flex items-center bg-white rounded-[2rem] p-2 md:p-3 shadow-2xl overflow-hidden">
                  <div className="pl-4 md:pl-6 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm vạn vật: ngữ pháp, đề thi, podcast..." 
                    className="flex-1 bg-transparent border-none px-4 py-3 md:py-4 text-slate-900 font-bold text-base md:text-lg focus:outline-none placeholder:text-slate-300"
                  />
                  <button className="hidden md:flex items-center gap-2 px-8 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-900 transition-all shadow-xl active:scale-95">
                    Tra cứu ngay
                  </button>
                  <button className="md:hidden p-4 bg-[#2E3192] text-white rounded-2xl active:scale-95">
                    <ArrowRight className="w-6 h-6" />
                  </button>
               </div>
            </motion.div>
            
            {/* Hot Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
               {['HSK 6', 'Thành ngữ cổ', 'Ngữ pháp Hán ngữ', 'Podcast Boya', 'Luyện thi TOCFL'].map((tag, i) => (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    key={tag} 
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white/60 uppercase tracking-widest transition-all"
                  >
                     {tag}
                  </motion.button>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION & TABS */}
      <div className="max-w-7xl mx-auto px-6 mt-8 md:mt-12">
        <div className="flex items-center gap-8 border-b border-slate-100 overflow-x-auto pb-px custom-scrollbar no-scrollbar">
           {['Tất cả', 'Phổ biến', 'Mới cập nhật', 'Đã lưu'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab.toLowerCase())}
               className={`relative py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${activeTab === tab.toLowerCase() ? 'text-[#2E3192]' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab}
               {activeTab === tab.toLowerCase() && (
                 <motion.div layoutId="activeTabLibrary" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E3192]" />
               )}
             </button>
           ))}
        </div>
      </div>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-6 mt-12 space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Khám phá chuyên mục</h2>
           <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {CATEGORIES.map((cat, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               key={cat.id} 
               className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#2E3192]/20 transition-all cursor-pointer flex flex-col"
             >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-900/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                   <cat.icon className="w-7 h-7" />
                </div>
                <div className="mb-8 flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#2E3192] transition-colors">{cat.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{cat.desc}"</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.count}</span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2E3192] group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 4. FEATURED RESOURCES */}
      <section className="max-w-7xl mx-auto px-6 mt-20 space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                 <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Tài nguyên chọn lọc</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Được đề xuất bởi đội ngũ Toxi AI</p>
              </div>
           </div>
           <button className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-[#2E3192] transition-all">
              <Filter className="w-5 h-5" />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {FEATURED_RESOURCES.map((item, idx) => (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               key={item.id} 
               className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group"
             >
                <div className="aspect-[16/10] relative overflow-hidden">
                   <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#2E3192] text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                        {item.tag}
                      </span>
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {item.difficulty}
                      </span>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> {item.type}
                   </div>
                   <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#2E3192] transition-colors">
                      {item.title}
                   </h3>
                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
                         <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> {item.downloads}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-all">
                           <BookmarkPlus className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-[#2E3192] flex items-center justify-center text-white shadow-lg shadow-indigo-900/20 active:scale-90 transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 5. HISTORY & RECENT ACTIVITY (NEW SECTION) */}
      <section className="max-w-7xl mx-auto px-6 mt-20 mb-20">
         <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400">
                    <History className="w-3.5 h-3.5" /> Gần đây
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none uppercase">Tiếp tục hành trình <br /><span className="text-indigo-400">khám phá</span></h2>
                  <p className="text-white/50 text-sm font-medium leading-relaxed">Hệ thống ghi nhớ các tài liệu bạn vừa xem để bạn có thể quay lại bất cứ lúc nào.</p>
               </div>
               <div className="space-y-4">
                  {[
                    { title: 'Ngữ pháp Bổ ngữ kết quả', time: '2 giờ trước', type: 'Lesson' },
                    { title: 'Podcast: Cuộc sống tại Bắc Kinh', time: '1 ngày trước', type: 'Audio' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xs font-black group-hover:text-indigo-400 transition-colors">{item.title}</p>
                             <p className="text-[10px] text-white/30 font-medium">{item.type} • {item.time}</p>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}
