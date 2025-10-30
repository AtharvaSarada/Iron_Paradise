# Supabase Storage Setup Guide for Photo Uploads

## 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New bucket**
4. Set bucket name: `photos`
5. Set **Public bucket**: `true` (allows public read access to photos)
6. Click **Create bucket**

## 2. Apply Storage Policies

1. Go to **Database** > **SQL Editor** in your Supabase Dashboard
2. Run the SQL from `supabase-storage-policies.sql`

This will set up:
- Authenticated users can upload photos to `member-photos/` folder
- Public read access to all photos (for displaying member photos)
- Users can manage their own photos (optional)
- Admins can manage all photos

## 3. Folder Structure

The storage will organize photos as:
```
photos/
├── member-photos/
│   ├── user-id-1/
│   │   ├── photo1.jpg
│   │   └── photo2.png
│   ├── user-id-2/
│   │   └── photo1.jpg
│   └── general-uploads/
│       ├── photo1.jpg
│       └── photo2.png
```

## 4. File Restrictions

The updated service includes:
- **File types**: JPG, JPEG, PNG, WebP only
- **File size**: Maximum 5MB
- **Validation**: Client-side validation before upload

## 5. Usage Examples

### Admin Upload Photo for Any User
```typescript
// Admin uploads photo for specific user
const photoUrl = await memberService.uploadPhotoForUser(file, targetUserId);
```

### User Upload Own Photo
```typescript
// User uploads their own photo
const photoUrl = await memberService.uploadOwnPhoto(file);
```

### Generic Upload Method
```typescript
// Upload for specific user (admin) or own photo (user)
const photoUrl = await memberService.uploadPhoto(file, targetUserId);

// Upload own photo (no targetUserId)
const photoUrl = await memberService.uploadPhoto(file);
```

### Delete Photo
```typescript
// Admin can delete any photo, users can only delete their own
await memberService.deletePhoto(photoUrl);
```

### Check Permissions
```typescript
// Check if current user can manage photos for target user
const canManage = await memberService.canManageUserPhotos(targetUserId);
```

### Update Member with Photo
```typescript
const updatedMember = await memberService.update(memberId, {
  photo_url: photoUrl
});
```

## 6. Security Features

- **RLS Policies**: Row Level Security ensures users can only access appropriate photos
- **Authentication Required**: Only authenticated users can upload
- **File Validation**: Type and size validation prevents malicious uploads
- **Organized Storage**: User-specific folders prevent conflicts

## 7. Public URLs

Photos are accessible via public URLs like:
```
https://your-project.supabase.co/storage/v1/object/public/photos/member-photos/user-123/photo.jpg
```

## 8. Error Handling

The service includes comprehensive error handling for:
- Invalid file types
- File size limits
- Upload failures
- Network issues
- Permission errors

## 9. Logging

All photo operations are logged via the logging service for audit trails.

## 10. Next Steps

1. Run the storage policies SQL
2. Test photo upload in your application
3. Verify photos appear in Storage dashboard
4. Check public URLs work correctly
5. Test delete functionality

## Troubleshooting

### Upload Fails
- Check if bucket exists and is named 'photos'
- Verify RLS policies are applied
- Ensure user is authenticated
- Check file type and size limits

### Photos Not Visible
- Verify bucket is set to public
- Check public URL format
- Ensure RLS policies allow SELECT

### Permission Denied
- Check user authentication status
- Verify RLS policies match your user roles
- Ensure bucket policies are correctly applied