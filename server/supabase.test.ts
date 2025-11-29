import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

describe("Supabase Connection", () => {
  it("should connect to Supabase successfully", async () => {
    // Test connection by checking if we can access the auth API
    const { data, error } = await supabase.auth.getSession();
    
    // We expect no error (even if session is null, connection is valid)
    expect(error).toBeNull();
    
    // Data should be defined
    expect(data).toBeDefined();
  });

  it("should have valid environment variables", () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.VITE_SUPABASE_URL).toContain('supabase.co');
  });
});
