import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const COOKIE = "freela_admin";

export type AdminRole = "owner" | "admin" | "editor" | "analyst";

export type AdminUser = {
  id: number;
  email: string;
  role: AdminRole;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function ensureOwner() {
  const db = getDb();
  const email = (process.env.ADMIN_EMAIL || "admin@freela.store").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "changeme-freela";
  const existing = db.prepare("SELECT id FROM admin_users WHERE email = ?").get(email) as
    | { id: number }
    | undefined;
  if (existing) return;
  const password_hash = bcrypt.hashSync(password, 12);
  db.prepare(
    "INSERT INTO admin_users (email, password_hash, role, created_at) VALUES (?, ?, 'owner', ?)",
  ).run(email, password_hash, new Date().toISOString());
}

export function tooManyLogins(email: string, ip: string) {
  const db = getDb();
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const row = db
    .prepare(
      "SELECT COUNT(*) as n FROM login_attempts WHERE created_at > ? AND (email = ? OR ip = ?)",
    )
    .get(since, email, ip) as { n: number };
  return row.n >= 20;
}

export function recordLoginAttempt(email: string, ip: string) {
  getDb()
    .prepare("INSERT INTO login_attempts (email, ip, created_at) VALUES (?, ?, ?)")
    .run(email, ip, new Date().toISOString());
}

export async function login(email: string, password: string, ip: string) {
  if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "changeme-freela")) {
    return { ok: false as const, error: "Production admin password is not configured." };
  }
  ensureOwner();
  const normalized = email.trim().toLowerCase();
  if (tooManyLogins(normalized, ip)) {
    return { ok: false as const, error: "Too many attempts. Try again in 15 minutes." };
  }
  recordLoginAttempt(normalized, ip);
  const user = getDb()
    .prepare("SELECT id, email, password_hash, role FROM admin_users WHERE email = ?")
    .get(normalized) as
    | { id: number; email: string; password_hash: string; role: AdminRole }
    | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { ok: false as const, error: "Invalid email or password." };
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  getDb()
    .prepare("INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(hashToken(token), user.id, expires);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
  audit(user.id, "login", "session", String(user.id), null);
  return { ok: true as const, user: { id: user.id, email: user.email, role: user.role } };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(hashToken(token));
  }
  jar.set(COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) });
}

export async function currentAdmin(): Promise<AdminUser | null> {
  ensureOwner();
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.role, s.expires_at
       FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(hashToken(token)) as
    | { id: number; email: string; role: AdminRole; expires_at: string }
    | undefined;
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return { id: row.id, email: row.email, role: row.role };
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
  getDb()
    .prepare(
      "INSERT INTO audit_log (user_id, action, entity, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(userId, action, entity, entityId, safe, new Date().toISOString());
}

export function requireRole(user: AdminUser, roles: AdminRole[]) {
  return roles.includes(user.role);
}
