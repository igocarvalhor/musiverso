begin;
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into public.kids_teacher_records(user_id,record_key,value) values ('11111111-1111-4111-8111-111111111111','role-test','{}'),('22222222-2222-4222-8222-222222222222','role-test','{}');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","user_metadata":{"musiverso_kids_admin":true,"role":"teacher"},"app_metadata":{}}',true);
do $$ begin
if (select count(*) from public.kids_teacher_records)<>0 then raise exception 'student read allowed';end if;
begin insert into public.kids_teacher_access(user_id,status) values(auth.uid(),'approved');raise exception 'self approval allowed';exception when insufficient_privilege then null;end;
insert into public.kids_teacher_access(user_id,status) values(auth.uid(),'pending');
update public.kids_teacher_access set status='approved' where user_id=auth.uid();
if found then raise exception 'self promotion allowed';end if;
if (select count(*) from public.kids_teacher_records)<>0 then raise exception 'pending teacher read allowed';end if;
begin insert into public.kids_teacher_records(user_id,record_key,value) values(auth.uid(),'student-write','{}');raise exception 'student write allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","app_metadata":{"musiverso_kids_admin":true}}',true);
update public.kids_teacher_access set status='approved' where user_id='11111111-1111-4111-8111-111111111111';
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","app_metadata":{}}',true);
do $$ begin
if (select count(*) from public.kids_teacher_records)<>1 then raise exception 'approved isolation failed';end if;
insert into public.kids_teacher_records(user_id,record_key,value) values(auth.uid(),'teacher-write','{}');
begin insert into public.kids_teacher_records(user_id,record_key,value) values('22222222-2222-4222-8222-222222222222','foreign-write','{}');raise exception 'cross user write allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","app_metadata":{"musiverso_kids_admin":true}}',true);
update public.kids_teacher_access set status='denied' where user_id='11111111-1111-4111-8111-111111111111';
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","app_metadata":{}}',true);
do $$ begin if (select count(*) from public.kids_teacher_records)<>0 then raise exception 'revocation failed';end if;end $$;
select 'PASS: student denied, forged metadata denied, pending denied, admin approval, teacher ownership, revocation' as verification;
rollback;