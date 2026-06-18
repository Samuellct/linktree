export interface Link {
  id: string;
  title: string;
  url: string;
  preview_image?: string | null;
  description?: string | null;
  icon?: string | null;
  accent_color?: string | null;
  position: number;
  enabled: number; // 0 or 1
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  uniqueVisitors: number;
  totalClicks: number;
  clicksPerLink: Array<{ id: string; title: string; url: string; clicks: number }>;
  visitsOverTime: Array<{ date: string; count: number }>;
  clicksOverTime: Array<{ date: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
}

// Settings keys:
// - site_name, bio, avatar, theme_color, custom_css, font_family, animations_enabled (0/1), umami_id, umami_url, seo_title, seo_description, og_image, favicon, social_github, social_twitter, social_linkedin, social_instagram, social_youtube
export type Settings = Record<string, string>;

// DB helper functions

// --- Settings ---
export async function getSettings(db: D1Database): Promise<Settings> {
  try {
    const { results } = await db.prepare("SELECT key, value FROM settings").all();
    const settingsObj: Settings = {};
    if (results) {
      for (const row of results as { key: string; value: string }[]) {
        settingsObj[row.key] = row.value;
      }
    }
    return settingsObj;
  } catch (e) {
    console.error("Error fetching settings:", e);
    return {};
  }
}

export async function setSetting(db: D1Database, key: string, value: string): Promise<boolean> {
  try {
    await db
      .prepare("INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2")
      .bind(key, value)
      .run();
    return true;
  } catch (e) {
    console.error(`Error setting key ${key}:`, e);
    return false;
  }
}

export async function updateSettings(db: D1Database, settings: Record<string, string>): Promise<boolean> {
  try {
    const statements = Object.entries(settings).map(([key, value]) =>
      db.prepare("INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2").bind(key, value)
    );
    await db.batch(statements);
    return true;
  } catch (e) {
    console.error("Error batch updating settings:", e);
    return false;
  }
}

// --- Users ---
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  try {
    const user = await db.prepare("SELECT * FROM users WHERE email = ?1 LIMIT 1").bind(email).first<User>();
    return user || null;
  } catch (e) {
    console.error(`Error fetching user ${email}:`, e);
    return null;
  }
}

export async function createUser(db: D1Database, email: string, passwordHash: string): Promise<boolean> {
  try {
    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO users (id, email, password_hash, role) VALUES (?1, ?2, ?3, 'admin')")
      .bind(id, email, passwordHash)
      .run();
    return true;
  } catch (e) {
    console.error("Error creating user:", e);
    return false;
  }
}

export async function hasAnyUsers(db: D1Database): Promise<boolean> {
  try {
    const res = await db.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();
    return (res?.count ?? 0) > 0;
  } catch (e) {
    console.error("Error counting users:", e);
    return false;
  }
}

// --- Links ---
export async function getAllLinks(db: D1Database): Promise<Link[]> {
  try {
    const { results } = await db.prepare("SELECT * FROM links ORDER BY position ASC").all<Link>();
    return results || [];
  } catch (e) {
    console.error("Error fetching all links:", e);
    return [];
  }
}

export async function getEnabledLinks(db: D1Database): Promise<Link[]> {
  try {
    const { results } = await db.prepare("SELECT * FROM links WHERE enabled = 1 ORDER BY position ASC").all<Link>();
    return results || [];
  } catch (e) {
    console.error("Error fetching enabled links:", e);
    return [];
  }
}

export async function createLink(db: D1Database, link: Omit<Link, "id" | "position">): Promise<boolean> {
  try {
    const id = crypto.randomUUID();
    // Get max position to append link at the end
    const maxPosRes = await db.prepare("SELECT MAX(position) as max_pos FROM links").first<{ max_pos: number }>();
    const position = (maxPosRes?.max_pos ?? -1) + 1;

    await db
      .prepare(
        "INSERT INTO links (id, title, url, preview_image, description, icon, accent_color, position, enabled) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"
      )
      .bind(
        id,
        link.title,
        link.url,
        link.preview_image || null,
        link.description || null,
        link.icon || null,
        link.accent_color || null,
        position,
        link.enabled ?? 1
      )
      .run();
    return true;
  } catch (e) {
    console.error("Error creating link:", e);
    return false;
  }
}

export async function updateLink(db: D1Database, id: string, link: Partial<Omit<Link, "id">>): Promise<boolean> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(link)) {
      updates.push(`${key} = ?${i}`);
      values.push(value === undefined ? null : value);
      i++;
    }

    if (updates.length === 0) return true;

    values.push(id);
    const query = `UPDATE links SET ${updates.join(", ")} WHERE id = ?${i}`;
    await db.prepare(query).bind(...values).run();
    return true;
  } catch (e) {
    console.error(`Error updating link ${id}:`, e);
    return false;
  }
}

export async function deleteLink(db: D1Database, id: string): Promise<boolean> {
  try {
    await db.prepare("DELETE FROM links WHERE id = ?1").bind(id).run();
    return true;
  } catch (e) {
    console.error(`Error deleting link ${id}:`, e);
    return false;
  }
}

export async function reorderLinks(db: D1Database, idOrder: string[]): Promise<boolean> {
  try {
    const statements = idOrder.map((id, index) =>
      db.prepare("UPDATE links SET position = ?1 WHERE id = ?2").bind(index, id)
    );
    await db.batch(statements);
    return true;
  } catch (e) {
    console.error("Error reordering links:", e);
    return false;
  }
}

// --- Analytics ---
export async function logEvent(
  db: D1Database,
  event: {
    event_type: "visit" | "click";
    link_id?: string | null;
    device: string;
    browser: string;
    country: string;
  }
): Promise<boolean> {
  try {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    await db
      .prepare(
        "INSERT INTO analytics_events (id, event_type, link_id, timestamp, device, browser, country) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
      )
      .bind(id, event.event_type, event.link_id || null, timestamp, event.device, event.browser, event.country)
      .run();
    return true;
  } catch (e) {
    console.error("Error logging analytics event:", e);
    return false;
  }
}

export async function getAnalyticsStats(db: D1Database, days: number = 30): Promise<AnalyticsStats> {
  try {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Total visits
    const totalVisitsRes = await db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'visit'")
      .first<{ count: number }>();
    const totalVisits = totalVisitsRes?.count ?? 0;

    // Unique visitors (estimated by unique device + browser + country combo per day for simplicity in SQLite without IPs)
    const uniqueRes = await db
      .prepare(
        "SELECT COUNT(DISTINCT(device || '-' || browser || '-' || country || '-' || (timestamp / (24 * 60 * 60 * 1000)))) as count FROM analytics_events WHERE event_type = 'visit'"
      )
      .first<{ count: number }>();
    const uniqueVisitors = uniqueRes?.count ?? 0;

    // Total clicks
    const totalClicksRes = await db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'click'")
      .first<{ count: number }>();
    const totalClicks = totalClicksRes?.count ?? 0;

    // Clicks per link
    const { results: clicksPerLinkRes } = await db
      .prepare(
        `SELECT l.id, l.title, l.url, COUNT(a.id) as clicks 
         FROM links l 
         LEFT JOIN analytics_events a ON l.id = a.link_id AND a.event_type = 'click'
         GROUP BY l.id
         ORDER BY clicks DESC`
      )
      .all<{ id: string; title: string; url: string; clicks: number }>();
    const clicksPerLink = clicksPerLinkRes || [];

    // Visits over time (grouped by day)
    const { results: visitsOverTimeRes } = await db
      .prepare(
        `SELECT strftime('%Y-%m-%d', datetime(timestamp / 1000, 'unixepoch', 'localtime')) as date, COUNT(*) as count 
         FROM analytics_events 
         WHERE event_type = 'visit' AND timestamp >= ?1
         GROUP BY date
         ORDER BY date ASC`
      )
      .bind(cutoff)
      .all<{ date: string; count: number }>();
    const visitsOverTime = visitsOverTimeRes || [];

    // Clicks over time (grouped by day)
    const { results: clicksOverTimeRes } = await db
      .prepare(
        `SELECT strftime('%Y-%m-%d', datetime(timestamp / 1000, 'unixepoch', 'localtime')) as date, COUNT(*) as count 
         FROM analytics_events 
         WHERE event_type = 'click' AND timestamp >= ?1
         GROUP BY date
         ORDER BY date ASC`
      )
      .bind(cutoff)
      .all<{ date: string; count: number }>();
    const clicksOverTime = clicksOverTimeRes || [];

    // Device breakdown
    const { results: devicesRes } = await db
      .prepare("SELECT device as name, COUNT(*) as count FROM analytics_events WHERE event_type = 'visit' GROUP BY device ORDER BY count DESC")
      .all<{ name: string; count: number }>();
    const devices = devicesRes || [];

    // Browser breakdown
    const { results: browsersRes } = await db
      .prepare("SELECT browser as name, COUNT(*) as count FROM analytics_events WHERE event_type = 'visit' GROUP BY browser ORDER BY count DESC")
      .all<{ name: string; count: number }>();
    const browsers = browsersRes || [];

    // Country breakdown
    const { results: countriesRes } = await db
      .prepare("SELECT country as name, COUNT(*) as count FROM analytics_events WHERE event_type = 'visit' GROUP BY country ORDER BY count DESC LIMIT 10")
      .all<{ name: string; count: number }>();
    const countries = countriesRes || [];

    return {
      totalVisits,
      uniqueVisitors,
      totalClicks,
      clicksPerLink,
      visitsOverTime,
      clicksOverTime,
      devices,
      browsers,
      countries,
    };
  } catch (e) {
    console.error("Error compiling analytics stats:", e);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      totalClicks: 0,
      clicksPerLink: [],
      visitsOverTime: [],
      clicksOverTime: [],
      devices: [],
      browsers: [],
      countries: [],
    };
  }
}
