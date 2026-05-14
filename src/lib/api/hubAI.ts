import { aiGenerateJSON } from '../ai-bridge';
import type { ReadingArticle, ListeningAudio, VocabHighlight, TranscriptSegment } from './readingListening';

/**
 * Phân tích bài đọc: Tự động tạo Pinyin, Dịch và Trích xuất từ vựng quan trọng
 */
export async function analyzeReadingContent(content: string, hskLevel: string) {
  const prompt = `Bạn là trợ lý Toxi AI chuyên gia biên soạn giáo trình tiếng Trung.
Hãy phân tích đoạn văn sau (Cấp độ ${hskLevel}):
"${content}"

Yêu cầu trả về định dạng JSON:
{
  "title_vi": "Tiêu đề tiếng Việt phù hợp",
  "translation": "Bản dịch tiếng Việt chau chuốt",
  "pinyin_data": [
    {"char": "你好", "pinyin": "nǐhǎo"},
    {"char": "，", "pinyin": ""},
    {"char": "世界", "pinyin": "shìjiè"}
  ],
  "vocabulary_highlights": [
    {
      "word": "từ mới",
      "pinyin": "phiên âm",
      "meaning": "nghĩa tiếng Việt",
      "example": "câu ví dụ tiếng Trung",
      "example_meaning": "dịch câu ví dụ"
    }
  ],
  "word_count": 123,
  "estimated_minutes": 5
}

Lưu ý: 
- pinyin_data phải bao gồm toàn bộ các từ/ký tự trong đoạn văn gốc theo đúng thứ tự.
- vocabulary_highlights chỉ trích xuất khoảng 5-10 từ vựng quan trọng/khó phù hợp với trình độ ${hskLevel}.`;

  try {
    return await aiGenerateJSON<{
      title_vi: string;
      translation: string;
      pinyin_data: Array<{ char: string, pinyin: string }>;
      vocabulary_highlights: VocabHighlight[];
      word_count: number;
      estimated_minutes: number;
    }>(prompt, 'deepseek');
  } catch (err) {
    console.error('analyzeReadingContent error:', err);
    throw err;
  }
}

/**
 * Phân tích bài nghe: Tạo transcript và trích xuất từ vựng từ nội dung thô (nếu có)
 */
export async function analyzeListeningContent(rawText: string, hskLevel: string) {
  const prompt = `Bạn là trợ lý Toxi AI. 
Dựa trên nội dung bài nghe (hoặc kịch bản) sau:
"${rawText}"

Hãy tạo transcript đồng bộ (giả lập timestamp) và trích xuất từ vựng. Trình độ ${hskLevel}.

Yêu cầu trả về JSON:
{
  "title_vi": "Tiêu đề tiếng Việt",
  "transcript": [
    {
      "start_ms": 0,
      "end_ms": 5000,
      "text": "Câu nói tiếng Trung",
      "pinyin": "phiên âm",
      "translation": "dịch tiếng Việt"
    }
  ],
  "vocabulary_highlights": [
     {"word": "...", "pinyin": "...", "meaning": "..."}
  ]
}

Lưu ý: start_ms và end_ms hãy ước lượng dựa trên độ dài câu văn (khoảng 200ms mỗi ký tự).`;

  try {
    return await aiGenerateJSON<{
      title_vi: string;
      transcript: TranscriptSegment[];
      vocabulary_highlights: VocabHighlight[];
    }>(prompt, 'deepseek');
  } catch (err) {
    console.error('analyzeListeningContent error:', err);
    throw err;
  }
}

/**
 * AI Live Chat Hybrid: Trợ lý Ngôn ngữ & Sự nghiệp Toàn diện (Tongxiao V1)
 * Kết hợp bộ óc Tongxiao V1, hạ tầng Gemini và dữ liệu thực tế từ Tongxiao.
 */
export async function aiChatTongxiao(query: string, history: any[], userHSK: string, mode: string, isLive: boolean = false) {
  const livePrompt = `BẠN ĐANG TRÒ CHUYỆN TRỰC TIẾP (LIVE TALK) VỚI NGƯỜI DÙNG.
  YÊU CẦU QUAN TRỌNG:
  1. TRẢ LỜI CỰC KỲ NGẮN GỌN VÀ TRỰC TIẾP (Tối đa 2 câu).
  2. SONG NGỮ: "Tiếng Trung (Tiếng Việt)".
  3. KHÔNG GIẢI THÍCH DÀI DÒNG. Hãy như một người bạn đang đối thoại.
  4. Nội dung: ${query}`;

  const prompt = isLive ? livePrompt : `BẠN LÀ TONGXIAO V1 - SIÊU TRỢ LÝ NGÔN NGỮ & CHIẾN LƯỢC SỰ NGHIỆP.
  ... (giữ nguyên prompt cũ nhưng bọc trong biến) ...`;
  
  // Re-defining the full prompt for clarity in the tool call
  const fullPrompt = isLive ? livePrompt : `BẠN LÀ TONGXIAO V1 - SIÊU TRỢ LÝ NGÔN NGỮ & CHIẾN LƯỢC SỰ NGHIỆP.

  VAI TRÒ: Bạn là chuyên gia tiếng Trung bậc thầy, am hiểu tường tận mọi khía cạnh:
  1. NGÔN NGỮ: Giải mã từ vựng, ngữ pháp, chiết tự và sắc thái biểu đạt.
  2. THÔNG TIN & SỰ KIỆN: Cập nhật tình hình mới nhất về lịch thi HSK, học bổng, các sự kiện văn hóa và xu hướng thị trường 2026.
  3. DOANH NGHIỆP & CƠ HỘI: Hiểu sâu về môi trường làm việc tại các tập đoàn FDI, văn hóa doanh nghiệp Trung Quốc và các cánh cửa sự nghiệp tiềm năng.

  BỘ ÓC (REASONING): Hãy suy luận đa chiều như mô hình Tongxiao V1. Phân tích vấn đề từ nhiều góc nhìn để giúp người học phát triển TOÀN DIỆN.

  YÊU CẦU ĐỊNH DẠNG JSON:
  {
    "summary": "Câu trả lời trực tiếp hoặc thông báo cần thêm thông tin.",
    "questions": ["Câu hỏi 1 để làm rõ ngữ cảnh", "Câu hỏi 2 nếu cần"],
    "analysis": "Phân tích (để trống nếu đang đợi người dùng trả lời câu hỏi làm rõ).",
    "roadmap": "Lộ trình (để trống nếu chưa đủ thông tin).",
    "grammar": ["Cấu trúc ngữ pháp liên quan"],
    "tags": ["Từ vựng liên quan"]
  }

  QUY TẮC PHẢN HỒI (LINH HOẠT): 
  - Ưu tiên trả lời hữu ích ngay lập tức dựa trên dữ liệu hiện có. Đừng quá cứng nhắc trong việc đòi hỏi thông tin.
  - CHỈ sử dụng mảng 'questions' khi thực sự cần thông tin để cá nhân hóa chuyên sâu hoặc khi câu hỏi quá mơ hồ. 
  - Nếu câu hỏi đủ rõ ràng, hãy trả lời đầy đủ ở các phần 'summary', 'analysis', 'roadmap' và có thể để 'questions' trống.
  - KHÔNG tự bịa ngữ cảnh. Nếu không chắc, hãy trả lời ở mức độ kiến thức chung (General knowledge) và gợi ý các hướng đi tiếp theo.
  - LUÔN trả về JSON.

  Nội dung: "${query}"
  Lịch sử: ${JSON.stringify(history.slice(-3))}
  Dữ liệu người dùng: ${userHSK ? `Trình độ ${userHSK}` : 'Chưa rõ trình độ'} | Chế độ: ${mode}`;

  try {
    if (isLive) {
      // Dùng Gemini cho Live Talk để tốc độ nhanh nhất (latency thấp)
      const { geminiGenerateJSON } = await import('../gemini');
      return await geminiGenerateJSON<any>(fullPrompt);
    }

    const { aiGenerateJSON } = await import('../ai-bridge');
    // Chế độ bình thường dùng DeepSeek R1 để có khả năng suy luận sâu
    return await aiGenerateJSON<any>(fullPrompt, 'deepseek', true);
  } catch (err) {
    console.error('aiChatTongxiao connection failed, falling back...', err);
    try {
      const { geminiGenerateJSON } = await import('../gemini');
      return await geminiGenerateJSON<any>(fullPrompt);
    } catch (fallbackErr) {
      console.error('Ultimate AI fallback failed:', fallbackErr);
      return {
        summary: "Ối, hình như sóng não của Toxi đang gặp chút nhiễu! (Kết nối tri thức bị gián đoạn)",
        questions: ["Bạn có muốn thử nói lại một lần nữa không?", "Toxi có nên thử kết nối lại ngay nhé?"],
        analysis: "Có vẻ như hệ thống đang bận rộn cập nhật tri thức mới hoặc gặp sự cố đường truyền tạm thời. Đừng lo, Toxi vẫn luôn ở đây đồng hành cùng bạn!",
        roadmap: "Hãy thử kiểm tra kết nối mạng hoặc làm mới trang để chúng ta tiếp tục nhé.",
        grammar: [],
        tags: ["Đang kết nối lại", "Gián đoạn tạm thời"]
      };
    }
  }
}

/**
 * Ghi nhật ký tương tác để phục vụ RAG và RLHF
 */
export async function logAIInteraction(data: {
  user_id: string;
  user_query: string;
  ai_response: any;
  active_mode: string;
  latency_ms: number;
}) {
  try {
    const { supabase } = await import('../supabase');
    const { error } = await supabase.from('ai_interaction_logs').insert([{
      user_id: data.user_id,
      user_query: data.user_query,
      ai_response: JSON.stringify(data.ai_response),
      active_mode: data.active_mode,
      latency_ms: data.latency_ms
    }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('logAIInteraction error:', err);
    return false;
  }
}

/**
 * Khôi phục lịch sử hội thoại gần đây
 */
export async function fetchAIHistory(userId: string) {
  try {
    const { supabase } = await import('../supabase');
    const { data, error } = await supabase
      .from('ai_interaction_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data.reverse().map(log => ({
      role: 'assistant',
      content: JSON.parse(log.ai_response),
      mode: log.active_mode,
      timestamp: new Date(log.created_at),
      user_query: log.user_query // Dùng để phục hồi cặp hỏi-đáp
    }));
  } catch (err) {
    console.error('fetchAIHistory error:', err);
    return [];
  }
}

/**
 * Lấy thông tin gói thành viên và hạn mức của User
 */
export async function getUserSubscription(userId: string) {
  try {
    const { supabase } = await import('../supabase');
    const { data, error } = await supabase
      .from('ai_user_dna')
      .select('membership_tier, daily_chat_count, last_chat_reset')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // Nếu chưa có DNA, tạo mặc định là Free
    if (!data) {
      const defaultData = { user_id: userId, membership_tier: 'free', daily_chat_count: 0 };
      await supabase.from('ai_user_dna').insert([defaultData]);
      return defaultData;
    }

    return data;
  } catch (err) {
    console.error('getUserSubscription error:', err);
    return { membership_tier: 'free', daily_chat_count: 0 };
  }
}

/**
 * Kiểm tra và cập nhật lượt sử dụng chat
 */
export async function checkAndIncrementUsage(userId: string) {
  const FREE_LIMIT = 20;
  
  try {
    const { supabase } = await import('../supabase');
    const sub = await getUserSubscription(userId);
    
    // Nếu là Pro/Enterprise, không giới hạn (hoặc giới hạn rất cao)
    if (sub.membership_tier !== 'free') return { allowed: true };

    // Kiểm tra hạn mức Free
    if (sub.daily_chat_count >= FREE_LIMIT) {
      return { allowed: false, limit: FREE_LIMIT };
    }

    // Tăng count (Trigger SQL sẽ tự reset nếu sang ngày mới)
    await supabase.rpc('increment_chat_count', { user_id_param: userId });
    
    return { allowed: true, current: sub.daily_chat_count + 1 };
  } catch (err) {
    console.error('checkAndIncrementUsage error:', err);
    return { allowed: true }; // Dự phòng cho phép dùng nếu lỗi hệ thống
  }
}

/**
 * Cập nhật điểm phản hồi cho câu trả lời của AI (RLHF)
 */
export async function updateFeedbackScore(userQuery: string, score: number) {
  try {
    const { supabase } = await import('../supabase');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Tìm log gần nhất của query này và update
    const { error } = await supabase
      .from('ai_interaction_logs')
      .update({ feedback_score: score })
      .eq('user_id', user.id)
      .eq('user_query', userQuery)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
  } catch (err) {
    console.error('updateFeedbackScore error:', err);
  }
}
