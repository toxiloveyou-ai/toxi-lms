
import { supabase } from '../supabase';

export interface AttendanceRecord {
  id?: string;
  staff_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  notes?: string;
}

export const attendanceApi = {
  async getDailyAttendance(date: string) {
    const { data, error } = await supabase
      .from('staff_attendance')
      .select(`
        *,
        staff:staff(full_name, role)
      `)
      .eq('date', date);

    if (error) throw error;
    return data;
  },

  async markAttendance(record: AttendanceRecord) {
    const { data, error } = await supabase
      .from('staff_attendance')
      .upsert([record], { onConflict: 'staff_id,date' })
      .select();

    if (error) throw error;
    return data[0];
  },

  async getStaffStats(staffId: string, month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('staff_attendance')
      .select('*')
      .eq('staff_id', staffId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data;
  }
};
