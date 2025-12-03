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
      const supabaseUser = await getSupabaseUser(accessToken);

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
    // Authentication is optional for public procedures.
    console.error("[Auth] Error authenticating request:", error);
    user = null;
  }

  return {
    req,
    res,
    user,
  };
}
