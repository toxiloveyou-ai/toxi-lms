import { supabase } from '../supabase';
// import { geminiGenerateJSON, geminiGenerate } from '../gemini';
import { aiGenerateJSON, aiGenerate } from '../ai-bridge';

// ─────────────────────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────────────────────
export async function fetchExams() {
  const { data, error } = await supabase
    .from('mock_exams')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchExams:', error); return []; }
  return data;
}

export async function fetchExamQuestions(examId: string) {
  const { data, error } = await supabase
    .from('exam_questions')
    .select('*')
    .eq('exam_id', examId)
    .order('order_index', { ascending: true });
  if (error) { console.error('fetchExamQuestions:', error); return []; }
  return data;
}

export async function fetchExamHistory(userId: string) {
  const { data } = await supabase
    .from('exam_results')
    .select('*, mock_exams(title, type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

export async function submitExamResult(resultData: any) {
  const { data, error } = await supabase.from('exam_results').insert([resultData]);
  if (error) console.error('submitExamResult:', error);
  return data;
}

// ─────────────────────────────────────────────────────────────
// Toxi AI — Giải thích câu hỏi thi thật với Gemini
// ─────────────────────────────────────────────────────────────
export async function askTongxiaoAboutQuestion(
  questionText: string,
  options: string[],
  correctIndex: number,
  userQuestion: string
): Promise<string> {
  const prompt = `Bạn là chuyên gia luyện thi tiếng Trung Toxi AI.
Câu hỏi: ${questionText}
Các lựa chọn: ${options.join(', ')}
Đáp án đúng: ${options[correctIndex]}

Học viên hỏi: ${userQuestion}

Hãy giải thích chi tiết, dễ hiểu, tập trung vào ngữ pháp và cách dùng từ. Trả về bằng tiếng Việt.`;

  return await aiGenerate(prompt, 'deepseek', true);
}

// ─────────────────────────────────────────────────────────────
// AI tự sinh câu hỏi luyện tập khi DB trống
// ─────────────────────────────────────────────────────────────
export async function generateAIPracticeQuestions(
  examType: string,
  topic: string,
  count: number = 5
): Promise<any[]> {
  const prompt = `Bạn là chuyên gia ra đề thi tiếng Trung chuẩn ${examType}.
Hãy tạo ${count} câu hỏi trắc nghiệm chủ đề "${topic}" theo đúng format đề thi ${examType}.

Trả về JSON:
{
  "questions": [
    {
      "part": "Đọc hiểu - Phần 1",
      "question_type": "choice",
      "question_text": "nội dung câu hỏi tiếng Trung",
      "passage_text": "đoạn văn nếu là bài đọc hiểu",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_index": 0,
      "expected_answer": "đáp án mẫu cho bài viết/dịch/nói",
      "tongxiao_explain": "giải thích chi tiết tại sao đúng/sai - bằng tiếng Việt",
      "key_vocabulary": {
        "word": "từ khóa chính",
        "pinyin": "phiên âm",
        "meaning": "nghĩa",
        "hint": "mẹo nhớ"
      }
    }
  ]
}

Yêu cầu:
- Câu hỏi phải đúng chuẩn ${examType}, độ khó phù hợp
- Đáp án nhiễu phải thực sự khó phân biệt
- Giải thích phải chi tiết và hữu ích`;

  try {
    // [TOXI AI Update] Sử dụng aiGenerateJSON để sinh đề thi với DeepSeek
    // Code cũ: const result = await geminiGenerateJSON<{ questions: any[] }>(prompt);
    const result = await aiGenerateJSON<{ questions: any[] }>(prompt, 'deepseek');
    return result.questions || [];
  } catch (err) {
    console.error('generateAIPracticeQuestions (DeepSeek/Gemini):', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Seed exam từ AI vào Supabase
// ─────────────────────────────────────────────────────────────
export async function seedAIExam(
  examType: string,
  topic: string,
  questionCount: number = 5
): Promise<boolean> {
  // 1. Tạo exam record
  const { data: exam, error: examErr } = await supabase
    .from('mock_exams')
    .insert({
      title: `${examType} - Luyện tập: ${topic} (AI tạo)`,
      type: examType,
      duration: Math.ceil(questionCount * 2),
      total_questions: questionCount,
      is_new: true,
      description: `Bộ câu hỏi chủ đề "${topic}" được Toxi AI tạo tự động theo chuẩn ${examType}.`
    })
    .select()
    .single();

  if (examErr || !exam) { console.error('seedAIExam exam insert:', examErr); return false; }

  // 2. Sinh câu hỏi từ AI
  const questions = await generateAIPracticeQuestions(examType, topic, questionCount);
  if (!questions.length) return false;

  // 3. Insert câu hỏi
  const toInsert = questions.map((q, i) => ({
    exam_id: exam.id,
    part: q.part || 'Luyện tập',
    question_type: q.question_type || 'choice',
    question_text: q.question_text,
    passage_text: q.passage_text || '',
    audio_url: q.audio_url || '',
    image_url: q.image_url || '',
    options: q.options || [],
    correct_index: q.correct_index ?? 0,
    expected_answer: q.expected_answer || '',
    tongxiao_explain: q.tongxiao_explain,
    key_vocabulary: q.key_vocabulary,
    order_index: i + 1,
  }));

  const { error: qErr } = await supabase.from('exam_questions').insert(toInsert);
  if (qErr) { console.error('seedAIExam questions insert:', qErr); return false; }

  return true;
}

// ─────────────────────────────────────────────────────────────
// Sync từ sai sang Smart Flashcard Deck
// ─────────────────────────────────────────────────────────────
export async function syncWrongVocabToFlashcards(userId: string, wrongQuestions: any[]) {
  if (!wrongQuestions.length) return 0;

  // Tìm hoặc tạo Smart Deck
  let deckId: string | undefined;
  const { data: existingDeck } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Từ sai từ Exam Prep')
    .single();

  if (existingDeck) {
    deckId = existingDeck.id;
  } else {
    const { data: newDeck } = await supabase
      .from('decks')
      .insert({
        user_id: userId,
        name: 'Từ sai từ Exam Prep',
        description: 'Hệ thống tự động đồng bộ từ vựng bạn làm sai',
        level_id: 'ALL',
        topic_id: 'auto',
        is_smart: true
      })
      .select()
      .single();
    if (newDeck) deckId = newDeck.id;
  }

  if (!deckId) return 0;

  const cardsToInsert: any[] = [];
  for (const q of wrongQuestions) {
    if (!q.key_vocabulary) continue;
    const { data: existing } = await supabase
      .from('cards').select('id').eq('deck_id', deckId).eq('front', q.key_vocabulary.word);
    if (!existing?.length) {
      cardsToInsert.push({
        deck_id: deckId,
        front: q.key_vocabulary.word,
        pinyin: q.key_vocabulary.pinyin || '',
        meaning: q.key_vocabulary.meaning || '',
        hint: q.key_vocabulary.hint || 'Từ này bạn đã làm sai trong bài thi!',
        example: q.question_text,
        example_mean: '(Câu hỏi thi thực tế bạn đã làm sai)',
      });
    }
  }

  if (cardsToInsert.length > 0) {
    await supabase.from('cards').insert(cardsToInsert);
  }

  return cardsToInsert.length;
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      score, 
      created_at, 
      user_id, 
      metadata,
      toxi_profiles:user_id (full_name, avatar_url), 
      mock_exams:exam_id (title, type)
    `)
    .order('score', { ascending: false })
    .limit(20);
  if (error) { console.error('fetchLeaderboard:', error); return []; }
  return data;
}
