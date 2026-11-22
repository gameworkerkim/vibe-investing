import type { D1Database } from "@cloudflare/workers-types";

export const SESSION_COOKIE = "sct_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function createSession(db: D1Database, userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, userId, expiresAt).run();
  return token;
}

export async function destroySession(db: D1Database, token: string): Promise<void> {
  await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
