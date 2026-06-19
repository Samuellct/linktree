import type { APIRoute } from "astro";
import { getSettings, getDb } from "../../lib/db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const db = getDb();
    let umamiUrl = "https://cloud.umami.is/script.js";
    if (db) {
      const settings = await getSettings(db);
      if (settings.umami_url) {
        umamiUrl = settings.umami_url;
      }
    }

    let baseDomain = umamiUrl.trim();
    if (baseDomain.endsWith("/")) {
      baseDomain = baseDomain.slice(0, -1);
    }
    if (baseDomain.endsWith("/script.js")) {
      baseDomain = baseDomain.slice(0, -10);
    } else if (baseDomain.endsWith("/umami.js")) {
      baseDomain = baseDomain.slice(0, -9);
    }
    const targetUrl = `${baseDomain}/api/send`;

    const body = await request.json();

    const headers = new Headers();
    headers.set("content-type", "application/json");

    // Pass client IP and User-Agent for accurate geolocation and device detection
    const userAgent = request.headers.get("user-agent");
    if (userAgent) {
      headers.set("user-agent", userAgent);
    }
    
    const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for");
    if (clientIp) {
      headers.set("x-forwarded-for", clientIp);
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    return new Response(responseText, {
      status: response.status,
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (e) {
    console.error("Umami proxy POST error:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
};
