
import { supabase } from '../supabase';

export interface ManagementTask {
  id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assigned_to?: string;
  due_date?: string;
  created_at?: string;
}

export interface ApprovalRequest {
  id?: string;
  requester_id: string;
  type: 'expense' | 'leave' | 'course_launch';
  amount?: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_id?: string;
  created_at?: string;
}

export const managementApi = {
  // --- Task Management ---
  async getTasks() {
    const { data, error } = await supabase
      .from('management_tasks')
      .select(`
        *,
        assignee:staff_profiles(full_name)
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createTask(task: Omit<ManagementTask, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('management_tasks')
      .insert([task])
      .select();

    if (error) throw error;
    return data[0];
  },

  async updateTask(id: string, updates: Partial<ManagementTask>) {
    const { data, error } = await supabase
      .from('management_tasks')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // --- Approval Workflow ---
  async getApprovalRequests() {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        *,
        requester:staff_profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('approval_requests')
      .insert([{ ...request, status: 'pending' }])
      .select();

    if (error) throw error;
    return data[0];
  },

  async respondToApproval(id: string, status: 'approved' | 'rejected', approverId: string) {
    const { data, error } = await supabase
      .from('approval_requests')
      .update({ status, approver_id: approverId })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }
};
