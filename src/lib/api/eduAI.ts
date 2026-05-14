import { aiGenerateJSON } from '../ai-bridge';

/**
 * AI Roleplay: Giả lập tình huống giao tiếp dựa trên nội dung bài học
 */
export async function generateEduRoleplayResponse(
  lessonTitle: string,
  userMessage: string,
  history: any[],
  context: string = ""
) {
  const prompt = `Bạn là chuyên gia huấn luyện ngôn ngữ AI tại Toxi Edu, chuyên sâu về Tiếng Trung Ứng Dụng trong công việc.
  Bối cảnh bài học: "${lessonTitle}".
  Nội dung trọng tâm (từ vựng/ngữ pháp): ${context}
  
  NHIỆM VỤ:
  1. Nhập vai vào tình huống thực tế liên quan đến bài học (ví dụ: cấp trên, khách hàng, hoặc đồng nghiệp).
  2. Phản hồi tin nhắn của học viên: "${userMessage}".
  3. Đánh giá tính tự nhiên và độ chính xác của học viên.
  
  YÊU CẦU PHẢN HỒI (CHỈ TRẢ VỀ JSON):
  {
    "content": "Câu phản hồi bằng tiếng Trung (tự nhiên, đúng ngữ cảnh công việc)",
    "vi": "Bản dịch tiếng Việt",
    "pinyin": "Phiên âm Pinyin chuẩn",
    "feedback": "Nhận xét ngắn gọn bằng tiếng Việt về câu nói của học viên. Nếu học viên nói tốt, hãy khích lệ. Nếu có lỗi, hãy sửa lỗi một cách tinh tế.",
    "xp_bonus": 15
  }
  
  LƯU Ý QUAN TRỌNG:
  - Luôn ưu tiên cách dùng từ chuyên nghiệp trong môi trường văn phòng/nhà máy.
  - Phản hồi phải ngắn gọn, súc tích (1-2 câu).`;

  try {
    return await aiGenerateJSON<{
      content: string;
      vi: string;
      pinyin: string;
      feedback: string;
      xp_bonus: number;
    }>(prompt, 'deepseek');
  } catch (err) {
    console.error('Roleplay AI error:', err);
    return {
      content: "不好 ý si，刚才系统有点忙。我们可以再试一次吗？",
      vi: "Xin lỗi, hệ thống vừa rồi hơi bận một chút. Chúng ta có thể thử lại không?",
      pinyin: "Bù hǎoyìsi, gāngcái xìtǒng yǒudiǎn máng. Wǒmen kěyǐ zài shì yīcì ma?",
      feedback: "Lỗi kết nối AI.",
      xp_bonus: 0
    };
  }
}

/**
 * AI Lesson Assistant: Giải đáp thắc mắc về nội dung bài học
 */
export async function askLessonAssistant(
  lessonData: any,
  question: string
) {
  const prompt = `Bạn là Giảng viên Tiếng Trung bậc thầy tại Toxi AI Academy.
  Nội dung bài học hiện tại: "${lessonData.title}".
  Dữ liệu bài học (JSON): ${JSON.stringify(lessonData.content_json || {})}
  
  Học viên hỏi: "${question}"
  
  NHIỆM VỤ:
  1. Giải đáp thắc mắc một cách chuyên nghiệp, đi sâu vào bản chất ngôn ngữ nhưng dễ hiểu.
  2. Luôn liên hệ đến tình huống ứng dụng thực tế trong công việc.
  3. Nếu học viên hỏi ngoài phạm vi bài học, hãy trả lời ngắn gọn và dẫn dắt họ quay lại nội dung chính.
  
  YÊU CẦU PHẢN HỒI (CHỈ TRẢ VỀ JSON):
  {
    "answer": "Nội dung giải đáp chi tiết, định dạng Markdown nhẹ (in đậm các từ khóa)",
    "examples": [
      {"zh": "Câu ví dụ tiếng Trung", "vi": "Bản dịch tiếng Việt"},
      {"zh": "Câu ví dụ 2", "vi": "Bản dịch 2"}
    ],
    "grammar_points": ["Điểm ngữ pháp quan trọng 1", "Điểm ngữ pháp 2"]
  }
  
  LƯU Ý: Tuyệt đối không trả về bất kỳ văn bản nào ngoài khối JSON.`;

  try {
    return await aiGenerateJSON<{
      answer: string;
      examples: string[];
      grammar_points: string[];
    }>(prompt, 'deepseek', true);
  } catch (err) {
    console.error('Lesson Assistant error:', err);
    throw err;
  }
}

/**
 * AI Homework Scorer: Chấm điểm và nhận xét bài tập nộp
 */
export async function scoreLessonSubmission(
  lessonTitle: string,
  submissionContent: string,
  vocabulary: any[] = []
) {
  const prompt = `Bạn là Giảng viên Tiếng Trung cao cấp tại Toxi Edu.
  Nhiệm vụ: Chấm điểm bài tập nộp của học viên.
  Bối cảnh bài học: "${lessonTitle}"
  Từ vựng trọng tâm cần áp dụng: ${JSON.stringify(vocabulary)}
  
  Nội dung bài làm của học viên: "${submissionContent}"
  
  TIÊU CHÍ CHẤM ĐIỂM:
  1. Độ chính xác về ngữ pháp và từ vựng (40%)
  2. Khả năng áp dụng từ vựng trọng tâm của bài học (30%)
  3. Tính tự nhiên và phù hợp ngữ cảnh (30%)
  
  YÊU CẦU PHẢN HỒI (CHỈ TRẢ VỀ JSON):
  {
    "score": 85,
    "feedback": "Nhận xét chi tiết bằng tiếng Việt. Chỉ ra các lỗi sai (nếu có) và cách sửa. Khích lệ những điểm học viên làm tốt.",
    "is_pass": true
  }
  
  LƯU Ý: Tuyệt đối không trả về bất kỳ văn bản nào ngoài khối JSON.`;

  try {
    return await aiGenerateJSON<{
      score: number;
      feedback: string;
      is_pass: boolean;
    }>(prompt, 'deepseek', true);
  } catch (err) {
    console.error('Homework Scorer error:', err);
    return {
      score: 70,
      feedback: "Hệ thống AI đang bận, bài làm của bạn đã được ghi nhận. Giảng viên sẽ xem lại sau.",
      is_pass: true
    };
  }
}
