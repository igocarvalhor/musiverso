alter table public.kids_teacher_profiles
  add constraint kids_teacher_profiles_own_avatar
  check (avatar_path is null or avatar_path in (
    user_id::text || '/avatar.jpg',
    user_id::text || '/avatar.png',
    user_id::text || '/avatar.webp'
  ));

alter policy kids_profiles_update on public.kids_teacher_profiles
  using (
    user_id = (select auth.uid())
    and (
      exists (select 1 from public.kids_teacher_access a where a.user_id = (select auth.uid()) and a.status = 'approved')
      or (select auth.jwt()) -> 'app_metadata' -> 'musiverso_kids_admin' = 'true'::jsonb
    )
  )
  with check (
    user_id = (select auth.uid())
    and (
      exists (select 1 from public.kids_teacher_access a where a.user_id = (select auth.uid()) and a.status = 'approved')
      or (select auth.jwt()) -> 'app_metadata' -> 'musiverso_kids_admin' = 'true'::jsonb
    )
  );

alter policy kids_teacher_avatars_insert on storage.objects
  with check (
    bucket_id = 'kids-teacher-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name in (
      (select auth.uid())::text || '/avatar.jpg',
      (select auth.uid())::text || '/avatar.png',
      (select auth.uid())::text || '/avatar.webp'
    )
    and (
      exists (select 1 from public.kids_teacher_access a where a.user_id = (select auth.uid()) and a.status = 'approved')
      or (select auth.jwt()) -> 'app_metadata' -> 'musiverso_kids_admin' = 'true'::jsonb
    )
  );

alter policy kids_teacher_avatars_update on storage.objects
  using (
    bucket_id = 'kids-teacher-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (
      exists (select 1 from public.kids_teacher_access a where a.user_id = (select auth.uid()) and a.status = 'approved')
      or (select auth.jwt()) -> 'app_metadata' -> 'musiverso_kids_admin' = 'true'::jsonb
    )
  )
  with check (
    bucket_id = 'kids-teacher-avatars'
    and name in (
      (select auth.uid())::text || '/avatar.jpg',
      (select auth.uid())::text || '/avatar.png',
      (select auth.uid())::text || '/avatar.webp'
    )
    and (
      exists (select 1 from public.kids_teacher_access a where a.user_id = (select auth.uid()) and a.status = 'approved')
      or (select auth.jwt()) -> 'app_metadata' -> 'musiverso_kids_admin' = 'true'::jsonb
    )
  );
