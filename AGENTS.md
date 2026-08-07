# AGENTS.md

## Project Context

The website for Călimara magazine: <https://calimara.online>. It began as a Base44 app and was
migrated off it completely — React frontend on Cloudflare Pages, Supabase Postgres + Auth, images on
Cloudflare R2. Treat it as user-owned application code, keep changes focused on the request, and
preserve existing conventions.

Start with `README.md` for setup, architecture, and the deploy workflow.

## Key Files

- `src/api/client.js`: the only module that talks to the backend. It exposes `db.entities.*`,
  `db.auth.*`, `db.users.*`, `db.integrations.Core.UploadFile`. These call shapes were inherited from
  the Base44 SDK on purpose, so the ~35 pages consuming them did not need rewriting. Change them and
  you change every page.
- `src/api/entityArgs.js`: pure name/argument mapping. Entity names become table names here, and the
  rule must stay in step with `snakeCase()` in `scripts/generate-schema.mjs`.
- `src/lib/AuthContext.jsx`: session state, backed by Supabase `onAuthStateChange`.
- `supabase/schema.sql`: generated. Do not hand-edit; change `base44/entities/*.jsonc` and regenerate.
- `supabase/runtime.sql`: hand-written, for what the entity definitions cannot express.
- `.secrets/credentials.env` and `.env.local`: gitignored. Never commit or print secrets.

## Working Notes

- `npm run dev` runs the frontend against the live Supabase backend. There is no local backend.
- Run `npm run lint` and `npm run build` before finishing. The build is the check that matters:
  ESLint has no import-resolution rule, so a deleted-module import lints clean and fails the build.
- Every table has row-level security. Public content is world-readable, writes are admin-only, and
  `public.is_admin()` reads the `profile` table. Anonymous submissions and file uploads are the two
  deliberate exceptions, both bounded (mime allow-list, 10 MB cap).
- Never move privileged operations into the browser. The anon key is public by design; the
  service-role key must never appear in frontend code. Admin invites use a magic link for this
  reason, and roles are granted in the Supabase dashboard.
- Images are served from `https://media.calimara.online` (R2) at full size — R2 has no on-the-fly
  resizing, unlike the previous host. See the note in `src/components/ui/image.jsx`.
- The migration scripts under `scripts/` are one-time tools. Each has a `--selftest`.
