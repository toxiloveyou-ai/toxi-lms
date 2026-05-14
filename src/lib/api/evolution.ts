import { supabase } from '../supabase';
import { aiGenerateJSON } from '../ai-bridge';
import { updateTongxiaoMemory, logTongxiaoWisdom } from './tongxiao';

export interface LinguisticDNA {
  grammarPatterns: string[];
  vocabularyStrengths: string[];
  weaknesses: string[];
  preferredStyle: 'formal' | 'casual' | 'academic';
}

export interface EthicalGrowth {
  persistenceScore: number;
  culturalAwareness: string[];
  virtueNote: string;
}

/**
 * Phân tích sâu sắc sự tiến hóa của người học dựa trên lịch sử hội thoại
 * Lấy "Đạo đức làm gốc, Tài làm bệ phóng" làm tiêu chí đánh giá.
 */
export async function evolveLearnerProfile(userId: string, conversationHistory: any[]) {
  if (!userId || conversationHistory.length < 5) return null;

  const historyText = conversationHistory
    .slice(-10) // Lấy 10 tin nhắn gần nhất để phân tích
    .map(m => `${m.role === 'bot' ? 'AI' : 'User'}: ${m.content}`)
    .join('\n');
  
  const prompt = `Bạn là Hệ thống Tiến hóa Toxi AI (Evolution Engine). 
Nhiệm vụ: Phân tích "DNA Ngôn ngữ" (Tài) và "Sự phát triển Đạo đức/Thái độ" (Đức) của người học.

Dữ liệu hội thoại:
${historyText}

Yêu cầu trả về JSON chính xác:
{
  "linguisticDNA": {
    "grammarPatterns": ["Cấu trúc ngữ pháp đã dùng tốt"],
    "vocabularyStrengths": ["Nhóm từ vựng thành thạo"],
    "weaknesses": ["Điểm yếu hoặc lỗi sai cần cải thiện"],
    "preferredStyle": "formal" | "casual" | "academic"
  },
  "ethicalGrowth": {
    "persistenceScore": 1-100,
    "culturalAwareness": ["Hiểu biết văn hóa đã thể hiện"],
    "virtueNote": "Nhận xét ngắn về thái độ: kiên trì, trung thực, cầu tiến (lấy đạo đức làm gốc)"
  }
}
Chỉ trả về JSON.`;

  try {
    const analysis = await aiGenerateJSON(prompt, 'deepseek', true);
    if (analysis) {
      // Lưu vào bộ nhớ dài hạn của Toxi AI
      await updateTongxiaoMemory(userId, 'linguistic_dna', analysis.linguisticDNA);
      await updateTongxiaoMemory(userId, 'ethical_growth', analysis.ethicalGrowth);
      
      // Ghi lại dấu ấn trí tuệ
      await logTongxiaoWisdom(
        userId, 
        'evolution_insight', 
        `Tiến hóa mới: ${analysis.ethicalGrowth.virtueNote}. Phong cách: ${analysis.linguisticDNA.preferredStyle}`
      );
      
      return analysis;
    }
  } catch (e) {
    console.warn('[Evolution] Analysis failed:', e);
  }
  return null;
}

/**
 * Lấy thông tin tiến hóa hiện tại của người dùng
 */
export async function getLearnerEvolution(userId: string) {
  const { data, error } = await supabase
    .from('tongxiao_memory')
    .select('memory_key, memory_value')
    .eq('user_id', userId)
    .in('memory_key', ['linguistic_dna', 'ethical_growth']);

  if (error) return null;

  return data.reduce((acc: any, item) => {
    acc[item.memory_key] = item.memory_value;
    return acc;
  }, {});
}
