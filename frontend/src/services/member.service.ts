import { supabase } from '@/config/supabase';
import { logAction, LOG_ACTIONS } from './logging.service';

export interface Member {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  emergency_contact?: string;
  join_date: string;
  package_id?: string;
  membership_expiry?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateMemberInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  emergency_contact?: string;
  join_date?: string;
  package_id?: string;
  membership_expiry?: string;
  status?: 'active' | 'inactive';
}

export const memberService = {
  async getAll(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Member fetch error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Member service error:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    await logAction(LOG_ACTIONS.MEMBER_VIEWED, { member_id: id });
    return data;
  },

  async create(input: CreateMemberInput): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert([{
        ...input,
        join_date: input.join_date || new Date().toISOString().split('T')[0],
        status: input.status || 'active',
      }])
      .select()
      .single();

    if (error) throw error;
    await logAction(LOG_ACTIONS.MEMBER_CREATED, { member_id: data.id, name: data.name });
    return data;
  },

  async update(id: string, input: Partial<CreateMemberInput>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logAction(LOG_ACTIONS.MEMBER_UPDATED, { member_id: id });
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await logAction(LOG_ACTIONS.MEMBER_DELETED, { member_id: id });
  },

  async uploadPhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `member-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
