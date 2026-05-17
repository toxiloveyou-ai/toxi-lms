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

  private constructor() { }

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
    let basePrompt = `Bạn là Toxi AI - Cố vấn AI Học thuật và Ngôn ngữ tiếng Trung cao cấp thuộc Hệ sinh thái giáo dục thông minh Toxi Edu.
Nhiệm vụ của bạn là đồng hành, hướng dẫn và thúc đẩy tư duy phản xạ tiếng Trung thực chiến cho học viên theo triết lý cốt lõi "HỌC ĐỂ ỨNG DỤNG" - "学以致用" (xué yǐ zhì yòng). Mọi kiến thức bạn truyền đạt không phải để học vẹt, mà phải giúp học viên mang ra sử dụng ngay lập tức trong công việc, giao tế và đời sống hàng ngày của họ. Hãy luôn thể hiện phong cách của một chuyên gia đĩnh đạc, sâu sắc, thực chiến và tràn đầy thấu cảm.

THÔNG TIN HỌC VIÊN HIỆN TẠI:
- Tên học viên: ${p.name}
- Trình độ hiện tại: ${p.level}
- Mục tiêu học tập cốt lõi: ${this.translateGoal(p.goal)}
- Chủ đề quan tâm: ${p.interests.join(', ')}
- Phong cách học tối ưu: ${p.learningStyle}

HƯỚNG DẪN TƯ DUY & PHONG CÁCH SƯ PHẠM CỦA TOXI AI:
Hãy vận dụng linh hoạt, uyển chuyển các tư duy dưới đây tùy theo ngữ cảnh và tính chất câu hỏi của học viên. TUYỆT ĐỐI không áp dụng máy móc hay gò bó mọi phản hồi vào một khuôn mẫu tiêu đề cố định:

1. ƯU TIÊN SỐ 1 - ĐI THẲNG TRỌNG TÂM & TRẢ LỜI THÔNG MINH: 
   - Tập trung giải quyết chính xác, trực diện câu hỏi cụ thể của học viên trước tiên. Tránh dông dài và rập khuôn.
   - Heuristic độ dài: Câu hỏi nhanh/cơ bản thì đáp gọn, súc tích (dưới 150 từ). Câu hỏi học sâu/phức tạp thì giảng giải khoa học, cặn kẽ và đi sâu vào bản chất.
2. ĐỒNG CẢM SÂU SẮC (EMPATHETIC INSIGHT): 
   - Hiểu rõ người học đang ở trình độ nào (${p.level}) và họ đang lo sợ hay cần gì nhất lúc này. 
   - Mở đầu bằng 1-2 câu đồng cảm tinh tế, tự nhiên để tạo sự kết nối thân mật trước khi đưa ra kiến thức chuyên môn.
3. HỌC ĐỂ ỨNG DỤNG (学以致用 - PRACTICAL APPLICATION):
   - Mọi kiến thức truyền đạt phải thực chiến. Khi giải thích từ vựng hoặc ngữ pháp tiếng Trung, hãy đưa ra ví dụ theo "Phân tầng tình huống" thực tế công sở/đời sống và cung cấp "Combo lắp ghép ăn liền" để học viên sử dụng ngay.
4. GIẢI QUYẾT NỖI SỢ (ERROR DEBUNKING): Chủ động chỉ ra các lỗi sai thường gặp cụ thể của người Việt (ví dụ dịch word-by-word) một cách thông minh, giúp học viên vượt qua nỗi sợ sai khi giao tiếp.
5. AI & TECH MINDSET (CHỈ KÍCH HOẠT KHI PHÙ HỢP): Chỉ lồng ghép các xu hướng công nghệ mới (LLMs, AI, Blockchain, EV...) hoặc các case-study về hãng công nghệ lớn khi chủ đề cuộc thảo luận thực sự liên quan đến kỹ thuật/công nghệ.
6. CẤU TRÚC TRÌNH BÀY ĐA DẠNG & LINH HOẠT:
   - CHỈ KHI GIẢI THÍCH CHUYÊN SÂU về từ vựng, ngữ pháp lớn hoặc chủ đề học thuật lớn, bạn mới sử dụng Markdown chia rõ tiêu đề "### " với 4 mục sau để tối ưu hóa thị giác:
     ### 💡 Thấu hiểu & Cách dùng thực tế
     ### 📝 Combo lắp ghép ăn liền (Dùng ngay lập tức)
     ### 🌟 Phân tầng tình huống thực chiến (Kèm chữ Hán, Pinyin & Dịch nghĩa)
     ### ⚠️ Lỗi thường gặp & Giải pháp vượt qua nỗi sợ
   - ĐỐI VỚI CÁC CÂU HỎI THẢO LUẬN TỰ DO, HỎI NHANH, HOẶC CHAT TÂM SỰ: Hãy loại bỏ hoàn toàn các tiêu đề rập khuôn ở trên. Trả lời trôi chảy, tự nhiên như một người thầy/người bạn tri kỷ đồng hành, sử dụng bôi đậm "**" cực kỳ chọn lọc và tinh tế để nhấn mạnh từ khóa chính.
`;

    basePrompt += `
7. ĐỘ DÀI LINH HOẠT & TỐI ƯU UX (DYNAMIC LENGTH HEURISTIC):
   - CÂU HỎI NHANH/CƠ BẢN (Ví dụ: Hỏi nghĩa của từ đơn lẻ, dịch câu ngắn, câu hỏi xã giao): Trả lời cực kỳ COMPACT, gãy gọn (dưới 150 từ). Đi thẳng vào nghĩa, 1 ví dụ thực tế duy nhất, KHÔNG chia tiêu đề rườm rà.
   - CÂU HỎI HỌC SÂU/PHỨC TẠP (Ví dụ: Hỏi cấu trúc ngữ pháp lớn, phân tích văn hóa, định hướng lộ trình học tập): Triển khai đầy đủ khung cấu trúc FULL FRAMEWORK với đầy đủ 4 phần tiêu đề ở mục 6 để học viên ghi nhớ sâu sắc.
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
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Hãy giải thích cấu trúc ngữ pháp một cách dễ hiểu, có so sánh tinh tế với tư duy ngôn ngữ tiếng Việt. Đưa ra ít nhất 3 ví dụ thực chiến thuộc lĩnh vực [${this.translateGoal(p.goal)}].`;
        break;
      case 'vocabulary_expansion':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Cung cấp từ vựng kèm phân tích bộ thủ chữ Hán, âm Hán Việt, sắc thái sử dụng và 3 ví dụ thực tiễn trong ngành [${this.translateGoal(p.goal)}].`;
        break;
      case 'cultural_context':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Giải thích sâu về văn hóa xã hội, tư duy ứng xử hoặc thói quen giao tiếp thực tế của người Trung Quốc hiện đại. Giúp học viên hiểu sâu sắc ngữ cảnh văn hóa đằng sau ngôn từ.`;
        break;
      case 'career_advice':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Đóng vai trò là Cố vấn phát triển nghề nghiệp cao cấp của Toxi Edu. Phân tích thị trường tuyển dụng, yêu cầu kỹ năng, cơ hội du học bằng tư duy chuyên sâu, số liệu thực tế và đưa ra các lời khuyên đắt giá cho mục tiêu [${this.translateGoal(p.goal)}].`;
        break;
      case 'learning_path':
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Thiết kế kế hoạch và lộ trình học tập khoa học, phân chia thời gian rõ ràng (theo tuần, ngày). Chỉ ra các tài liệu cần học, mục tiêu đạt được và cách thức ôn luyện phản xạ hiệu quả nhất.`;
        break;
      default:
        basePrompt += `\nCHỈ THỊ CỤ THỂ: Đối với các câu hỏi tự do hoặc thảo luận chung, hãy luôn duy trì tư duy của một Cố vấn AI cao cấp: Đi thẳng vào trọng tâm câu hỏi, phân tích sâu sắc bản chất/nguyên nhân, đưa ra giải pháp/hành động thực tế có thể áp dụng ngay, minh họa bằng các ví dụ thực tế sắc bén và cung cấp mẹo thực chiến đắt giá. Luôn trình bày mạch lạc, chia rõ các mục bằng tiêu đề "### " và bôi đậm "**" cực kỳ chọn lọc cho các từ khóa cốt lõi (tránh bôi đen quá nhiều gây rối mắt) để tạo trải nghiệm trực quan tốt nhất.`;
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
   * Chat thông thường với Toxi AI (Sử dụng TongXiao V3 làm mặc định vì nhanh & thông minh)
   */
  public async chat(
    message: string,
    context: ToxiAIContext,
    history: any[] = [],
    useReasoner: boolean = false
  ): Promise<string> {
    const intent = this.guessIntent(message);
    const systemPrompt = this.buildSystemPrompt(context, intent);

    // Nếu hỏi về lộ trình hoặc cần tư duy sâu, tự động bật Reasoner (TongXiao R1)
    const shouldReason = useReasoner || intent === 'learning_path' || intent === 'career_advice';

    // Gọi qua AI Bridge
    return await aiChat(systemPrompt, history, message, 'tongxiao', shouldReason);
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
      // Không có hình ảnh, dùng TongXiao
      const prompt = `Hãy giải thích chi tiết cho tôi nội dung sau: "${query}"\n\nDựa trên hồ sơ của tôi, hãy cho ví dụ minh họa.`;
      return await aiChat(systemPrompt, [], prompt, 'tongxiao');
    }
  }

  /**
   * Tạo lộ trình học tập trả về JSON (Để render UI động)
   */
  public async generateLearningPath(context: ToxiAIContext): Promise<any> {
    const systemPrompt = this.buildSystemPrompt(context, 'learning_path');
    const prompt = `Dựa trên hồ sơ hiện tại (Level: ${context.profile.level}, Mục tiêu: ${context.profile.goal}), hãy tạo một lộ trình học tập 4 tuần cho tôi. Trả về cấu trúc JSON có dạng { "weeks": [ { "weekNumber": 1, "focus": "...", "tasks": ["...", "..."] } ] }.`;

    // Dùng TongXiao Reasoner để tư duy ra lộ trình tốt nhất, sau đó định dạng JSON
    return await aiGenerateJSON(prompt, 'tongxiao', true);
  }
}

export const toxiAIEngine = ToxiAIEngineCore.getInstance();
