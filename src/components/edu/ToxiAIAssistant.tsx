import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Paperclip, ChevronDown } from 'lucide-react';
import { toxiAIEngine, type ToxiAIContext, type ToxiUserProfile } from '../../lib/toxi-ai-engine';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ToxiAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Chào bạn, tôi là Toxi AI - trợ lý học tập cá nhân của bạn. Hôm nay bạn muốn học gì?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Thông tin User Profile mô phỏng (trong thực tế sẽ lấy từ DB sau khi auth)
  const [userProfile, setUserProfile] = useState<ToxiUserProfile>({
    id: 'user-1',
    name: 'Học viên',
    level: 'Beginner',
    goal: 'general_communication',
    interests: ['Văn hóa', 'Phim ảnh'],
    learningStyle: 'Thực hành giao tiếp'
  });

  useEffect(() => {
    // Tự động cuộn xuống tin nhắn mới nhất
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Thử lấy thông tin người dùng từ Supabase nếu có
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('toxi_profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUserProfile(prev => ({
            ...prev,
            id: session.user.id,
            name: profile.full_name || 'Học viên',
            // Map thêm các trường nếu sau này DB có
          }));
        }
      }
    };
    fetchUser();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const context: ToxiAIContext = { profile: userProfile };
      // Chuyển đổi lịch sử cho AI Engine
      const aiHistory = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content
      }));

      const replyContent = await toxiAIEngine.chat(userMessage, context, aiHistory);
      
      const replyMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: replyContent };
      setMessages(prev => [...prev, replyMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi Toxi AI:', error);
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'system', content: 'Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* FAB - Nút nổi (Floating Action Button) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgb(79,70,229,0.5)] hover:scale-110 hover:shadow-[0_10px_40px_rgb(79,70,229,0.7)] transition-all duration-300 animate-in fade-in zoom-in group"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Cửa sổ Chat Box (Glassmorphism / Tech-Zen) */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 
          ${isExpanded 
            ? 'top-4 bottom-4 left-4 right-4 rounded-3xl' 
            : 'bottom-6 right-6 w-[380px] h-[600px] rounded-[2rem]'
          }`}
          style={{ 
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset' 
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/50 to-white/50 rounded-t-[2rem]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight leading-none">Toxi AI</h3>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Trợ lý học tập cá nhân
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm 
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none' 
                    : msg.role === 'system'
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-none text-xs text-center w-full'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Toxi AI</span>
                    </div>
                  )}
                  {/* Có thể thay thế bằng ReactMarkdown nếu cần render phức tạp */}
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/50 border-t border-indigo-100/50 rounded-b-[2rem]">
            <div className="relative flex items-end gap-2">
              <button className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi Toxi AI bất cứ điều gì..."
                className="w-full max-h-32 min-h-[44px] py-3 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none shadow-sm transition-all scrollbar-thin"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-center mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
              AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
