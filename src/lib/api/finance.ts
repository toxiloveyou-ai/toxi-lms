
import { supabase } from '../supabase';

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  branch_id?: string;
  created_at?: string;
}

export const financeApi = {
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        branch:branches(name)
      `)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        student:toxi_profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
