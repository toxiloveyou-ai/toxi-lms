import { aiGenerate, aiGenerateJSON, aiChat, aiVision, type AIProvider } from './ai-bridge';

// ============================================================================
// TOXI AI ENGINE - Hệ sinh thái thông minh của Toxi Edu
// ============================================================================

export type LearningGoal = 
  | 'study_abroad' 
  | 'business' 
  | 'medical' 
  | 'engineering' 
  | 'general_communication'
  | 'hsk_prep';

export type UserLevel = 'Beginner' | 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4' | 'HSK5' | 'HSK6' | 'Advanced';

export interface ToxiUserProfile {
  id: string;
  name: string;
  level: UserLevel;
  goal: LearningGoal;
  interests: string[];
  learningStyle: string;
}

export type ToxiAIIntent = 
  | 'grammar_explanation' 
  | 'vocabulary_expansion' 
  | 'cultural_context' 
  | 'career_advice' 
  | 'learning_path'
  | 'general_chat';

export interface ToxiAIContext {
  profile: ToxiUserProfile;
  currentTask?: string;      // Ví dụ: Đang làm bài tập ngữ pháp bài 5
  recentErrors?: string[];   // Các lỗi học viên hay mắc phải
}

class ToxiAIEngineCore {
  private static instance: ToxiAIEngineCore;

  private constructor() {}

  public static getInstance(): ToxiAIEngineCore {
    if (!ToxiAIEngineCore.instance) {
      ToxiAIEngineCore.instance = new ToxiAIEngineCore();
    }
    return ToxiAIEngineCore.instance;
  }

  /**
   * Tạo System Prompt siêu cá nhân hóa dựa trên hồ sơ người dùng
   */
  private buildSystemPrompt(context: ToxiAIContext, intent: ToxiAIIntent): string {
    const p = context.profile;
    let basePrompt = `Bạn là Toxi AI - trợ lý chuyên dụng về giáo dục tiếng Trung và văn hóa Trung Quốc, thuộc hệ sinh thái Toxi Edu. 
Nhiệm vụ của bạn là đồng hành, hướng dẫn và truyền cảm hứng cho học viên một cách thông minh và cá nhân hóa.

THÔNG TIN HỌC VIÊN HIỆN TẠI:
- Tên: ${p.name}
- Trình độ: ${p.level}
- Mục tiêu học tập: ${this.translateGoal(p.goal)}
- Sở thích/Sự quan tâm: ${p.interests.join(', ')}
- Phong cách học: ${p.learningStyle}
`;

    if (context.recentErrors && context.recentErrors.length > 0) {
      basePrompt += `\nLƯU Ý: Học viên gần đây hay mắc các lỗi sau: ${context.recentErrors.join(', ')}. Hãy chú ý giải thích rõ nếu liên quan.\n`;
    }

    if (context.currentTask) {
      basePrompt += `\nNGỮ CẢNH HIỆN TẠI: Học viên đang ${context.currentTask}.\n`;
    }

    // Tinh chỉnh theo Intent (Ý định)
    switch (intent) {
      case 'grammar_explanation':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Hãy giải thích ngữ pháp một cách dễ hiểu, có so sánh với tiếng Việt. Đưa ra ít nhất 3 ví dụ liên quan đến lĩnh vực [${this.translateGoal(p.goal)}].`;
        break;
      case 'vocabulary_expansion':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Cung cấp từ vựng, từ đồng nghĩa, trái nghĩa và cách dùng trong thực tế (đặc biệt trong ngữ cảnh ${this.translateGoal(p.goal)}). Mở rộng kiến thức về chữ Hán (bộ thủ, câu chuyện chữ Hán nếu có).`;
        break;
      case 'cultural_context':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Giải thích sâu về văn hóa, lịch sử hoặc thói quen của người Trung Quốc liên quan đến chủ đề này. Giúp học viên hiểu "tại sao họ lại nói như vậy".`;
        break;
      case 'career_advice':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Đóng vai trò là một chuyên gia tư vấn định hướng nghề nghiệp và học thuật, sử dụng tư duy chuyên gia (expert mindset) để phân tích cơ hội và thách thức.`;
        break;
      case 'learning_path':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Thiết kế lộ trình học tập khoa học, khả thi, dựa trên trình độ hiện tại và mục tiêu của học viên. Trả lời chi tiết từng bước.`;
        break;
      default:
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Trả lời tự nhiên, thân thiện như một người bạn đồng hành, luôn khuyến khích học viên.`;
    }

    return basePrompt;
  }

  private translateGoal(goal: LearningGoal): string {
    const goals: Record<LearningGoal, string> = {
      study_abroad: 'Du học Trung Quốc',
      business: 'Kinh doanh & Thương mại',
      medical: 'Y tế & Chăm sóc sức khỏe',
      engineering: 'Khoa học Kỹ thuật',
      general_communication: 'Giao tiếp đời sống',
      hsk_prep: 'Luyện thi chứng chỉ HSK'
    };
    return goals[goal] || 'Học tập chung';
  }

  /**
   * Phân tích câu hỏi của người dùng để đoán Intent (Ý định)
   */
  private guessIntent(message: string): ToxiAIIntent {
    const lower = message.toLowerCase();
    if (lower.includes('ngữ pháp') || lower.includes('tại sao dùng') || lower.includes('cấu trúc')) return 'grammar_explanation';
    if (lower.includes('từ vựng') || lower.includes('nghĩa là gì') || lower.includes('chữ này')) return 'vocabulary_expansion';
    if (lower.includes('văn hóa') || lower.includes('lịch sử') || lower.includes('thói quen')) return 'cultural_context';
    if (lower.includes('định hướng') || lower.includes('du học') || lower.includes('xin việc') || lower.includes('công việc')) return 'career_advice';
    if (lower.includes('lộ trình') || lower.includes('bắt đầu từ đâu') || lower.includes('kế hoạch')) return 'learning_path';
    return 'general_chat';
  }

  // ==========================================================================
  // PUBLIC API: Giao tiếp với Frontend
  // ==========================================================================

  /**
   * Chat thông thường với Toxi AI (Sử dụng DeepSeek V3 làm mặc định vì nhanh & thông minh)
   */
  public async chat(
    message: string, 
    context: ToxiAIContext, 
    history: any[] = [],
    useReasoner: boolean = false
  ): Promise<string> {
    const intent = this.guessIntent(message);
    const systemPrompt = this.buildSystemPrompt(context, intent);
    
    // Nếu hỏi về lộ trình hoặc cần tư duy sâu, tự động bật Reasoner (DeepSeek R1)
    const shouldReason = useReasoner || intent === 'learning_path' || intent === 'career_advice';

    // Gọi qua AI Bridge
    return await aiChat(systemPrompt, history, message, 'deepseek', shouldReason);
  }

  /**
   * Giải thích một đoạn văn bản hoặc hình ảnh (hỗ trợ đa phương tiện với Gemini)
   */
  public async explain(
    query: string,
    context: ToxiAIContext,
    base64Image?: string
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context, 'vocabulary_expansion');
    
    if (base64Image) {
      // Nếu có hình ảnh, BẮT BUỘC dùng Gemini (Vision)
      const prompt = `${systemPrompt}\n\nNgười dùng đang nhờ bạn giải thích nội dung trong hình ảnh này. Câu hỏi: ${query}`;
      return await aiVision<{ explanation: string }>(prompt, base64Image).then(res => res.explanation || JSON.stringify(res));
    } else {
      // Không có hình ảnh, dùng DeepSeek
      const prompt = `Hãy giải thích chi tiết cho tôi nội dung sau: "${query}"\n\nDựa trên hồ sơ của tôi, hãy cho ví dụ minh họa.`;
      return await aiChat(systemPrompt, [], prompt, 'deepseek');
    }
  }

  /**
   * Tạo lộ trình học tập trả về JSON (Để render UI động)
   */
  public async generateLearningPath(context: ToxiAIContext): Promise<any> {
    const systemPrompt = this.buildSystemPrompt(context, 'learning_path');
    const prompt = `Dựa trên hồ sơ hiện tại (Level: ${context.profile.level}, Mục tiêu: ${context.profile.goal}), hãy tạo một lộ trình học tập 4 tuần cho tôi. Trả về cấu trúc JSON có dạng { "weeks": [ { "weekNumber": 1, "focus": "...", "tasks": ["...", "..."] } ] }.`;
    
    // Dùng DeepSeek Reasoner để tư duy ra lộ trình tốt nhất, sau đó định dạng JSON
    return await aiGenerateJSON(prompt, 'deepseek', true);
  }
}

export const toxiAIEngine = ToxiAIEngineCore.getInstance();
