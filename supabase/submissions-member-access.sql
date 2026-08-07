-- Submissions inbox is shared with all signed-in members (Editorial Room).
-- Magazine content writes stay admin-only (admin portal is admin-only).
-- Idempotent.

drop policy if exists "submission_select" on public.submission;
create policy "submission_select" on public.submission
  for select using (auth.role() = 'authenticated');

drop policy if exists "submission_update" on public.submission;
create policy "submission_update" on public.submission
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "submission_delete" on public.submission;
create policy "submission_delete" on public.submission
  for delete using (public.is_admin());

-- Content + team-ops: admin only (matches /admin gate).
do $$
declare
  t text;
  admin_tables text[] := array[
    'cultural_recommendation','deadline','faq_item','fragment','illustration','issue',
    'meeting','open_call','person','product','reading_collection','reading_tag','role',
    'rubrica','site_settings','story','team_notice','timeline_event'
  ];
begin
  foreach t in array admin_tables loop
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for insert with check (public.is_admin())',
      t || '_insert', t
    );
    execute format(
      'create policy %I on public.%I for update using (public.is_admin()) with check (public.is_admin())',
      t || '_update', t
    );
    execute format(
      'create policy %I on public.%I for delete using (public.is_admin())',
      t || '_delete', t
    );
  end loop;
end $$;
