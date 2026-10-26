# Supabase setup (photos + songs)

The app now stores uploaded photos and songs in Supabase Storage. It stores the file URLs and memory metadata in the Supabase database, not full Base64 media inside database rows or localStorage.

## 1. Create a Supabase project

1. Open https://supabase.com/ and create a project.
2. In Project Settings -> API, copy the **Project URL** and the **publishable key** (or the legacy `anon` key). Do not use a `service_role` / secret key in the browser.
3. Copy `.env.example` to `.env.local` and fill in:

   ```env
   VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
   VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
   VITE_SUPABASE_MEDIA_BUCKET="media"
   ```

4. In Supabase Dashboard -> SQL Editor, run the complete contents of `supabase-setup.sql`.
5. Restart the local dev server after changing environment variables (`npm run dev`).
6. When deploying (for example, on Vercel), add the same `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_MEDIA_BUCKET` values in the project's Environment Variables, then redeploy.

## 2. Verify uploads

- Open the site and upload a photo in Memories Scrapbook. It should appear under Storage -> `media` -> `photos`.
- Upload a song for a photo. It should appear under `media` -> `songs`, and the photo row should contain `song_url` and `song_title`.
- Upload the global favorite song. It is stored as `app_settings.id = default_song`, so another device can load the same public URL after refreshing the site.
- Shared photo metadata appears in Table Editor -> `memories`. The avatar URL is stored under `app_settings.id = avatar`.

## Important security note

This ZIP uses a **client-side/demo login**, not Supabase Auth. To make the upload buttons work without changing the login system, the included SQL grants anonymous users read/write access to memory rows and permits anonymous media uploads into the public `media` bucket. Anyone with the site can therefore upload files and alter/delete shared gallery records. Public bucket files can be viewed by anyone with their URL. The SQL limits files to 50 MB, image/audio MIME types, and the `photos`/`songs` folders, but those controls are not a substitute for authentication.

Before using the site with private content or publicly sharing it widely, add real Supabase Auth and change the SQL policies so only approved authenticated users can insert/update/delete. Never add a service-role key to a frontend `.env` variable.

## Existing Firebase data

This migration changes future uploads to Supabase. It does not automatically copy old Firestore memories or Base64 images/songs from the previous Firebase project. Download/export those old files and upload them through the new site (or run a separate migration) if they need to be retained.
