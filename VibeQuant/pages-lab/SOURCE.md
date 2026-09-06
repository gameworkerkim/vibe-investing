# Lab source paths — what actually deploys to vibequant.cc/lab/

Production `https://vibequant.cc/lab/` is **not** built from `TokenForge/` or from `CASSANDRA AI/`.
Those folders are app sources. The Pages project that owns the apex domain only uploads **`VibeQuant/pages`**.

## 1. Cloudflare Pages (this URL)

| Item | Value |
|---|---|
| Live URL | https://vibequant.cc/lab/ |
| Pages project | `vibequant-web` (custom domain `vibequant.cc`) |
| **GitHub path that gets uploaded** | [`VibeQuant/pages/lab/`](https://github.com/gameworkerkim/vibe-investing/tree/main/VibeQuant/pages/lab) |
| Edit here first | [`VibeQuant/pages-lab/`](https://github.com/gameworkerkim/vibe-investing/tree/main/VibeQuant/pages-lab) then copy into `pages/lab/` |
| Deploy command | `cd VibeQuant/pages && npx wrangler pages deploy . --project-name=vibequant-web --commit-dirty=true` |
| Wrangler output dir | `VibeQuant/pages/wrangler.toml` → `pages_build_output_dir = "."` |

**Must-not (this is why production still showed 「곧 연결할께요」):**

- On `main`, `pages/functions/_middleware.js` intercepts `/lab/*` and returns coming-soon HTML.
- On `main`, `pages/_routes.json` **includes** `/lab/*`, so that Function runs instead of static `pages/lab/`.
- This branch: drop `/lab/*` from `_routes.json` include, and do **not** intercept `/lab` in middleware.

`lab.vibequant.cc` → 302 to `https://vibequant.cc/lab/` (apex Pages). The unused project name `vibequant-lab` is **not** what serves the live path.

## 2. DART Monitor app (Next.js, already live)

Lab’s default tab launches this app. It is **not** a Cloudflare static build.

| Item | Value |
|---|---|
| Live app | https://dart-monitor-pi.vercel.app |
| **Vercel Git source** | [`github.com/gameworkerkim/cassandra-ai`](https://github.com/gameworkerkim/cassandra-ai) |
| Vercel Root Directory | `./` (repo root). Package name: `dart-monitor` |
| npm / local folder name | `dart-monitor` (`package.json` `"name"`) |
| Monorepo copy (do **not** point Vercel here) | [`vibe-investing/CASSANDRA AI`](https://github.com/gameworkerkim/vibe-investing/tree/main/CASSANDRA%20AI) — folder name has a **space** |

Vercel dashboard → Project → Settings → Git:

- Repository: `gameworkerkim/cassandra-ai`
- Production branch: `main`
- Root Directory: empty / `.`

Do not set Root Directory to `CASSANDRA AI` on the monorepo unless you accept the space in the path.

## 3. TokenForge (Lab second tab)

| Item | Value |
|---|---|
| App source | [`TokenForge/`](https://github.com/gameworkerkim/vibe-investing/tree/main/TokenForge) |
| Worker API | `POST /api/v1/tokenforge/*` on `vibequant-api` |
| Lab UI | same `pages/lab/` files as above |
