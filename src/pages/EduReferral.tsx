import React, { useState, useEffect } from 'react';
import { 
  Share2, Users, Wallet, Gift, Copy, Check, 
  ChevronRight, Sparkles, Zap, Trophy, 
  ArrowUpRight, Heart, Star, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function EduReferral() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalInvited: 0,
    totalPaid: 0,
    totalEarned: 0,
    pendingCommissions: 0
  });
  const [referralHistory, setReferralHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  async function fetchReferralData() {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Profile & Referral Code
      const { data: profileData, error: profileError } = await supabase
        .from('toxi_profiles')
        .select('referral_code, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      let currentCode = profileData?.referral_code;

      // Generate referral code if not exists
      if (!currentCode) {
        currentCode = `TX${user.id.slice(0, 5).toUpperCase()}`;
        try {
          await supabase
            .from('toxi_profiles')
            .update({ referral_code: currentCode })
            .eq('id', user.id);
        } catch (e) {
          console.warn('Could not auto-generate referral code:', e);
        }
      }
      
      setProfile({ ...profileData, referral_code: currentCode });

      // 2. Fetch Stats (Mocked for now, will integrate with referrals/commissions tables later)
      setStats({
        totalInvited: 12,
        totalPaid: 4,
        totalEarned: 1250000,
        pendingCommissions: 450000
      });

      // 3. Fetch History (Mocked)
      setReferralHistory([
        { id: 1, name: 'Nguyễn Văn A', status: 'paid', date: '2024-05-10', amount: 250000 },
        { id: 2, name: 'Trần Thị B', status: 'pending', date: '2024-05-12', amount: 0 },
        { id: 3, name: 'Lê Văn C', status: 'paid', date: '2024-05-13', amount: 250000 },
      ]);

    } catch (err) {
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  }

  const referralLink = `${window.location.origin}/edu/explore?ref=${profile?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !profile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang tải dữ liệu đối tác...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. HERO HEADER */}
      <header className="relative p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-slate-900 via-[#1E2060] to-[#2E3192] text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Share2 className="w-64 h-64 rotate-12" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#2E3192]/50 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Toxi Partner Program</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              Chia sẻ tri thức <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Nhận hoa hồng</span> xứng đáng.
            </h1>
            
            <p className="text-white/60 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
              Giúp bạn bè chinh phục tiếng Trung Ứng Dụng và nhận ngay ưu đãi tài chính hấp dẫn từ Toxi Edu. Cùng nhau phát triển, cùng nhau thành công.
            </p>
          </div>

          <div className="w-full lg:w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Link giới thiệu của bạn</label>
              <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                <input 
                  type="text" 
                  readOnly 
                  value={referralLink}
                  className="flex-1 bg-transparent px-4 py-2 text-xs font-bold text-white outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-[#2E3192] hover:scale-105'}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Mã của bạn</p>
                <p className="text-2xl font-black text-emerald-400 tracking-tighter">{profile?.referral_code || '---'}</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <Share2 className="w-3.5 h-3.5" /> Chia sẻ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. STATS OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 group hover:border-emerald-500/20 transition-all">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900">{stats.totalInvited}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bạn bè đã mời</p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 group hover:border-[#2E3192]/20 transition-all">
          <div className="w-12 h-12 bg-indigo-50 text-[#2E3192] rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Gift className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900">{stats.totalPaid}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã đăng ký học</p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 group hover:border-orange-500/20 transition-all">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900">{stats.totalEarned.toLocaleString()}₫</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng hoa hồng</p>
          </div>
        </div>

        <div className="p-8 bg-[#1E2060] text-white rounded-[2.5rem] shadow-xl shadow-indigo-200/50 space-y-4 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-12 h-12" />
          </div>
          <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-white/10">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-3xl font-black text-white">{stats.pendingCommissions.toLocaleString()}₫</p>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Đang chờ xử lý</p>
          </div>
        </div>
      </section>

      {/* 3. TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Referral History */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lịch sử giới thiệu</h2>
            <button className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest hover:underline">Xem tất cả</button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người được mời</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hoa hồng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {referralHistory.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                          {item.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-black text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{item.date}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {item.status === 'paid' ? 'Đã thanh toán' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">
                      {item.amount > 0 ? `+${item.amount.toLocaleString()}₫` : '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: How it works & Leaderboard */}
        <section className="lg:col-span-4 space-y-8">
          {/* Leaderboard Card */}
          <div className="p-8 bg-gradient-to-br from-[#2E3192] to-[#1E2060] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-20">
               <Trophy className="w-12 h-12" />
             </div>
             
             <h3 className="text-xl font-black mb-6">Top Đại Sứ Toxi 🏆</h3>
             
             <div className="space-y-4">
                {[
                  { name: 'Hoàng Minh', earned: '12.5M', rank: 1 },
                  { name: 'Thanh Thảo', earned: '8.2M', rank: 2 },
                  { name: 'Quốc Bảo', earned: '5.4M', rank: 3 }
                ].map((top, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                       <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${
                         top.rank === 1 ? 'bg-yellow-400 text-slate-900' : 'bg-white/20'
                       }`}>
                         {top.rank}
                       </span>
                       <span className="text-sm font-bold">{top.name}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-400">{top.earned}</span>
                  </div>
                ))}
             </div>
             
             <p className="mt-6 text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Cập nhật hàng tuần</p>
          </div>

          {/* Guide Card */}
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
             <h3 className="text-lg font-black text-slate-900">3 Bước đơn giản 🚀</h3>
             <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="w-8 h-8 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#2E3192] font-black text-sm">1</div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">Chia sẻ link</p>
                      <p className="text-xs text-slate-500 font-medium">Gửi link giới thiệu hoặc mã QR cho bạn bè của bạn.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#2E3192] font-black text-sm">2</div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">Bạn bè đăng ký</p>
                      <p className="text-xs text-slate-500 font-medium">Hệ thống ghi nhận bạn là người giới thiệu ngay khi họ truy cập.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#2E3192] font-black text-sm">3</div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">Nhận hoa hồng</p>
                      <p className="text-xs text-slate-500 font-medium">Nhận 10-20% giá trị khóa học ngay khi họ thanh toán thành công.</p>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </div>

      {/* 4. CTA FOOTER */}
      <section className="p-10 md:p-16 rounded-[3rem] bg-emerald-500 text-white text-center space-y-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10">
            <Gift className="w-32 h-32" />
         </div>
         <h2 className="text-3xl md:text-4xl font-black tracking-tight relative z-10">
            Hợp tác bền vững cùng Toxi Edu
         </h2>
         <p className="text-white/80 font-medium max-w-2xl mx-auto relative z-10">
            Bạn có tệp khách hàng lớn? Liên hệ bộ phận Partnership để nhận mức chiết khấu ưu đãi riêng lên tới 30%.
         </p>
         <div className="pt-4 relative z-10">
            <button className="px-10 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
               Liên hệ đối tác
            </button>
         </div>
      </section>

    </div>
  );
}
