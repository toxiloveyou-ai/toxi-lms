import React, { useState } from 'react';
import { 
  Search, BookOpen, Library, FileText, 
  Headphones, Globe, BookMarked, Sparkles, 
  ArrowRight, Download, Filter, BookmarkPlus,
  PlayCircle, ScrollText, Landmark, FileCheck
} from 'lucide-react';

// MOCK DATA: Các chuyên mục của Kho dữ liệu
const CATEGORIES = [
  { id: 'grammar', title: 'Ngữ pháp Cốt lõi', icon: BookOpen, desc: 'Hơn 500+ cấu trúc ngữ pháp từ cơ bản đến nâng cao.', color: 'from-blue-500 to-indigo-600' },
  { id: 'idioms', title: 'Thành ngữ & Tục ngữ', icon: ScrollText, desc: 'Giải nghĩa và nguồn gốc của 10,000+ câu Thành ngữ (Chengyu).', color: 'from-orange-400 to-red-500' },
  { id: 'hsk', title: 'Kho Đề thi HSK/TOCFL', icon: FileCheck, desc: 'Bộ đề thi thật qua các năm, kèm giải thích chi tiết.', color: 'from-emerald-400 to-teal-500' },
  { id: 'audio', title: 'Podcast & Audio', icon: Headphones, desc: 'Luyện nghe thụ động với hàng ngàn giờ Audio/Podcast.', color: 'from-pink-500 to-rose-500' },
  { id: 'books', title: 'Thư viện Sách & PDF', icon: Library, desc: 'Giáo trình, truyện song ngữ, sách học thuật.', color: 'from-purple-500 to-fuchsia-600' },
  { id: 'culture', title: 'Văn hóa & Lịch sử', icon: Landmark, desc: 'Khám phá chiều sâu văn hóa Trung Hoa.', color: 'from-amber-500 to-yellow-600' },
];

// MOCK DATA: Tài nguyên nổi bật
const FEATURED_RESOURCES = [
  {
    id: 'r1',
    title: 'Bộ 5000 Từ vựng HSK 1-6 (Bản chuẩn Hán Biểu)',
    type: 'PDF / Flashcard',
    downloads: '12.5K',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
    tag: 'Must-have'
  },
  {
    id: 'r2',
    title: 'Giải mã 100 Câu Thành Ngữ Thường Dùng Nhất',
    type: 'E-Book & Audio',
    downloads: '8.2K',
    thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800',
    tag: 'Trending'
  },
  {
    id: 'r3',
    title: 'Tổng hợp Đề thi HSK 4 (Năm 2023 - Có giải thích)',
    type: 'Đề thi Mẫu',
    downloads: '15.1K',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    tag: 'Hot'
  }
];

export default function EduLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="animate-in fade-in duration-700 bg-[#F9F6ED] min-h-screen pb-32 font-sans">
      
      {/* 1. HERO SECTION - CỖ MÁY TÌM KIẾM TRI THỨC */}
      <section className="relative overflow-hidden bg-[#2E3192] text-white pt-20 pb-28 px-6 lg:px-16 mx-4 mt-4 rounded-[3rem] shadow-2xl">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]" />
            {/* Chữ Hán chìm mờ */}
            <div className="absolute top-10 right-20 text-[200px] font-black text-white/[0.02] select-none leading-none">文</div>
            <div className="absolute bottom-10 right-80 text-[150px] font-black text-white/[0.02] select-none leading-none">学</div>
         </div>

         <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-orange-400">
               <Globe className="w-4 h-4" /> Kho Dữ Liệu Nhân Loại
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
               Bách Khoa Toàn Thư <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">Hán Ngữ & Văn Hóa.</span>
            </h1>
            
            <p className="text-white/70 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
               Tra cứu bất kỳ điều gì bạn muốn. Từ ngữ pháp cốt lõi, thành ngữ cổ, đến hàng ngàn đề thi và giáo trình chất lượng cao.
            </p>

            {/* Thanh Tìm kiếm Khổng lồ */}
            <div className="max-w-3xl mx-auto relative group mt-10">
               <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="w-6 h-6 text-slate-400 group-focus-within:text-[#2E3192] transition-colors" />
               </div>
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tra cứu từ vựng, ngữ pháp, đề thi, thành ngữ..." 
                  className="w-full pl-16 pr-32 py-6 bg-white rounded-3xl text-slate-900 font-medium text-lg focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-2xl transition-all"
               />
               <button className="absolute inset-y-2 right-2 px-8 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg">
                  Tra cứu
               </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 pt-4">
               <span className="text-sm font-medium text-white/50">Gợi ý:</span>
               {['Cấu trúc 把', 'Đề HSK 5', 'Thành ngữ', 'Podcast giao tiếp', 'Giáo trình Boya'].map(tag => (
                  <button key={tag} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white/80 transition-colors">
                     {tag}
                  </button>
               ))}
            </div>
         </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-16">
         
         {/* CATEGORIES GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
               const Icon = cat.icon;
               return (
                 <div key={cat.id} className="bg-white rounded-3xl p-8 border border-[#EADBC8] shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                       <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-[#2E3192] mb-3">{cat.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{cat.desc}</p>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-orange-500 transition-colors">
                       Khám phá <ArrowRight className="w-4 h-4" />
                    </div>
                 </div>
               );
            })}
         </div>

         {/* FEATURED RESOURCES */}
         <section className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-black text-[#2E3192] flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-orange-500" /> Tài nguyên nổi bật
               </h2>
               <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#2E3192] uppercase tracking-widest transition-colors">
                  <Filter className="w-4 h-4" /> Bộ lọc
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {FEATURED_RESOURCES.map((item) => (
                  <div key={item.id} className="bg-white rounded-[2rem] border border-[#EADBC8] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                     <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2E3192]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-[#2E3192] text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                           {item.tag}
                        </div>
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <FileText className="w-3 h-3 text-orange-500" /> {item.type}
                        </div>
                        <h3 className="text-lg font-bold text-[#2E3192] leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                           {item.title}
                        </h3>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              <Download className="w-4 h-4" /> {item.downloads} lượt tải
                           </span>
                           <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#2E3192] hover:text-white transition-colors">
                              <BookmarkPlus className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

      </div>
    </div>
  );
}
