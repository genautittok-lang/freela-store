import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type Database from "better-sqlite3";

type SqliteCtor = typeof import("better-sqlite3");

let singleton: Database.Database | null | undefined;
let loadFailed = false;

export function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
}

export function resolveDatabasePath() {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  if (isServerlessRuntime()) return "/tmp/freela.db";
  return path.join(process.cwd(), "data", "freela.db");
}

function loadConstructor(): SqliteCtor | null {
  try {
    const require = createRequire(import.meta.url);
    return require("better-sqlite3") as SqliteCtor;
  } catch {
    return null;
  }
}

function openAt(filePath: string, Sqlite: SqliteCtor): Database.Database {
  if (filePath !== ":memory:") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const db = new Sqlite(filePath);
  db.pragma(isServerlessRuntime() || filePath.startsWith("/tmp") || filePath === ":memory:" ? "journal_mode = DELETE" : "journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tool_id TEXT,
      locale TEXT,
      session_id TEXT NOT NULL,
      processing_mode TEXT,
      result TEXT,
      path TEXT,
      source TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS events_name_time ON events(name, created_at);
    CREATE INDEX IF NOT EXISTS events_tool ON events(tool_id, created_at);
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES admin_users(id)
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      ip TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tool_overrides (
      tool_id TEXT PRIMARY KEY,
      status TEXT,
      noindex INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);
  try {
    db.exec("ALTER TABLE events ADD COLUMN source TEXT");
  } catch {
    /* already present */
  }
  return db;
}

/** Never throws. Null when native SQLite is unavailable or the filesystem is not writable. */
export function tryGetDb(): Database.Database | null {
  if (singleton !== undefined) return singleton;
  if (loadFailed) return null;
  const Sqlite = loadConstructor();
  if (!Sqlite) {
    loadFailed = true;
    singleton = null;
    return null;
  }
  const candidates = [resolveDatabasePath(), "/tmp/freela.db", ":memory:"];
  const tried = new Set<string>();
  for (const candidate of candidates) {
    if (tried.has(candidate)) continue;
    tried.add(candidate);
    try {
      singleton = openAt(candidate, Sqlite);
      return singleton;
    } catch {
      /* try next */
    }
  }
  loadFailed = true;
  singleton = null;
  return null;
}

/** @deprecated Prefer tryGetDb — this still never throws; returns null-safe via throw only if misused. */
export function getDb() {
  const db = tryGetDb();
  if (!db) {
    throw new Error("SQLite is not available in this runtime.");
  }
  return db;
}

export function systemHealth() {
  const db = tryGetDb();
  return {
    service: "freela.store",
    ok: true,
    sqlite: Boolean(db),
    serverless: isServerlessRuntime(),
    storage: db ? "sqlite" : "none",
    databaseHint: isServerlessRuntime() ? "/tmp/freela.db (ephemeral on Vercel)" : "data/freela.db",
    time: new Date().toISOString(),
  };
}

export function resetDbForTests() {
  singleton = undefined;
  loadFailed = false;
}
