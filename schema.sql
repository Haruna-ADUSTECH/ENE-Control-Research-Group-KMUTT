-- KMUTT Control Research Group
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists researchers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text,
  email text,
  google_scholar text,
  orcid text,
  bio text,
  expertise text[] default '{}',
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  degree text,
  status text default 'Current',
  research_topic text,
  supervisor text,
  start_year int,
  graduation_year int,
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  year int,
  type text default 'Journal',
  title text not null,
  authors text,
  venue text,
  volume text,
  doi text,
  google_scholar text,
  url text,
  abstract text,
  topics text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists theses (
  id uuid primary key default gen_random_uuid(),
  year int,
  degree text,
  title text not null,
  author text,
  supervisor text,
  abstract text,
  pdf_url text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text default 'Ongoing',
  summary text,
  pi text,
  funding text,
  start_date date,
  end_date date,
  url text,
  created_at timestamptz default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  published_at timestamptz default now(),
  url text,
  created_at timestamptz default now()
);

create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  caption text,
  image_url text,
  storage_path text,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;
alter table researchers enable row level security;
alter table students enable row level security;
alter table publications enable row level security;
alter table theses enable row level security;
alter table projects enable row level security;
alter table news enable row level security;
alter table gallery enable row level security;

-- Helper: is current user an approved administrator?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Public read access
create policy "public read researchers" on researchers for select using (true);
create policy "public read students" on students for select using (true);
create policy "public read publications" on publications for select using (true);
create policy "public read theses" on theses for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read news" on news for select using (true);
create policy "public read gallery" on gallery for select using (true);

-- Admin write access
create policy "admin insert researchers" on researchers for insert with check (public.is_admin());
create policy "admin update researchers" on researchers for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete researchers" on researchers for delete using (public.is_admin());

create policy "admin insert students" on students for insert with check (public.is_admin());
create policy "admin update students" on students for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete students" on students for delete using (public.is_admin());

create policy "admin insert publications" on publications for insert with check (public.is_admin());
create policy "admin update publications" on publications for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete publications" on publications for delete using (public.is_admin());

create policy "admin insert theses" on theses for insert with check (public.is_admin());
create policy "admin update theses" on theses for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete theses" on theses for delete using (public.is_admin());

create policy "admin insert projects" on projects for insert with check (public.is_admin());
create policy "admin update projects" on projects for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete projects" on projects for delete using (public.is_admin());

create policy "admin insert news" on news for insert with check (public.is_admin());
create policy "admin update news" on news for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete news" on news for delete using (public.is_admin());

create policy "admin insert gallery" on gallery for insert with check (public.is_admin());
create policy "admin update gallery" on gallery for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete gallery" on gallery for delete using (public.is_admin());

-- Create a Storage bucket manually or uncomment the next statement if your project permits it:
-- insert into storage.buckets (id, name, public) values ('research-media','research-media',true)
-- on conflict (id) do nothing;

-- Storage: public viewing, admin upload/update/delete
create policy "public read research media" on storage.objects for select using (bucket_id='research-media');
create policy "admin upload research media" on storage.objects for insert with check (bucket_id='research-media' and public.is_admin());
create policy "admin update research media" on storage.objects for update using (bucket_id='research-media' and public.is_admin());
create policy "admin delete research media" on storage.objects for delete using (bucket_id='research-media' and public.is_admin());

-- After creating your admin account in Supabase Authentication,
-- replace USER_UUID with the Auth user's UUID and run:
-- insert into public.admin_users(user_id) values ('USER_UUID');
