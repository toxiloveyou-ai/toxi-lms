import { supabase } from '../lib/supabase';

/**
 * TOXI EDU ACCESS CODES
 * 
 * FALLBACK: Danh sách các mã mặc định nếu DB chưa sẵn sàng.
 */
export const FALLBACK_ACCESS_CODES = [
  'TOXI-STUDENT-2026',
  'TOXI-PRO-LEARNER',
  'TOXI-VIP-ACCESS',
  'TOXI-EDU-GEN-1',
  'TOXI-HOCVIEN-CHINH-THUC',
  'TOXI-AI-ACADEMY'
];

/**
 * Kiểm tra mã truy cập có hợp lệ không (Async)
 * Kiểm tra trong bảng 'edu_access_codes' trước, sau đó dùng fallback.
 */
export const validateAccessCode = async (code: string): Promise<boolean> => {
  const cleanCode = code.trim().toUpperCase();
  
  try {
    const { data, error } = await supabase
      .from('edu_access_codes')
      .select('code, status')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      // Nếu mã tồn tại trong DB, kiểm tra xem đã dùng chưa
      return data.status === 'active';
    }
  } catch (err) {
    console.warn("Lỗi kiểm tra DB Access Code, sử dụng Fallback:", err);
  }

  // Fallback check
  return FALLBACK_ACCESS_CODES.includes(cleanCode);
};

/**
 * Đánh dấu mã đã sử dụng
 */
export const markCodeAsUsed = async (code: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('edu_access_codes')
      .update({ 
        status: 'used', 
        owner_id: userId,
        used_at: new Date().toISOString() 
      })
      .eq('code', code.trim().toUpperCase());
    
    if (error) console.error("Error marking code as used:", error);
  } catch (err) {
    console.error("Failed to mark code as used:", err);
  }
};

