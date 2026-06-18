import type { APIRoute } from "astro";
import { getUserByEmail, createUser, hasAnyUsers, getDb } from "../../lib/db";
import { hashPassword, verifyPassword, createSessionToken } from "../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const db = getDb();
    if (!db) {
      return new Response(JSON.stringify({ error: "Base de données non disponible" }), { status: 500 });
    }
    const body = await request.json();
    const { email, password, isSetup } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), { status: 400 });
    }

    let secret = "dev-linktree-secret-key-987654321";
    try {
      const jwtSecret = locals.runtime?.env?.JWT_SECRET;
      if (jwtSecret) {
        secret = jwtSecret;
      }
    } catch (e) {
      // Ignore env getter errors in dev
    }

    // Handle First-Time Setup Registration
    if (isSetup) {
      const usersExist = await hasAnyUsers(db);
      if (usersExist) {
        return new Response(JSON.stringify({ error: "L'administrateur a déjà été créé" }), { status: 403 });
      }

      const pwHash = await hashPassword(password);
      await createUser(db, email, pwHash);

      // Log in immediately after setup
      const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      const token = await createSessionToken({ email, role: "admin", exp }, secret);

      cookies.set("admin_session", token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return new Response(JSON.stringify({ success: true, message: "Configuration initiale réussie" }));
    }

    // Normal Login Flow
    const user = await getUserByEmail(db, email);
    if (!user) {
      return new Response(JSON.stringify({ error: "Identifiants incorrects" }), { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Identifiants incorrects" }), { status: 401 });
    }

    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const token = await createSessionToken({ email: user.email, role: user.role, exp }, secret);

    cookies.set("admin_session", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("Login API Error:", e);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete("admin_session", { path: "/" });
  return new Response(JSON.stringify({ success: true }));
};
