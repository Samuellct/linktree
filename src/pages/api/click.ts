import type { APIRoute } from "astro";
import { logEvent, getDb } from "../../lib/db";
import { parseUserAgent } from "../../lib/utils";

export const GET: APIRoute = async ({ request, locals, url }) => {
  try {
    const db = getDb();
    if (!db) {
      return Response.redirect(new URL("/", request.url), 302);
    }
    const linkId = url.searchParams.get("id");

    if (!linkId) {
      return Response.redirect(new URL("/", request.url), 302);
    }

    // Retrieve target link details
    const link = await db.prepare("SELECT * FROM links WHERE id = ?1 LIMIT 1").bind(linkId).first<{ url: string }>();
    if (!link || !link.url) {
      return Response.redirect(new URL("/", request.url), 302);
    }

    // Parse analytics details
    const userAgent = request.headers.get("user-agent");
    const { device, browser } = parseUserAgent(userAgent);
    
    // Cloudflare provides the user's estimated country in CF-IPCountry header
    const country = request.headers.get("cf-ipcountry") || "XX";

    // Async log event
    await logEvent(db, {
      event_type: "click",
      link_id: linkId,
      device,
      browser,
      country,
    });

    return Response.redirect(link.url, 302);
  } catch (e) {
    console.error("Click redirect API error:", e);
    return Response.redirect(new URL("/", request.url), 302);
  }
};
