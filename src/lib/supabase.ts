import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key - only use in API routes)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Upload a photo to Supabase Storage
export async function uploadPhoto(
  file: File | Blob,
  userId: string,
  filename: string
): Promise<string> {
  const path = `${userId}/${Date.now()}_${filename}`;
  const { data, error } = await supabase.storage
    .from("photos")
    .upload(path, file, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Upload a journal photo
export async function uploadJournalPhoto(
  file: File | Blob,
  userId: string
): Promise<string> {
  const path = `journal/${userId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from("photos")
    .upload(path, file, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Get the current authenticated user's profile
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Auth helpers
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
