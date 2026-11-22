import type { D1Database } from "@cloudflare/workers-types";

export async function logAudit(
  db: D1Database,
  userId: number | null,
  action: string,
  detail?: string
): Promise<void> {
  await db
    .prepare("INSERT INTO audit_logs (user_id, action, detail) VALUES (?, ?, ?)")
    .bind(userId, action, detail ?? null)
    .run();
}
