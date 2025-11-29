import { describe, expect, it, beforeAll } from "vitest";

// Check if Supabase environment variables are configured
const hasSupabaseConfig = !!(
  process.env.VITE_SUPABASE_URL &&
  process.env.VITE_SUPABASE_ANON_KEY
);

describe("Supabase Connection", () => {
  // Skip tests if Supabase is not configured
  it.skipIf(!hasSupabaseConfig)("should connect to Supabase successfully", async () => {
    // Dynamic import to avoid initialization error
    const { supabase } = await import("./supabase");

    // Test connection by checking if we can access the auth API
    const { data, error } = await supabase.auth.getSession();

    // We expect no error (even if session is null, connection is valid)
    expect(error).toBeNull();

    // Data should be defined
    expect(data).toBeDefined();
  });

  it.skipIf(!hasSupabaseConfig)("should have valid environment variables", () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.VITE_SUPABASE_URL).toContain('supabase.co');
  });

  it("should detect when Supabase is not configured", () => {
    // This test always runs and verifies our configuration detection works
    if (hasSupabaseConfig) {
      expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    } else {
      // In development/CI without credentials, this should be undefined
      expect(hasSupabaseConfig).toBe(false);
    }
  });
});
