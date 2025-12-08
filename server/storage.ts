// Storage helpers for file uploads using Supabase Storage
import { supabase, supabaseAdmin } from "./supabase";

// Initialize Supabase client for storage operations.
// Use the service-role client when available to ensure Storage
// operations bypass RLS and avoid missing session errors.
function getSupabaseClient() {
  return supabaseAdmin ?? supabase;
}

/**
 * Upload a file to Supabase Storage
 * @param relKey - Relative path/key for the file (e.g., "avatars/user-123.jpg")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = normalizeKey(relKey);
  
  // Determine bucket based on file path
  const bucket = getBucketFromPath(key);
  const filePath = getFilePathFromKey(key);
  
  // Convert data to appropriate format
  let fileData: Blob | Buffer | Uint8Array;
  if (typeof data === 'string') {
    fileData = new Blob([data], { type: contentType });
  } else {
    fileData = data;
  }
  
  // Upload to Supabase Storage
  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileData, {
      contentType,
      upsert: true, // Overwrite if exists
    });
  
  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return {
    key,
    url: publicUrl,
  };
}

/**
 * Get a file's public URL from Supabase Storage
 * @param relKey - Relative path/key for the file
 * @returns Object with key and public URL
 */
export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = normalizeKey(relKey);
  
  const bucket = getBucketFromPath(key);
  const filePath = getFilePathFromKey(key);
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return {
    key,
    url: publicUrl,
  };
}

/**
 * Delete a file from Supabase Storage
 * @param relKey - Relative path/key for the file
 */
export async function storageDelete(relKey: string): Promise<void> {
  const supabase = getSupabaseClient();
  const key = normalizeKey(relKey);
  
  const bucket = getBucketFromPath(key);
  const filePath = getFilePathFromKey(key);
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  if (error) {
    throw new Error(`Supabase Storage delete failed: ${error.message}`);
  }
}

// Helper functions

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

/**
 * Determine which Supabase Storage bucket to use based on file path
 * Buckets should be created in Supabase Dashboard:
 * - avatars: User profile pictures
 * - covers: Profile cover images
 * - products: Product images
 * - generated: AI-generated images
 * - courses: Course-related files
 * - digital-products: Downloadable digital products
 */
function getBucketFromPath(key: string): string {
  if (key.startsWith('avatars/')) return 'avatars';
  if (key.startsWith('covers/')) return 'covers';
  if (key.startsWith('products/')) return 'products';
  if (key.startsWith('generated/')) return 'generated';
  if (key.startsWith('courses/')) return 'courses';
  if (key.startsWith('digital-products/')) return 'digital-products';
  if (key.startsWith('posts/')) return 'posts';
  
  // Default bucket for miscellaneous files
  return 'public';
}

/**
 * Extract the file path within the bucket (remove bucket prefix)
 */
function getFilePathFromKey(key: string): string {
  const parts = key.split('/');
  // If key starts with bucket name, remove it
  const bucket = getBucketFromPath(key);
  if (parts[0] === bucket) {
    return parts.slice(1).join('/');
  }
  return key;
}
