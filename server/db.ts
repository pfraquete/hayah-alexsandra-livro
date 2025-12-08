import { supabaseAdmin } from "./supabase";

// Define types locally to avoid Drizzle dependency
export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastSignedIn: Date | null;
}

export interface InsertUser {
  openId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin";
  active?: boolean;
  lastSignedIn?: Date | null;
}

// Check Supabase connection
export async function checkConnection(): Promise<boolean> {
  if (!supabaseAdmin) {
    return false;
  }

  try {
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  if (!supabaseAdmin) {
    console.warn("[Database] Cannot upsert user: supabaseAdmin not available");
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .upsert({
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        updatedAt: new Date().toISOString(),
        lastSignedIn: user.lastSignedIn ? new Date(user.lastSignedIn).toISOString() : new Date().toISOString(),
        role: user.role || 'user',
        active: true
      }, {
        onConflict: 'openId'
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  if (!supabaseAdmin) {
    console.warn("[Database] Cannot get user: supabaseAdmin not available");
    return undefined;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('openId', openId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is not found
      console.error("[Database] Error fetching user:", error);
    }
    return undefined;
  }

  return data as User;
}
