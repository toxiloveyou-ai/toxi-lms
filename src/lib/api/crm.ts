
import { supabase } from '../supabase';

export interface Lead {
  id?: string;
  full_name: string;
  phone: string;
  email?: string;
  source: string;
  status: 'new' | 'contacted' | 'consulted' | 'enrolled' | 'lost';
  potential_score: number;
  notes?: string;
  assigned_to?: string;
  created_at?: string;
}

export const crmApi = {
  /**
   * Get all leads with optional status filter
   */
  async getLeads(status?: string) {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new lead
   */
  async createLead(lead: Omit<Lead, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Update lead status or details
   */
  async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Convert Lead to Student (TOXI Profile)
   */
  async convertToStudent(leadId: string, studentData: any) {
    // 1. Create student profile
    const { data: student, error: studentError } = await supabase
      .from('toxi_profiles')
      .insert([studentData])
      .select();

    if (studentError) throw studentError;

    // 2. Update lead status to 'enrolled'
    const { error: leadError } = await supabase
      .from('leads')
      .update({ status: 'enrolled' })
      .eq('id', leadId);

    if (leadError) throw leadError;

    return student[0];
  }
};
