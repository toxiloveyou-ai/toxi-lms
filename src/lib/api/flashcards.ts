import { supabase } from '../supabase';
import { aiGenerateJSON } from '../ai-bridge';

// Định nghĩa Ratings của thuật toán SM-2
export const RATINGS = {
  AGAIN: 0,   // Không nhớ -> reset
  HARD:  1,   // Khó -> tăng nhẹ interval
  GOOD:  2,   // Tốt -> tăng interval bình thường
  EASY:  3    // Dễ -> tăng nhanh interval
};

// Hàm tính toán SM-2 (Dựa trên mô tả thiết kế)
export function calculateNextReview(currentProgress: any, rating: number) {
  const now = new Date();
  
  // Nếu là Again (0)
  if (rating === RATINGS.AGAIN) {
    return {
      interval: 1, // Ôn lại vào ngày mai (hoặc 1 phút nếu setup kỹ hơn, nhưng đơn giản là 1 ngày)
      ease_factor: Math.max(1.3, currentProgress.ease_factor - 0.2),
      status: 'learning',
      next_review: new Date(now.getTime() + 1 * 60000).toISOString() // 1 phút sau để demo (Thực tế là 1 ngày)
    };
  }

  // Good, Hard, Easy
  const newEase = currentProgress.ease_factor + (0.1 - (3 - rating) * 0.18);
  let newInterval;
  
  if (currentProgress.interval === 0) {
    // Nếu thẻ mới
    newInterval = rating === RATINGS.EASY ? 4 : 1;
  } else {
    // Nếu thẻ cũ
    newInterval = rating === RATINGS.HARD 
      ? currentProgress.interval * 1.2 
      : currentProgress.interval * newEase;
  }

  const roundedInterval = Math.max(1, Math.round(newInterval));
  
  // Tính ngày ôn tiếp theo
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + roundedInterval);

  return {
    interval: roundedInterval,
    ease_factor: Math.max(1.3, newEase),
    status: roundedInterval > 21 ? 'mastered' : 'review',
    next_review: nextReviewDate.toISOString()
  };
}

// Lấy danh sách Decks của user (kèm số thẻ + progress)
export async function fetchUserDecks(userId: string) {
  try {
    // Bước 1: Lấy danh sách Decks (Không join để tránh lỗi Schema Cache)
    const { data: decks, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (deckError) throw deckError;
    if (!decks || decks.length === 0) return [];

    // Bước 2: Lấy số lượng thẻ cho từng Deck bằng một query riêng
    const { data: counts, error: countError } = await supabase
      .from('cards')
      .select('deck_id');
    
    if (countError) console.warn('Could not fetch card counts:', countError);

    // Bước 3: Gộp dữ liệu thủ công
    return decks.map(deck => {
      const cardCount = counts?.filter(c => c.deck_id === deck.id).length || 0;
      return {
        ...deck,
        count: cardCount,
        progress: 0, // Fallback
        due: 0,
        mastered: 0
      };
    });
  } catch (err) {
    console.error('Robust fetchUserDecks Error:', err);
    return [];
  }
}

// Lấy danh sách thẻ cần ôn (Due cards) trong 1 Deck
export async function fetchCardsToReview(deckId: string, userId: string) {
  // Lấy tất cả cards trong deck
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error || !cards) {
    console.error('Error fetching cards:', error);
    return [];
  }

  // Lấy progress riêng
  const cardIds = cards.map(c => c.id);
  let progressMap: Record<string, any> = {};
  if (cardIds.length > 0) {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .in('card_id', cardIds);
    
    (progressData || []).forEach(p => { progressMap[p.card_id] = p; });
  }

  const now = new Date().toISOString();

  // Lọc thẻ cần ôn: chưa có progress HOẶC next_review <= now (và chưa mastered)
  return cards.filter(card => {
    const progress = progressMap[card.id];
    if (!progress) return true; // Thẻ mới hoàn toàn
    if (progress.status === 'mastered') return false; // Đã thuần thục
    return progress.next_review <= now;
  });
}

// Cập nhật tiến độ sau khi lật thẻ
export async function submitCardReview(userId: string, cardId: string, rating: number) {
  // 1. Lấy progress hiện tại
  const { data: currentProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle();

  const progressObj = currentProgress || { ease_factor: 2.5, interval: 0, total_reviews: 0 };
  
  // 2. Tính toán SM-2
  const nextData = calculateNextReview(progressObj, rating);

  // 3. Upsert vào database
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      card_id: cardId,
      status: nextData.status,
      ease_factor: nextData.ease_factor,
      interval: nextData.interval,
      next_review: nextData.next_review,
      total_reviews: progressObj.total_reviews + 1,
      last_reviewed: new Date().toISOString()
    }, { onConflict: 'user_id,card_id' });

  if (error) {
    console.error('Error updating progress:', error);
  }
}

// Tạo deck mới
export async function createDeck(userId: string, name: string, description: string, levelId?: string) {
  const { data, error } = await supabase
    .from('decks')
    .insert({ user_id: userId, name, description, level_id: levelId || 'ALL' })
    .select()
    .single();
  if (error) console.error('Error creating deck:', error);
  return data;
}

// Thêm card vào deck
export async function addCardToDeck(deckId: string, card: {
  front: string; pinyin: string; meaning: string; hint?: string;
  example?: string; example_mean?: string; related_words?: string;
}) {
  const { data, error } = await supabase
    .from('cards')
    .insert({ deck_id: deckId, ...card })
    .select()
    .single();
  if (error) console.error('Error adding card:', error);
  return data;
}

// Xóa card
export async function deleteCard(cardId: string) {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) console.error('Error deleting card:', error);
}

// Xóa deck (cascade sẽ xóa cards)
export async function deleteDeck(deckId: string) {
  const { error } = await supabase.from('decks').delete().eq('id', deckId);
  if (error) console.error('Error deleting deck:', error);
}
// Lấy danh sách sổ tay cộng đồng (Công khai)
export async function fetchCommunityNotebooks() {
  try {
    const { data: decks, error } = await supabase
      .from('decks')
      .select('*')
      .eq('privacy', 'public')
      .order('clone_count', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    // Fallback profile data to avoid JOIN errors
    return (decks || []).map(d => ({
      ...d,
      toxi_profiles: { full_name: 'Toxi Scholar' }
    }));
  } catch (err) {
    console.error('Error fetching community notebooks:', err);
    return [];
  }
}

// Clone sổ tay về cá nhân
export async function cloneNotebook(userId: string, notebookId: string) {
  try {
    // 1. Lấy thông tin sổ gốc
    const { data: original, error: fetchError } = await supabase
      .from('decks')
      .select('*, cards(*)')
      .eq('id', notebookId)
      .single();

    if (fetchError || !original) throw fetchError;

    // 2. Tạo sổ mới cho user
    const { data: newNotebook, error: createError } = await supabase
      .from('decks')
      .insert({
        user_id: userId,
        name: `${original.name} (Bản sao)`,
        description: original.description
      })
      .select()
      .single();

    if (createError || !newNotebook) throw createError;

    // 3. Clone tất cả cards
    if (original.cards && original.cards.length > 0) {
      const cardsToInsert = original.cards.map((c: any) => ({
        deck_id: newNotebook.id,
        front: c.front,
        pinyin: c.pinyin,
        meaning: c.meaning,
        hint: c.hint,
        example: c.example,
        example_mean: c.example_mean,
        related_words: c.related_words
      }));

      await supabase.from('cards').insert(cardsToInsert);
    }

    // 4. Tăng clone_count của sổ gốc
    await supabase
      .from('decks')
      .update({ clone_count: (original.clone_count || 0) + 1 })
      .eq('id', notebookId);

    return newNotebook;
  } catch (err) {
    console.error('Error cloning notebook:', err);
    return null;
  }
}

// Lấy danh sách sổ tay hệ thống (HSK, Curated) - Dùng chung cho tất cả user
export async function fetchSystemNotebooks() {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .or('notebook_type.eq.hsk_official,notebook_type.eq.toxi_curated');

    // Nếu không có dữ liệu theo type, thử fallback theo tên (phòng trường hợp DB chưa migrate đủ cột)
    if (error || !data || data.length === 0) {
      const { data: fallbackData } = await supabase
        .from('decks')
        .select('*')
        .ilike('name', '%HSK%');
      return fallbackData || [];
    }
    return data || [];
  } catch (err) {
    console.error('System Notebooks Fetch Error:', err);
    return [];
  }
}

/**
 * [ADMIN ONLY] - Lấy toàn bộ danh sách sổ tay trong hệ thống
 */
export async function adminFetchAllDecks() {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*, cards(count)')
      .order('notebook_type', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Admin Fetch All Decks Error:', err);
    return [];
  }
}

// Hàm dành cho Admin: Upload từ vựng hàng loạt (Kèm lọc trùng lặp)
export async function adminBulkUploadCards(deckId: string, cards: any[]) {
  try {
    // 1. Lấy danh sách từ đã tồn tại trong Deck này để lọc trùng
    const { data: existingCards, error: fetchError } = await supabase
      .from('cards')
      .select('front')
      .eq('deck_id', deckId);
    
    if (fetchError) throw fetchError;
    
    const existingFronts = new Set((existingCards || []).map(c => c.front));
    
    // 2. Lọc ra các từ chưa có
    const newCards = cards.filter(c => !existingFronts.has(c.front));
    const duplicatesCount = cards.length - newCards.length;

    if (newCards.length === 0) {
      return { success: true, added: 0, duplicates: duplicatesCount };
    }

    // 3. Upload theo batch
    const batchSize = 100;
    for (let i = 0; i < newCards.length; i += batchSize) {
      const batch = newCards.slice(i, i + batchSize);
      const { error } = await supabase
        .from('cards')
        .insert(batch.map(c => ({ ...c, deck_id: deckId })));
      if (error) throw error;
    }

    return { success: true, added: newCards.length, duplicates: duplicatesCount };
  } catch (err) {
    console.error('Admin Upload Error:', err);
    throw err;
  }
}

/**
 * [TOXI AI Admin] - Tự động bổ sung thông tin từ vựng bằng AI
 * Giúp Admin upload danh sách từ thô (chỉ cần Chữ Hán) và AI tự điền Pinyin, Nghĩa, Ví dụ.
 */
export async function aiEnrichCards(words: string[]) {
  if (!words.length) return [];
  
  const prompt = `Bạn là chuyên gia biên soạn giáo trình tiếng Trung. Hãy điền đầy đủ thông tin cho danh sách từ vựng sau.
Danh sách từ: ${words.join(', ')}

Yêu cầu trả về mảng JSON các đối tượng:
{
  "front": "Chữ Hán",
  "pinyin": "phiên âm có dấu",
  "meaning": "nghĩa tiếng Việt chính xác, súc tích",
  "hint": "Gợi ý nhớ từ hoặc phân loại (VD: Động từ, Danh từ)",
  "example": "Câu ví dụ tiếng Trung ngắn gọn",
  "example_mean": "Dịch nghĩa câu ví dụ",
  "related_words": "1-2 từ liên quan"
}
Chỉ trả về JSON, không giải thích gì thêm.`;

  try {
    const enriched = await aiGenerateJSON<any[]>(prompt, 'deepseek', false);
    return enriched;
  } catch (err) {
    console.error('AI Enrichment Error:', err);
    throw new Error('Không thể sử dụng AI để bổ sung dữ liệu. Vui lòng kiểm tra kết nối.');
  }
}

// ============================================================
// SMART REVIEW (ÔN TẬP THÔNG MINH) - SM-2 Queue System
// ============================================================

/**
 * Pure SM-2 calculation — returns the next review parameters.
 * Rating scale: 0=Again, 1=Hard, 2=Good, 3=Easy
 */
export function calculateSM2(progress: { ease_factor: number; interval: number; repetitions: number }, rating: number) {
  let { ease_factor, interval, repetitions } = progress;

  if (rating < 2) {
    // Failed: reset
    repetitions = 0;
    interval = 1;
    if (rating === 0) ease_factor = Math.max(1.3, ease_factor - 0.2);
  } else {
    // Passed
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    const q = (rating / 3) * 5;
    ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ease_factor = Math.max(1.3, ease_factor);
  }

  if (rating === 3 && repetitions === 1) interval = 4;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  let status: string;
  if (repetitions === 0) status = 'learning';
  else if (interval > 21) status = 'mastered';
  else status = 'review';

  return { ease_factor, interval, repetitions, status, next_review: nextReview.toISOString() };
}

/**
 * Submit a SM-2 review for a card — upserts into user_progress.
 */
export async function submitSmartReview(userId: string, cardId: string, rating: number) {
  const { data: currentProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle();

  const prog = currentProgress || { ease_factor: 2.5, interval: 0, repetitions: 0, total_reviews: 0 };
  const next = calculateSM2(
    { ease_factor: prog.ease_factor, interval: prog.interval, repetitions: prog.repetitions || 0 },
    rating
  );

  const { error } = await supabase.from('user_progress').upsert({
    user_id: userId,
    card_id: cardId,
    status: next.status,
    ease_factor: next.ease_factor,
    interval: next.interval,
    next_review: next.next_review,
    total_reviews: (prog.total_reviews || 0) + 1,
    last_reviewed: new Date().toISOString()
  }, { onConflict: 'user_id,card_id' });

  if (error) console.error('Smart Review Error:', error);
  return next;
}

/**
 * Build the smart review queue for a deck:
 *   1. Due cards (nextReviewDate <= now), sorted by lowest ease_factor (hardest first)
 *   2. New cards (no progress record), interleaved, max 10 per session
 */
export async function fetchSmartReviewQueue(deckId: string, userId: string) {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error || !cards) return { dueCards: 0, newCards: 0, totalNewInSession: 0, queue: [] as any[] };

  const cardIds = cards.map(c => c.id);
  let progressMap: Record<string, any> = {};
  if (cardIds.length > 0) {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .in('card_id', cardIds);
    (progressData || []).forEach((p: any) => { progressMap[p.card_id] = p; });
  }

  const now = new Date().toISOString();
  const dueCards: any[] = [];
  const newCards: any[] = [];

  cards.forEach(card => {
    const prog = progressMap[card.id];
    if (!prog) {
      newCards.push({ ...card, _progress: null });
    } else if (prog.status === 'mastered') {
      if (prog.next_review <= now) dueCards.push({ ...card, _progress: prog });
    } else if (prog.next_review <= now) {
      dueCards.push({ ...card, _progress: prog });
    }
  });

  dueCards.sort((a, b) => (a._progress?.ease_factor || 2.5) - (b._progress?.ease_factor || 2.5));
  const sessionNewCards = newCards.slice(0, 10);

  const queue: any[] = [];
  let dueIdx = 0, newIdx = 0;
  while (dueIdx < dueCards.length || newIdx < sessionNewCards.length) {
    for (let i = 0; i < 3 && dueIdx < dueCards.length; i++) {
      queue.push({ ...dueCards[dueIdx], _isNew: false });
      dueIdx++;
    }
    if (newIdx < sessionNewCards.length) {
      queue.push({ ...sessionNewCards[newIdx], _isNew: true });
      newIdx++;
    }
  }

  return { dueCards: dueCards.length, newCards: newCards.length, totalNewInSession: sessionNewCards.length, queue };
}

/**
 * Fetch comprehensive progress stats for a deck + user.
 */
export async function fetchDeckProgress(deckId: string, userId: string) {
  const { data: cards } = await supabase.from('cards').select('id').eq('deck_id', deckId);
  if (!cards || cards.length === 0) return { total: 0, newCount: 0, learning: 0, review: 0, mastered: 0, dueToday: 0 };

  const cardIds = cards.map(c => c.id);
  const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId).in('card_id', cardIds);
  const now = new Date().toISOString();

  const stats = { total: cards.length, newCount: 0, learning: 0, review: 0, mastered: 0, dueToday: 0 };
  cards.forEach(card => {
    const prog = (progress || []).find((p: any) => p.card_id === card.id);
    if (!prog) { stats.newCount++; return; }
    if (prog.status === 'learning') stats.learning++;
    else if (prog.status === 'review') stats.review++;
    else if (prog.status === 'mastered') stats.mastered++;
    if (prog.next_review <= now && prog.status !== 'mastered') stats.dueToday++;
  });
  return stats;
}

/**
 * Generate quiz options for a card: 1 correct + 3 distractors.
 */
export async function generateQuizOptions(deckId: string, correctCard: any) {
  const { data: allCards } = await supabase
    .from('cards')
    .select('id, front, pinyin, meaning')
    .eq('deck_id', deckId)
    .neq('id', correctCard.id);

  if (!allCards || allCards.length < 3) return null;
  const shuffled = allCards.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3);

  return [
    { id: correctCard.id, meaning: correctCard.meaning, isCorrect: true },
    ...distractors.map((d: any) => ({ id: d.id, meaning: d.meaning, isCorrect: false }))
  ].sort(() => Math.random() - 0.5);
}
