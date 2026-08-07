import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Living ops notes for whoever runs Călimara.
 * Keep this page honest and concrete — future admin-portal work should grow from here,
 * not replace it with a second source of truth.
 */
const SECTIONS = [
  {
    title: 'Where the site lives',
    body: [
      'Frontend: React + Vite, deployed as a static site on Cloudflare Pages (project name: calimara).',
      'Public URL: https://calimara.online (also https://www.calimara.online).',
      'Preview URL pattern: https://<deployment-id>.calimara.pages.dev.',
      'Deploy from the repo root: npm run build && npx wrangler pages deploy dist --project-name=calimara --branch=main',
      'There is no separate Node/Express API. The browser talks to Supabase directly (with row-level security).',
    ],
  },
  {
    title: 'Domain',
    body: [
      'Registrar: Namecheap, purchased 5 August 2026 on the cristi.grosu@gmail.com account.',
      'Term: 2 years from purchase (renew around August 2028).',
      'DNS is managed in Cloudflare (nameservers pointed away from Namecheap parking).',
      'SSL on Cloudflare is Full. Custom hostnames: apex, www, and media.calimara.online.',
    ],
  },
  {
    title: 'Where the data lives',
    body: [
      'Database: Supabase Postgres (project ref hkvrkekzdabjkbwrdesw, region eu-west-1).',
      'Dashboard: https://supabase.com/dashboard/project/hkvrkekzdabjkbwrdesw',
      'Tables mirror the old Base44 entities (issue, story, person, …) plus public.profile for auth roles.',
      'Schema: supabase/schema.sql is generated from base44/entities/*.jsonc — do not hand-edit it.',
      'Runtime extras (defaults, storage bucket, realtime, admin bootstrap): supabase/runtime.sql.',
      'Every table has row-level security. Public content is world-readable; writes are admin-only, with two deliberate exceptions: anonymous Submission inserts, and uploads into the uploads storage bucket (10 MB, mime allow-list).',
    ],
  },
  {
    title: 'Where media lives',
    body: [
      'Published images (covers, page scans, portraits): Cloudflare R2 bucket calimara-media.',
      'Public CDN: https://media.calimara.online (custom domain on that R2 bucket).',
      'R2 has no on-the-fly resizing — images are served at full size. See the note in src/components/ui/image.jsx.',
      'Public form attachments (submit page): Supabase Storage bucket uploads, public-read, size/mime limited.',
    ],
  },
  {
    title: 'Auth and roles',
    body: [
      'Auth provider: Supabase Auth (email/password). Admins create accounts with a password from /admin/users (Edge Function admin-create-user).',
      'Roles live in public.profile.role: user | editor | admin. New signups default to user.',
      'is_admin() in Postgres is what RLS checks for privileged writes — currently only role = admin.',
      'editor is reserved for the future admin portal (content editing without full admin). Policies are not wired for editor yet.',
      'Never put the service-role key in the frontend. The anon key is public by design; RLS is the gate.',
      'Invite members from Directory (magic link). Promote admins/editors in the Supabase dashboard (Authentication → Users → edit profile role) until the admin portal can do it.',
    ],
  },
    {
    title: 'Members area vs admin portal',
    body: [
      'Editorial Room (/members): for every signed-in member — deadlines, submissions inbox, meetings, notices, directory, chat, issue workspaces.',
      'Ops README (/members/readme): admin only.',
      'Admin portal (/admin): admin only — magazine content CRUD, site settings, users & roles. Editors and members cannot open it.',
      'Frontend API surface is src/api/client.js (db.entities.*, db.auth.*, db.users.*, db.integrations.Core.UploadFile, db.functions.invoke).',
    ],
  },
  {
    title: 'Story transcription',
    body: [
      'Edge Function: supabase/functions/transcribe-story-pages (admin-only).',
      'Admins see TRANSCRIBE PAGES on a story detail page; it writes story.full_text from magazine page scans via OpenAI vision.',
      'Requires secret OPENAI_API_KEY in Supabase (optional OPENAI_MODEL, default gpt-4o).',
      'Deploy: npx supabase functions deploy transcribe-story-pages',
    ],
  },
  {
    title: 'Secrets and local setup',
    body: [
      'Frontend env (.env.local, gitignored): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.',
      'Ops secrets (.secrets/credentials.env, gitignored): Postgres pooler fields, Cloudflare token, R2 account id. Never commit.',
      'Local: npm install && npm run dev — frontend against the live Supabase backend. There is no local database.',
    ],
  },
  {
    title: 'Useful links',
    body: [
      'Site: https://calimara.online',
      'Cloudflare dashboard (Pages + R2 + DNS): https://dash.cloudflare.com',
      'Supabase dashboard: https://supabase.com/dashboard/project/hkvrkekzdabjkbwrdesw',
      'Namecheap account (domain renewals): the cristi.grosu@gmail.com login',
      'Repo docs: README.md and AGENTS.md',
    ],
  },
];

export default function Readme() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <p className="label-mono text-dusty-yellow flex items-center gap-2">
          <BookOpen size={14} /> — README —
        </p>
        <h1 className="font-heading text-5xl mt-2">How Călimara is run</h1>
        <p className="font-body text-archive-fg/70 mt-2">
          Infrastructure and ops notes for admins. Update this page when hosting, roles, or storage change —
          it is the map for whoever inherits the keys.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="border border-archive-line bg-archive-bg2 p-5 space-y-3">
          <h2 className="label-mono text-dusty-yellow">{section.title.toUpperCase()}</h2>
          <ul className="space-y-2">
            {section.body.map((line) => (
              <li key={line} className="font-body text-archive-fg/85 text-[0.95rem] leading-relaxed pl-3 border-l border-archive-line">
                {line}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
