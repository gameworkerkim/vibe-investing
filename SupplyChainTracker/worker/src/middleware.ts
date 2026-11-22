import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { SESSION_COOKIE } from "./session";
import type { Env } from "./index";

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  mustChangePassword: boolean;
};

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export async function getUserFromRequest(c: Context<{ Bindings: Env }>): Promise<AuthUser | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.must_change_password AS mustChangePassword
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`
  )
    .bind(token, new Date().toISOString())
    .first<{ id: number; email: string; role: string; mustChangePassword: number }>();
  if (!row) return null;
  return { id: row.id, email: row.email, role: row.role, mustChangePassword: row.mustChangePassword === 1 };
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const user = await getUserFromRequest(c);
  if (!user) return c.json({ error: "로그인이 필요합니다." }, 401);
  c.set("user", user);
  await next();
}

export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const user = c.get("user") as AuthUser | undefined;
  if (!user || user.role !== "admin") return c.json({ error: "관리자 권한이 필요합니다." }, 403);
  await next();
}
