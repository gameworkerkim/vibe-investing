import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, sessionCookie, clearSessionCookie, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./session";
import { logAudit } from "./audit";
import { getUserFromRequest } from "./middleware";
import type { Env } from "./index";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.post("/signup", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!EMAIL_RE.test(email)) return c.json({ error: "올바른 이메일을 입력하세요." }, 400);
  if (typeof password !== "string" || password.length < 8) {
    return c.json({ error: "비밀번호는 8자 이상이어야 합니다." }, 400);
  }
  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return c.json({ error: "이미 등록된 이메일입니다." }, 409);
  const hash = await hashPassword(password);
  await c.env.DB
    .prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'pending')")
    .bind(email, hash)
    .run();
  await logAudit(c.env.DB, null, "signup", email);
  return c.json({ ok: true, message: "가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다." }, 201);
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const row = await c.env.DB.prepare(
    "SELECT id, email, password_hash, role, must_change_password FROM users WHERE email = ?"
  )
    .bind(email)
    .first<{ id: number; email: string; password_hash: string; role: string; must_change_password: number }>();

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return c.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, 401);
  }
  if (row.role === "pending") return c.json({ error: "관리자 승인 대기 중입니다." }, 403);
  if (row.role === "rejected") return c.json({ error: "가입이 거부된 계정입니다." }, 403);

  const token = await createSession(c.env.DB, row.id);
  c.header("Set-Cookie", sessionCookie(token));
  await logAudit(c.env.DB, row.id, "login", row.email);
  return c.json({
    user: { id: row.id, email: row.email, role: row.role },
    mustChangePassword: row.must_change_password === 1,
  });
});

authRoutes.post("/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await destroySession(c.env.DB, token);
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ ok: true });
});

authRoutes.get("/me", async (c) => {
  const user = await getUserFromRequest(c);
  if (!user) return c.json({ error: "로그인이 필요합니다." }, 401);
  return c.json({ user });
});

authRoutes.post("/change-password", async (c) => {
  const user = await getUserFromRequest(c);
  if (!user) return c.json({ error: "로그인이 필요합니다." }, 401);
  const body = await c.req.json<{ currentPassword?: string; newPassword?: string }>();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  if (newPassword.length < 8) return c.json({ error: "새 비밀번호는 8자 이상이어야 합니다." }, 400);

  const row = await c.env.DB.prepare("SELECT password_hash FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ password_hash: string }>();
  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
    return c.json({ error: "현재 비밀번호가 올바르지 않습니다." }, 400);
  }

  const hash = await hashPassword(newPassword);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(hash, user.id)
    .run();
  await logAudit(c.env.DB, user.id, "change_password");
  return c.json({ ok: true, message: "비밀번호가 변경되었습니다." });
});

export { SESSION_TTL_SECONDS };
