import type { Application, Request, Response } from "express";

/**
 * OAuth routes placeholder
 * Register OAuth callback routes under /api/oauth/*
 */
export function registerOAuthRoutes(app: Application): void {
  // OAuth routes can be added here if needed
  // Currently using Supabase Auth which handles OAuth externally

  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    // Redirect to frontend after OAuth callback
    res.redirect("/");
  });
}
