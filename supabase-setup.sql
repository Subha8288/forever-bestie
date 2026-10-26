-- Supabase setup for Forever Bestie / Romantic Birthday Celebration.
-- Run this in Supabase Dashboard -> SQL Editor -> New query.
-- This enables public demo access because the existing app uses a client-side login.
-- Do NOT use these open write policies for a private/production app with valuable data.

create extension if not exists pgcrypto;

create table if not exists public.memories (
  id text primary key,
  url text not null,
  caption text not null default '',
  date text not null default '',
  location text not null default '',
  category text not null default '',
  uploaded_by text not null default 'Subho',
  created_at timestamptz not null default now(),
  song_url text,
  song_title text
);

create table if not exists public.app_settings (
  id text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

alter table public.memories enable row level security;
alter table public.app_settings enable row level security;

grant select, insert, update, delete on public.memories to anon, authenticated;
grant select, insert, update, delete on public.app_settings to anon, authenticated;

drop policy if exists "Public demo can read memories" on public.memories;
drop policy if exists "Public demo can insert memories" on public.memories;
drop policy if exists "Public demo can update memories" on public.memories;
drop policy if exists "Public demo can delete memories" on public.memories;
create policy "Public demo can read memories" on public.memories for select to anon, authenticated using (true);
create policy "Public demo can insert memories" on public.memories for insert to anon, authenticated with check (true);
create policy "Public demo can update memories" on public.memories for update to anon, authenticated using (true) with check (true);
create policy "Public demo can delete memories" on public.memories for delete to anon, authenticated using (true);

drop policy if exists "Public demo can read app settings" on public.app_settings;
drop policy if exists "Public demo can insert app settings" on public.app_settings;
drop policy if exists "Public demo can update app settings" on public.app_settings;
drop policy if exists "Public demo can delete app settings" on public.app_settings;
create policy "Public demo can read app settings" on public.app_settings for select to anon, authenticated using (true);
create policy "Public demo can insert app settings" on public.app_settings for insert to anon, authenticated with check (true);
create policy "Public demo can update app settings" on public.app_settings for update to anon, authenticated using (true) with check (true);
create policy "Public demo can delete app settings" on public.app_settings for delete to anon, authenticated using (true);

-- Public image/audio bucket. File-size limit: 50 MB; allow only image/audio MIME types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav',
    'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/3gpp'
  ]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public demo can view media" on storage.objects;
drop policy if exists "Public demo can upload media" on storage.objects;
create policy "Public demo can view media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');
create policy "Public demo can upload media" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] in ('photos', 'songs')
  );

-- Enable Realtime for memories so other open tabs/devices refresh when rows change.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'memories'
  ) then
    alter publication supabase_realtime add table public.memories;
  end if;
end $$;
