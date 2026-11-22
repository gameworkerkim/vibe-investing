import { Hono } from "hono";
import { authRoutes } from "./auth";
import { adminRoutes } from "./admin";
import { getUserFromRequest } from "./middleware";
import { indexPage, loginPage, signupPage, dashboardPage } from "./html";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.html(indexPage()));
app.get("/login", (c) => c.html(loginPage()));
app.get("/signup", (c) => c.html(signupPage()));
app.get("/dashboard", async (c) => {
  const user = await getUserFromRequest(c);
  if (!user) return c.redirect("/login");
  return c.html(dashboardPage(user));
});

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;
