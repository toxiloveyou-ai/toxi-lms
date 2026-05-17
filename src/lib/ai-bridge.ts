import { supabase } from './supabase';

/**
 * AI Bridge — Toxi AI
 * Một lớp trung gian bảo mật để quản lý và chuyển đổi linh hoạt giữa các AI Provider (Gemini & DeepSeek)
 * thông qua Supabase Edge Function Proxy.
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
  const safePrompt = prompt + CHARACTER_SAFETY_INSTRUCTION;
  console.log(`[AI Bridge Secure Proxy] Routing one-shot generation to ${provider} via Supabase Edge Function...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('toxi-ai', {
      body: {
        action: 'generate',
        provider,
        useReasoner,
        payload: {
          prompt: safePrompt
        }
      }
    });

    if (error) throw error;
    return (data.text || "").replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
  } catch (error) {
    console.error(`[AI Bridge Error]`, error);
    throw new Error("Không thể kết nối với dịch vụ AI bảo mật.");
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
  console.log(`[AI Bridge Secure Proxy] Routing JSON generation to ${provider} via Supabase Edge Function...`);

  try {
    const { data, error } = await supabase.functions.invoke('toxi-ai', {
      body: {
        action: 'generateJSON',
        provider,
        useReasoner,
        payload: {
          prompt
        }
      }
    });

    if (error) throw error;
    
    const rawText = data.text || "{}";
    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    const cleaned = jsonMatch ? jsonMatch[0].trim() : rawText;
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error(`[AI Bridge JSON Error]`, error);
    throw new Error("Không thể tạo dữ liệu cấu trúc AI bảo mật.");
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
  const safeSystem = systemInstruction + CHARACTER_SAFETY_INSTRUCTION;
  console.log(`[AI Bridge Secure Proxy] Routing chat to ${provider} via Supabase Edge Function...`);

  try {
    const { data, error } = await supabase.functions.invoke('toxi-ai', {
      body: {
        action: 'chat',
        provider,
        useReasoner,
        payload: {
          systemInstruction: safeSystem,
          history,
          userMessage
        }
      }
    });

    if (error) throw error;
    return (data.text || "").replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
  } catch (error) {
    console.error(`[AI Bridge Chat Error]`, error);
    throw new Error("Không thể kết nối với dịch vụ AI bảo mật.");
  }
}

/**
 * Phân tích Hình ảnh (Vision)
 */
export async function aiVision<T = any>(
  prompt: string, 
  base64Image: string
): Promise<T> {
  console.log(`[AI Bridge Secure Proxy] Routing vision to Gemini via Supabase Edge Function...`);

  try {
    const { data, error } = await supabase.functions.invoke('toxi-ai', {
      body: {
        action: 'vision',
        provider: 'gemini',
        payload: {
          prompt,
          base64Image
        }
      }
    });

    if (error) throw error;
    
    const rawText = data.text || "{}";
    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    const cleaned = jsonMatch ? jsonMatch[0].trim() : rawText;
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error(`[AI Bridge Vision Error]`, error);
    throw new Error("Không thể xử lý phân tích hình ảnh bảo mật.");
  }
}
