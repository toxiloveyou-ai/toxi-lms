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
// Lấy dữ liệu dashboard: decks đang học + progress
// ─────────────────────────────────────────────────────────────
export async function getDashboardData(userId: string) {
  const now = new Date().toISOString();

  // Decks đang học
  const { data: decks } = await supabase
    .from('decks')
    .select('id, name, description, level_id, topic_id, is_smart, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(6);

  // Đếm cards + progress cho từng deck
  const decksWithStats = await Promise.all(
    (decks || []).map(async (deck) => {
      const { count: totalCount } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deck.id);

      const { count: masteredCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'mastered')
        .in('card_id',
          (await supabase.from('cards').select('id').eq('deck_id', deck.id))
            .data?.map(c => c.id) || []
        );

      const { count: dueCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'mastered')
        .lte('next_review', now)
        .in('card_id',
          (await supabase.from('cards').select('id').eq('deck_id', deck.id))
            .data?.map(c => c.id) || []
        );

      const total = totalCount || 0;
      const mastered = masteredCount || 0;
      return {
        ...deck,
        count: total,
        mastered,
        due: dueCount || 0,
        progress: total > 0 ? Math.round((mastered / total) * 100) : 0,
      };
    })
  );

  // Kết quả thi gần nhất để lấy radar stats
  const { data: lastExam } = await supabase
    .from('edu_exam_results')
    .select('radar_stats, score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Lịch sử tra từ gần nhất
  const { data: recentSearches } = await supabase
    .from('search_history')
    .select('keyword')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Kết quả thi Toxi tốt nhất để lấy chứng chỉ
  const { data: bestToxiCert } = await supabase
    .from('edu_exam_results')
    .select('score, created_at')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    decks: decksWithStats,
    lastExam: lastExam || null,
    bestToxiCert: bestToxiCert || null,
    recentSearches: (recentSearches || []).map(s => s.keyword),
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
 * Cập nhật thông tin cá nhân
 */
export async function updateProfile(userId: string, updates: Partial<{ full_name: string, avatar_url: string, bio: string, goals: string }>) {
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
