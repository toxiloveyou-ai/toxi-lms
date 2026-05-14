import { supabase } from '../supabase';
import { addXP } from './profile';
import { aiChat } from '../ai-bridge';

// ── LESSON PROGRESS ──────────────────────────────────────────
export async function getOrCreateLessonProgress(userId: string, lessonId: string, classId?: string) {
  const { data: existing } = await supabase
    .from('edu_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (existing) return existing;
  const { data: created } = await supabase
    .from('edu_lesson_progress')
    .insert({ user_id: userId, lesson_id: lessonId, class_id: classId || null, status: 'in_progress', phase_completed: 'understand' })
    .select('*')
    .single();
  return created;
}

export async function updateLessonPhase(userId: string, lessonId: string, phase: 'understand' | 'practice' | 'apply' | 'done') {
  await supabase
    .from('edu_lesson_progress')
    .update({ phase_completed: phase, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('lesson_id', lessonId);
}

export async function completeLessonAndAwardXP(userId: string, lessonId: string, score: number, xpReward: number) {
  const now = new Date().toISOString();
  await supabase
    .from('edu_lesson_progress')
    .upsert({ user_id: userId, lesson_id: lessonId, status: 'completed', score, xp_earned: xpReward, phase_completed: 'done', completed_at: now, updated_at: now }, { onConflict: 'user_id,lesson_id' });
  await addXP(userId, xpReward, `lesson_complete_${lessonId}`);
}

export async function getCourseProgress(userId: string, lessonIds: string[]) {
  if (!lessonIds.length) return {};
  const { data } = await supabase
    .from('edu_lesson_progress')
    .select('lesson_id, status, phase_completed, score, xp_earned')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);
  return (data || []).reduce((acc: Record<string, any>, p) => { acc[p.lesson_id] = p; return acc; }, {});
}

// ── ZONE 1: NOTES ────────────────────────────────────────────
export async function getLessonNote(userId: string, lessonId: string): Promise<string> {
  const { data } = await supabase
    .from('lesson_notes')
    .select('content')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  return data?.content || '';
}

export async function saveLessonNote(userId: string, lessonId: string, content: string) {
  await supabase
    .from('lesson_notes')
    .upsert({ user_id: userId, lesson_id: lessonId, content, updated_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });
}

// ── ZONE 2: SUBMISSIONS (PORTFOLIO) ──────────────────────────
export async function submitLesson(userId: string, lessonId: string, classId: string | undefined, submissionType: string, content: string, fileUrl?: string) {
  const { data, error } = await supabase
    .from('lesson_submissions')
    .insert({ user_id: userId, lesson_id: lessonId, class_id: classId || null, submission_type: submissionType, content, file_url: fileUrl || null, status: 'submitted' })
    .select('*')
    .single();
  return { data, error };
}

export async function getMySubmissions(userId: string, lessonId: string) {
  const { data } = await supabase
    .from('lesson_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('submitted_at', { ascending: false });
  return data || [];
}

export async function scoreSubmissionWithAI(submissionId: string, submissionContent: string, lessonTitle: string) {
  try {
    const system = `Bạn là giáo viên tiếng Trung tại Toxi Edu. Hãy chấm điểm bài nộp sau (thang 0-100) và cho feedback ngắn gọn bằng tiếng Việt.
Bài học: ${lessonTitle}
Trả về định dạng: SCORE:XX\nFEEDBACK:...`;
    const result = await aiChat(system, [], submissionContent);
    const scoreMatch = result.match(/SCORE:(\d+)/);
    const feedbackMatch = result.match(/FEEDBACK:([\s\S]*)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : result;
    await supabase.from('lesson_submissions').update({ ai_score: score, ai_feedback: feedback }).eq('id', submissionId);
    return { score, feedback };
  } catch {
    return { score: 70, feedback: 'Bài nộp đã được ghi nhận.' };
  }
}

// ── ZONE 3: QUESTIONS (HỎI GIÁO VIÊN) ───────────────────────
export async function askTeacher(userId: string, lessonId: string, classId: string | undefined, question: string) {
  const { data } = await supabase
    .from('lesson_questions')
    .insert({ user_id: userId, lesson_id: lessonId, class_id: classId || null, question })
    .select('*')
    .single();
  return data;
}

export async function getLessonQuestions(lessonId: string, userId: string) {
  const { data } = await supabase
    .from('lesson_questions')
    .select('*')
    .eq('lesson_id', lessonId)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false });
  return data || [];
}

// ── ZONE 3: CLASS MEMBERS ────────────────────────────────────
export async function getClassMembers(classId: string, excludeUserId: string) {
  const { data } = await supabase
    .from('edu_class_members')
    .select('student_id, toxi_profiles!edu_class_members_student_id_fkey(full_name, avatar_url)')
    .eq('class_id', classId)
    .neq('student_id', excludeUserId)
    .limit(20);
  return (data || []).map((m: any) => ({
    id: m.student_id,
    name: m.toxi_profiles?.full_name || 'Học viên',
    avatar: m.toxi_profiles?.avatar_url || null
  }));
}
