create table public.kids_teacher_records (
user_id uuid not null references auth.users(id) on delete cascade,
record_key text not null check(length(record_key) between 1 and 300),
value jsonb not null,
updated_at timestamptz not null default now(),
primary key(user_id,record_key)
);
alter table public.kids_teacher_records enable row level security;
revoke all on public.kids_teacher_records from anon;
grant select,insert,update,delete on public.kids_teacher_records to authenticated;
create policy teacher_own_select on public.kids_teacher_records for select to authenticated using ((select auth.uid())=user_id);
create policy teacher_own_insert on public.kids_teacher_records for insert to authenticated with check ((select auth.uid())=user_id);
create policy teacher_own_update on public.kids_teacher_records for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy teacher_own_delete on public.kids_teacher_records for delete to authenticated using ((select auth.uid())=user_id);