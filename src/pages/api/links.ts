import type { APIRoute } from "astro";
import { getAllLinks, createLink, updateLink, deleteLink, reorderLinks } from "../../lib/db";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const links = await getAllLinks(db);
    return new Response(JSON.stringify(links), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("GET links API error:", e);
    return new Response(JSON.stringify({ error: "Impossible de récupérer les liens" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const body = await request.json();
    const { title, url, preview_image, description, icon, accent_color, enabled } = body;

    if (!title || !url) {
      return new Response(JSON.stringify({ error: "Titre et URL requis" }), { status: 400 });
    }

    const success = await createLink(db, {
      title,
      url,
      preview_image: preview_image || null,
      description: description || null,
      icon: icon || null,
      accent_color: accent_color || null,
      enabled: enabled ?? 1,
    });

    if (success) {
      return new Response(JSON.stringify({ success: true }));
    } else {
      return new Response(JSON.stringify({ error: "Erreur lors de la création du lien" }), { status: 500 });
    }
  } catch (e) {
    console.error("POST link API error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue" }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const body = await request.json();

    // Reorder flow
    if (body.reorder && Array.isArray(body.idOrder)) {
      const success = await reorderLinks(db, body.idOrder);
      if (success) {
        return new Response(JSON.stringify({ success: true }));
      } else {
        return new Response(JSON.stringify({ error: "Erreur lors de la réorganisation" }), { status: 500 });
      }
    }

    // Update single link flow
    const { id, title, url, preview_image, description, icon, accent_color, enabled } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID du lien manquant" }), { status: 400 });
    }

    const success = await updateLink(db, id, {
      title,
      url,
      preview_image,
      description,
      icon,
      accent_color,
      enabled,
    });

    if (success) {
      return new Response(JSON.stringify({ success: true }));
    } else {
      return new Response(JSON.stringify({ error: "Erreur lors de la mise à jour du lien" }), { status: 500 });
    }
  } catch (e) {
    console.error("PUT link API error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });
    }

    const success = await deleteLink(db, id);
    if (success) {
      return new Response(JSON.stringify({ success: true }));
    } else {
      return new Response(JSON.stringify({ error: "Erreur de suppression" }), { status: 500 });
    }
  } catch (e) {
    console.error("DELETE link API error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue" }), { status: 500 });
  }
};
