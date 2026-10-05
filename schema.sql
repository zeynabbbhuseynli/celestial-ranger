begin;
create table public.profiles(user_id uuid primary key references auth.users(id) on delete cascade,ranger_name text not null check(char_length(ranger_name)<=60),updated_at timestamptz not null default now());
create table public.ranger_progress(user_id uuid primary key references auth.users(id) on delete cascade,data jsonb not null default '{}',notes jsonb not null default '{}',revision bigint not null default 1,updated_at timestamptz not null default now(),check(octet_length(data::text)<=100000),check(octet_length(notes::text)<=10000));
create table public.stamps(user_id uuid references auth.users(id) on delete cascade,location_id text not null,primary key(user_id,location_id));
create table public.challenges(user_id uuid references auth.users(id) on delete cascade,location_id text not null,completed boolean not null,primary key(user_id,location_id));
create table public.field_notes(user_id uuid references auth.users(id) on delete cascade,location_id text not null,content text not null check(char_length(content)<=600),primary key(user_id,location_id));
create table public.eco_points(user_id uuid primary key references auth.users(id) on delete cascade,points integer not null check(points between 0 and 1000000));
create table public.food_orders(user_id uuid primary key references auth.users(id) on delete cascade,selection jsonb not null,status text not null default 'simulated' check(status='simulated'));
create table public.user_preferences(user_id uuid primary key references auth.users(id) on delete cascade,preferences jsonb not null);
create table public.ai_usage(user_id uuid references auth.users(id) on delete cascade,bucket text,requests integer not null,primary key(user_id,bucket));
do $$ declare t text; begin
 foreach t in array array['profiles','ranger_progress','stamps','challenges','field_notes','eco_points','food_orders','user_preferences'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy own_read on public.%I for select to authenticated using ((select auth.uid())=user_id)',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon,authenticated;
-- All writes use the validated transaction below; no client-supplied user ID.
create function public.save_ranger(payload jsonb,note_data jsonb,expected_revision bigint) returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); r bigint; k text; v jsonb; locs text[]:=array['berk','nintendo','dark','potter','celestial'];
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(payload)<>'object' or jsonb_typeof(note_data)<>'object' or octet_length(payload::text)>100000 or octet_length(note_data::text)>10000 then raise exception 'Invalid progress'; end if;
 if coalesce(jsonb_typeof(payload->'stamped'),'object')<>'object' or coalesce(jsonb_typeof(payload->'triviaAnswered'),'object')<>'object' then raise exception 'Invalid completion data'; end if;
 if coalesce(jsonb_typeof(payload->'visitedOrder'),'array')<>'array' or coalesce(jsonb_typeof(payload->'plannedOrder'),'array')<>'array' or coalesce(jsonb_typeof(payload->'interests'),'array')<>'array' then raise exception 'Invalid preferences'; end if;
 if char_length(coalesce(payload->>'rangerName',''))>60 or coalesce(payload->>'ecoPoints','0')!~'^\d{1,7}$' or coalesce((payload->>'ecoPoints')::integer,0)>1000000 then raise exception 'Invalid name or points'; end if;
 -- Serializes creation and update for a single account, including first import.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,0));
 select revision into r from public.ranger_progress where user_id=uid for update;
 if coalesce(r,0)<>expected_revision then raise exception 'Progress conflict'; end if;
 r:=coalesce(r,0)+1;
 insert into public.ranger_progress values(uid,payload,note_data,r,now()) on conflict(user_id) do update set data=excluded.data,notes=excluded.notes,revision=excluded.revision,updated_at=now();
 insert into public.profiles values(uid,coalesce(payload->>'rangerName','Ranger'),now()) on conflict(user_id) do update set ranger_name=excluded.ranger_name,updated_at=now();
 delete from public.stamps where user_id=uid;
 for k,v in select * from jsonb_each(coalesce(payload->'stamped','{}')) loop
 if not k=any(locs) or jsonb_typeof(v)<>'boolean' then raise exception 'Invalid stamp'; end if;
 if v='true'::jsonb then insert into public.stamps values(uid,k); end if;
 end loop;
 delete from public.challenges where user_id=uid;
 for k,v in select * from jsonb_each(coalesce(payload->'triviaAnswered','{}')) loop
 if not k=any(locs) or jsonb_typeof(v)<>'boolean' then raise exception 'Invalid challenge'; end if;
 insert into public.challenges values(uid,k,v::text::boolean);
 end loop;
 delete from public.field_notes where user_id=uid;
 for k,v in select * from jsonb_each(note_data) loop
 if not k=any(locs) or jsonb_typeof(v)<>'string' then raise exception 'Invalid note'; end if;
 insert into public.field_notes values(uid,k,v#>>'{}');
 end loop;
 insert into public.eco_points values(uid,coalesce((payload->>'ecoPoints')::integer,0)) on conflict(user_id) do update set points=excluded.points;
 delete from public.food_orders where user_id=uid;
 if payload->'foodOrder' is not null and payload->'foodOrder'<>'null'::jsonb then insert into public.food_orders(user_id,selection) values(uid,payload->'foodOrder'); end if;
 insert into public.user_preferences values(uid,jsonb_build_object('mode',payload->'mode','interests',payload->'interests','plannedOrder',payload->'plannedOrder')) on conflict(user_id) do update set preferences=excluded.preferences;
 return r;
end $$;
revoke all on function public.save_ranger(jsonb,jsonb,bigint) from public,anon;
grant execute on function public.save_ranger(jsonb,jsonb,bigint) to authenticated;
create function public.consume_ai_quota() returns boolean language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); m text:='m:'||to_char(now() at time zone 'UTC','YYYYMMDDHH24MI'); d text:='d:'||to_char(now() at time zone 'UTC','YYYYMMDD'); n integer;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,1));
 if coalesce((select requests from public.ai_usage where user_id=uid and bucket=m),0)>=10 or coalesce((select requests from public.ai_usage where user_id=uid and bucket=d),0)>=100 then return false; end if;
 insert into public.ai_usage values(uid,m,1) on conflict(user_id,bucket) do update set requests=public.ai_usage.requests+1;
 insert into public.ai_usage values(uid,d,1) on conflict(user_id,bucket) do update set requests=public.ai_usage.requests+1;
 delete from public.ai_usage where user_id=uid and bucket not in(m,d);
 return true;
end $$;
revoke all on function public.consume_ai_quota() from public,anon;
grant execute on function public.consume_ai_quota() to authenticated;
commit;
