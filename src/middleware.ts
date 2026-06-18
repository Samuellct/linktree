import { defineMiddleware } from "astro:middleware";
import { verifySessionToken } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Fetch secret from bindings or use fallback for dev
  let secret = "dev-linktree-secret-key-987654321";
  try {
    const jwtSecret = context.locals.runtime?.env?.JWT_SECRET;
    if (jwtSecret) {
      secret = jwtSecret;
    }
  } catch (e) {
    // Ignore env getter errors in non-request dev environments
  }

  const isProtectedPath = 
    (path.startsWith("/admin") && path !== "/admin/login") ||
    path.startsWith("/api/links") ||
    path.startsWith("/api/settings");

  // Match all protected routes
  if (isProtectedPath) {
    const sessionCookie = context.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return context.redirect("/admin/login");
    }

    const payload = await verifySessionToken(sessionCookie, secret);
    if (!payload) {
      // Delete the invalid session cookie
      context.cookies.delete("admin_session", { path: "/" });
      return context.redirect("/admin/login");
    }

    // Attach user information to locals
    context.locals.user = payload;
  }

  return next();
});
