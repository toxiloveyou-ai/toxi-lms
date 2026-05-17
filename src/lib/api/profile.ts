import { supabase } from '../supabase';
// import { geminiGenerate } from '../gemini';
import { aiGenerate } from '../ai-bridge';

// ─────────────────────────────────────────────────────────────
// Lấy hoặc tạo mới profile của user
// ─────────────────────────────────────────────────────────────
export async function getOrCreateProfile(userId: string, fallbackName?: string) {
  const { data: existing } = await supabase
    .from('toxi_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existing) return existing;

  // Tạo profile mới nếu chưa có
  const { data: created } = await supabase
    .from('toxi_profiles')
    .insert({ id: userId, full_name: fallbackName || 'Học Viên' })
    .select('*')
    .single();

  return created;
}

// ─────────────────────────────────────────────────────────────
// Cập nhật streak_days và total_xp
// ─────────────────────────────────────────────────────────────
export async function addXP(userId: string, amount: number, source: string) {
  // Upsert vào xp_events
  await supabase.from('xp_events').insert({ user_id: userId, source, amount });

  // Cộng dồn vào profile
  const { data: profile } = await supabase
    .from('toxi_profiles')
    .select('total_xp')
    .eq('id', userId)
    .single();

  if (profile) {
    await supabase
      .from('toxi_profiles')
      .update({ total_xp: (profile.total_xp || 0) + amount })
      .eq('id', userId);
  }
}

// ─────────────────────────────────────────────────────────────
// Theo dõi hoạt động: Cập nhật Streak và log truy cập
// ─────────────────────────────────────────────────────────────
export async function trackUserActivity(userId: string) {
  const { data: profile } = await supabase
    .from('toxi_profiles')
    .select('streak_days, last_access')
    .eq('id', userId)
    .single();

  if (!profile) return;

  const now = new Date();
  const lastAccess = profile.last_access ? new Date(profile.last_access) : null;
  
  let newStreak = profile.streak_days || 0;

  if (!lastAccess) {
    newStreak = 1;
  } else {
    // Chuyển về ngày (không tính giờ) để so sánh
    const lastDate = new Date(lastAccess.getFullYear(), lastAccess.getMonth(), lastAccess.getDate());
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Sang ngày tiếp theo -> Tăng streak
      newStreak += 1;
    } else if (diffDays > 1) {
      // Bỏ lỡ ngày -> Reset streak
      newStreak = 1;
    }
    // Nếu diffDays === 0 (cùng ngày) -> Giữ nguyên streak
  }

  await supabase
    .from('toxi_profiles')
    .update({ 
      last_access: now.toISOString(),
      streak_days: newStreak
    })
    .eq('id', userId);
  
  return newStreak;
}

// ─────────────────────────────────────────────────────────────
// Lấy dữ liệu dashboard: decks đang học + progress (Đã tối ưu)
// ─────────────────────────────────────────────────────────────
export async function getDashboardData(userId: string) {
  const now = new Date().toISOString();

  // 1. Fetch Decks
  const { data: decks } = await supabase
    .from('decks')
    .select('id, name, description, level_id, topic_id, is_smart, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(6);

  if (!decks || decks.length === 0) {
    return { decks: [], lastExam: null, bestToxiCert: null, recentSearches: [] };
  }

  const deckIds = decks.map(d => d.id);

  // 2. Fetch all cards for these decks in one go
  const { data: allCards } = await supabase
    .from('cards')
    .select('id, deck_id')
    .in('deck_id', deckIds);

  const cardIds = allCards?.map(c => c.id) || [];
  
  // 3. Fetch all progress for these cards in one go
  const { data: allProgress } = await supabase
    .from('user_progress')
    .select('card_id, status, next_review')
    .eq('user_id', userId)
    .in('card_id', cardIds);

  // 4. Group data in memory for efficiency
  const progressMap = new Map();
  allProgress?.forEach(p => {
    progressMap.set(p.card_id, p);
  });

  const cardsByDeck = new Map();
  allCards?.forEach(c => {
    if (!cardsByDeck.has(c.deck_id)) cardsByDeck.set(c.deck_id, []);
    cardsByDeck.get(c.deck_id).push(c.id);
  });

  // 5. Calculate stats
  const decksWithStats = decks.map(deck => {
    const deckCardIds = cardsByDeck.get(deck.id) || [];
    let mastered = 0;
    let due = 0;

    deckCardIds.forEach((cid: string) => {
      const p = progressMap.get(cid);
      if (p) {
        if (p.status === 'mastered') mastered++;
        else if (p.next_review && p.next_review <= now) due++;
      }
    });

    const total = deckCardIds.length;
    return {
      ...deck,
      count: total,
      mastered,
      due,
      progress: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  });

  // 6. Parallel fetch remaining small items
  const [lastExamRes, searchRes, bestCertRes] = await Promise.all([
    supabase.from('edu_exam_results').select('radar_stats, score, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('search_history').select('keyword').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('edu_exam_results').select('score, created_at').eq('user_id', userId).order('score', { ascending: false }).limit(1).maybeSingle()
  ]);

  return {
    decks: decksWithStats,
    lastExam: lastExamRes.data || null,
    bestToxiCert: bestCertRes.data || null,
    recentSearches: (searchRes.data || []).map(s => s.keyword),
  };
}

// ─────────────────────────────────────────────────────────────
// Tạo AI Tip cá nhân hoá (Gemini)
// ─────────────────────────────────────────────────────────────
export async function generateAITip(profile: any, dashData: any): Promise<string> {
  const radarStats = dashData.lastExam?.radar_stats;
  const recentWords = dashData.recentSearches?.join(', ') || 'chưa có';
  const deckSummary = dashData.decks
    .slice(0, 3)
    .map((d: any) => `"${d.name}" (${d.progress}% hoàn thành, ${d.due} thẻ cần ôn)`)
    .join('; ');

  const weakSkills = radarStats
    ? Object.entries(radarStats as Record<string, number>)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .map(([k]) => k)
        .join(' và ')
    : null;

  const prompt = `Bạn là Toxi AI, trợ lý học tiếng Trung thông minh.
Dữ liệu học viên:
- Tên: ${profile?.full_name || 'bạn'}
- Streak: ${profile?.streak_days || 0} ngày liên tiếp
- XP: ${profile?.total_xp || 0} điểm
- Mục tiêu: ${profile?.target_exam || 'HSK 5'} (Ngày thi: ${profile?.exam_date || 'chưa đặt'}, Mục tiêu điểm: ${profile?.target_score || 'chưa đặt'})
- Từ vừa tra: ${recentWords}
- Bộ thẻ: ${deckSummary || 'chưa có bộ thẻ nào'}
${weakSkills ? `- Kỹ năng yếu nhất: ${weakSkills}` : ''}

Hãy viết 1 lời khuyên học tập CỰC KỲ ngắn gọn (tối đa 2 câu), cá nhân hoá theo dữ liệu trên, bằng tiếng Việt. 
Đặc biệt, nếu học viên có ngày thi sắp tới, hãy nhắc nhở nhẹ nhàng hoặc khích lệ dựa trên mục tiêu điểm số.
Viết như đang nói chuyện với bạn học, sử dụng ngôn ngữ trẻ trung, năng động.`;

  try {
    // [TOXI AI Update] Sử dụng aiGenerate để linh hoạt giữa các model
    // Code cũ: return await geminiGenerate(prompt);
    return await aiGenerate(prompt, 'deepseek');
  } catch {
    return 'Hôm nay hãy thử ôn 10 thẻ Flashcard và tra 3 từ mới trong Từ Điển AI nhé!';
  }
}

/**
 * Lấy nhật ký học tập của user
 */
export async function fetchLearningDiary(userId: string) {
  const { data, error } = await supabase
    .from('learning_diary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching diary:', error);
    return [];
  }
  return data;
}

/**
 * Thêm một mục nhật ký mới
 */
export async function createLearningDiaryEntry(userId: string, entry: { title: string, content: string, mood?: string, privacy?: string }) {
  const { data, error } = await supabase
    .from('learning_diary')
    .insert([{ ...entry, user_id: userId }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Cập nhật thông tin cá nhân và mục tiêu học tập
 */
export async function updateProfile(
  userId: string, 
  updates: Partial<{ 
    full_name: string; 
    avatar_url: string; 
    bio: string; 
    goals: string;
    phone: string;
    target_exam: string;
    exam_date: string | null;
    target_score: number | null;
  }>
) {
  const { data, error } = await supabase
    .from('toxi_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Upload ảnh đại diện lên Storage
 */
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('toxi-assets')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('toxi-assets')
    .getPublicUrl(filePath);

  await updateProfile(userId, { avatar_url: publicUrl });
  return publicUrl;
}
