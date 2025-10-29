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
    console.log('Fetching members from Supabase profiles table...');
    
    try {
      // Direct fetch from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
        throw new Error(`Database error: ${profilesError.message}`);
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('No profiles found in database');
        return [];
      }

      console.log(`Successfully fetched ${profilesData.length} profiles from database`);
      
      // Convert profiles to member format
      const members: Member[] = profilesData.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        name: profile.full_name || profile.email?.split('@')[0] || 'User',
        email: profile.email || '',
        phone: '',
        address: '',
        emergency_contact: '',
        join_date: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'inactive',
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.created_at || new Date().toISOString()
      }));

      return members;
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
      throw new Error(`Failed to load members: ${error.message || 'Unknown error'}`);
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
    try {
      // Try to create in members table first
      const { data: memberData } = await supabase
        .from('members')
        .insert([{
          ...input,
          join_date: input.join_date || new Date().toISOString().split('T')[0],
          status: input.status || 'active',
        }])
        .select()
        .single();

      if (memberData) {
        await logAction(LOG_ACTIONS.MEMBER_CREATED, { member_id: memberData.id, name: memberData.name });
        return memberData;
      }

      // If members table doesn't work, create in profiles table
      console.log('Creating member in profiles table...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          email: input.email,
          full_name: input.name,
          role: 'user'
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Convert profile to member format
      const newMember: Member = {
        id: profileData.id,
        user_id: profileData.id,
        name: profileData.full_name || profileData.email.split('@')[0],
        email: profileData.email,
        phone: input.phone || '',
        address: input.address || '',
        emergency_contact: input.emergency_contact || '',
        join_date: input.join_date || new Date().toISOString().split('T')[0],
        status: input.status || 'active',
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.created_at || new Date().toISOString()
      };

      await logAction(LOG_ACTIONS.MEMBER_CREATED, { member_id: newMember.id, name: newMember.name });
      return newMember;
    } catch (error) {
      console.error('Create member failed:', error);
      throw error;
    }
  },

  async update(id: string, input: Partial<CreateMemberInput>): Promise<Member> {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await logAction(LOG_ACTIONS.MEMBER_UPDATED, { member_id: id });
      return data;
    } catch (error) {
      console.error('Update member failed:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await logAction(LOG_ACTIONS.MEMBER_DELETED, { member_id: id });
    } catch (error) {
      console.error('Delete member failed:', error);
      throw error;
    }
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
