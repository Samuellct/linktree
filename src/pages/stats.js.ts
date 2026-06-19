import type { APIRoute } from "astro";
import { getSettings, getDb } from "../lib/db";

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    let umamiUrl = "https://cloud.umami.is/script.js";
    if (db) {
      const settings = await getSettings(db);
      if (settings.umami_url) {
        umamiUrl = settings.umami_url;
      }
    }

    const response = await fetch(umamiUrl);
    if (!response.ok) {
      return new Response("Failed to load tracking script", { status: 502 });
    }
    const js = await response.text();
    return new Response(js, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("Stats proxy error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
};
