import { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Sparkles, Bot, User, ArrowRight, MessageSquare, 
  ChevronLeft, Briefcase, GraduationCap, Coffee, Landmark, 
  Star, Loader2, AlertCircle, RefreshCw, Zap, BrainCircuit, Bookmark, Activity, Search
} from 'lucide-react';
import { aiChat, aiGenerateJSON } from '../lib/ai-bridge';
import { getTongxiaoMemory, updateTongxiaoMemory, logTongxiaoWisdom } from '../lib/api/tongxiao';
import { getLearnerEvolution, evolveLearnerProfile } from '../lib/api/evolution';
import { supabase } from '../lib/supabase';
import { speak, listen } from '../lib/voice-engine';

const SCENARIO_GROUPS = [
  {
    id: 'core', title: 'TRUNG TÂM TRÍ TUỆ (CORE)', icon: Sparkles, color: 'bg-indigo-600',
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
    id: 'work', title: 'Nghề Nghiệp & Công Việc', icon: Briefcase, color: 'bg-blue-500',
    scenarios: [
      { id: 'factory', title: 'Nhà máy / Sản xuất', desc: 'Báo cáo sự cố máy móc, xin nghỉ phép, giao tiếp với quản lý.', botName: 'Quản đốc Wang' },
      { id: 'trade', title: 'Đàm phán Thương mại', desc: 'Ký hợp đồng xuất nhập khẩu, chốt giá cả.', botName: 'Giám đốc Li' },
      { id: 'interview', title: 'Phỏng vấn Xin việc', desc: 'Phỏng vấn tại doanh nghiệp FDI Trung Quốc.', botName: 'HR Manager Chen' },
      { id: 'construction', title: 'Giám sát Công trình', desc: 'Làm việc với kỹ sư, chuyên gia Trung Quốc tại công trường.', botName: 'Kỹ sư Zhang' },
    ]
  },
  {
    id: 'study', title: 'Du Học & Học Thuật', icon: GraduationCap, color: 'bg-emerald-500',
    scenarios: [
      { id: 'scholarship', title: 'Phỏng vấn Học bổng HSK', desc: 'Trả lời hội đồng, trình bày kế hoạch học tập chi tiết.', botName: 'Giáo sư Chen' },
      { id: 'admission', title: 'Nhập học Đại học', desc: 'Mô phỏng phỏng vấn vào Đại học Phục Đán, SJTU.', botName: 'Hội đồng Tuyển sinh' },
      { id: 'dorm', title: 'Thuê nhà & Ký túc xá', desc: 'Làm thủ tục nhận phòng, báo cáo hỏng hóc đồ đạc.', botName: 'Quản lý KTX' },
    ]
  },
  {
    id: 'life', title: 'Cuộc Sống Hàng Ngày', icon: Coffee, color: 'bg-amber-500',
    scenarios: [
      { id: 'shopping', title: 'Mua sắm & Taobao', desc: 'Mặc cả, trả giá, hỏi thông tin sản phẩm trực tiếp.', botName: 'Chủ shop' },
      { id: 'restaurant', title: 'Nhà hàng & Gọi món', desc: 'Đặt bàn, gọi món đặc sản, thanh toán qua WeChat.', botName: 'Phục vụ' },
      { id: 'subway', title: 'Hỏi đường & Di chuyển', desc: 'Mua vé tàu điện ngầm, hỏi đường đi tại Bắc Kinh.', botName: 'Người đi đường' },
    ]
  },
  {
    id: 'culture', title: 'Văn Hóa Nâng Cao', icon: Landmark, color: 'bg-purple-500',
    scenarios: [
      { id: 'tea', title: 'Trà đàm', desc: 'Nói chuyện về triết học, lịch sử, văn hóa trà đạo.', botName: 'Học giả Lưu' },
      { id: 'festival', title: 'Tiệc tùng & Lễ Tết', desc: 'Chúc Tết, ứng xử bàn tiệc, phong tục tặng quà.', botName: 'Bạn bè bản xứ' },
      { id: 'presentation', title: 'Pitching Dự án', desc: 'Thuyết trình dự án trước đối tác cấp cao Trung Quốc.', botName: 'Đối tác Đầu tư' },
    ]
  },
  {
    id: 'toxi', title: 'Toxi Đặc Thù (Độc quyền)', icon: Star, color: 'bg-rose-500',
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      
      // Auto-speak opening message
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
      
      // Auto-speak bot reply
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
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="text-center mb-10 space-y-6">
          <div>
             <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase">Phòng Thực Chiến Tongxiao</h2>
             <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold italic">
               "Lấy Đạo đức làm gốc, lấy Tài làm bệ phóng." Hãy chọn kịch bản để bắt đầu rèn luyện bản lĩnh ngôn ngữ.
             </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
             <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2E3192] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm kịch bản (VD: phỏng vấn, đàm phán...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#2E3192] transition-all font-bold text-sm shadow-sm"
                />
             </div>
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button className="px-6 py-2.5 bg-white text-[#2E3192] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">Tất cả</button>
                <button className="px-6 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-[#2E3192]">Việc làm</button>
                <button className="px-6 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-[#2E3192]">Du học</button>
             </div>
          </div>
        </div>
        <div className="space-y-10">
          {SCENARIO_GROUPS.map((group) => {
            const filteredScenarios = group.scenarios.filter(s => 
              s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (s.desc || "").toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredScenarios.length === 0) return null;

            return (
              <div key={group.id} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className={`p-2 rounded-xl text-white ${group.color} shadow-lg shadow-indigo-100`}>
                    <group.icon className="w-5 h-5" />
                  </div>
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredScenarios.map(scenario => (
                  <div
                    key={scenario.id}
                    onClick={() => handleStartScenario(scenario)}
                    className="student-card p-6 cursor-pointer border-2 border-transparent hover:border-[#2E3192]/30 hover:shadow-2xl transition-all group/card relative overflow-hidden flex flex-col h-full bg-white rounded-3xl"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 transition-opacity group-hover/card:opacity-20 ${group.color}`} />
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h4 className="font-black text-slate-900 mb-3 group-hover/card:text-[#2E3192] transition-colors leading-tight text-lg">{scenario.title}</h4>
                      <p className="text-xs text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1 font-medium italic">"{scenario.desc}"</p>
                      <div className="flex justify-between items-center text-[11px] font-black mt-auto pt-4 border-t border-slate-50">
                        <span className="text-slate-400 flex items-center gap-2 truncate pr-2 uppercase tracking-widest">
                          <User className="w-4 h-4 shrink-0" /> {scenario.botName}
                        </span>
                        <span className="text-[#2E3192] flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-all transform translate-x-2 group-hover/card:translate-x-0 whitespace-nowrap uppercase tracking-widest">
                          Bắt đầu <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out relative overflow-hidden">
      
      {/* Sidebar - Intelligence Hub */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-500 flex flex-col gap-4 overflow-hidden h-full shrink-0`}>
        <div className="flex items-center justify-between px-2 shrink-0">
          <button
            onClick={() => { setActiveScenario(null); setMessages([]); setAiHistory([]); }}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Đổi kịch bản
          </button>
          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            Memory V3.0
          </span>
        </div>

        <div className="student-card p-6 bg-gradient-to-br from-[#1E2060] to-[#2E3192] text-white border-none shadow-xl relative overflow-hidden shrink-0 rounded-[2rem]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <Bot className="w-12 h-12" />
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/60">Context Engine</h3>
             </div>
             <div className="space-y-1">
                <p className="text-xl font-black leading-tight tracking-tight">{activeScenario.title}</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Đối tác: {activeScenario.botName}</p>
             </div>
             <p className="text-xs text-white/70 font-medium leading-relaxed line-clamp-3 italic">
                "{activeScenario.desc}"
             </p>
          </div>
        </div>

        <div className="student-card p-5 flex-1 flex-col overflow-hidden bg-white/50 backdrop-blur-sm border-slate-200/50 rounded-[2rem] hidden md:flex">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em]">Thống kê thực chiến</h3>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="space-y-4">
             <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1">
                   <span>Độ phức tạp</span>
                   <span className="text-emerald-500">HSK {evolutionData?.linguistic_dna?.estimatedLevel || '3'}</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full w-[65%]" />
                </div>
             </div>
             <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1">
                   <span>Từ vựng mới</span>
                   <span className="text-indigo-500">+{messages.filter(m => m.role === 'bot').length * 2}</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full w-[40%]" />
                </div>
             </div>
          </div>
        </div>

        <div className="student-card p-5 flex-[1.5] flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm border-slate-200/50 rounded-[2rem]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em]">Nội Dung Đã Lưu</h3>
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
            {pinnedMessages.length > 0 ? (
              pinnedMessages.map((msg, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in slide-in-from-right-4 duration-300 group hover:border-[#2E3192]/30 transition-all relative">
                  <p className="text-[11px] text-slate-700 font-bold leading-relaxed line-clamp-3">
                     {msg.content}
                  </p>
                  <button 
                    onClick={() => setPinnedMessages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-40">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">Ghim tin nhắn quan trọng để xem lại tại đây.</p>
              </div>
            )}
          </div>
        </div>

        <div className="student-card p-5 bg-white border border-slate-100 shrink-0 rounded-[2rem] shadow-sm">
           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Gợi ý phản xạ</h4>
           <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, prompt)}
                  disabled={isThinking}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#2E3192]/30 hover:bg-white hover:shadow-md transition-all text-[11px] font-bold text-slate-700 flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2E3192] opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col overflow-hidden relative student-card border-none shadow-2xl bg-white rounded-[3rem]">
        
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white shadow-2xl rounded-full flex items-center justify-center border border-slate-100 hover:scale-110 transition-all hidden md:flex"
        >
          {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
        </button>

        {/* Neural Network Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#2E3192_0%,transparent_70%)]" />
           <svg className="w-full h-full" viewBox="0 0 1000 1000">
              <defs>
                 <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="currentColor" />
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dotGrid)" />
           </svg>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl relative z-20 shrink-0">
           <div className="flex items-center gap-3">
              <div className="relative">
                 <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#2E3192] to-[#1E2060] flex items-center justify-center shadow-lg relative group overflow-hidden">
                    <Bot className="w-5 h-5 text-white relative z-10" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2px] border-white animate-pulse" />
              </div>
              <div>
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Tongxiao Brain V3.0</h2>
                 <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase tracking-widest rounded border border-emerald-100">DS-V3 Engine</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Secure Intelligence Hub</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPinyin(!showPinyin)}
                className={`p-2.5 px-3.5 rounded-lg border transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.1em] shadow-sm ${showPinyin ? 'bg-[#2E3192] text-white border-[#2E3192]' : 'bg-white text-slate-400 border-slate-100 hover:border-[#2E3192] hover:text-[#2E3192]'}`}
              >
                 <Sparkles className="w-3 h-3" /> {showPinyin ? 'Pinyin' : 'No Pinyin'}
              </button>
           </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative custom-scrollbar scroll-smooth">
           {messages.length === 0 && !isThinking && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center animate-bounce">
                   <MessageSquare className="w-12 h-12 text-[#2E3192]" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900">Khởi động trí tuệ nhân tạo</h3>
                   <p className="text-slate-400 font-medium max-w-sm">Toxi AI đang chuẩn bị bối cảnh hoàn hảo cho bạn...</p>
                </div>
             </div>
           )}

           {messages.map((msg, i) => {
             const isBot = msg.role === 'bot';
             
             // Phân tách nội dung: Tiếng Trung, Pinyin (trong ngoặc tròn), Nhận xét (trong ngoặc vuông)
             const insightMatch = msg.content.match(/\[(.*?)\]/);
             const insight = insightMatch ? insightMatch[1] : null;
             
             // Lấy phần text còn lại (bao gồm Trung + Pinyin)
             let contentNoInsight = msg.content.replace(/\[.*?\]/, '').trim();
             
             // Tách Pinyin và Tiếng Trung
             const pinyinMatch = contentNoInsight.match(/\((.*?)\)/);
             const pinyin = pinyinMatch ? pinyinMatch[1] : null;
             const chineseText = contentNoInsight.replace(/\(.*?\)/g, '').trim();

             // Helper để render text có hỗ trợ bôi đen **...** và xuống dòng
             const renderFormattedText = (text: string) => {
               return text.split('\n').map((line, i) => (
                 <div key={i} className="mb-1 last:mb-0">
                   {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                     if (part.startsWith('**') && part.endsWith('**')) {
                       return <strong key={j} className="font-black">{part.slice(2, -2)}</strong>;
                     }
                     return part;
                   })}
                 </div>
               ));
             };

             return (
               <div key={i} className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
                 <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                   msg.role === 'user' 
                     ? 'bg-[#2E3192] text-white' 
                     : isBot 
                     ? 'bg-white border border-slate-100 text-[#2E3192]' 
                     : 'bg-slate-100 text-slate-500'
                 }`}>
                   {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                 </div>
                 
                 <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`p-2.5 px-4 rounded-[18px] shadow-sm transition-all group relative border ${
                     msg.role === 'user'
                       ? 'bg-[#2E3192] text-white border-[#2E3192] rounded-tr-none'
                       : isBot
                       ? 'bg-white border-slate-100 text-slate-900 rounded-tl-none hover:shadow-md'
                       : 'bg-amber-50 border-amber-100 text-amber-900 text-[10px] italic'
                   }`}>
                     {/* Bố cục nội dung khoa học & nhỏ gọn */}
                     <div className="flex flex-col leading-tight">
                        <div className={`text-[14px] leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-900'}`}>
                           {renderFormattedText(chineseText)}
                        </div>
                        {showPinyin && pinyin && (
                           <div className={`text-[11px] mt-1 font-medium italic opacity-60 tracking-wide ${msg.role === 'user' ? 'text-white' : 'text-slate-500'}`}>
                              ({pinyin})
                           </div>
                        )}
                        {!pinyin && msg.role !== 'user' && !isBot && (
                           <div className="text-[13px]">{renderFormattedText(msg.content)}</div>
                        )}
                     </div>

                     {isBot && (
                        <div className="absolute top-1 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button title="Làm mới" className="p-1 text-slate-300 hover:text-[#2E3192] transition-colors"><RefreshCw className="w-2.5 h-2.5" /></button>
                           <button 
                             title="Lưu tin nhắn" 
                             onClick={() => {
                               if (!pinnedMessages.find(m => m.content === chineseText)) {
                                 setPinnedMessages(prev => [{ content: chineseText, timestamp: new Date() }, ...prev]);
                               }
                             }}
                             className={`p-1 transition-colors ${pinnedMessages.find(m => m.content === chineseText) ? 'text-orange-500' : 'text-slate-300 hover:text-orange-500'}`}
                           >
                             <Star className="w-2.5 h-2.5" />
                           </button>
                        </div>
                     )}
                   </div>

                   {!!(isBot && insight) && (
                     <div className="bg-[#2E3192]/5 backdrop-blur-md border border-[#2E3192]/10 p-2.5 px-4 rounded-[18px] text-[12px] text-slate-800 font-bold flex items-start gap-2.5 shadow-inner animate-in zoom-in-95 duration-500 delay-300 max-w-xl border-l-[3px] border-l-[#2E3192]">
                        <div className="p-1 bg-[#2E3192] rounded-md text-white shrink-0 shadow-md">
                           <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        <div className="leading-relaxed italic">{renderFormattedText(insight)}</div>
                     </div>
                   )}
                 </div>
               </div>
             );
           })}

           {isThinking && (
             <div className="flex items-start gap-3">
               <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-200 flex items-center justify-center shrink-0">
                 <Loader2 className="w-4 h-4 animate-spin" />
               </div>
               <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-50 flex items-center gap-2">
                  <div className="flex gap-1">
                     <div className="w-1 h-1 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Thinking...</span>
               </div>
             </div>
           )}

           {error && (
             <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
               <AlertCircle className="w-5 h-5 shrink-0" />
               {error}
             </div>
           )}

           <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-5 border-t border-slate-50 bg-white/80 backdrop-blur-2xl relative z-20 shrink-0">
           
           {/* Voice Wave Visualizer */}
           {(isListening || isSpeaking) && (
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-3 px-5 bg-white shadow-xl rounded-full border border-slate-100 animate-in slide-in-from-bottom-2">
                <div className="flex gap-1 h-4 items-center">
                   {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full ${isListening ? 'bg-red-500' : 'bg-indigo-500'} animate-wave`}
                        style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}
                      />
                   ))}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isListening ? 'text-red-500' : 'text-indigo-500'}`}>
                   {isListening ? 'Hệ thống đang nghe...' : 'Tongxiao đang nói...'}
                </span>
             </div>
           )}

           <form onSubmit={handleSend} className="relative flex items-center gap-3 max-w-5xl mx-auto group/form">
              <div className="relative">
                 {isListening && (
                   <div className="absolute inset-[-3px] bg-red-500 rounded-xl animate-ping opacity-20" />
                 )}
                 <button 
                   type="button" 
                   onClick={async () => {
                     if (isListening) return;
                     setIsListening(true);
                     try {
                        const transcript = await listen();
                        if (transcript) {
                           setInput(transcript);
                           // Auto-submit after voice recognition
                           setTimeout(() => handleSend(undefined, transcript), 500);
                        }
                     } catch (e) {
                        console.error(e);
                        setError("Không thể nghe giọng nói. Hãy kiểm tra Micro hoặc Key Azure.");
                     } finally {
                        setIsListening(false);
                     }
                   }}
                   className={`p-3.5 rounded-xl transition-all relative z-10 shadow-md ${isListening ? 'bg-red-500 text-white scale-105' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-[#2E3192]'}`}
                 >
                   <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                 </button>
              </div>
              
              <div className="flex-1 relative flex items-center">
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   disabled={isThinking}
                   placeholder={isListening ? "Hãy nói điều gì đó..." : isSpeaking ? "Đang phát âm thanh..." : "Thực chiến ngay..."}
                   className="w-full pl-5 pr-14 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#2E3192] focus:bg-white focus:ring-4 focus:ring-[#2E3192]/5 transition-all text-slate-800 font-medium text-sm shadow-inner disabled:opacity-60 placeholder:text-slate-300"
                 />
                 <button
                   type="submit"
                   disabled={!input.trim() || isThinking}
                   className="absolute right-1.5 p-2.5 bg-[#2E3192] text-white rounded-lg hover:bg-[#1E2060] transition-all disabled:opacity-20 shadow-md active:scale-90"
                 >
                   <Send className="w-4.5 h-4.5" />
                 </button>
              </div>
           </form>
           <div className="flex items-center justify-center gap-3 mt-2">
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">
                 {isListening ? 'Auto-Submit Active' : 'DS-V3 • AI Reflection Active'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
