

import { supabase } from '../supabase';

export const academicApi = {
  /**
   * Fetch all courses
   */
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('title');
    if (error) throw error;
    return data;
  },

  /**
   * Fetch classes with enrollment counts
   */
  async getClasses() {
    const { data, error } = await supabase
      .from('edu_classes')
      .select(`
        *,
        courses(title, code),
        teacher:teachers(id, staff:staff_profiles(full_name)),
        members:edu_class_members(count)
      `);
    if (error) throw error;
    return data;
  },

  /**
   * Enroll a student and create an invoice automatically
   */
  async enrollStudent(studentId: string, classId: string, coursePrice: number) {
    // 1. Create Class Membership
    const { data: enrollment, error: enrollError } = await supabase
      .from('edu_class_members')
      .insert({
        student_id: studentId,
        class_id: classId
      })
      .select()
      .single();

    if (enrollError) throw enrollError;

    // 2. Automatically generate an Invoice in the Finance system
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        student_id: studentId,
        total_amount: coursePrice,
        invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
        status: 'unpaid',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    return { enrollment, invoice };
  },

  /**
   * Record a grade/achievement for a student
   */
  async recordGrade(classId: string, studentId: string, type: string, score: number, notes: string) {
    const { data, error } = await supabase
      .from('edu_homework_submissions')
      .insert({
        class_id: classId,
        student_id: studentId,
        submission_type: type,
        ai_score: score,
        teacher_feedback: notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
