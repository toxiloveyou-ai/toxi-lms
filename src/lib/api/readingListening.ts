import { supabase } from '../supabase';
import { addCardToDeck, fetchUserDecks, createDeck } from './flashcards';

// ============================================================
// TYPES
// ============================================================

export interface RLDomain {
  id: string;
  name_vi: string;
  name_zh?: string;
  icon?: string;
}

export interface TranscriptSegment {
  start_ms: number;
  end_ms: number;
  text: string;
  pinyin?: string;
  translation?: string;
}

export interface VocabHighlight {
  word: string;
  pinyin: string;
  meaning: string;
  example?: string;
  example_meaning?: string;
  timestamp_ms?: number;
}

export interface ReadingArticle {
  id: string;
  title: string;
  title_vi?: string;
  content: string;
  pinyin_data?: Array<{ char: string; pinyin: string }>;
  translation?: string;
  vocabulary_highlights?: VocabHighlight[];
  hsk_level: string;
  domain?: string;
  difficulty_label?: string;
  word_count?: number;
  estimated_minutes?: number;
  cover_image_url?: string;
  status: string;
  view_count?: number;
  created_at?: string;
}

export interface ListeningAudio {
  id: string;
  title: string;
  title_vi?: string;
  audio_url: string;
  transcript: TranscriptSegment[];
  vocabulary_highlights?: VocabHighlight[];
  hsk_level: string;
  domain?: string;
  difficulty_label?: string;
  duration_seconds?: number;
  cover_image_url?: string;
  speaker_info?: string;
  status: string;
  view_count?: number;
  created_at?: string;
}

export interface SavedWord {
  id?: string;
  user_id?: string;
  word: string;
  pinyin?: string;
  meaning?: string;
  example_sentence?: string;
  example_meaning?: string;
  source_type: 'reading' | 'listening';
  source_id: string;
  source_title?: string;
}

// ============================================================
// FETCH FUNCTIONS — READING
// ============================================================

export async function fetchReadingArticles(filters?: {
  domain?: string;
  hskLevel?: string;
  search?: string;
  limit?: number;
}) {
  let query = supabase
    .from('rl_reading_articles')
    .select('id, title, title_vi, hsk_level, domain, difficulty_label, word_count, estimated_minutes, cover_image_url, view_count, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters?.domain) query = query.eq('domain', filters.domain);
  if (filters?.hskLevel) query = query.eq('hsk_level', filters.hskLevel);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) { console.error('fetchReadingArticles error:', error); return []; }
  return (data || []) as ReadingArticle[];
}

export async function fetchReadingArticleById(id: string): Promise<ReadingArticle | null> {
  const { data, error } = await supabase
    .from('rl_reading_articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) { console.error('fetchReadingArticleById error:', error); return null; }

  // Tăng view count (fire & forget)
  supabase.from('rl_reading_articles')
    .update({ view_count: (data?.view_count || 0) + 1 })
    .eq('id', id).then(() => {});

  return data as ReadingArticle;
}

// ============================================================
// FETCH FUNCTIONS — LISTENING
// ============================================================

export async function fetchListeningAudios(filters?: {
  domain?: string;
  hskLevel?: string;
  search?: string;
  limit?: number;
}) {
  let query = supabase
    .from('rl_listening_audios')
    .select('id, title, title_vi, hsk_level, domain, difficulty_label, duration_seconds, cover_image_url, speaker_info, view_count, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters?.domain) query = query.eq('domain', filters.domain);
  if (filters?.hskLevel) query = query.eq('hsk_level', filters.hskLevel);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) { console.error('fetchListeningAudios error:', error); return []; }
  return (data || []) as ListeningAudio[];
}

export async function fetchListeningAudioById(id: string): Promise<ListeningAudio | null> {
  const { data, error } = await supabase
    .from('rl_listening_audios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) { console.error('fetchListeningAudioById error:', error); return null; }

  // Tăng view count
  supabase.from('rl_listening_audios')
    .update({ view_count: (data?.view_count || 0) + 1 })
    .eq('id', id).then(() => {});

  if (!data) return null;
  return {
    ...data,
    transcript: Array.isArray(data.transcript) ? data.transcript : []
  } as ListeningAudio;
}

// ============================================================
// SAVED WORDS — Personal Vocabulary Notebook
// ============================================================

export async function saveWord(userId: string, word: SavedWord) {
  const { data, error } = await supabase
    .from('rl_saved_words')
    .upsert({ user_id: userId, ...word }, { onConflict: 'user_id,word,source_id' })
    .select()
    .maybeSingle();

  if (error) { console.error('saveWord error:', error); return null; }
  return data;
}

export async function unsaveWord(userId: string, wordId: string) {
  const { error } = await supabase
    .from('rl_saved_words')
    .delete()
    .eq('user_id', userId)
    .eq('id', wordId);
  if (error) console.error('unsaveWord error:', error);
}

export async function fetchSavedWords(userId: string, sourceId?: string) {
  let query = supabase
    .from('rl_saved_words')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sourceId) query = query.eq('source_id', sourceId);

  const { data, error } = await query;
  if (error) { console.error('fetchSavedWords error:', error); return []; }
  return data || [];
}

/**
 * Xuất từ đã lưu sang thẻ Flashcard trong sổ tay cá nhân
 * Tự động tạo Deck "Từ vựng Đọc Nghe" nếu chưa có
 */
export async function exportWordToFlashcard(userId: string, word: SavedWord) {
  try {
    // 1. Tìm hoặc tạo deck dành riêng cho từ vựng Đọc Nghe
    const decks = await fetchUserDecks(userId);
    let targetDeck = decks.find((d: any) => d.name === 'Từ vựng Đọc Nghe 📖');

    if (!targetDeck) {
      targetDeck = await createDeck(
        userId,
        'Từ vựng Đọc Nghe 📖',
        'Từ vựng được lưu từ các bài đọc và bài nghe'
      );
    }

    if (!targetDeck) throw new Error('Cannot create deck');

    // 2. Thêm card
    const card = await addCardToDeck(targetDeck.id, {
      front: word.word,
      pinyin: word.pinyin || '',
      meaning: word.meaning || '',
      example: word.example_sentence,
      example_mean: word.example_meaning,
      hint: `Nguồn: ${word.source_title || word.source_type}`,
    });

    // 3. Cập nhật linked_card_id trong rl_saved_words
    if (card && word.id) {
      await supabase
        .from('rl_saved_words')
        .update({ linked_card_id: card.id })
        .eq('id', word.id);
    }

    return card;
  } catch (err) {
    console.error('exportWordToFlashcard error:', err);
    return null;
  }
}

// ============================================================
// USER HISTORY — Progress Tracking
// ============================================================

export async function saveUserProgress(
  userId: string,
  contentType: 'reading' | 'listening',
  contentId: string,
  progressPct: number,
  audioPositionMs?: number
) {
  const { error } = await supabase
    .from('rl_user_history')
    .upsert({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
      progress_pct: progressPct,
      audio_position_ms: audioPositionMs,
      last_accessed: new Date().toISOString()
    }, { onConflict: 'user_id,content_type,content_id' });

  if (error) console.error('saveUserProgress error:', error);
}

export async function fetchUserHistory(userId: string) {
  const { data, error } = await supabase
    .from('rl_user_history')
    .select('*')
    .eq('user_id', userId)
    .order('last_accessed', { ascending: false })
    .limit(20);

  if (error) { console.error('fetchUserHistory error:', error); return []; }
  return data || [];
}

// ============================================================
// DOMAINS
// ============================================================

export async function fetchDomains(): Promise<RLDomain[]> {
  const { data, error } = await supabase.from('rl_domains').select('*');
  if (error) {
    // Fallback hardcoded nếu bảng chưa tồn tại
    return [
      { id: 'business', name_vi: 'Kinh doanh', name_zh: '商业', icon: '💼' },
      { id: 'travel', name_vi: 'Du lịch', name_zh: '旅游', icon: '✈️' },
      { id: 'academic', name_vi: 'Học thuật', name_zh: '学术', icon: '📚' },
      { id: 'culture', name_vi: 'Văn hóa', name_zh: '文化', icon: '🎭' },
      { id: 'science', name_vi: 'Khoa học', name_zh: '科学', icon: '🔬' },
      { id: 'technology', name_vi: 'Công nghệ', name_zh: '科技', icon: '💻' },
      { id: 'healthcare', name_vi: 'Y tế', name_zh: '医疗', icon: '🏥' },
      { id: 'daily_life', name_vi: 'Đời sống', name_zh: '生活', icon: '🏠' },
    ];
  }
  return data || [];
}

// ============================================================
// ADMIN — Upload
// ============================================================

export async function adminUploadAudio(audioFile: File, folder = 'audios') {
  try {
    const ext = audioFile.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${folder}/${fileName}`;
    
    console.log(`Uploading audio to: exam-assets/${path}`);
    
    const { error } = await supabase.storage
      .from('exam-assets')
      .upload(path, audioFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      throw error;
    }

    const { data } = supabase.storage.from('exam-assets').getPublicUrl(path);
    console.log('Upload success, public URL:', data.publicUrl);
    return data.publicUrl;
  } catch (err: any) {
    console.error('adminUploadAudio Failed:', err);
    throw err;
  }
}

export async function adminUploadImage(imageFile: File, folder = 'covers') {
  try {
    const ext = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${folder}/${fileName}`;
    
    console.log(`Uploading image to: exam-assets/${path}`);
    
    const { error } = await supabase.storage
      .from('exam-assets')
      .upload(path, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      throw error;
    }

    const { data } = supabase.storage.from('exam-assets').getPublicUrl(path);
    return data.publicUrl;
  } catch (err: any) {
    console.error('adminUploadImage Failed:', err);
    throw err;
  }
}

export async function adminCreateReadingArticle(article: Omit<ReadingArticle, 'id' | 'created_at' | 'view_count'>) {
  const { data, error } = await supabase
    .from('rl_reading_articles')
    .insert({ ...article, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminCreateListeningAudio(audio: Omit<ListeningAudio, 'id' | 'created_at' | 'view_count'>) {
  const { data, error } = await supabase
    .from('rl_listening_audios')
    .insert({ ...audio, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminFetchAllContent() {
  const [readingRes, audioRes] = await Promise.all([
    supabase.from('rl_reading_articles').select('id, title, hsk_level, domain, status, view_count, created_at').order('created_at', { ascending: false }),
    supabase.from('rl_listening_audios').select('id, title, hsk_level, domain, status, view_count, created_at').order('created_at', { ascending: false })
  ]);

  return {
    articles: readingRes.data || [],
    audios: audioRes.data || [],
  };
}

export async function adminUpdateContentStatus(
  table: 'rl_reading_articles' | 'rl_listening_audios',
  id: string,
  status: 'draft' | 'published'
) {
  const { error } = await supabase.from(table).update({ status }).eq('id', id);
  if (error) throw error;
}
