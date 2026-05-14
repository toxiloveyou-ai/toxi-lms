import { supabase } from '../supabase';

export interface TongxiaoMemory {
  id?: string;
  user_id: string;
  memory_key: string;
  memory_value: any;
  confidence_score: number;
}

/**
 * Lấy toàn bộ bộ nhớ của người dùng để nạp vào Context cho AI
 */
export async function getTongxiaoMemory(userId: string): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('tongxiao_memory')
    .select('memory_key, memory_value')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching Tongxiao memory:', error);
    return {};
  }

  return data.reduce((acc, item) => ({
    ...acc,
    [item.memory_key]: item.memory_value
  }), {});
}

/**
 * Lưu một mẩu kiến thức mới mà AI học được về người dùng
 */
export async function updateTongxiaoMemory(userId: string, key: string, value: any, confidence = 1.0) {
  const { error } = await supabase
    .from('tongxiao_memory')
    .upsert({
      user_id: userId,
      memory_key: key,
      memory_value: value,
      confidence_score: confidence,
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id,memory_key' });

  if (error) console.error('Error updating Tongxiao memory:', error);
}

/**
 * Ghi lại một insight (phát hiện) về quá trình học tập
 */
export async function logTongxiaoWisdom(userId: string, type: string, content: string, sessionId?: string) {
  const { error } = await supabase
    .from('tongxiao_wisdom_logs')
    .insert({
      user_id: userId,
      insight_type: type,
      insight_content: content,
      session_id: sessionId
    });

  if (error) console.error('Error logging wisdom:', error);
}
