
import { supabase } from '../supabase';

const PAYOS_CLIENT_ID = import.meta.env.VITE_PAYOS_CLIENT_ID;
const PAYOS_API_KEY = import.meta.env.VITE_PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = import.meta.env.VITE_PAYOS_CHECKSUM_KEY;

/**
 * PayOS Integration for Toxi Edu
 * Using automatic QR code and instant verification
 */
export const paymentApi = {
  /**
   * Create a payment link using PayOS
   * Note: In production, this should be called from a secure backend/edge function
   * to hide sensitive keys.
   */
  async createPaymentLink(orderData: {
    orderCode: number;
    amount: number;
    description: string;
    buyerName: string;
    buyerEmail: string;
    cancelUrl: string;
    returnUrl: string;
  }) {
    try {
      // In a real scenario, we call our own backend/edge function
      // which then calls PayOS API.
      // Here we simulate the response structure or call a Supabase Edge Function if available.
      
      const { data, error } = await supabase.functions.invoke('payos-handler', {
        body: {
          action: 'create-link',
          ...orderData
        }
      });

      if (error) throw error;
      return data; // { checkoutUrl, paymentLinkId, ... }
    } catch (err) {
      console.error('Error creating PayOS link:', err);
      throw err;
    }
  },

  /**
   * Check payment status manually (Polling or Refresh)
   */
  async checkPaymentStatus(orderCode: number) {
    try {
      const { data, error } = await supabase.functions.invoke('payos-handler', {
        body: { 
          action: 'check-order',
          orderCode 
        }
      });

      if (error) throw error;
      return data; // { status: 'PAID' | 'PENDING' | 'CANCELLED', ... }
    } catch (err) {
      console.error('Error checking PayOS status:', err);
      throw err;
    }
  },

  /**
   * Generate a mock order code (must be numeric for PayOS)
   */
  generateOrderCode() {
    return Math.floor(Date.now() / 1000);
  }
};
