
import { supabase } from '../supabase';

export interface Department {
  id: string;
  name: string;
  parent_id?: string;
  manager_id?: string;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_period: number; // minutes allowed late
  work_hours: number;
  color: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  base_salary?: number;
}

export interface LeaveRequest {
  id?: string;
  staff_id: string;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_id?: string;
}

export const hrApi = {
  // Departments
  async getDepartments() {
    const { data, error } = await supabase
      .from('hr_departments')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async saveDepartment(dept: Partial<Department>) {
    if (dept.id) {
      const { data, error } = await supabase.from('hr_departments').update(dept).eq('id', dept.id).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase.from('hr_departments').insert([dept]).select();
      if (error) throw error;
      return data[0];
    }
  },

  async deleteDepartment(id: string) {
    const { error } = await supabase.from('hr_departments').delete().eq('id', id);
    if (error) throw error;
  },

  // Shifts
  async getShifts() {
    const { data, error } = await supabase
      .from('hr_shifts')
      .select('*')
      .order('start_time');
    if (error) throw error;
    return data;
  },

  async saveShift(shift: Partial<Shift>) {
    // Try to save with full object first, fallback if columns are missing
    try {
      if (shift.id) {
        const { data, error } = await supabase.from('hr_shifts').update(shift).eq('id', shift.id).select();
        if (error) throw error;
        return data[0];
      } else {
        const { data, error } = await supabase.from('hr_shifts').insert([shift]).select();
        if (error) throw error;
        return data[0];
      }
    } catch (err: any) {
      if (err.message?.includes('column') && err.message?.includes('not found')) {
        // Fallback: save only essential fields
        const essentialShift = {
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time
        };
        if (shift.id) {
          const { data, error } = await supabase.from('hr_shifts').update(essentialShift).eq('id', shift.id).select();
          if (error) throw error;
          return data[0];
        } else {
          const { data, error } = await supabase.from('hr_shifts').insert([essentialShift]).select();
          if (error) throw error;
          return data[0];
        }
      }
      throw err;
    }
  },

  async deleteShift(id: string) {
    const { error } = await supabase.from('hr_shifts').delete().eq('id', id);
    if (error) throw error;
  },

  // Roles
  async getRoles() {
    const { data, error } = await supabase
      .from('hr_roles')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async saveRole(role: Partial<Role>) {
    if (role.id) {
      const { data, error } = await supabase.from('hr_roles').update(role).eq('id', role.id).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase.from('hr_roles').insert([role]).select();
      if (error) throw error;
      return data[0];
    }
  },

  async deleteRole(id: string) {
    const { error } = await supabase.from('hr_roles').delete().eq('id', id);
    if (error) throw error;
  },

  // Leaves
  async getLeaveRequests(status?: string) {
    let query = supabase
      .from('hr_leave_requests')
      .select(`
        *,
        staff:staff(full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createLeaveRequest(request: Partial<LeaveRequest>) {
    const { data, error } = await supabase
      .from('hr_leave_requests')
      .insert([request])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateLeaveStatus(id: string, status: string, approverId: string) {
    const { data, error } = await supabase
      .from('hr_leave_requests')
      .update({ status, approver_id: approverId })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};
