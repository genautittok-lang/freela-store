import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { tryGetDb } from "@/lib/db";

const COOKIE = "freela_admin";

export type AdminRole = "owner" | "admin" | "editor" | "analyst";

export type AdminUser = {
  id: number;
  email: string;
  role: AdminRole;
};

const memoryAttempts: { email: string; ip: string; at: number }[] = [];

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function configuredAdminEmail() {
  return (process.env.ADMIN_EMAIL || "admin@freela.store").trim().toLowerCase();
}

function configuredPassword() {
  return process.env.ADMIN_PASSWORD || "changeme-freela";
}

function productionPasswordBlocked() {
  return (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "changeme-freela")
  );
}

function sessionSecret() {
  return crypto.createHash("sha256").update(`freela-admin-session:${configuredPassword()}:${configuredAdminEmail()}`).digest();
}

function signSession(user: AdminUser) {
  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp }), "utf8").toString(
    "base64url",
  );
  const sig = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function readSignedSession(token: string): AdminUser | null {
  const dot = token.lastIndexOf(".");
  if (dot < 8) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      id?: number;
      email?: string;
      role?: AdminRole;
      exp?: number;
    };
    if (!data.email || !data.role || !data.exp || data.exp < Date.now()) return null;
    return { id: data.id || 1, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export function ensureOwner() {
  const db = tryGetDb();
  if (!db) return;
  const email = configuredAdminEmail();
  const existing = db.prepare("SELECT id FROM admin_users WHERE email = ?").get(email) as { id: number } | undefined;
  if (existing) return;
  const password_hash = bcrypt.hashSync(configuredPassword(), 12);
  db.prepare(
    "INSERT INTO admin_users (email, password_hash, role, created_at) VALUES (?, ?, 'owner', ?)",
  ).run(email, password_hash, new Date().toISOString());
}

export function tooManyLogins(email: string, ip: string) {
  const sinceMs = Date.now() - 15 * 60 * 1000;
  const memCount = memoryAttempts.filter((row) => row.at >= sinceMs && (row.email === email || row.ip === ip)).length;
  if (memCount >= 20) return true;
  const db = tryGetDb();
  if (!db) return false;
  const since = new Date(sinceMs).toISOString();
  const row = db
    .prepare("SELECT COUNT(*) as n FROM login_attempts WHERE created_at > ? AND (email = ? OR ip = ?)")
    .get(since, email, ip) as { n: number };
  return row.n >= 20;
}

export function recordLoginAttempt(email: string, ip: string) {
  memoryAttempts.push({ email, ip, at: Date.now() });
  if (memoryAttempts.length > 500) memoryAttempts.splice(0, memoryAttempts.length - 400);
  const db = tryGetDb();
  if (!db) return;
  db.prepare("INSERT INTO login_attempts (email, ip, created_at) VALUES (?, ?, ?)").run(email, ip, new Date().toISOString());
}

async function setSessionCookie(user: AdminUser) {
  const jar = await cookies();
  const value = signSession(user);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 12);
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  const db = tryGetDb();
  if (!db) return;
  try {
    db.prepare("INSERT OR REPLACE INTO admin_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
      hashToken(value),
      user.id,
      expires.toISOString(),
    );
  } catch {
    /* session cookie is enough */
  }
}

export async function login(email: string, password: string, ip: string) {
  if (productionPasswordBlocked()) {
    return { ok: false as const, error: "Production admin password is not configured." };
  }
  const normalized = email.trim().toLowerCase();
  if (tooManyLogins(normalized, ip)) {
    return { ok: false as const, error: "Too many attempts. Try again in 15 minutes." };
  }
  recordLoginAttempt(normalized, ip);

  const envOk = normalized === configuredAdminEmail() && password === configuredPassword();
  if (envOk) {
    try {
      ensureOwner();
    } catch {
      /* env login does not need sqlite */
    }
    const db = tryGetDb();
    const row = db
      ?.prepare("SELECT id, email, role FROM admin_users WHERE email = ?")
      .get(normalized) as { id: number; email: string; role: AdminRole } | undefined;
    const user: AdminUser = row ?? { id: 1, email: normalized, role: "owner" };
    await setSessionCookie(user);
    audit(user.id, "login", "session", String(user.id), null);
    return { ok: true as const, user };
  }

  try {
    ensureOwner();
  } catch {
    return { ok: false as const, error: "Invalid email or password." };
  }
  const db = tryGetDb();
  if (!db) {
    return { ok: false as const, error: "Invalid email or password." };
  }
  const user = db
    .prepare("SELECT id, email, password_hash, role FROM admin_users WHERE email = ?")
    .get(normalized) as { id: number; email: string; password_hash: string; role: AdminRole } | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { ok: false as const, error: "Invalid email or password." };
  }
  const admin = { id: user.id, email: user.email, role: user.role };
  await setSessionCookie(admin);
  audit(user.id, "login", "session", String(user.id), null);
  return { ok: true as const, user: admin };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    try {
      tryGetDb()?.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(hashToken(token));
    } catch {
      /* ignore */
    }
  }
  jar.set(COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) });
}

export async function currentAdmin(): Promise<AdminUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;
    const signed = readSignedSession(token);
    if (signed) return signed;
    const db = tryGetDb();
    if (!db) return null;
    const row = db
      .prepare(
        `SELECT u.id, u.email, u.role, s.expires_at
         FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
         WHERE s.token_hash = ?`,
      )
      .get(hashToken(token)) as { id: number; email: string; role: AdminRole; expires_at: string } | undefined;
    if (!row || new Date(row.expires_at) < new Date()) return null;
    return { id: row.id, email: row.email, role: row.role };
  } catch {
    return null;
  }
}

export function audit(
  userId: number | null,
  action: string,
  entity: string,
  entityId: string | null,
  details: string | null,
) {
  const safe =
    details && details.length > 240
      ? details.slice(0, 240)
      : details && /%PDF-|data:image|-----BEGIN /.test(details)
        ? "[redacted]"
        : details;
  try {
    tryGetDb()
      ?.prepare(
        "INSERT INTO audit_log (user_id, action, entity, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(userId, action, entity, entityId, safe, new Date().toISOString());
  } catch {
    /* analytics/audit are optional on serverless */
  }
}

export function requireRole(user: AdminUser, roles: AdminRole[]) {
  return roles.includes(user.role);
}
