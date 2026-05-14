
import { supabase } from '../supabase';

export interface PayrollRecord {
  id?: string;
  staff_id: string;
  month: number;
  year: number;
  base_salary: number;
  bonus: number;
  commissions: number;
  allowances: number;
  deductions: number;
  insurance_deduction: number;
  total_salary: number;
  total_sessions: number;
  status: 'pending' | 'processed' | 'paid';
}

export const payrollApi = {
  async getMonthlyPayroll(month: number, year: number) {
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        staff:staff(full_name, role, branch, employee_id, bank_name, bank_account_number, bank_account_holder, payroll_model, base_session_rate)
      `)
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
    return data;
  },

  async calculatePayroll(month: number, year: number) {
    try {
      // 1. Fetch all active staff
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('status', 'active');
      
      if (staffError) throw staffError;
      if (!staff || staff.length === 0) return [];

      // 2. Fetch attendance for the month
      // Get last day of month accurately
      const lastDay = new Date(year, month, 0).getDate();
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const { data: attendance, error: attendanceError } = await supabase
        .from('staff_attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (attendanceError) throw attendanceError;

      // 3. Fetch approved leave requests
      const { data: leaveRequests, error: leaveError } = await supabase
        .from('hr_leave_requests')
        .select('*')
        .eq('status', 'approved')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (leaveError) {
        console.warn('Error fetching leave requests, proceeding without leave data:', leaveError);
      }

      // 4. Advanced calculation
      const payrolls = staff.map(s => {
        const staffAttendance = attendance?.filter(a => a.staff_id === s.id) || [];
        
        let totalSalary = 0;
        let deductions = 0;
        let totalSessions = 0;
        let bonus = 0;

        if (s.payroll_model === 'per_session') {
          // PART-TIME / SESSION MODEL
          staffAttendance.forEach(att => {
            if (att.status === 'present') {
              // Use override if available, otherwise use staff base rate
              const rate = att.session_pay > 0 ? att.session_pay : (s.base_session_rate || 0);
              totalSalary += rate;
              totalSessions += 1;
            }
          });
        } else {
          // STANDARD MONTHLY MODEL
          const daysPresent = staffAttendance.filter(a => a.status === 'present').length;
          const daysLate = staffAttendance.filter(a => a.status === 'late').length;
          
          const base = s.salary || 0;
          const dailyRate = base / 26; // Standard 26 working days
          
          // Calculate leave (paid vs unpaid)
          const staffLeave = leaveRequests?.filter(r => r.staff_id === s.id) || [];
          let paidLeaveDays = 0;
          staffLeave.forEach(req => {
            if (req.type === 'annual' || req.type === 'sick') { // Paid leave types
               const start = new Date(req.start_date > startDate ? req.start_date : startDate);
               const end = new Date(req.end_date < endDate ? req.end_date : endDate);
               const diffTime = Math.max(0, end.getTime() - start.getTime());
               const days = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
               paidLeaveDays += days;
            }
          });

          // Deduction logic: 20k per late check-in
          deductions = daysLate * 20000;
          
          // Total Calculation
          const workSalary = dailyRate * (daysPresent + daysLate);
          const leaveSalary = dailyRate * paidLeaveDays;
          totalSalary = workSalary + leaveSalary;
        }
        
        const allowances = (s.allowance_meal || 0) + (s.allowance_transport || 0) + (s.allowance_phone || 0);
        const insuranceDeduction = s.insurance_social || 0;
        
        return {
          staff_id: s.id,
          month,
          year,
          base_salary: s.salary || 0,
          bonus,
          commissions: 0, // Manual input usually
          allowances,
          deductions: deductions + insuranceDeduction,
          insurance_deduction: insuranceDeduction,
          total_salary: Math.max(0, Math.round(totalSalary + allowances + bonus - deductions - insuranceDeduction)),
          total_sessions: totalSessions,
          status: 'pending'
        };
      });

      if (payrolls.length > 0) {
        const { data, error: upsertError } = await supabase
          .from('payroll')
          .upsert(payrolls, { onConflict: 'staff_id,month,year' })
          .select();
        
        if (upsertError) throw upsertError;
        return data;
      }
      return [];
    } catch (err: any) {
      console.error('Detailed Payroll Calculation Error:', err);
      throw err;
    }
  }
};
