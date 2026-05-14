import { supabase } from '../supabase';

// ── ENROLLMENT & COMMERCE ────────────────────────────────────

/**
 * Check if a user is enrolled in a course and what the status is
 */
export async function checkEnrollment(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('edu_enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  if (error) return { enrolled: false, status: null, error };
  return { 
    enrolled: !!data, 
    status: data?.status || null, 
    paymentStatus: data?.payment_status || null,
    data 
  };
}

/**
 * Register for a course (Pending payment)
 */
export async function enrollInCourse(userId: string, courseId: string, amount: number, billUrl?: string) {
  const { data, error } = await supabase
    .from('edu_enrollments')
    .upsert({
      user_id: userId,
      course_id: courseId,
      total_amount: amount,
      paid_amount: 0,
      status: 'pending',
      payment_status: 'unpaid',
      bill_url: billUrl || null
    }, { onConflict: 'user_id,course_id' })
    .select()
    .single();

  return { data, error };
}

/**
 * (Admin Only) Confirm payment and activate enrollment
 */
export async function activateEnrollment(enrollmentId: string, amountPaid: number) {
  const { data, error } = await supabase
    .from('edu_enrollments')
    .update({
      status: 'active',
      payment_status: 'paid',
      paid_amount: amountPaid
    })
    .eq('id', enrollmentId)
    .select()
    .single();

  return { data, error };
}

// ── PROGRESS & LESSONS ───────────────────────────────────────

/**
 * Get all lessons for a course with user's progress
 */
export async function getCourseLessonsWithProgress(userId: string, courseId: string) {
  // 1. Get all lessons
  const { data: lessons, error: lError } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (lError) throw lError;

  // 2. Get progress
  const { data: progress, error: pError } = await supabase
    .from('edu_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .in('lesson_id', lessons.map(l => l.id));

  if (pError) throw pError;

  // 3. Merge
  const progressMap = (progress || []).reduce((acc: any, p) => {
    acc[p.lesson_id] = p;
    return acc;
  }, {});

  return lessons.map(l => ({
    ...l,
    progress: progressMap[l.id] || { status: 'not_started' }
  }));
}

// ── EXAMS & RESULTS ──────────────────────────────────────────

/**
 * Submit final exam results
 */
export async function submitExamResult(userId: string, examId: string, score: number, answers: any) {
  const status = score >= 70 ? 'passed' : 'failed'; // Default 70% threshold
  
  const { data, error } = await supabase
    .from('edu_exam_results')
    .insert({
      user_id: userId,
      exam_id: examId,
      score: score,
      status: status,
      answers_json: answers
    })
    .select()
    .single();

  return { data, error, passed: status === 'passed' };
}

/**
 * Get exam for a course
 */
export async function getFinalExam(courseId: string) {
  const { data, error } = await supabase
    .from('edu_final_exams')
    .select('*')
    .eq('course_id', courseId)
    .maybeSingle();
  
  return { data, error };
}

// ── CERTIFICATES ─────────────────────────────────────────────

/**
 * Issue a certificate (Typically called after passing exam)
 */
export async function issueCertificate(userId: string, courseId: string, score: number) {
  const certId = `TX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      cert_id: certId,
      user_id: userId,
      course_id: courseId,
      metadata_json: { score, issued_at: new Date().toISOString() }
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Verify a certificate by ID
 */
export async function verifyCertificate(certId: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, toxi_profiles(full_name), courses(title)')
    .eq('cert_id', certId)
    .maybeSingle();

  return { data, error, valid: !!data };
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(userId: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, courses(title, thumbnail_url)')
    .eq('user_id', userId)
    .order('issue_date', { ascending: false });

  return { data, error };
}
