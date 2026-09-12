<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!-- BASE44:BEGIN -->
## Base44 dev environment

- **Stack**: TanStack Start (SSR) + Vite + React 19, Bun package manager, remote Supabase backend.
- **Run**: `docker compose -f docker-compose.base44.yml up -d` → app on port 3000.
- **Vite config** comes from `@lovable.dev/vite-tanstack-config` (not standard vite defineConfig). It bundles TanStack devtools, SSR, tailwind, nitro, and sandbox detection. Do not add plugins manually.
- **Env vars**: `.env` (git-tracked) holds public Supabase credentials (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_*`). `SUPABASE_SERVICE_ROLE_KEY` is a secret delivered via `/run/base44/app.env` — needed only for admin/server routes; a dev placeholder is generated so the app boots.
- **App structure**: `/` redirects to `/beta/index.html` (static HTML in `public/beta/`). `/app` → `/main/index.html`. SSR routes: `/admin`, `/app`, `/beta`, plus API endpoints under `/api/public/`.
- **Optional secrets**: `TWILIO_*` (SMS notifications), `CEO_EMAILS`/`FOUNDER_EMAILS` (tester allowlists) — all have empty-string fallbacks.
- **Verify**: `curl -s http://localhost:3000/` should return HTML (redirect page to `/beta/index.html`).
<!-- BASE44:END -->
