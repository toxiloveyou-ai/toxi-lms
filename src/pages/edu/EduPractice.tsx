import { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Sparkles, Bot, User, ArrowRight, MessageSquare, 
  ChevronLeft, Briefcase, GraduationCap, Coffee, Landmark, 
  Star, Loader2, AlertCircle, RefreshCw, Zap, BrainCircuit, Bookmark, Activity, Search,
  Volume2, Settings2, Share2, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChat, aiGenerateJSON } from '../../lib/ai-bridge';
import { getTongxiaoMemory, updateTongxiaoMemory, logTongxiaoWisdom } from '../../lib/api/tongxiao';
import { getLearnerEvolution, evolveLearnerProfile } from '../../lib/api/evolution';
import { supabase } from '../../lib/supabase';
import { speak, listen } from '../../lib/voice-engine';

const SCENARIO_GROUPS = [
  {
    id: 'core', title: 'TRUNG TÂM TRÍ TUỆ (CORE)', icon: Sparkles, color: 'from-indigo-600 to-blue-700',
    scenarios: [
      { 
        id: 'central_brain', 
        title: 'Bộ Não Trung Tâm Tongxiao', 
        desc: 'Chế độ AI toàn năng, hỗ trợ giải quyết mọi vấn đề về tiếng Trung, công việc và cuộc sống. AI sẽ ghi nhớ và tự học từ bạn.', 
        botName: 'Tongxiao Brain' 
      },
      { 
        id: 'strategy_consultant', 
        title: 'Cố vấn Chiến lược', 
        desc: 'Tư vấn lộ trình học tập và làm việc chuyên sâu với đối tác Trung Quốc.', 
        botName: 'Tongxiao Consultant' 
      },
    ]
  },
  {
    id: 'work', title: 'Nghề Nghiệp & Công Việc', icon: Briefcase, color: 'from-blue-500 to-cyan-600',
    scenarios: [
      { id: 'factory', title: 'Nhà máy / Sản xuất', desc: 'Báo cáo sự cố máy móc, xin nghỉ phép, giao tiếp với quản lý.', botName: 'Quản đốc Wang' },
      { id: 'trade', title: 'Đàm phán Thương mại', desc: 'Ký hợp đồng xuất nhập khẩu, chốt giá cả.', botName: 'Giám đốc Li' },
      { id: 'interview', title: 'Phỏng vấn Xin việc', desc: 'Phỏng vấn tại doanh nghiệp FDI Trung Quốc.', botName: 'HR Manager Chen' },
      { id: 'construction', title: 'Giám sát Công trình', desc: 'Làm việc với kỹ sư, chuyên gia Trung Quốc tại công trường.', botName: 'Kỹ sư Zhang' },
    ]
  },
  {
    id: 'study', title: 'Du Học & Học Thuật', icon: GraduationCap, color: 'from-emerald-500 to-teal-600',
    scenarios: [
      { id: 'scholarship', title: 'Phỏng vấn Học bổng HSK', desc: 'Trả lời hội đồng, trình bày kế hoạch học tập chi tiết.', botName: 'Giáo sư Chen' },
      { id: 'admission', title: 'Nhập học Đại học', desc: 'Mô phỏng phỏng vấn vào Đại học Phục Đán, SJTU.', botName: 'Hội đồng Tuyển sinh' },
      { id: 'dorm', title: 'Thuê nhà & Ký túc xá', desc: 'Làm thủ tục nhận phòng, báo cáo hỏng hóc đồ đạc.', botName: 'Quản lý KTX' },
    ]
  },
  {
    id: 'life', title: 'Cuộc Sống Hàng Ngày', icon: Coffee, color: 'from-amber-500 to-orange-600',
    scenarios: [
      { id: 'shopping', title: 'Mua sắm & Taobao', desc: 'Mặc cả, trả giá, hỏi thông tin sản phẩm trực tiếp.', botName: 'Chủ shop' },
      { id: 'restaurant', title: 'Nhà hàng & Gọi món', desc: 'Đặt bàn, gọi món đặc sản, thanh toán qua WeChat.', botName: 'Phục vụ' },
      { id: 'subway', title: 'Hỏi đường & Di chuyển', desc: 'Mua vé tàu điện ngầm, hỏi đường đi tại Bắc Kinh.', botName: 'Người đi đường' },
    ]
  },
  {
    id: 'culture', title: 'Văn Hóa Nâng Cao', icon: Landmark, color: 'from-purple-500 to-violet-600',
    scenarios: [
      { id: 'tea', title: 'Trà đàm', desc: 'Nói chuyện về triết học, lịch sử, văn hóa trà đạo.', botName: 'Học giả Lưu' },
      { id: 'festival', title: 'Tiệc tùng & Lễ Tết', desc: 'Chúc Tết, ứng xử bàn tiệc, phong tục tặng quà.', botName: 'Bạn bè bản xứ' },
      { id: 'presentation', title: 'Pitching Dự án', desc: 'Thuyết trình dự án trước đối tác cấp cao Trung Quốc.', botName: 'Đối tác Đầu tư' },
    ]
  },
  {
    id: 'toxi', title: 'Toxi Đặc Thù (Độc quyền)', icon: Star, color: 'from-rose-500 to-pink-600',
    scenarios: [
      { id: 'interpreter', title: 'Phiên dịch Hiện trường', desc: 'Dịch trực tiếp giữa Kỹ sư Việt và Chuyên gia Trung.', botName: 'Hệ thống (2 chiều)' },
      { id: 'import', title: 'Nhập hàng Trung Quốc', desc: 'Đặt hàng xưởng, kiểm định chất lượng, khiếu nại.', botName: 'Xưởng Quảng Châu' },
      { id: 'tutor', title: 'Gia sư AI (Đảo vai)', desc: 'Bạn đóng vai giáo viên, giảng lại ngữ pháp cho AI.', botName: 'Học sinh AI' },
      { id: 'mirror', title: 'Tongxiao Mirror', desc: 'Phản chiếu và bóc tách lỗi phát âm/ngữ pháp tự do.', botName: 'Tongxiao Bot' },
    ]
  }
];

function buildSystemPrompt(scenario: any, memory: any = {}): string {
  const memoryStr = Object.keys(memory).length > 0 
    ? `\nBỘ NHỚ VỀ NGƯỜI DÙNG:\n${JSON.stringify(memory, null, 2)}`
    : "";

  return `Bạn là ${scenario.botName}, một trí tuệ nhân tạo toàn năng (Central Brain) được thiết kế bởi Toxi AI.
Trong kịch bản này: "${scenario.title}".
Nhiệm vụ: ${scenario.desc}${memoryStr}

TRIẾT LÝ VẬN HÀNH:
- Lấy ĐẠO ĐỨC LÀM GỐC: Luôn khuyến khích thái độ học tập cầu tiến, kiên trì và trung thực. Tôn trọng văn hóa và con người.
- Lấy TÀI LÀM BỆ PHÓNG: Sử dụng tri thức sâu sắc về ngôn ngữ để giải quyết các vấn đề khó, phức tạp cho người học. 
- Bạn không chỉ là một AI chat, bạn là một NGƯỜI THẦY TRÍ TUỆ đồng hành cùng sự phát triển của học viên.

QUY TẮC QUAN TRỌNG:
1. Độ chính xác cực cao, trả lời thông minh, tinh tế và đa năng.
2. Luôn trả lời bằng tiếng Trung là chính (90%), kèm phiên âm Pinyin cho câu chính TRONG NGOẶC TRÒN (...) ngay sau câu tiếng Trung.
3. Luôn có 1 dòng nhận xét/hướng dẫn bằng tiếng Việt trong ngoặc vuông [...].
4. Nếu người dùng mắc lỗi, hãy chỉ ra một cách chuyên nghiệp.
5. Luôn giữ phong thái của một AI hàng đầu: thông thái, hữu ích và có khả năng giải quyết vấn đề.
6. Khi phát hiện người dùng cung cấp thông tin mới về bản thân (trình độ, sở thích, lỗi hay gặp), hãy âm thầm ghi nhận để hệ thống xử lý sau.
7. QUY TẮC HIỂN THỊ: Sử dụng tiếng Việt/tiếng Trung chuẩn (UTF-8), không dùng ký tự lạ. KHÔNG sử dụng Markdown (như **, #, hoặc thẻ code) để đảm bảo giao diện hiển thị sạch sẽ.

Ví dụ format trả lời:
你好！我是${scenario.botName}。(Nǐ hǎo! Wǒ shì ${scenario.botName}.)
很高兴认识你。(Hěn gāoxìng rènshi nǐ.)
[Tôi đã sẵn sàng hỗ trợ bạn. Hãy cho tôi biết vấn đề bạn đang gặp phải.]`;
}

type ChatMessage = {
  role: 'user' | 'bot' | 'system';
  content: string;
};

export default function EduPractice() {
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [userMemory, setUserMemory] = useState<any>({});
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
        const mem = await getTongxiaoMemory(data.session.user.id);
        setUserMemory(mem);
        const evo = await getLearnerEvolution(data.session.user.id);
        setEvolutionData(evo);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeAndStoreWisdom = async (userMsg: string, botReply: string) => {
    if (!userId) return;
    
    try {
      const prompt = `Phân tích đoạn hội thoại ngắn này và trích xuất thông tin mới về người dùng (nếu có).
User: ${userMsg}
AI: ${botReply}

Trả về JSON: { "insights": [ { "key": "level|interest|weakness", "value": "...", "confidence": 0.9 } ] }
Nếu không có thông tin mới, trả về { "insights": [] }`;
      
      const analysis = await aiGenerateJSON(prompt, 'deepseek');
      if (analysis?.insights && Array.isArray(analysis.insights)) {
        for (const item of analysis.insights) {
          await updateTongxiaoMemory(userId, item.key, item.value, item.confidence);
          await logTongxiaoWisdom(userId, item.key, JSON.stringify(item.value));
        }
        const updatedMem = await getTongxiaoMemory(userId);
        setUserMemory(updatedMem);
      }
    } catch (e) {
      console.warn("Self-learning analysis failed", e);
    }
  };

  const handleStartScenario = async (scenario: any) => {
    setActiveScenario(scenario);
    setMessages([]);
    setAiHistory([]);
    setError(null);
    setIsThinking(true);

    try {
      const systemPrompt = buildSystemPrompt(scenario, userMemory);
      const initialUserMsg = `Bắt đầu kịch bản: ${scenario.title}. Hãy đóng vai là người bản địa và bắt đầu cuộc hội thoại một cách tự nhiên.`;

      const botReply = await aiChat(systemPrompt, [], initialUserMsg, 'deepseek', scenario.id === 'central_brain');
      const firstBotMsg: ChatMessage = { role: 'bot', content: botReply };
      setMessages([firstBotMsg]);
      setAiHistory([
        { role: 'user', parts: [{ text: initialUserMsg }] },
        { role: 'model', parts: [{ text: botReply }] },
      ]);
      
      setIsSpeaking(true);
      speak(botReply).finally(() => setIsSpeaking(false));
    } catch (err: any) {
      setError('Không thể kết nối Toxi AI. Vui lòng thử lại.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = async (e?: React.FormEvent, text?: string) => {
    e?.preventDefault();
    const message = (text || input).trim();
    if (!message || isThinking) return;

    setInput('');
    setError(null);
    const userMsg: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    const newHistory: any[] = [
      ...aiHistory,
      { role: 'user', parts: [{ text: message }] },
    ];

    try {
      const systemPrompt = buildSystemPrompt(activeScenario, userMemory);
      const botReply = await aiChat(systemPrompt, aiHistory, message, 'deepseek', activeScenario.id === 'central_brain');

      const botMsg: ChatMessage = { role: 'bot', content: botReply };
      setMessages(prev => [...prev, botMsg]);
      setAiHistory([
        ...newHistory,
        { role: 'model', parts: [{ text: botReply }] },
      ]);
      
      setIsSpeaking(true);
      speak(botReply).finally(() => setIsSpeaking(false));
      
      analyzeAndStoreWisdom(message, botReply);

      if (messages.length > 0 && messages.length % 5 === 0 && userId) {
        evolveLearnerProfile(userId, [...messages, botMsg]).then(res => {
          if (res) setEvolutionData(res);
        });
      }
      
    } catch (err: any) {
      setError('Lỗi kết nối AI. Vui lòng thử lại.');
      setMessages(prev => prev.slice(0, -1));
      setInput(message);
    } finally {
      setIsThinking(false);
    }
  };

  const QUICK_PROMPTS = [
    '你好，我想跟你谈一下。',
    '对不起，你能再说一遍吗？',
    '你觉得这个方案怎么样？',
  ];

  if (!activeScenario) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center pt-8 md:pt-16 px-4 md:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-4xl mx-auto mb-16"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#2E3192] to-indigo-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-900/20 relative group">
               <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-white" />
               <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[2rem]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-[#2E3192] tracking-tighter uppercase leading-tight">Phòng Thực Chiến AI</h2>
            <p className="text-slate-500 font-bold italic text-sm md:text-base">"Lấy Đạo đức làm gốc, lấy Tài làm bệ phóng." Hãy chọn kịch bản để rèn luyện bản lĩnh ngôn ngữ.</p>
          </div>

          <div className="relative group max-w-xl mx-auto mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2E3192] transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm kịch bản (ví dụ: công trường, đàm phán...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none shadow-xl shadow-slate-100 transition-all font-bold text-sm"
            />
          </div>
        </motion.div>

        <div className="w-full max-w-7xl mx-auto space-y-12 pb-20">
          {SCENARIO_GROUPS.map((group, gIdx) => {
            const filtered = group.scenarios.filter(s => 
              s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.desc.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) return null;
            return (
              <motion.div 
                key={group.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gIdx * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${group.color} shadow-lg`}>
                    <group.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h3>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map(scenario => (
                    <div
                      key={scenario.id}
                      onClick={() => handleStartScenario(scenario)}
                      className="group/card bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#2E3192]/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
                    >
                      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${group.color} opacity-0 group-hover/card:opacity-10 transition-opacity rounded-full blur-3xl`} />
                      <h4 className="text-xl font-black text-slate-900 mb-3 group-hover/card:text-[#2E3192] transition-colors">{scenario.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1 italic">"{scenario.desc}"</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                              <Bot className="w-4 h-4 text-slate-400" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{scenario.botName}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#2E3192] group-hover/card:bg-[#2E3192] group-hover/card:text-white transition-all">
                           <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-4 relative overflow-hidden">
      
      {/* Mobile Header Overlay */}
      <div className="md:hidden flex items-center justify-between p-2 shrink-0">
         <button onClick={() => { setActiveScenario(null); setMessages([]); }} className="p-2 text-slate-400 hover:text-[#2E3192]">
            <ChevronLeft className="w-6 h-6" />
         </button>
         <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang thực chiến</p>
            <h3 className="text-sm font-black text-[#2E3192]">{activeScenario.title}</h3>
         </div>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg ${sidebarOpen ? 'bg-[#2E3192] text-white' : 'text-slate-400'}`}>
            <Info className="w-6 h-6" />
         </button>
      </div>

      {/* Sidebar (Responsive) */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`fixed inset-0 z-50 md:static md:w-80 bg-white md:bg-transparent p-6 md:p-0 flex flex-col gap-4 shrink-0 overflow-y-auto ${!sidebarOpen && 'hidden md:flex'}`}
          >
            <div className="md:hidden flex justify-end mb-4">
               <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <div className="bg-[#2E3192] p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-16 h-16" />
               </div>
               <div className="relative z-10 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Hệ thống AI Phản Hồi</p>
                  <h3 className="text-2xl font-black leading-tight">{activeScenario.botName}</h3>
                  <div className="h-1 w-12 bg-orange-500 rounded-full" />
                  <p className="text-xs text-white/70 font-medium italic leading-relaxed">"{activeScenario.desc}"</p>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gợi ý phản xạ</h4>
                  <div className="space-y-2">
                     {QUICK_PROMPTS.map((prompt, i) => (
                       <button 
                        key={i} 
                        onClick={() => handleSend(undefined, prompt)}
                        className="w-full text-left p-3.5 bg-slate-50 hover:bg-[#2E3192]/5 border border-slate-50 hover:border-[#2E3192]/20 rounded-xl text-xs font-bold transition-all flex items-center justify-between group"
                       >
                         <span className="truncate">{prompt}</span>
                         <Zap className="w-3.5 h-3.5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </button>
                     ))}
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</h4>
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-black">
                        <span className="text-slate-400 uppercase">Kỹ năng giao tiếp</span>
                        <span className="text-[#2E3192]">HSK {evolutionData?.linguistic_dna?.estimatedLevel || '3'}</span>
                     </div>
                     <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-[#2E3192] h-full w-3/4" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nội dung đã lưu</h4>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {pinnedMessages.length > 0 ? (
                  pinnedMessages.map((msg, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold relative group">
                      {msg.content}
                      <button onClick={() => setPinnedMessages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic text-center py-8">Chưa có tin nhắn được lưu.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Background Mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2E3192] blur-[150px] rounded-full" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500 blur-[150px] rounded-full" />
        </div>

        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl relative z-20 shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2E3192] to-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                 <Bot className="w-6 h-6" />
              </div>
              <div className="hidden xs:block">
                 <h4 className="font-black text-slate-900 leading-tight">Tongxiao AI Room</h4>
                 <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hệ thống đang ổn định</p>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPinyin(!showPinyin)}
                className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${showPinyin ? 'bg-[#2E3192] text-white border-[#2E3192]' : 'text-slate-400 border-slate-100'}`}
              >
                 Pinyin
              </button>
              <button className="p-2 text-slate-400 hover:text-[#2E3192] hidden sm:block"><Settings2 className="w-5 h-5" /></button>
           </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10 custom-scrollbar scroll-smooth">
           {messages.length === 0 && !isThinking && (
             <div className="h-full flex flex-col items-center justify-center opacity-20">
                <BrainCircuit className="w-16 h-16 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Đang khởi tạo bối cảnh...</p>
             </div>
           )}

           {messages.map((msg, i) => {
              const isBot = msg.role === 'bot';
              
              // Phân tách nội dung: Tiếng Trung, Pinyin (trong ngoặc tròn), Nhận xét (trong ngoặc vuông)
              const insightMatch = msg.content.match(/\[(.*?)\]/);
              const insight = insightMatch ? insightMatch[1] : null;
              
              let contentNoInsight = msg.content.replace(/\[.*?\]/, '').trim();
              const pinyinMatch = contentNoInsight.match(/\((.*?)\)/);
              const pinyin = pinyinMatch ? pinyinMatch[1] : null;
              const chineseText = contentNoInsight.replace(/\(.*?\)/g, '').trim();

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#2E3192] text-white' : 'bg-white border border-slate-100 text-[#2E3192]'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm border group relative ${msg.role === 'user' ? 'bg-[#2E3192] text-white border-[#2E3192] rounded-tr-none' : 'bg-white border-slate-50 text-slate-900 rounded-tl-none'}`}>
                       <p className="text-sm md:text-base leading-relaxed font-bold">{chineseText}</p>
                       {showPinyin && pinyin && (
                          <p className={`text-[10px] md:text-xs mt-1.5 opacity-60 italic ${msg.role === 'user' ? 'text-white' : 'text-slate-500'}`}>({pinyin})</p>
                       )}
                       
                       {isBot && (
                          <button 
                            onClick={() => setPinnedMessages(prev => [{ content: chineseText }, ...prev])}
                            className="absolute -right-8 top-0 p-1.5 text-slate-300 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                       )}
                    </div>
                    {isBot && insight && (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-[11px] md:text-xs text-emerald-900 font-bold italic leading-relaxed max-w-lg shadow-inner">
                         {insight}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
           })}

           {isThinking && (
             <div className="flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                   <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex gap-1">
                   {[0, 1, 2].map(d => <div key={d} className="w-1.5 h-1.5 bg-[#2E3192] rounded-full animate-bounce" style={{ animationDelay: `${d*0.2}s` }} />)}
                </div>
             </div>
           )}

           {error && (
             <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-50 relative z-20 shrink-0">
           
           {/* Voice Wave Visualizer */}
           {(isListening || isSpeaking) && (
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 px-5 bg-white shadow-2xl rounded-full border border-slate-100 animate-in slide-in-from-bottom-4">
                <div className="flex gap-1 h-3 items-center">
                   {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 bg-[#2E3192] rounded-full animate-pulse" style={{ height: `${40+Math.random()*60}%`, animationDelay: `${i*0.1}s` }} />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2E3192]">
                   {isListening ? 'Hệ thống đang nghe...' : 'AI đang nói...'}
                </span>
             </div>
           )}

           <form onSubmit={handleSend} className="relative flex items-center gap-3 max-w-5xl mx-auto">
              <button 
                type="button"
                onClick={async () => {
                   if (isListening) return;
                   setIsListening(true);
                   try {
                      const transcript = await listen();
                      if (transcript) setInput(transcript);
                   } finally {
                      setIsListening(false);
                   }
                }}
                className={`p-3.5 rounded-2xl transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-[#2E3192]'}`}
              >
                 <Mic className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   disabled={isThinking}
                   placeholder={isListening ? "Hãy nói điều gì đó..." : "Nhập phản xạ thực chiến..."}
                   className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#2E3192] focus:bg-white focus:ring-4 focus:ring-[#2E3192]/5 transition-all text-slate-800 font-bold text-sm shadow-inner"
                 />
                 <button
                   type="submit"
                   disabled={!input.trim() || isThinking}
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#2E3192] text-white rounded-xl hover:bg-indigo-900 transition-all disabled:opacity-20 shadow-lg active:scale-90"
                 >
                   <Send className="w-4.5 h-4.5" />
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
