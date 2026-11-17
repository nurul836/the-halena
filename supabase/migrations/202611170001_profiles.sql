-- Review and apply after the existing AI migration. No AI grants are changed.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Member' check(char_length(btrim(display_name)) between 2 and 80),
 avatar_path text check(avatar_path is null or avatar_path ~ ('^' || id::text || '/[a-f0-9-]{36}\.jpg$')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,avatar_path) on public.profiles to authenticated;
grant all on public.profiles to service_role;
create policy profiles_owner_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_owner_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
-- Guard against broad policies introduced later.
create policy profiles_owner_guard on public.profiles as restrictive for all to anon,authenticated
 using(id=(select auth.uid())) with check(id=(select auth.uid()));

create function public.create_halena_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,
 case when char_length(btrim(coalesce(new.raw_user_meta_data->>'full_name','')))>=2
 then left(btrim(new.raw_user_meta_data->>'full_name'),80) else 'Member' end);
 return new;
end;$$;
revoke all on function public.create_halena_profile() from public,anon,authenticated;
create trigger halena_profile_on_signup after insert on auth.users for each row execute function public.create_halena_profile();
insert into public.profiles(id,display_name) select id,
 case when char_length(btrim(coalesce(raw_user_meta_data->>'full_name','')))>=2
 then left(btrim(raw_user_meta_data->>'full_name'),80) else 'Member' end from auth.users;
create function public.touch_halena_profile() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now();return new;end;$$;
revoke all on function public.touch_halena_profile() from public,anon,authenticated;
create trigger halena_profile_updated before update on public.profiles for each row execute function public.touch_halena_profile();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('profile-avatars','profile-avatars',false,2097152,array['image/jpeg']);
create policy avatar_owner_guard on storage.objects as restrictive for all to anon,authenticated
using(bucket_id<>'profile-avatars' or ((select auth.uid()) is not null and name ~ ('^'||(select auth.uid())::text||'/[a-f0-9-]{36}\.jpg$')))
with check(bucket_id<>'profile-avatars' or ((select auth.uid()) is not null and name ~ ('^'||(select auth.uid())::text||'/[a-f0-9-]{36}\.jpg$')));
create policy avatar_owner_read on storage.objects for select to authenticated
using(bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy avatar_owner_insert on storage.objects for insert to authenticated
with check(bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy avatar_owner_delete on storage.objects for delete to authenticated
using(bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy avatar_bucket_protected on storage.buckets as restrictive for all to anon,authenticated
using(id<>'profile-avatars') with check(id<>'profile-avatars');
commit;
