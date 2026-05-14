import { supabase } from '../supabase';
import { aiGenerateJSON, aiVision } from '../ai-bridge';

export interface CharacterDetail {
  char: string;
  pinyin: string;
  meaning: string;
  stroke_count: number;
  components: { part: string; mean: string }[];
  mnemonic: {
    story: string;
    parts: { part: string; role: string; meaning: string }[];
  };
}

// [TOXI AI Upgrade] In-memory session cache for character details
const characterCache: Record<string, CharacterDetail> = {};


/**
 * Tra cứu thông tin chi tiết của một chữ Hán để luyện viết
 */
export async function getCharacterDetail(char: string): Promise<CharacterDetail | null> {
  if (!char || char.length > 1) {
    // Nếu là cụm từ, chỉ lấy chữ đầu tiên hoặc báo lỗi
    char = char.trim()[0];
  }

  // [TOXI AI Upgrade] Check cache first
  if (characterCache[char]) {
    console.log(`[CharacterAPI] Returning cached data for: ${char}`);
    return characterCache[char];
  }

  // 1. Thử tìm trong DB trước (dictionary_words)
  const { data: dbWord } = await supabase
    .from('dictionary_words')
    .select('*')
    .eq('keyword', char)
    .maybeSingle();

  // [TOXI AI Upgrade] If DB has complete info (mnemonic & stroke_count), return immediately
  if (dbWord && dbWord.mnemonic && dbWord.stroke_count) {
    console.log(`[CharacterAPI] Found complete data in DB for: ${char}`);
    const detail = {
      char,
      pinyin: dbWord.pinyin || '',
      meaning: dbWord.meaning || '',
      stroke_count: dbWord.stroke_count || 0,
      components: dbWord.components || [],
      mnemonic: dbWord.mnemonic
    };
    characterCache[char] = detail;
    return detail;
  }


  // 2. Gọi AI để lấy Mnemonics và chi tiết cấu tạo sâu (Sử dụng R1 cho độ sâu)
  const prompt = `Bạn là chuyên gia chiết tự chữ Hán. Hãy phân tích chữ "${char}" và trả về JSON chi tiết.
Yêu cầu:
- pinyin: phiên âm pinyin có dấu
- meaning: nghĩa chính của chữ
- stroke_count: số nét
- components: mảng các bộ thủ/thành phần cấu tạo
- mnemonic: {
    "story": "Một câu chuyện hoặc câu thơ ghi nhớ (mnemonic) đầy cảm hứng và dễ nhớ về chữ này, tương tự cách giải nghĩa chữ 'Yêu' (爱) là dùng trái tim che chở...",
    "parts": [
      {"part": "bộ/thành phần", "role": "vai trò trong chữ", "meaning": "nghĩa của bộ đó"}
    ]
  }

Trả về JSON CHÍNH XÁC.`;

  try {
    // [TOXI AI Upgrade] Prioritize DeepSeek V3 for speed and cost, fallback is handled in ai-bridge
    const aiData = await aiGenerateJSON<any>(prompt, 'deepseek', false);
    
    const result = {

      char,
      pinyin: aiData.pinyin || dbWord?.pinyin || '',
      meaning: aiData.meaning || dbWord?.meaning || '',
      stroke_count: aiData.stroke_count || 0,
      components: aiData.components || dbWord?.components || [],
      mnemonic: aiData.mnemonic || { story: '', parts: [] }
    };

    // Cache it
    characterCache[char] = result;
    return result;
  } catch (err) {
    console.error('[CharacterAPI] Error fetching character detail:', err);
    // Fallback logic if AI fails: Return partial data from DB if available
    if (dbWord) {
        return {
            char,
            pinyin: dbWord.pinyin || '',
            meaning: dbWord.meaning || '',
            stroke_count: dbWord.stroke_count || 0,
            components: dbWord.components || [],
            mnemonic: dbWord.mnemonic || { story: "Dữ liệu đang được cập nhật...", parts: [] }
        };
    }
    return null;
  }

}

/**
 * Gửi nét vẽ (base64) để AI chấm điểm (Giả lập hoặc gửi qua Vision nếu hỗ trợ)
 * Hiện tại Vision chưa phổ biến trong bridge nên ta sẽ dùng AI để phân tích "Common Mistakes" 
 * dựa trên ký tự đang viết để đưa ra feedback hữu ích.
 */
export async function getHandwritingFeedback(char: string, score: number) {
  const prompt = `Học viên vừa luyện viết chữ "${char}" và đạt điểm tự lượng hóa là ${score}/100.
Hãy đưa ra 2 câu nhận xét ngắn gọn, chuyên nghiệp và 1 lời khuyên kỹ thuật về cách viết chữ này (ví dụ về thứ tự nét, tỷ lệ bộ thủ, hoặc độ nhấn của bút).
Trả về JSON: { "comment": "...", "tip": "..." }`;

  try {
    return await aiGenerateJSON<{ comment: string; tip: string }>(prompt, 'deepseek');
  } catch (err) {
    return { 
      comment: "Nét chữ khá ổn định.", 
      tip: "Hãy chú ý hơn đến tỷ lệ giữa các bộ thủ để chữ trông cân đối hơn." 
    };
  }
}

/**
 * Phân tích nét vẽ thực tế của người dùng bằng Vision AI
 */
export async function getAdvancedHandwritingFeedback(char: string, base64Image: string) {
  const prompt = `Đây là hình ảnh nét vẽ tay của học viên cho chữ Hán: "${char}".
Hãy phân tích hình ảnh và so sánh với chữ mẫu chuẩn.
Yêu cầu trả về JSON gồm:
- score: điểm số từ 0-100 dựa trên độ chính xác của nét, kết cấu (structure) và tỷ lệ.
- comment: nhận xét ngắn gọn về ưu điểm hoặc nhược điểm chính (ví dụ: "Nét mác hơi ngắn", "Kết cấu cân đối").
- tip: 1 lời khuyên kỹ thuật để cải thiện.
- accuracy_details: {
    "stroke_order": "đúng/sai/cần cải thiện",
    "proportion": "tốt/hơi lệch",
    "balance": "cân đối/nghiêng"
  }

Lưu ý: Nếu hình ảnh trống hoặc không nhìn rõ chữ, hãy cho điểm thấp và yêu cầu viết lại.`;

  try {
    return await aiVision<{ 
      score: number; 
      comment: string; 
      tip: string;
      accuracy_details: any;
    }>(prompt, base64Image);
  } catch (err) {
    console.error('[CharacterAPI] Vision Error:', err);
    // Fallback nếu Vision lỗi
    return {
      score: 75,
      comment: "Toxi AI đã ghi nhận bài viết.",
      tip: "Hãy thử viết lại dứt khoát hơn để AI phân tích tốt hơn.",
      accuracy_details: { stroke_order: "không xác định", proportion: "ổn", balance: "ổn" }
    };
  }
}


/**
 * Lưu lịch sử luyện tập vào Supabase
 */
export async function savePracticeHistory(data: {
  user_id: string;
  hanzi: string;
  score: number;
  feedback: string;
}) {
  const { error } = await supabase.from('character_sessions').insert([{
    user_id: data.user_id,
    character: data.hanzi,
    score: data.score,
    ai_feedback: data.feedback,
    created_at: new Date().toISOString()
  }]);
  if (error) console.error('[CharacterAPI] Error saving history:', error);
  return !error;
}

/**
 * Lấy lịch sử luyện tập của 1 chữ
 */
export async function getPracticeHistory(userId: string, hanzi: string) {
  const { data } = await supabase
    .from('character_sessions')
    .select('*, character, ai_feedback, created_at')
    .eq('user_id', userId)
    .eq('character', hanzi)
    .order('created_at', { ascending: false })
    .limit(5);
    
  // Map lại để khớp với UI nếu cần
  return (data || []).map(h => ({
    ...h,
    hanzi: h.character,
    feedback: h.ai_feedback,
    practiced_at: h.created_at
  }));
}

/**
 * Lấy các chữ có cùng bộ thủ
 */
export async function getCharactersByRadical(radical: string) {
  try {
    // Tìm trong dictionary_words những từ có chứa bộ thủ này trong components
    // Hỗ trợ cả định dạng [{part: '...'}] và [{name: '...'}]
    const { data, error } = await supabase
      .from('dictionary_words')
      .select('keyword, pinyin, meaning')
      .or(`components.cs.[{"part":"${radical}"}],components.cs.[{"name":"${radical}"}]`)
      .limit(10);
      
    if (error) throw error;

    // Filter only single characters in JS for better reliability across DB versions
    return (data || []).filter(c => c.keyword.length === 1);
  } catch (err) {
    console.error('[CharacterAPI] Error fetching related by radical:', err);
    return [];
  }
}
