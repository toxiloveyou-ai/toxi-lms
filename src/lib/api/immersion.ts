import { supabase } from '../supabase';
// import { geminiGenerateJSON, geminiGenerate } from '../gemini';
import { aiGenerateJSON, aiGenerate } from '../ai-bridge';

interface MaterialFilters {
  level?: string;
  type?: string;
}

export type WordToken = { text: string; pinyin: string; mean: string };

export async function getMaterials(filters?: MaterialFilters) {
  let query = supabase
    .from('immersion_materials')
    .select('*')
    .order('published_at', { ascending: false });

  if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
  if (filters?.level && filters.level !== 'all') query = query.eq('level', filters.level);

  const { data, error } = await query;
  if (error) { console.error('getMaterials error:', error); return []; }
  return data;
}

export async function getProgress(userId: string | null, materialId: string) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('immersion_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .single();
  if (error && error.code !== 'PGRST116') console.error('getProgress error:', error);
  return data;
}

export async function updateProgress(
  userId: string,
  materialId: string,
  data: { progress_percent?: number; last_position?: string; words_looked_up?: number }
) {
  const isCompleted = data.progress_percent && data.progress_percent >= 0.95;
  await supabase.from('immersion_progress').upsert({
    user_id: userId,
    material_id: materialId,
    status: isCompleted ? 'completed' : 'reading',
    ...data,
    completed_at: isCompleted ? new Date().toISOString() : undefined
  }, { onConflict: 'user_id,material_id' });
}

// ─────────────────────────────────────────────────────────────
// Parse content_cn → mảng WordToken qua Gemini, cache vào DB
// ─────────────────────────────────────────────────────────────
export async function parseContentTokens(material: any): Promise<WordToken[]> {
  // 1. Dùng cache nếu có
  if (material.key_words_json?.tokens && Array.isArray(material.key_words_json.tokens)) {
    return material.key_words_json.tokens as WordToken[];
  }

  const content = material.content_cn;
  if (!content) return [];

  // 2. Gọi Gemini tokenize
  const prompt = `Bạn là chuyên gia tiếng Trung. Hãy tách đoạn văn tiếng Trung sau thành các từ/cụm từ có nghĩa và trả về JSON.

Đoạn văn: "${content}"

Trả về JSON với format:
{
  "tokens": [
    {"text": "từ hoặc cụm từ", "pinyin": "phiên âm", "mean": "nghĩa tiếng Việt ngắn gọn"},
    ...
  ]
}

Quy tắc:
- Mỗi token là 1 từ có nghĩa (không tách từng chữ đơn lẻ vô nghĩa)
- Giữ dấu câu như 。，！？ làm token riêng với pinyin="" và mean=""
- Pinyin có dấu thanh đầy đủ
- Nghĩa ngắn gọn 1-4 từ tiếng Việt`;

  try {
    // [TOXI AI Update] Sử dụng DeepSeek để tokenize bài đọc (chi phí rẻ hơn Gemini khi xử lý văn bản dài)
    // Code cũ: const result = await geminiGenerateJSON<{ tokens: WordToken[] }>(prompt);
    const result = await aiGenerateJSON<{ tokens: WordToken[] }>(prompt, 'deepseek');
    const tokens = result.tokens || [];

    // 3. Lưu cache vào DB
    const existing = material.key_words_json || {};
    await supabase
      .from('immersion_materials')
      .update({ key_words_json: { ...existing, tokens } })
      .eq('id', material.id);

    return tokens;
  } catch (err) {
    console.error('parseContentTokens error (DeepSeek/Gemini):', err);
    return content.split('').map((ch: string) => ({ text: ch, pinyin: '', mean: '' }));
  }
}

// ─────────────────────────────────────────────────────────────
// AI Tongxiao Companion — tóm tắt / giải thích bài đọc
// ─────────────────────────────────────────────────────────────
export async function askTongxiaoAboutArticle(
  articleTitle: string,
  contentCn: string,
  contentVi: string,
  question: string
): Promise<string> {
  const prompt = `Bài đọc: ${articleTitle}\nNội dung Trung: ${contentCn}\nDịch: ${contentVi}\n\nHọc viên hỏi: ${question}\n\nHãy đóng vai trợ giảng Tongxiao, trả lời ngắn gọn, dễ hiểu và tập trung vào câu hỏi của học viên (nếu hỏi từ vựng/ngữ pháp thì giải thích rõ).`;

  // [TOXI AI Update] Sử dụng R1 (Reasoner) để giải thích ngữ pháp/nội dung bài đọc chuyên sâu
  return await aiGenerate(prompt, 'deepseek', true);
}
