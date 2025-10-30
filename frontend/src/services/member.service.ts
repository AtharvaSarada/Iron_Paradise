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
    console.log('Fetching members using direct REST API...');

    // Use direct fetch API instead of Supabase client to bypass any client-side issues
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`;

      console.log('Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const profilesData = await response.json();
      console.log('Profiles fetched:', profilesData.length);

      if (!profilesData || profilesData.length === 0) {
        return [];
      }

      // Convert profiles to member format
      const members: Member[] = profilesData.map((profile: any) => ({
        id: profile.id,
        user_id: profile.id,
        name: profile.full_name || profile.email?.split('@')[0] || 'User',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        emergency_contact: profile.emergency_contact || '',
        join_date: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'inactive',
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.created_at || new Date().toISOString()
      }));

      console.log('Members converted successfully');
      return members;
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
      throw new Error(`Failed to load members: ${error.message}`);
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
    console.log('Updating member using direct REST API...');

    try {
      // Update in profiles table using direct REST API
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`;

      const updateData: any = {};
      if (input.name) updateData.full_name = input.name;
      if (input.email) updateData.email = input.email;
      // Note: profiles table doesn't have phone, address, etc. - those would go in members table

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update API Error:', errorText);
        throw new Error(`Failed to update member: ${response.status}`);
      }

      const updatedProfiles = await response.json();
      const updatedProfile = updatedProfiles[0];

      console.log('Member updated successfully');
      await logAction(LOG_ACTIONS.MEMBER_UPDATED, { member_id: id });

      // Convert back to member format
      return {
        id: updatedProfile.id,
        user_id: updatedProfile.id,
        name: updatedProfile.full_name || updatedProfile.email?.split('@')[0] || 'User',
        email: updatedProfile.email || '',
        phone: input.phone || '',
        address: input.address || '',
        emergency_contact: input.emergency_contact || '',
        join_date: input.join_date || new Date().toISOString().split('T')[0],
        status: input.status || 'active',
        created_at: updatedProfile.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error: any) {
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

  async uploadPhoto(file: File, targetUserId?: string): Promise<string> {
    console.log('Uploading photo to Supabase Storage...');

    try {
      // First, check if storage is accessible
      console.log('Checking storage buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error(`Storage not accessible: ${bucketsError.message}`);
      }
      
      console.log('Available buckets:', buckets?.map(b => b.name) || []);
      
      const photosBucket = buckets?.find(b => b.name === 'photos');
      if (!photosBucket) {
        console.error('Photos bucket not found! Available buckets:', buckets?.map(b => b.name));
        throw new Error('Photos bucket does not exist. Please create it in Supabase Dashboard > Storage');
      }
      
      console.log('Photos bucket found:', photosBucket);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images only.');
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload images smaller than 5MB.');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Determine the target user ID for the photo
      const photoUserId = targetUserId || user.id;
      const filePath = `member-photos/${photoUserId}/${fileName}`;

      console.log('Uploading to path:', filePath);
      console.log('Current user:', user.id, 'Target user:', photoUserId);

      // Try a simple upload first to test basic access
      console.log('Attempting upload with basic settings...');
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          upsert: true // Allow overwrite to avoid conflicts
        });

      if (error) {
        console.error('Storage upload error:', error);
        
        // Try uploading to root folder as fallback
        console.log('Trying fallback upload to root folder...');
        const rootFilePath = `${fileName}`;
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('photos')
          .upload(rootFilePath, file, {
            upsert: true
          });
          
        if (fallbackError) {
          console.error('Fallback upload also failed:', fallbackError);
          throw new Error(`Upload failed: ${error.message}. Fallback also failed: ${fallbackError.message}`);
        }
        
        console.log('Fallback upload successful:', fallbackData);
        
        // Get public URL for fallback
        const { data: fallbackUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(rootFilePath);

        const fallbackPublicUrl = fallbackUrlData.publicUrl;
        console.log('Fallback photo uploaded successfully:', fallbackPublicUrl);
        
        await logAction(LOG_ACTIONS.MEMBER_UPDATED, {
          action: 'photo_uploaded_fallback',
          file_path: rootFilePath,
          target_user_id: photoUserId
        });

        return fallbackPublicUrl;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Photo uploaded successfully:', publicUrl);

      await logAction(LOG_ACTIONS.MEMBER_UPDATED, {
        action: 'photo_uploaded',
        file_path: filePath,
        target_user_id: photoUserId
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Photo upload failed:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  },

  // Admin method to upload photo for any user
  async uploadPhotoForUser(file: File, targetUserId: string): Promise<string> {
    console.log('Admin uploading photo for user:', targetUserId);
    return this.uploadPhoto(file, targetUserId);
  },

  // User method to upload their own photo
  async uploadOwnPhoto(file: File): Promise<string> {
    console.log('User uploading own photo');
    return this.uploadPhoto(file);
  },

  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/storage/v1/object/public/photos/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid photo URL format');
      }

      const filePath = urlParts[1];
      console.log('Deleting photo at path:', filePath);

      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Extract target user ID from file path
      const pathParts = filePath.split('/');
      const targetUserId = pathParts[1]; // member-photos/user-id/filename

      console.log('Current user:', user.id, 'Photo owner:', targetUserId);

      const { error } = await supabase.storage
        .from('photos')
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('Photo deleted successfully');
      await logAction(LOG_ACTIONS.MEMBER_UPDATED, {
        action: 'photo_deleted',
        file_path: filePath,
        target_user_id: targetUserId
      });
    } catch (error: any) {
      console.error('Photo delete failed:', error);
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  },

  // Helper method to check if current user can manage photos for target user
  async canManageUserPhotos(targetUserId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current user's role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Admin can manage all photos, users can only manage their own
      return profile?.role === 'admin' || user.id === targetUserId;
    } catch (error) {
      console.error('Error checking photo permissions:', error);
      return false;
    }
  },
};
