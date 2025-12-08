import { supabase } from './supabase';

export { supabase };

// Storage buckets
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POST_MEDIA: 'post-media',
  COURSE_CONTENT: 'course-content',
  DIGITAL_PRODUCTS: 'digital-products',
} as const;

// Upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { url: '', error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { url: '', error: err as Error };
  }
}

// Upload multiple files
export async function uploadFiles(
  bucket: string,
  files: File[],
  pathPrefix: string
): Promise<{ urls: string[]; errors: Error[] }> {
  const results = await Promise.all(
    files.map(async (file, index) => {
      const ext = file.name.split('.').pop();
      const path = `${pathPrefix}/${Date.now()}-${index}.${ext}`;
      return uploadFile(bucket, path, file);
    })
  );

  return {
    urls: results.filter((r) => !r.error).map((r) => r.url),
    errors: results.filter((r) => r.error).map((r) => r.error!),
  };
}

// Delete file from storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}

// Generate signed URL for private files (courses, ebooks)
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) return null;
  return data.signedUrl;
}
