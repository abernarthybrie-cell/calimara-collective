-- Hand-written companion to the generated schema.sql, for things that are not derivable from the
-- Base44 entity definitions. Idempotent: safe to re-run.

-- 1. Insert defaults.
-- The export carried its own ids and timestamps, so the generated tables have none. Rows created
-- by the app (submissions, chat messages) need them filled in server-side.
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE' and table_name <> 'profile'
  loop
    execute format('alter table public.%I alter column id set default gen_random_uuid()::text', t);
    execute format('alter table public.%I alter column created_date set default now()', t);
    execute format('alter table public.%I alter column updated_date set default now()', t);
  end loop;
end $$;

-- 2. Storage bucket for public submissions.
-- The upload endpoint is reachable by anonymous visitors, so the bucket itself enforces the limits
-- rather than trusting the browser: 10 MB and a fixed mime allow-list.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads', 'uploads', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "uploads_insert" on storage.objects;
create policy "uploads_insert" on storage.objects
  for insert with check (bucket_id = 'uploads');

drop policy if exists "uploads_read" on storage.objects;
create policy "uploads_read" on storage.objects
  for select using (bucket_id = 'uploads');

-- 3. Roles: allow editor for the future admin portal (writes stay admin-only via is_admin()).
alter table public.profile drop constraint if exists profile_role_allowed;
alter table public.profile
  add constraint profile_role_allowed check (role in ('user', 'editor', 'admin'));

-- 4. Bootstrap known admins.
-- Passwords cannot be exported from Base44, so the first Supabase account only exists after signup.
-- Promoting by email on insert removes that chicken-and-egg step.
-- Further admins/editors: Supabase dashboard or the future admin portal.
create or replace function public.promote_known_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email in (
    'abernarthybrie@gmail.com',
    'abrenarthybrie@gmail.com'
  ) then
    new.role := 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists promote_known_admin on public.profile;
create trigger promote_known_admin
  before insert on public.profile
  for each row execute function public.promote_known_admin();

update public.profile set role = 'admin'
where email in (
  'abernarthybrie@gmail.com',
  'abrenarthybrie@gmail.com'
);

-- 5. Realtime for the members' chat.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'member_message'
  ) then
    alter publication supabase_realtime add table public.member_message;
  end if;
end $$;
