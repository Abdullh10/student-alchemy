import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads an image to the public `avatars` bucket under the current
 * teacher's folder (required by storage RLS: first path segment = auth.uid())
 * and returns its public URL.
 */
export async function uploadAvatar(file: File, teacherId: string, prefix: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${teacherId}/${prefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
