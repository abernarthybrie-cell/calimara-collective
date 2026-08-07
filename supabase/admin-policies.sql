-- Admin portal companion policies. Idempotent. Apply after schema.sql + earlier runtime.sql.
-- Staff (admin | editor) can manage magazine content. Only admins can change other users' roles.

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

-- Profile: self may update own row but not escalate role; admins may update anyone.
drop policy if exists "profile_update_self" on public.profile;
create policy "profile_update_self" on public.profile
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profile p where p.id = auth.uid())
  );

drop policy if exists "profile_update_by_admin" on public.profile;
create policy "profile_update_by_admin" on public.profile
  for update
  using (public.is_admin())
  with check (public.is_admin() and role in ('user', 'editor', 'admin'));

-- Content + team-ops writes: staff. Submissions inbox: staff read/update/delete.
-- Public insert on submission stays open. Member chat policies unchanged.
do $$
declare
  t text;
  staff_tables text[] := array[
    'cultural_recommendation','deadline','faq_item','fragment','illustration','issue',
    'meeting','open_call','person','product','reading_collection','reading_tag','role',
    'rubrica','site_settings','story','team_notice','timeline_event','submission'
  ];
begin
  foreach t in array staff_tables loop
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    if t = 'submission' then
      execute format('drop policy if exists %I on public.%I', t || '_select', t);
      execute format(
        'create policy %I on public.%I for select using (public.is_staff())',
        t || '_select', t
      );
      -- anonymous insert preserved
      execute format(
        'create policy %I on public.%I for insert with check (true)',
        t || '_insert', t
      );
    else
      execute format(
        'create policy %I on public.%I for insert with check (public.is_staff())',
        t || '_insert', t
      );
    end if;
    execute format(
      'create policy %I on public.%I for update using (public.is_staff()) with check (public.is_staff())',
      t || '_update', t
    );
    execute format(
      'create policy %I on public.%I for delete using (public.is_staff())',
      t || '_delete', t
    );
  end loop;
end $$;
