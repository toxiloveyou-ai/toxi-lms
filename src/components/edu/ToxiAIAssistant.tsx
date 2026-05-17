import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  Paperclip, 
  ChevronDown, 
  Brain, 
  MessageSquare, 
  Flame, 
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { toxiAIEngine, type ToxiAIContext, type ToxiUserProfile } from '../../lib/toxi-ai-engine';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isReasoning?: boolean; // Tag for messages processed using Deep Reasoning (R1)
}

const QUICK_PROMPTS = [
  { text: '📚 Giải thích cấu trúc chữ Hán', prompt: 'Hãy giải thích sâu cho tôi cấu trúc và cách nhớ của các bộ thủ thông dụng trong tiếng Trung, lấy ví dụ cụ thể.' },
  { text: '🎯 Lập lộ trình học HSK cấp tốc', prompt: 'Dựa trên mục tiêu học tập của tôi, hãy thiết kế lộ trình học HSK cấp tốc trong 4 tuần. Vui lòng chia nhỏ từng tuần.' },
  { text: '💼 Tiếng Trung Thương mại thực chiến', prompt: 'Cho tôi 5 mẫu câu đàm phán thương mại tiếng Trung thực chiến kèm phiên âm Pinyin và cách dùng tế nhị.' },
  { text: '🇨🇳 Kinh nghiệm phỏng vấn du học', prompt: 'Hãy đóng vai là người phỏng vấn học bổng du học Trung Quốc và đưa ra các câu hỏi thường gặp kèm gợi ý cách trả lời ghi điểm.' }
];

// Helper structures to group consecutive table lines together
// Helper structures to group consecutive table/blockquote lines together
interface LineBlock {
  type: 'text' | 'table' | 'blockquote';
  lines: string[];
}

const parseBlocks = (content: string): LineBlock[] => {
  const rawLines = content.split('\n');
  const blocks: LineBlock[] = [];
  let currentBlock: LineBlock | null = null;

  for (const line of rawLines) {
    const trimmed = line.trim();
    // A table line starts with | and ends with |
    const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|');
    const isQuoteLine = trimmed.startsWith('>');

    if (isTableLine) {
      if (currentBlock && currentBlock.type === 'table') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'table', lines: [line] };
      }
    } else if (isQuoteLine) {
      if (currentBlock && currentBlock.type === 'blockquote') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'blockquote', lines: [line] };
      }
    } else {
      if (currentBlock && currentBlock.type === 'text') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'text', lines: [line] };
      }
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

// Render inline markdown segments (**bold**, *italic*, `code`)
const renderLineSegments = (cleanLine: string, role: 'user' | 'assistant' | 'system') => {
  const segments: React.ReactNode[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < cleanLine.length) {
    // Bold (**text**)
    if (cleanLine.substring(i, i + 2) === '**') {
      if (currentText) {
        segments.push(<span key={segments.length}>{currentText}</span>);
        currentText = '';
      }
      const closingIdx = cleanLine.indexOf('**', i + 2);
      if (closingIdx !== -1) {
        const boldText = cleanLine.substring(i + 2, closingIdx);
        segments.push(
          <strong key={segments.length} className={`font-black ${role === 'user' ? 'text-orange-200' : 'text-[#2E3192] bg-indigo-50/70 px-1.5 py-0.5 rounded-md'}`}>
            {boldText}
          </strong>
        );
        i = closingIdx + 2;
      } else {
        currentText += '**';
        i += 2;
      }
    } 
    // Italic (*text*)
    else if (cleanLine[i] === '*' && cleanLine[i + 1] !== '*') {
      if (currentText) {
        segments.push(<span key={segments.length}>{currentText}</span>);
        currentText = '';
      }
      const closingIdx = cleanLine.indexOf('*', i + 1);
      if (closingIdx !== -1) {
        const italicText = cleanLine.substring(i + 1, closingIdx);
        segments.push(<em key={segments.length} className="italic font-medium">{italicText}</em>);
        i = closingIdx + 1;
      } else {
        currentText += '*';
        i += 1;
      }
    }
    // Inline code (`code`)
    else if (cleanLine[i] === '`') {
      if (currentText) {
        segments.push(<span key={segments.length}>{currentText}</span>);
        currentText = '';
      }
      const closingIdx = cleanLine.indexOf('`', i + 1);
      if (closingIdx !== -1) {
        const codeText = cleanLine.substring(i + 1, closingIdx);
        segments.push(
          <code key={segments.length} className={`font-mono text-xs px-1.5 py-0.5 rounded border ${role === 'user' ? 'bg-indigo-800/40 text-orange-200 border-indigo-700' : 'bg-slate-50 text-rose-500 border-slate-200/60'}`}>
            {codeText}
          </code>
        );
        i = closingIdx + 1;
      } else {
        currentText += '`';
        i += 1;
      }
    } 
    // Regular text
    else {
      currentText += cleanLine[i];
      i++;
    }
  }
  
  if (currentText) {
    segments.push(<span key={segments.length}>{currentText}</span>);
  }

  return segments;
};

// Render consecutive blockquote lines as a single beautifully-styled glassmorphic quote card
const renderBlockquoteBlock = (quoteLines: string[], role: 'user' | 'assistant' | 'system', blockIdx: number) => {
  // Process quote lines into clean lines
  const cleanRows = quoteLines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('> ')) {
      return trimmed.substring(2);
    } else if (trimmed.startsWith('>')) {
      return trimmed.substring(1);
    }
    return trimmed;
  });

  // Filter out redundant empty lines or check if the block is completely blank
  const isCompletelyEmpty = cleanRows.every(row => row.trim() === '');
  if (isCompletelyEmpty) {
    return null; // Return absolutely nothing, eliminating empty visual noise cards!
  }

  return (
    <div key={blockIdx} className="my-4 ml-2 mr-1">
      <div className={`relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 to-orange-50/20 p-4 shadow-sm backdrop-blur-sm ${role === 'user' ? 'border-indigo-800/40 bg-gradient-to-br from-indigo-950/40 to-indigo-900/30' : ''}`}>
        <div className="absolute top-0 right-0 -mr-3 -mt-3 text-indigo-200/40 font-serif text-8xl pointer-events-none select-none">“</div>
        <div className="flex items-start gap-3">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E2060] to-[#2E3192] text-[10px] text-white shadow-sm mt-0.5 font-black">💡</div>
          <div className={`text-xs font-semibold leading-relaxed text-slate-700 tracking-wide w-full ${role === 'user' ? 'text-indigo-200' : ''}`}>
            <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider block mb-1">MẸO & CỐ VẤN THỰC CHIẾN</span>
            <div className="space-y-1.5">
              {cleanRows.map((cleanLine, rowIdx) => {
                if (cleanLine.trim() === '') {
                  return <div key={rowIdx} className="h-2" />; // Render intelligent paragraph spacing
                }
                return (
                  <p key={rowIdx} className="italic">
                    {renderLineSegments(cleanLine, role)}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render consecutive table lines as a gorgeous, responsive, Tech-Zen HTML table
const renderTableBlock = (tableLines: string[], role: 'user' | 'assistant' | 'system', blockIdx: number) => {
  const parsedRows = tableLines.map(rowLine => {
    const trimmed = rowLine.trim();
    const cells = trimmed.split('|').map(c => c.trim());
    // Remove empty padding items at start and end of row split
    if (cells[0] === '') cells.shift();
    if (cells[cells.length - 1] === '') cells.pop();
    return cells;
  });

  let headerCells: string[] = [];
  let bodyRows: string[][] = [];

  if (parsedRows.length > 0) {
    headerCells = parsedRows[0];
  }

  // Detect separator row (e.g. |---|---|)
  const hasSeparator = parsedRows.length > 1 && parsedRows[1].every(cell => cell.includes('-') || cell === '');
  const startIdx = hasSeparator ? 2 : 1;
  bodyRows = parsedRows.slice(startIdx);

  // Render text segments within table cell supporting bold ** and inline code `
  const renderCellContent = (cellText: string) => {
    const segments: React.ReactNode[] = [];
    let currentText = '';
    let i = 0;
    while (i < cellText.length) {
      if (cellText.substring(i, i + 2) === '**') {
        if (currentText) {
          segments.push(<span key={segments.length}>{currentText}</span>);
          currentText = '';
        }
        const closingIdx = cellText.indexOf('**', i + 2);
        if (closingIdx !== -1) {
          const boldText = cellText.substring(i + 2, closingIdx);
          segments.push(<strong key={segments.length} className="font-black text-[#2E3192]">{boldText}</strong>);
          i = closingIdx + 2;
        } else {
          currentText += '**';
          i += 2;
        }
      } else if (cellText[i] === '`') {
        if (currentText) {
          segments.push(<span key={segments.length}>{currentText}</span>);
          currentText = '';
        }
        const closingIdx = cellText.indexOf('`', i + 1);
        if (closingIdx !== -1) {
          const codeText = cellText.substring(i + 1, closingIdx);
          segments.push(<code key={segments.length} className="font-mono text-[10px] bg-slate-50 text-rose-500 px-1 py-0.5 rounded border border-slate-200/50">{codeText}</code>);
          i = closingIdx + 1;
        } else {
          currentText += '`';
          i += 1;
        }
      } else {
        currentText += cellText[i];
        i++;
      }
    }
    if (currentText) segments.push(<span key={segments.length}>{currentText}</span>);
    return segments;
  };

  return (
    <div key={blockIdx} className="w-full overflow-x-auto my-3 border border-slate-100 rounded-2xl shadow-sm bg-white">
      <table className="w-full text-left text-xs border-collapse min-w-[360px]">
        <thead>
          <tr className="bg-gradient-to-r from-[#1E2060] to-[#2E3192] text-white">
            {headerCells.map((header, idx) => (
              <th key={idx} className="p-3 font-black uppercase tracking-wider text-[10px] border-b border-indigo-900/10">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bodyRows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-indigo-50/20 transition-colors odd:bg-white even:bg-slate-50/50">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="p-3 text-slate-700 font-semibold leading-relaxed">
                  {renderCellContent(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper to format AI markdown responses (headers ###, bold **, lists -, code blocks `)
const renderMessageContent = (content: string, role: 'user' | 'assistant' | 'system') => {
  if (role === 'system') {
    return <p className="text-xs font-semibold leading-relaxed">{content}</p>;
  }

  // Parse lines into text and table blocks
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIdx) => {
        if (block.type === 'table') {
          return renderTableBlock(block.lines, role, blockIdx);
        }

        if (block.type === 'blockquote') {
          return renderBlockquoteBlock(block.lines, role, blockIdx);
        }

        // Render standard text lines inside this block
        return (
          <div key={blockIdx} className="space-y-1">
            {block.lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              
              // Detect headers (e.g. ### Heading or ## Heading)
              let isHeader = false;
              let headerLevel = 0;
              let cleanLine = line;
              
              if (trimmed.startsWith('#')) {
                let hashCount = 0;
                while (hashCount < trimmed.length && trimmed[hashCount] === '#') {
                  hashCount++;
                }
                if (hashCount > 0 && hashCount <= 6 && trimmed[hashCount] === ' ') {
                  isHeader = true;
                  headerLevel = hashCount;
                  cleanLine = trimmed.substring(hashCount + 1).trim();
                }
              }

              // Detect list items (bullet points)
              const isBullet = !isHeader && (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• '));
              if (isBullet) {
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  cleanLine = trimmed.substring(2);
                } else if (trimmed.startsWith('• ')) {
                  cleanLine = trimmed.substring(2);
                }
              }


              // Parse markdown segments (**bold**, *italic*, `code`)
              const segments: React.ReactNode[] = [];
              let currentText = '';
              let i = 0;
              
              while (i < cleanLine.length) {
                // Bold (**text**)
                if (cleanLine.substring(i, i + 2) === '**') {
                  if (currentText) {
                    segments.push(<span key={segments.length}>{currentText}</span>);
                    currentText = '';
                  }
                  const closingIdx = cleanLine.indexOf('**', i + 2);
                  if (closingIdx !== -1) {
                    const boldText = cleanLine.substring(i + 2, closingIdx);
                    segments.push(
                      <strong key={segments.length} className={`font-black ${role === 'user' ? 'text-orange-200' : 'text-[#2E3192] bg-indigo-50/70 px-1.5 py-0.5 rounded-md'}`}>
                        {boldText}
                      </strong>
                    );
                    i = closingIdx + 2;
                  } else {
                    currentText += '**';
                    i += 2;
                  }
                } 
                // Italic (*text*)
                else if (cleanLine[i] === '*' && cleanLine[i + 1] !== '*') {
                  if (currentText) {
                    segments.push(<span key={segments.length}>{currentText}</span>);
                    currentText = '';
                  }
                  const closingIdx = cleanLine.indexOf('*', i + 1);
                  if (closingIdx !== -1) {
                    const italicText = cleanLine.substring(i + 1, closingIdx);
                    segments.push(<em key={segments.length} className="italic font-medium">{italicText}</em>);
                    i = closingIdx + 1;
                  } else {
                    currentText += '*';
                    i += 1;
                  }
                }
                // Inline code (`code`)
                else if (cleanLine[i] === '`') {
                  if (currentText) {
                    segments.push(<span key={segments.length}>{currentText}</span>);
                    currentText = '';
                  }
                  const closingIdx = cleanLine.indexOf('`', i + 1);
                  if (closingIdx !== -1) {
                    const codeText = cleanLine.substring(i + 1, closingIdx);
                    segments.push(
                      <code key={segments.length} className={`font-mono text-xs px-1.5 py-0.5 rounded border ${role === 'user' ? 'bg-indigo-800/40 text-orange-200 border-indigo-700' : 'bg-slate-50 text-rose-500 border-slate-200/60'}`}>
                        {codeText}
                      </code>
                    );
                    i = closingIdx + 1;
                  } else {
                    currentText += '`';
                    i += 1;
                  }
                } 
                // Regular text
                else {
                  currentText += cleanLine[i];
                  i++;
                }
              }
              
              if (currentText) {
                segments.push(<span key={segments.length}>{currentText}</span>);
              }

              // Render headers beautifully
              if (isHeader) {
                const headerClasses = headerLevel === 1 
                  ? 'text-base font-black text-[#2E3192] mt-4 mb-2 flex items-center gap-2 uppercase tracking-tight'
                  : headerLevel === 2
                  ? 'text-sm font-black text-[#2E3192] mt-3.5 mb-2 flex items-center gap-2 uppercase tracking-tight'
                  : 'text-xs font-black text-[#2E3192] mt-3 mb-1.5 flex items-center gap-1.5 uppercase tracking-tight';

                const pillHeight = headerLevel === 1 ? 'h-4.5' : headerLevel === 2 ? 'h-4' : 'h-3.5';

                return (
                  <div key={lineIdx} className={`${role === 'user' ? 'text-white' : 'text-[#2E3192]'}`}>
                    {role === 'user' ? (
                      <p className="text-sm font-black uppercase tracking-wider my-1">{cleanLine}</p>
                    ) : (
                      <div className={headerClasses}>
                        <span className={`w-1.5 ${pillHeight} bg-orange-500 rounded-full shrink-0 shadow-sm`}></span>
                        <span>{segments}</span>
                      </div>
                    )}
                  </div>
                );
              }

              if (isBullet) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 ml-2 my-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${role === 'user' ? 'bg-orange-300' : 'bg-orange-500'}`}></span>
                    <span className={`text-sm font-semibold leading-relaxed ${role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                      {segments}
                    </span>
                  </div>
                );
              }


              return (
                <p key={lineIdx} className={`text-sm leading-relaxed my-0.5 min-h-[1.25rem] ${role === 'user' ? 'font-semibold text-white' : 'font-medium text-slate-800'}`}>
                  {segments}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function ToxiAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [useReasoner, setUseReasoner] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Chào bạn! Tôi là Toxi AI - Người đồng hành học tập và cố vấn tiếng Trung cá nhân của bạn. Hôm nay bạn muốn nâng cấp kỹ năng gì? Hãy chọn các gợi ý bên dưới hoặc nhắn tin cho tôi nhé! 🧠💬' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Simulated or fetched profile
  const [userProfile, setUserProfile] = useState<ToxiUserProfile>({
    id: 'user-1',
    name: 'Học viên',
    level: 'Beginner',
    goal: 'general_communication',
    interests: ['Văn hóa', 'Giao tiếp thực tế'],
    learningStyle: 'Thực hành phản xạ'
  });

  const teaserTexts = [
    "Cần giải thích cấu trúc chữ Hán? ✍️ Hỏi tôi ngay!",
    "Lập lộ trình ôn thi HSK cấp tốc? 🎯 Nhấp vào đây nhé!",
    "Luyện phản xạ giao tiếp tiếng Trung? 💬 Tôi sẵn sàng!",
    "Kinh nghiệm xin học bổng du học? 🇨🇳 Tìm hiểu ngay!"
  ];

  // Rotate teaser messages
  useEffect(() => {
    const interval = setInterval(() => {
      setTeaserIndex((prev) => (prev + 1) % teaserTexts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Show teaser after a 2.5 second delay (first load)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !sessionStorage.getItem('toxi_teaser_dismissed')) {
        setShowTeaser(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Global event listener to open Toxi AI from header buttons
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setShowTeaser(false);
    };

    window.addEventListener('open-toxi-ai', handleOpenEvent);
    return () => {
      window.removeEventListener('open-toxi-ai', handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    // Attempt to load profile from supabase
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase.from('toxi_profiles').select('*').eq('id', session.user.id).maybeSingle();
          if (profile) {
            setUserProfile(prev => ({
              ...prev,
              id: session.user.id,
              name: profile.full_name || 'Học viên',
              // Dynamic level mappings if available
            }));
          }
        }
      } catch (err) {
        console.warn('Could not fetch supabase user details, using fallback simulation:', err);
      }
    };
    fetchUser();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || input.trim();
    if (!messageContent || isLoading) return;

    if (!textToSend) setInput('');
    
    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = { 
      id: userMsgId, 
      role: 'user', 
      content: messageContent 
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setShowTeaser(false);

    try {
      const context: ToxiAIContext = { profile: userProfile };
      // Map message history to engine structure
      const aiHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const replyContent = await toxiAIEngine.chat(messageContent, context, aiHistory, useReasoner);
      
      const replyMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: replyContent,
        isReasoning: useReasoner
      };
      setMessages(prev => [...prev, replyMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi Toxi AI:', error);
      const errorMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'system', 
        content: 'Kết nối mạng yếu hoặc không ổn định. Tôi đang thử kết nối lại, vui lòng gửi lại tin nhắn sau ít phút!' 
      };
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

  const dismissTeaser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTeaser(false);
    sessionStorage.setItem('toxi_teaser_dismissed', 'true');
  };

  const handleChipClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const clearChat = () => {
    if (window.confirm("Bạn có muốn làm mới cuộc trò chuyện với trợ lý?")) {
      setMessages([
        { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: 'Chào bạn! Cuộc trò chuyện đã được làm mới. Hãy chọn các gợi ý bên dưới hoặc hỏi tôi bất cứ câu hỏi nào về tiếng Trung nhé! 💡🇨🇳' 
        }
      ]);
    }
  };

  return (
    <>
      {/* 1. FLOATING ACTION CONTAINER (FAB & TEASER) */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-[350] flex flex-col items-end gap-3 pointer-events-none select-none">
          {/* Elegant Speech Teaser Bubble */}
          {showTeaser && (
            <div 
              onClick={() => { setIsOpen(true); setShowTeaser(false); }}
              className="pointer-events-auto cursor-pointer animate-in fade-in slide-in-from-bottom-5 duration-500 bg-white/95 backdrop-blur-xl border border-indigo-100 shadow-[0_12px_40px_rgba(46,49,146,0.15)] rounded-2xl p-4 max-w-[280px] md:max-w-[320px] relative flex gap-3 group items-start hover:-translate-y-1 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E3192] to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-900/10">
                <Sparkles className="w-4 h-4 text-orange-300 animate-pulse" />
              </div>
              <div className="flex-1 pr-4">
                <p className="text-[10px] font-black tracking-widest text-[#2E3192] uppercase mb-0.5">Toxi AI gợi ý</p>
                <p className="text-xs font-bold text-slate-700 leading-snug tracking-tight">
                  {teaserTexts[teaserIndex]}
                </p>
              </div>
              <button 
                onClick={dismissTeaser}
                className="absolute top-2 right-2 w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Little triangle arrow pointing to the FAB */}
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-indigo-100 rotate-45"></div>
            </div>
          )}

          {/* Floating Action Button */}
          <button 
            onClick={() => { setIsOpen(true); setShowTeaser(false); }}
            className="pointer-events-auto w-14 h-14 bg-gradient-to-tr from-[#2E3192] to-indigo-600 hover:from-indigo-600 hover:to-[#2E3192] rounded-full flex items-center justify-center text-white shadow-[0_8px_32px_rgba(46,49,146,0.4)] hover:scale-110 hover:shadow-[0_12px_40px_rgba(46,49,146,0.6)] transition-all duration-300 relative group animate-in fade-in zoom-in"
          >
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform relative z-10" />
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping group-hover:animate-none"></span>
            {/* Notification Glow Spot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-full animate-pulse shadow-md"></span>
          </button>
        </div>
      )}

      {/* 2. CHATBOX PORTAL CONTAINER (MODERN CLASSIC & GLASSMORPHISM STYLE) */}
      {isOpen && (
        <div 
          className={`fixed z-[450] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col bg-white/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.18)] border border-slate-200/50 
          ${isExpanded 
            ? 'top-4 bottom-4 left-4 right-4 rounded-3xl' 
            : 'bottom-0 left-0 right-0 w-full h-[90vh] rounded-t-[2.5rem] md:bottom-6 md:right-6 md:left-auto md:w-[420px] md:h-[640px] md:rounded-[2.5rem]'
          } ${useReasoner ? 'ring-2 ring-orange-500/30' : ''}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 bg-gradient-to-r from-[#1E2060] to-[#2E3192] text-white rounded-t-[2.5rem] md:rounded-t-[2.5rem] relative overflow-hidden shrink-0">
            {/* Subtle glow background in header */}
            <div className="absolute top-[-50%] left-[-20%] w-[120px] h-[120px] bg-orange-500/10 blur-[40px] rounded-full"></div>
            
            <div className="flex items-center gap-3 relative.z-10">
              <div className={`w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md ${useReasoner ? 'ring-2 ring-orange-400' : ''}`}>
                <Bot className={`w-6 h-6 text-white ${isLoading ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight text-white uppercase leading-none">Toxi AI Assistant</h3>
                  {useReasoner && (
                    <span className="px-1.5 py-0.5 bg-orange-500 text-[8px] font-black rounded uppercase tracking-wider text-white shadow-sm shadow-orange-900/30 animate-pulse">
                      R1 active
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {useReasoner ? 'Cố vấn tư duy sâu (R1)' : 'Trợ lý tiếng Trung cá nhân'}
                </p>
              </div>
            </div>

            {/* Header Toolbar Controls */}
            <div className="flex items-center gap-1 relative z-10">
              {/* Refresh/Clear chat */}
              <button 
                onClick={clearChat}
                title="Làm mới chat"
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-90"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {/* Expand to Fullscreen (Desktop only) */}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-90"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              
              {/* Close panel */}
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-90"
              >
                {isExpanded ? <X className="w-4.5 h-4.5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Deep Reasoning Switch Banner (Prominent yet clean toggle) */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Brain className={`w-4 h-4 ${useReasoner ? 'text-orange-500' : 'text-slate-400'}`} />
              <span>Chế độ Tư duy sâu (TongXiao-R1)</span>
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-300" />
                <div className="absolute left-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg w-48 shadow-xl leading-relaxed z-[500]">
                  Kích hoạt mô hình lập luận phức tạp để giải thích ngữ pháp khó, dịch thuật chuyên sâu hoặc lập lộ trình khoa học.
                </div>
              </div>
            </div>
            
            {/* Custom iOS-like switch toggle */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={useReasoner} 
                onChange={() => setUseReasoner(!useReasoner)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent bg-[#FBFBFF]">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}
              >
                <div className={`max-w-[88%] rounded-2xl p-4 shadow-sm relative group/bubble
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#2E3192] to-indigo-700 text-white rounded-tr-none' 
                    : msg.role === 'system'
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-none text-xs text-center w-full'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Avatar or Tag for AI assistant */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className={`w-3.5 h-3.5 ${msg.isReasoning ? 'text-orange-500' : 'text-[#2E3192]'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${msg.isReasoning ? 'text-orange-500' : 'text-[#2E3192]'}`}>
                        Toxi AI {msg.isReasoning ? '(R1)' : ''}
                      </span>
                    </div>
                  )}
                  
                  {/* Message Content with Custom Markdown Formatter */}
                  <div className="selection:bg-[#2E3192]/20">
                    {renderMessageContent(msg.content, msg.role)}
                  </div>
                  
                  {/* Subtle reasoning badge inside messages if generated with R1 */}
                  {msg.role === 'assistant' && msg.isReasoning && (
                    <div className="mt-2 pt-1.5 border-t border-slate-50 flex items-center justify-between text-[9px] font-black text-orange-500 uppercase tracking-widest">
                      <span>Mô hình tư duy sâu R1</span>
                      <Brain className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading / Bouncing dots */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-[#2E3192] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-[#2E3192]/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider ml-1">
                    {useReasoner ? 'Toxi AI đang phân tích sâu...' : 'Toxi AI đang nhập...'}
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Learning Prompts (Shows only when user starts or needs ideas) */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Đề xuất học tập nhanh</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none drag-scroll">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(qp.prompt)}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-white border border-slate-200/60 text-slate-600 hover:text-[#2E3192] hover:border-[#2E3192]/30 active:scale-95 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  {qp.text}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Field & Controls */}
          <div className="p-4 bg-white border-t border-slate-100 rounded-b-[2.5rem] md:rounded-b-[2.5rem] shrink-0">
            <div className="relative flex items-end gap-2">
              {/* Attachment Button */}
              <button 
                onClick={() => alert("Tính năng tải lên giáo trình hoặc hình ảnh bài tập sẽ khả dụng trong bản cập nhật tới! Vui lòng hỏi trực tiếp trợ lý.")}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#2E3192] hover:bg-[#2E3192]/5 border border-slate-200/50 transition-all active:scale-90"
                title="Tải lên ảnh bài tập"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              {/* Textarea */}
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={useReasoner ? "Hỏi Toxi AI (R1) - Hỗ trợ lập luận sâu..." : "Hỏi Toxi AI bất cứ điều gì..."}
                className="w-full max-h-24 min-h-[44px] py-3 px-4 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10 resize-none shadow-inner transition-all scrollbar-thin"
                rows={1}
              />
              
              {/* Send Button */}
              <button 
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#2E3192] to-indigo-600 text-white hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
              </button>
            </div>
            
            {/* Copyright Disclaimer */}
            <p className="text-center mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Trực thuộc hệ sinh thái giáo dục thông minh Toxi Edu
            </p>
          </div>
        </div>
      )}
    </>
  );
}
