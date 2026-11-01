create table public.kids_teacher_access (
user_id uuid primary key references auth.users(id) on delete cascade,
status text not null default 'pending' check(status in ('pending','approved','denied')),
requested_at timestamptz not null default now()
);
alter table public.kids_teacher_access enable row level security;
revoke all on public.kids_teacher_access from anon;
grant select,insert,update on public.kids_teacher_access to authenticated;
create policy access_read on public.kids_teacher_access for select to authenticated using (user_id=(select auth.uid()) or coalesce((select auth.jwt())->'app_metadata'->>'musiverso_kids_admin','false')='true');
create policy access_request on public.kids_teacher_access for insert to authenticated with check ((user_id=(select auth.uid()) and status='pending') or coalesce((select auth.jwt())->'app_metadata'->>'musiverso_kids_admin','false')='true');
create policy access_admin_update on public.kids_teacher_access for update to authenticated using (coalesce((select auth.jwt())->'app_metadata'->>'musiverso_kids_admin','false')='true') with check (coalesce((select auth.jwt())->'app_metadata'->>'musiverso_kids_admin','false')='true');
drop policy if exists teacher_own_select on public.kids_teacher_records;
drop policy if exists teacher_own_insert on public.kids_teacher_records;
drop policy if exists teacher_own_update on public.kids_teacher_records;
drop policy if exists teacher_own_delete on public.kids_teacher_records;
create policy teacher_authorized on public.kids_teacher_records for all to authenticated
using (user_id=(select auth.uid()) and (coalesce((select auth.jwt())->'app_metadata'->>'musiverso_kids_admin','false')='true' or exists(select 1 from public.kids_teacher_access a where a.user_id=(select auth.uid()) and a.status='approved')))
with check (user_id=(select auth.uid()) and (coalesce((select auth.jwt())->'app_metadata'->>'musiverso_kids_admin','false')='true' or exists(select 1 from public.kids_teacher_access a where a.user_id=(select auth.uid()) and a.status='approved')));