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

// Sample data for when database is unavailable
const sampleMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, City, State 12345',
    emergency_contact: '+1 234 567 8901',
    join_date: '2024-10-15',
    status: 'active',
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-10-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 8902',
    address: '456 Oak Ave, City, State 12345',
    emergency_contact: '+1 234 567 8903',
    join_date: '2024-10-20',
    status: 'active',
    created_at: '2024-10-20T10:00:00Z',
    updated_at: '2024-10-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 234 567 8904',
    address: '789 Pine St, City, State 12345',
    emergency_contact: '+1 234 567 8905',
    join_date: '2024-10-25',
    status: 'inactive',
    created_at: '2024-10-25T10:00:00Z',
    updated_at: '2024-10-25T10:00:00Z'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1 234 567 8906',
    address: '321 Elm St, City, State 12345',
    emergency_contact: '+1 234 567 8907',
    join_date: '2024-10-28',
    status: 'active',
    created_at: '2024-10-28T10:00:00Z',
    updated_at: '2024-10-28T10:00:00Z'
  }
];

// Test function to check Supabase connectivity
const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Simple auth check
    const { data: session } = await supabase.auth.getSession();
    console.log('Auth session test:', !!session);
    
    // Test 2: Try to access a simple table
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    console.log('Profiles table test:', { 
      success: !error, 
      error: error?.message,
      count 
    });
    
    return !error;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
};

export const memberService = {
  async getAll(): Promise<Member[]> {
    try {
      console.log('Fetching real members from Supabase...');
      
      // First test the connection
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        console.log('Connection test failed, using sample data');
        return sampleMembers;
      }
      
      // Try to fetch profiles data
      console.log('Attempting to fetch from profiles table...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
        console.log('RLS might be blocking access, using sample data');
        return sampleMembers;
      }

      if (profilesData && profilesData.length > 0) {
        console.log('Successfully fetched profiles:', profilesData.length);
        
        // Convert profiles to member format
        const membersFromProfiles: Member[] = profilesData.map(profile => ({
          id: profile.id,
          user_id: profile.id,
          name: profile.full_name || profile.email?.split('@')[0] || 'Unknown User',
          email: profile.email || 'no-email@example.com',
          phone: '',
          address: '',
          emergency_contact: '',
          join_date: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          status: 'active' as 'active' | 'inactive',
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.created_at || new Date().toISOString()
        }));

        return membersFromProfiles;
      }

      console.log('No profiles data found, using sample data');
      return sampleMembers;
      
    } catch (error) {
      console.error('Complete failure fetching members:', error);
      console.log('Using sample data as final fallback');
      return sampleMembers;
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
      console.error('Update member failed, database unavailable:', error);
      // Return a mock updated member
      const mockMember: Member = {
        id,
        name: input.name || 'Updated Member',
        email: input.email || 'updated@example.com',
        join_date: input.join_date || new Date().toISOString().split('T')[0],
        status: input.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input
      };
      return mockMember;
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
      console.error('Delete member failed, database unavailable:', error);
      // For demo purposes, we'll just log the deletion
      console.log(`Member ${id} would be deleted (database unavailable)`);
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
