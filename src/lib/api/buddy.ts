
import { supabase } from '../supabase';

export interface BuddyRequest {
  id?: string;
  user_id: string;
  hsk_level: string;
  goal: string;
  preferred_time: string;
  description: string;
  is_active?: boolean;
  created_at?: string;
  user_profile?: any;
}

export async function fetchBuddyRequests(filters?: { hsk_level?: string, goal?: string }) {
  let query = supabase
    .from('study_buddy_requests')
    .select(`
      *,
      user_profile:toxi_profiles(id, full_name, total_xp, streak_days, avatar_url)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters?.hsk_level && filters.hsk_level !== 'all') {
    query = query.eq('hsk_level', filters.hsk_level);
  }
  
  if (filters?.goal && filters.goal !== 'all') {
    query = query.eq('goal', filters.goal);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createBuddyRequest(request: Partial<BuddyRequest>) {
  const { data, error } = await supabase
    .from('study_buddy_requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function connectWithBuddy(requesterId: string, receiverId: string) {
  const { data, error } = await supabase
    .from('buddy_connections')
    .insert({ requester_id: requesterId, receiver_id: receiverId, status: 'pending' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptBuddyConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('buddy_connections')
    .update({ status: 'connected' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserConnections(userId: string) {
  const { data, error } = await supabase
    .from('buddy_connections')
    .select(`
      *,
      requester:toxi_profiles!buddy_connections_requester_id_fkey(id, full_name, total_xp),
      receiver:toxi_profiles!buddy_connections_receiver_id_fkey(id, full_name, total_xp)
    `)
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

  if (error) throw error;
  return data;
}
export async function fetchBuddyMoments() {
  const { data, error } = await supabase
    .from('buddy_moments')
    .select(`
      *,
      user_profile:toxi_profiles(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

export async function createBuddyMoment(userId: string, content: string, imageUrl?: string) {
  const { data, error } = await supabase
    .from('buddy_moments')
    .insert({ user_id: userId, content, image_url: imageUrl })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function likeBuddyMoment(momentId: string, userId: string) {
  // Simple like logic - could be expanded to a separate table
  const { data: moment } = await supabase
    .from('buddy_moments')
    .select('likes')
    .eq('id', momentId)
    .single();
  
  const newLikes = (moment?.likes || 0) + 1;
  
  const { data, error } = await supabase
    .from('buddy_moments')
    .update({ likes: newLikes })
    .eq('id', momentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// MESSAGING API
// ─────────────────────────────────────────────────────────────

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('buddy_messages')
    .insert({ 
      sender_id: senderId, 
      receiver_id: receiverId, 
      content 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchMessages(userId: string, otherId: string) {
  const { data, error } = await supabase
    .from('buddy_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}
