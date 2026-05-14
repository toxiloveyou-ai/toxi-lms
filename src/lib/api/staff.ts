
import { supabase } from '../supabase';

export interface StaffProfile {
  id?: string;
  employee_id?: string;
  full_name: string;
  roles: string[]; // Changed from single role to array for multi-position support
  email?: string;
  phone?: string;
  branch?: string;
  status: 'active' | 'on_leave' | 'resigned' | 'terminated';
  salary?: number;
  address?: string;
  education_level?: string;
  payroll_model?: 'monthly' | 'per_session';
  base_session_rate?: number;
  joined_at?: string;
  created_at?: string;
  department_id?: string;
  current_shift_id?: string;
  contract_type?: string;
  // Banking Information
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  // Recurring Allowances (Monthly)
  allowance_meal?: number;
  allowance_transport?: number;
  allowance_phone?: number;
  insurance_social?: number; // Standard social insurance deduction
}

export const staffApi = {
  async getStaff() {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createStaff(staff: Omit<StaffProfile, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('staff')
      .insert([staff])
      .select();

    if (error) throw error;
    return data[0];
  },

  async updateStaff(id: string, updates: Partial<StaffProfile>) {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }
};
