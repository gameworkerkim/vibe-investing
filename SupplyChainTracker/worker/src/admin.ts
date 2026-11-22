import { Hono } from "hono";
import { requireAuth, requireAdmin, type AuthUser } from "./middleware";
import { logAudit } from "./audit";
import type { Env } from "./index";

export const adminRoutes = new Hono<{ Bindings: Env }>();

adminRoutes.use("*", requireAuth, requireAdmin);

adminRoutes.get("/users", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, email, role, must_change_password AS mustChangePassword, created_at AS createdAt
     FROM users
     ORDER BY created_at DESC`
  ).all();
  return c.json({ users: results });
});

adminRoutes.post("/users/:id/approve", async (c) => {
  const user = c.get("user") as AuthUser;
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "잘못된 사용자 ID입니다." }, 400);
  await c.env.DB.prepare(
    "UPDATE users SET role = 'member', approved_by = ?, updated_at = datetime('now') WHERE id = ? AND role = 'pending'"
  )
    .bind(user.id, id)
    .run();
  await logAudit(c.env.DB, user.id, "approve_user", `user_id=${id}`);
  return c.json({ ok: true });
});

adminRoutes.post("/users/:id/reject", async (c) => {
  const user = c.get("user") as AuthUser;
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "잘못된 사용자 ID입니다." }, 400);
  await c.env.DB.prepare(
    "UPDATE users SET role = 'rejected', approved_by = ?, updated_at = datetime('now') WHERE id = ? AND role = 'pending'"
  )
    .bind(user.id, id)
    .run();
  await logAudit(c.env.DB, user.id, "reject_user", `user_id=${id}`);
  return c.json({ ok: true });
});

adminRoutes.get("/audit", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, user_id AS userId, action, detail, created_at AS createdAt FROM audit_logs ORDER BY id DESC LIMIT 100"
  ).all();
  return c.json({ logs: results });
});
