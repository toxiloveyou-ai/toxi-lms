import { supabase } from '../supabase';
// import { geminiGenerateJSON } from '../gemini';
import { aiGenerateJSON } from '../ai-bridge';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface DictionaryWord {
  id?: string;
  keyword: string;
  pinyin: string;
  meaning: string;
  examples: { text: string; pinyin: string; mean: string }[];
  components: { part: string; mean: string }[];
  grammar_note: string;
  source: 'system' | 'ai_generated';
  verified: boolean;
  lookup_count?: number;
  // Các trường mở rộng (Optional để không break code cũ)
  hsk_level?: string;
  synonyms?: string[];
  antonyms?: string[];
}

// ─────────────────────────────────────────────────────────────
// Lấy danh sách Deck (để chọn khi lưu từ)
// ─────────────────────────────────────────────────────────────
export async function fetchUserDecksForSelect(userId: string) {
  const { data } = await supabase
    .from('decks')
    .select('id, name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return data || [];
}

// ─────────────────────────────────────────────────────────────
// 1. Tìm kiếm từ vựng (Hybrid Mode: Database → AI Fallback)
// ─────────────────────────────────────────────────────────────
export async function searchWord(userId: string | null, query: string): Promise<DictionaryWord | null> {
  const keyword = query.trim();
  if (!keyword) return null;

  // B1: Lưu lịch sử tra cứu
  if (userId) {
    await supabase.from('search_history').insert([{ user_id: userId, keyword }]);
  }

  // B1.5: Nhận diện ngôn ngữ (Tiếng Việt hay Tiếng Trung)
  const isVietnamese = /[a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(keyword) && !/[一-龥]/.test(keyword);

  // B2: Tìm trong Supabase
  // Nếu là tiếng Việt, tìm trong cột 'meaning', nếu là tiếng Trung tìm trong 'keyword'
  let dbQuery = supabase.from('dictionary_words').select('*');
  
  if (isVietnamese) {
    // Tìm kiếm tương đối trong cột nghĩa tiếng Việt
    dbQuery = dbQuery.ilike('meaning', `%${keyword}%`);
  } else {
    // Tìm chính xác chữ Hán
    dbQuery = dbQuery.eq('keyword', keyword);
  }


  const { data: dbResults } = await dbQuery.limit(1);
  const dbWord = dbResults?.[0];

  if (dbWord) {
    // Tăng lookup count (chạy ngầm, không block)
    incrementLookupCount(dbWord.id);
    return dbWord as DictionaryWord;
  }

  // B3: Gọi AI Fallback (DeepSeek V3 cho tốc độ / R1 cho độ sâu)
  console.log(`[Dictionary] Not found in DB. Calling AI for (${isVietnamese ? 'VN' : 'CN'}):`, keyword);
  
  const prompt = `Bạn là chuyên gia từ điển Hán-Việt cao cấp. Hãy phân tích từ/cụm từ sau và trả về JSON CHÍNH XÁC.
Từ cần phân tích: "${keyword}"
Ngôn ngữ đầu vào: ${isVietnamese ? 'Tiếng Việt (Hãy tìm từ tiếng Trung tương ứng)' : 'Tiếng Trung'}

Yêu cầu JSON:
{
  "keyword": "Chữ Hán (Nếu đầu vào là tiếng Việt, hãy TRẢ VỀ CHỮ HÁN tương ứng)",
  "pinyin": "phiên âm pinyin có dấu",
  "meaning": "nghĩa tiếng Việt đầy đủ",
  "hsk_level": "HSK 1-6 hoặc 'Other'",
  "synonyms": ["từ đồng nghĩa 1", "từ đồng nghĩa 2"],
  "antonyms": ["từ phản nghĩa 1"],
  "examples": [
    {"text": "câu ví dụ tiếng Trung", "pinyin": "phiên âm", "mean": "dịch nghĩa"}
  ],
  "components": [
    {"part": "bộ thủ/thành phần", "mean": "ý nghĩa"}
  ],
  "grammar_note": "Giải thích chi tiết cách dùng, ngữ pháp, sắc thái từ bằng tiếng Việt"
}

Lưu ý:
- Nếu là tiếng Việt, hãy chọn từ tiếng Trung phổ biến và chính xác nhất.
- Grammar_note cần sâu sắc, hữu ích cho người học.`;

  let aiWord: Omit<DictionaryWord, 'id' | 'lookup_count'> | null = null;
  
  try {
    // Sử dụng DeepSeek V3 (Chat) cho tốc độ và tính ổn định cao nhất
    const aiData = await aiGenerateJSON<Omit<DictionaryWord, 'id' | 'lookup_count'>>(prompt, 'deepseek', false);
    
    aiWord = {
      ...aiData,
      source: 'ai_generated' as const,
      verified: false,
    };
  } catch (err) {
    console.error('[Dictionary] AI call failed:', err);
    return null; // Không trả mock, báo lỗi thật
  }

  // B4: Tự động lưu kết quả AI vào Database (self-enriching)
  const { data: insertedWord, error: insertError } = await supabase
    .from('dictionary_words')
    .insert(aiWord)
    .select('*')
    .single();

  if (insertError) {
    // Nếu lỗi do từ đã tồn tại (race condition), fetch lại
    if (insertError.code === '23505') {
      const { data: existing } = await supabase
        .from('dictionary_words')
        .select('*')
        .eq('keyword', aiWord.keyword)
        .single();
      return (existing as DictionaryWord) || (aiWord as DictionaryWord);
    }
    console.error('[Dictionary] Error persisting AI word:', insertError);
    return aiWord as DictionaryWord; // Vẫn trả về kết quả AI cho user
  }

  return insertedWord as DictionaryWord;
}

// ─────────────────────────────────────────────────────────────
// 2. Gọi hàm SQL increment_lookup_count
// ─────────────────────────────────────────────────────────────
export async function incrementLookupCount(wordId: string) {
  const { error } = await supabase.rpc('increment_lookup_count', { word_id: wordId });
  if (error) console.error('[Dictionary] Error incrementing lookup count:', error);
}

// ─────────────────────────────────────────────────────────────
// 3. Lưu từ vựng vào Flashcard và bảng saved_words (Xử lý 3 Edge Cases)
// ─────────────────────────────────────────────────────────────
export async function saveWordToFlashcard(
  userId: string,
  keyword: string,
  deckId: string | null,
  sourceType: 'dictionary' | 'immersion' | 'exam',
  sourceId?: string
) {
  let targetDeckId = deckId;

  // Edge case 2: Không chọn deck → tự tạo "Từ Mới Của Tôi"
  if (!targetDeckId) {
    const { data: defaultDeck } = await supabase
      .from('decks')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Từ Mới Của Tôi')
      .single();

    if (defaultDeck) {
      targetDeckId = defaultDeck.id;
    } else {
      const { data: newDeck } = await supabase
        .from('decks')
        .insert({
          user_id: userId,
          name: 'Từ Mới Của Tôi',
          description: 'Sổ tay từ vựng tự động lưu',
          level_id: 'ALL',
          topic_id: 'auto'
        })
        .select('id')
        .single();
      if (newDeck) targetDeckId = newDeck.id;
    }
  }

  if (!targetDeckId) return { status: 'error', message: 'Lỗi tạo bộ thẻ' };

  // Edge case 1: Chống trùng lặp
  const { data: existingSaved } = await supabase
    .from('saved_words')
    .select('id')
    .eq('user_id', userId)
    .eq('keyword', keyword)
    .eq('deck_id', targetDeckId);

  if (existingSaved && existingSaved.length > 0) {
    return { status: 'exists', message: 'Từ này đã có trong bộ thẻ.' };
  }

  // Edge case 3: Lấy thông tin từ DB, nếu không có thì lưu thô
  const { data: dbWord } = await supabase
    .from('dictionary_words')
    .select('id, pinyin, meaning')
    .eq('keyword', keyword)
    .single();

  const pinyin = dbWord?.pinyin || '';
  const meaning = dbWord?.meaning || 'Chưa có nghĩa';
  const vocabId = dbWord?.id || null;

  // Đẩy vào bảng cards (Flashcards)
  const { error: cardError } = await supabase
    .from('cards')
    .insert({
      deck_id: targetDeckId,
      front: keyword,
      pinyin: pinyin,
      meaning: meaning,
      hint: `Lưu từ ${sourceType === 'immersion' ? 'Góc Đọc Nghe' : sourceType === 'exam' ? 'Luyện Thi' : 'Từ Điển AI'}`
    });

  if (cardError) {
    console.error('[Dictionary] Error creating card:', cardError);
    return { status: 'error', message: 'Lỗi hệ thống khi tạo thẻ' };
  }

  // Đẩy vào bảng saved_words (Tracking)
  const { error: saveError } = await supabase
    .from('saved_words')
    .insert({
      user_id: userId,
      vocabulary_id: vocabId,
      keyword: keyword,
      deck_id: targetDeckId,
      source_type: sourceType,
      source_id: sourceId
    });

  if (saveError) {
    console.error('[Dictionary] Error tracking saved_words:', saveError);
    if (saveError.code === '23505') return { status: 'exists', message: 'Từ này đã lưu trước đó.' };
    return { status: 'error', message: 'Lỗi lưu trữ tracking' };
  }

  return { status: 'success', message: 'Lưu thành công!' };
}
/**
 * Lấy gợi ý từ vựng dựa trên Pinyin hoặc chữ Hán thô
 */
export async function getSuggestionsByPinyin(query: string) {
  if (!query.trim() || query.length < 2) return [];
  
  const { data } = await supabase
    .from('dictionary_words')
    .select('keyword, pinyin, meaning')
    .or(`pinyin.ilike.%${query}%,keyword.ilike.%${query}%`)
    .limit(5);
    
  return data || [];
}

/**
 * Wrapper cho saveWordToFlashcard để dùng thống nhất trong app
 */
export async function saveWordToNotebook(userId: string, keyword: string) {
  return await saveWordToFlashcard(userId, keyword, null, 'dictionary');
}

// ─────────────────────────────────────────────────────────────
// [TOXI AI v2] Rabbit Hole Mode — Tra từ liên quan ngay tại chỗ
// ─────────────────────────────────────────────────────────────
export async function rabbitHoleSearch(userId: string | null, keyword: string): Promise<DictionaryWord | null> {
  // Tái sử dụng hoàn toàn searchWord nhưng không reset UI
  return await searchWord(userId, keyword);
}

// ─────────────────────────────────────────────────────────────
// [TOXI AI v2] Confusable Pairs — So sánh cặp từ dễ nhầm
// ─────────────────────────────────────────────────────────────
export interface ConfusablePair {
  word_a: string;
  pinyin_a: string;
  meaning_a: string;
  word_b: string;
  pinyin_b: string;
  meaning_b: string;
  difference: string;
  example_a: string;
  example_b: string;
  tip: string;
}

export async function fetchConfusablePairs(keyword: string): Promise<ConfusablePair | null> {
  const prompt = `Bạn là chuyên gia ngôn ngữ Trung-Việt. Cho từ: "${keyword}"
Hãy tìm 1 từ tiếng Trung DỄ NHẦM LẪN nhất với từ này (về mặt phát âm, chữ viết, hoặc ý nghĩa).
Nếu không có từ dễ nhầm phổ biến, trả về null.

Trả về JSON:
{
  "word_a": "${keyword}",
  "pinyin_a": "pinyin của từ A",
  "meaning_a": "nghĩa tiếng Việt từ A",
  "word_b": "từ dễ nhầm",
  "pinyin_b": "pinyin của từ B",
  "meaning_b": "nghĩa tiếng Việt từ B",
  "difference": "Giải thích điểm khác biệt then chốt giữa 2 từ (1-2 câu tiếng Việt)",
  "example_a": "Câu ví dụ sử dụng từ A (tiếng Trung)",
  "example_b": "Câu ví dụ sử dụng từ B (tiếng Trung)",
  "tip": "Mẹo nhớ giúp phân biệt 2 từ (1 câu tiếng Việt)"
}

Chỉ trả về JSON, không giải thích thêm. Nếu không tìm thấy cặp dễ nhầm, trả về: null`;

  try {
    const result = await aiGenerateJSON<ConfusablePair | null>(prompt, 'deepseek', false);
    return result;
  } catch (err) {
    console.error('[Dictionary] Confusable pairs fetch failed:', err);
    return null;
  }
}
