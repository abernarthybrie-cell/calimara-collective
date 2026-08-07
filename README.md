# Călimara

The website for Călimara, a magazine made by young people in Bucharest — <https://calimara.online>.

Originally built on Base44; now fully self-hosted. Nothing in this repo talks to Base44 anymore.

## Architecture

| Concern | Where it lives |
| --- | --- |
| Frontend | React 18 + Vite 6, static build on Cloudflare Pages (project `calimara`) |
| Database | Supabase Postgres, with row-level security |
| Auth | Supabase Auth (email/password, Google, magic-link invites) |
| Images & uploads | Cloudflare R2, public at `https://media.calimara.online` |
| Form uploads | Supabase Storage, bucket `uploads` |
| DNS & CDN | Cloudflare (domain registered at Namecheap) |

`src/api/client.js` is the single point of contact with the backend. It exposes `db.entities.*`,
`db.auth.*`, `db.users.*` and `db.integrations.Core.UploadFile`, which is why the ~35 pages that
consume it read the way they do — the shapes were inherited from the Base44 SDK and kept so the
migration did not have to touch every page.

## Run locally

```bash
npm install
npm run dev
```

This runs the frontend against the live Supabase backend. There is no separate local backend.

`.env.local` holds the two values the frontend needs (both are safe in a browser bundle; the
database is protected by row-level security, not by hiding the key):

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

## Checks

```bash
npm run lint
npm run build
node src/api/entityArgs.check.mjs
```

## Deploy

From any machine with this repo and Node:

```bash
npm install
npm run deploy              # Cloudflare Pages + Edge Functions
npm run deploy:web          # Pages only
npm run deploy:functions    # Edge Functions only
```

`scripts/deploy.mjs` loads `.secrets/credentials.env` (tracked in this private repo by owner
choice). Cloudflare deploy needs `CLOUDFLARE_API_TOKEN` + `R2_ACCOUNT_ID`. Edge Functions also need
`SUPABASE_ACCESS_TOKEN` (personal token from
[Account → Access Tokens](https://supabase.com/dashboard/account/tokens) — not the service-role JWT).

## Database

`supabase/schema.sql` is generated from the entity definitions in `base44/entities/` (kept purely
as the schema's source of truth) by `scripts/generate-schema.mjs`. `supabase/runtime.sql` is
hand-written and holds what those definitions cannot express: insert defaults, the storage bucket
and its limits, and the realtime publication for the members' chat. Both are idempotent.

To change the schema, edit the entity definition, regenerate, and re-apply:

```bash
node scripts/generate-schema.mjs
node scripts/import-supabase.mjs --schema-only
```

## Migration scripts

One-time tools, kept for reference and reproducibility. They read credentials from
`.secrets/credentials.env` (tracked; keep the repo private).

| Script | Purpose |
| --- | --- |
| `scripts/export-base44.mjs` | Pulled all 173 records out of the Base44 API |
| `scripts/media-manifest.mjs` | Inventoried every image URL in the data and the source |
| `scripts/migrate-media.mjs` | Downloaded the 235 images and uploaded them to R2 |
| `scripts/generate-schema.mjs` | Turned entity definitions into Postgres DDL + RLS policies |
| `scripts/import-supabase.mjs` | Applied the schema and loaded the data, rewriting media URLs |

Each has a `--selftest` flag covering its non-obvious logic.

## Admin portal

Staff (`admin` or `editor`) open `/admin` after signing in. It covers:

- Submissions inbox (status pipeline, notes, assignment)
- CRUD for issues, stories, illustrations, fragments, people, roles, rubrici, FAQ, open calls, timeline, shelf, shop, reading room, deadlines, meetings, notices
- Site settings singleton
- Users & roles (admins only)

RLS: `supabase/admin-policies.sql` adds `is_staff()` and lets staff write content; only admins update other profiles’ roles.

```bash
# apply once against the live DB (same credentials as import-supabase)
# then: npm run build && wrangler pages deploy …
```

## Story transcription (admin)

`supabase/functions/transcribe-story-pages` is the port of the old Base44 AI function. Admins see a
**TRANSCRIBE PAGES** button on each story detail page. It needs an OpenAI key (vision model, default
`gpt-4o`):

```bash
npx supabase login
npx supabase link --project-ref hkvrkekzdabjkbwrdesw
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase functions deploy transcribe-story-pages
```

Optional: `npx supabase secrets set OPENAI_MODEL=gpt-4o-mini` for a cheaper model.
