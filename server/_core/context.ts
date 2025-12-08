import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import { supabase, getSupabaseUser } from "../supabase";
import * as db from "../db";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const req = opts.req as Request;
  const res = opts.res as Response;

  try {
    // Get access token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.substring(7);
      // DEBUG LOG
      console.log(`[Auth] Verifying token: ${accessToken.substring(0, 10)}...`);
      const supabaseUser = await getSupabaseUser(accessToken);

      // STRICT AUTH: If a token is provided, it MUST be valid.
      // If verification fails, we throw to reject the request immediately (401).
      if (!supabaseUser) {
        console.error("[Auth] Token validation failed. supabaseUser is null.");
        throw new Error("UNAUTHORIZED_INVALID_TOKEN");
      }
      console.log(`[Auth] User verified: ${supabaseUser.id}`);

      if (supabaseUser) {
        // Get or create user in our database
        const dbUser = await db.getUserByOpenId(supabaseUser.id);

        if (dbUser) {
          user = dbUser;
        } else {
          // Create user in our database
          await db.upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || null,
            email: supabaseUser.email ?? null,
            loginMethod: supabaseUser.app_metadata?.provider ?? "email",
            lastSignedIn: new Date(),
          });
          user = await db.getUserByOpenId(supabaseUser.id) ?? null;
        }
      }
    }
  } catch (error) {
    // If the error was our explicit UNAUTHORIZED check, we re-throw it or let it bubble up
    // However, for createContext, throwing might cause a 500 in some adapters depending on config.
    // Ideally, we want 401. 
    // If we return user=null, internal logic might still run.
    // LOG AND RE-THROW if it's an auth failure.

    const errMsg = error instanceof Error ? error.message : String(error);

    if (errMsg === "UNAUTHORIZED_INVALID_TOKEN") {
      console.error("[Auth] Request rejected: Invalid Token");

      // We set status 401 explicitly if possible, but we are in a helper.
      // TRPC Express Adapter handles errors.
      // If we throw here, the request fails. This is what we want for invalid tokens.
      throw new Error("Unauthorized: Invalid Token");
    }

    // For other errors (database connection, etc), we might log and proceed as anonymous or fail.
    console.error("[Auth] Error authenticating request:", error);
    user = null;
  }

  return {
    req,
    res,
    user,
  };
}
