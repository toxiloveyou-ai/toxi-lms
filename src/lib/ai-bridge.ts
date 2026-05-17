import { geminiGenerate, geminiGenerateJSON, geminiChat, geminiVision } from './gemini';
import { deepseekGenerate, deepseekGenerateJSON, deepseekChat, DEEPSEEK_MODELS } from './deepseek';

/**
 * AI Bridge — Toxi AI
 * Một lớp trung gian để quản lý và chuyển đổi linh hoạt giữa các AI Provider (Gemini & DeepSeek).
 * Nguyên tắc: 
 * - V3 (deepseek-chat) -> 90% tác vụ hàng ngày (nhanh, rẻ).
 * - R1 (deepseek-reasoner) -> 10% tác vụ cần phân tích sâu (suy luận tốt).
 */

export type AIProvider = 'gemini' | 'deepseek' | 'tongxiao';

const DEFAULT_PROVIDER: AIProvider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'gemini';

/**
 * [TOXI AI] Quy tắc đảm bảo hiển thị sạch, tránh lỗi ký tự và markdown lạ.
 */
const CHARACTER_SAFETY_INSTRUCTION = "\n[QUY TẮC KỸ THUẬT: Trả về văn bản chuẩn UTF-8. Hãy sử dụng định dạng bôi đậm ** cho từ khóa quan trọng và dấu gạch đầu dòng - để liệt kê danh sách khi cần thiết để thông tin được rõ ràng, trực quan.]";


/**
 * Tạo văn bản (One-shot)
 */
export async function aiGenerate(
  prompt: string, 
  provider: AIProvider = DEFAULT_PROVIDER,
  useReasoner: boolean = false
): Promise<string> {
  const dsModel = useReasoner ? DEEPSEEK_MODELS.R1 : DEEPSEEK_MODELS.V3;
  const safePrompt = prompt + CHARACTER_SAFETY_INSTRUCTION;
  console.log(`[AI Bridge] Using ${provider} (${(provider === 'deepseek' || provider === 'tongxiao') ? dsModel : 'flash'}) for text generation...`);
  
  try {
    if (provider === 'deepseek' || provider === 'tongxiao') {
      const text = await deepseekGenerate(safePrompt, undefined, dsModel);
      // [TOXI AI Update] Loại bỏ thẻ <thought> của R1 để không hiển thị cho người dùng
      return text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
    }
    return await geminiGenerate(safePrompt);
  } catch (error) {
    console.error(`[AI Bridge] ${provider} failed, falling back...`, error);
    if (provider === 'deepseek' || provider === 'tongxiao') return await geminiGenerate(safePrompt);
    return await deepseekGenerate(safePrompt, undefined, DEEPSEEK_MODELS.V3);
  }
}

/**
 * Tạo JSON
 */
export async function aiGenerateJSON<T = any>(
  prompt: string, 
  provider: AIProvider = DEFAULT_PROVIDER,
  useReasoner: boolean = false
): Promise<T> {
  const dsModel = useReasoner ? DEEPSEEK_MODELS.R1 : DEEPSEEK_MODELS.V3;
  console.log(`[AI Bridge] Using ${provider} (${(provider === 'deepseek' || provider === 'tongxiao') ? dsModel : 'flash'}) for JSON generation...`);

  try {
    if (provider === 'deepseek' || provider === 'tongxiao') {
      return await deepseekGenerateJSON<T>(prompt, undefined, dsModel);
    }
    return await geminiGenerateJSON<T>(prompt);
  } catch (error) {
    console.error(`[AI Bridge] ${provider} JSON failed, falling back...`, error);
    if (provider === 'deepseek' || provider === 'tongxiao') return await geminiGenerateJSON<T>(prompt);
    return await deepseekGenerateJSON<T>(prompt, undefined, DEEPSEEK_MODELS.V3);
  }
}

/**
 * Chat (Multi-turn)
 */
export async function aiChat(
  systemInstruction: string,
  history: any[],
  userMessage: string,
  provider: AIProvider = DEFAULT_PROVIDER,
  useReasoner: boolean = false
): Promise<string> {
  const dsModel = useReasoner ? DEEPSEEK_MODELS.R1 : DEEPSEEK_MODELS.V3;
  const safeSystem = systemInstruction + CHARACTER_SAFETY_INSTRUCTION;
  console.log(`[AI Bridge] Using ${provider} (${(provider === 'deepseek' || provider === 'tongxiao') ? dsModel : 'flash'}) for chat...`);

  try {
    if (provider === 'deepseek' || provider === 'tongxiao') {
      const dsHistory = history.map(h => ({
        role: (h.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: typeof h.parts === 'string' ? h.parts : h.parts?.[0]?.text || ''
      }));
      const text = await deepseekChat(safeSystem, dsHistory, userMessage, dsModel);
      // [TOXI AI Update] Loại bỏ thẻ <thought> của R1 để không hiển thị cho người dùng
      return text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
    }
    return await geminiChat(safeSystem, history, userMessage);
  } catch (error) {
    console.error(`[AI Bridge] ${provider} chat failed, falling back...`, error);
    if (provider === 'deepseek' || provider === 'tongxiao') return await geminiChat(safeSystem, history, userMessage);
    const dsHistory = history.map(h => ({
      role: (h.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: typeof h.parts === 'string' ? h.parts : h.parts?.[0]?.text || ''
    }));
    const text = await deepseekChat(safeSystem, dsHistory, userMessage, DEEPSEEK_MODELS.V3);
    return text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
  }
}

/**
 * Phân tích Hình ảnh (Vision)
 */
export async function aiVision<T = any>(
  prompt: string, 
  base64Image: string
): Promise<T> {
  console.log(`[AI Bridge] Using gemini for Vision analysis...`);
  // Hiện tại chỉ Gemini hỗ trợ Vision tốt qua API chuẩn
  return await geminiVision<T>(prompt, base64Image);
}


