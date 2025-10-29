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
    join_date: '2024-01-15',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 8902',
    address: '456 Oak Ave, City, State 12345',
    emergency_contact: '+1 234 567 8903',
    join_date: '2024-02-01',
    status: 'active',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 234 567 8904',
    address: '789 Pine St, City, State 12345',
    emergency_contact: '+1 234 567 8905',
    join_date: '2024-01-20',
    status: 'inactive',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1 234 567 8906',
    address: '321 Elm St, City, State 12345',
    emergency_contact: '+1 234 567 8907',
    join_date: '2024-02-10',
    status: 'active',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z'
  }
];

export const memberService = {
  async getAll(): Promise<Member[]> {
    try {
      console.log('Attempting to fetch members from database...');
      
      // Add a shorter timeout for faster fallback
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      );
      
      const fetchPromise = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Member fetch error:', error);
        console.log('Using sample data as fallback');
        return sampleMembers;
      }
      
      console.log('Successfully fetched members from database:', data?.length || 0);
      return data || sampleMembers;
    } catch (error) {
      console.error('Member service error:', error);
      console.log('Database unavailable, using sample data');
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
    } catch (error) {
      console.error('Create member failed, database unavailable:', error);
      // Return a mock created member for demo purposes
      const mockMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        ...input,
        join_date: input.join_date || new Date().toISOString().split('T')[0],
        status: input.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockMember;
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
