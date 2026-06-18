import type { APIRoute } from "astro";
import { updateSettings, getDb } from "../../lib/db";

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDb();
    if (!db) {
      return new Response(JSON.stringify({ error: "Base de données non disponible" }), { status: 500 });
    }
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Données invalides" }), { status: 400 });
    }

    // Convert all values to strings just in case
    const settingsUpdate: Record<string, string> = {};
    for (const [key, val] of Object.entries(body)) {
      settingsUpdate[key] = String(val);
    }

    const success = await updateSettings(db, settingsUpdate);
    if (success) {
      return new Response(JSON.stringify({ success: true }));
    } else {
      return new Response(JSON.stringify({ error: "Erreur lors de la mise à jour des paramètres" }), { status: 500 });
    }
  } catch (e) {
    console.error("PUT settings API error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue" }), { status: 500 });
  }
};
