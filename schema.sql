-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    preview_image TEXT,
    description TEXT,
    icon TEXT,
    accent_color TEXT,
    position INTEGER NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'visit' or 'click'
    link_id TEXT REFERENCES links(id) ON DELETE SET NULL,
    timestamp INTEGER NOT NULL,
    device TEXT NOT NULL,
    browser TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'XX'
);
