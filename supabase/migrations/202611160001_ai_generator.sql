-- Apply to a dedicated Supabase project or review existing policies first.
create table public.ai_settings (
 id boolean primary key default true check (id), enabled boolean not null default false,
 daily_job_limit integer not null default 50 check(daily_job_limit between 1 and 10000),
 daily_budget_cents integer not null default 5000 check(daily_budget_cents>0)
);
insert into public.ai_settings(id) values(true);
create table public.ai_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 daily_limit integer not null default 3 check(daily_limit between 1 and 100)
);
create table public.ai_jobs (
 id uuid primary key, user_id uuid not null references auth.users(id), request_hash text not null,
 status text not null default 'processing' check(status in ('processing','succeeded','failed','uncertain','deleted')),
 room_type text not null, style text not null, model text not null,
 created_at timestamptz not null default now(), expires_at timestamptz not null,
 consent_at timestamptz not null default now(), consent_version text not null default '2026-11-16',
 reservation_cents integer not null check(reservation_cents>0),
 usage jsonb not null default '{}'::jsonb, provider_request_id text,
 error_code text, deleted_at timestamptz
);
create index ai_jobs_user_created on public.ai_jobs(user_id,created_at desc);
create index ai_jobs_expiry on public.ai_jobs(expires_at) where status<>'deleted';
alter table public.ai_settings enable row level security;
alter table public.ai_accounts enable row level security;
alter table public.ai_jobs enable row level security;
-- No client policies: the authenticated server owns all job and quota access.
revoke all on public.ai_settings,public.ai_accounts,public.ai_jobs from anon,authenticated;
grant all on public.ai_settings,public.ai_accounts,public.ai_jobs to service_role;

create or replace function public.reserve_ai_job(p_user uuid,p_id uuid,p_hash text,p_room text,p_style text,p_model text,p_hours integer,p_cents integer)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare cfg public.ai_settings; account public.ai_accounts; existing public.ai_jobs; created public.ai_jobs; total integer; budget bigint;
begin
 -- Global lock makes account limits AND the global budget atomic across instances.
 perform pg_advisory_xact_lock(628461905);
 select * into existing from public.ai_jobs where id=p_id;
 if found then
  if existing.user_id<>p_user or existing.request_hash<>p_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
  return jsonb_build_object('created',false,'job',to_jsonb(existing));
 end if;
 select * into cfg from public.ai_settings where id=true;
 if not found or not cfg.enabled then raise exception 'GENERATION_DISABLED'; end if;
 select * into account from public.ai_accounts where user_id=p_user;
 if not found or not account.enabled then raise exception 'ACCOUNT_NOT_ENABLED'; end if;
 if p_hours<1 or p_hours>168 or p_cents<1 then raise exception 'INVALID_CONFIG'; end if;
 if exists(select 1 from public.ai_jobs where user_id=p_user and (created_at>now()-interval '1 minute' or (status='processing' and created_at>now()-interval '10 minutes'))) then raise exception 'RATE_LIMIT'; end if;
 if (select count(*) from public.ai_jobs where user_id=p_user and created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')>=account.daily_limit then raise exception 'DAILY_QUOTA'; end if;
 select count(*),coalesce(sum(reservation_cents),0) into total,budget from public.ai_jobs where created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 if total>=cfg.daily_job_limit or budget+p_cents>cfg.daily_budget_cents then raise exception 'GLOBAL_BUDGET'; end if;
 insert into public.ai_jobs(id,user_id,request_hash,room_type,style,model,expires_at,reservation_cents)
 values(p_id,p_user,p_hash,p_room,p_style,p_model,now()+make_interval(hours=>p_hours),p_cents) returning * into created;
 return jsonb_build_object('created',true,'job',to_jsonb(created));
end; $$;
revoke all on function public.reserve_ai_job(uuid,uuid,text,text,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.reserve_ai_job(uuid,uuid,text,text,text,text,integer,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ai-private','ai-private',false,20971520,array['image/png'])
on conflict(id) do update set public=false,file_size_limit=20971520,allowed_mime_types=array['image/png'];
-- Restrictive policies prevent accidental broad existing policies from granting
-- browser roles access to this bucket. Only the service-role server can access it.
create policy ai_private_no_browser_access on storage.objects as restrictive for all to anon,authenticated
using(bucket_id<>'ai-private') with check(bucket_id<>'ai-private');
create policy ai_private_no_browser_bucket_changes on storage.buckets as restrictive for all to anon,authenticated
using(id<>'ai-private') with check(id<>'ai-private');
