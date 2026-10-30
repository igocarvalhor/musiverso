create table public.kids_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 progress jsonb not null default '{}'::jsonb check (jsonb_typeof(progress) = 'object' and octet_length(progress::text) <= 131072),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.kids_progress enable row level security;
revoke all on public.kids_progress from public, anon, authenticated;
grant select, insert, update on public.kids_progress to authenticated;
grant all on public.kids_progress to service_role;
create policy kids_progress_read_own on public.kids_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy kids_progress_insert_own on public.kids_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy kids_progress_update_own on public.kids_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.kids_progress_stamp() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if TG_OP = 'INSERT' then new.revision := 1;
 else
  if new.revision <> old.revision + 1 then raise exception 'invalid progress revision'; end if;
 end if;
 new.updated_at := now();
 return new;
end;
$$;
revoke all on function public.kids_progress_stamp() from public, anon, authenticated;
create trigger kids_progress_stamp before insert or update on public.kids_progress for each row execute function public.kids_progress_stamp();
