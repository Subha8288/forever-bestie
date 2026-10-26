<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a952d287-8986-4395-8ae8-0c110dd09176

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies from the project folder:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase URL and publishable/anon key. Set `GEMINI_API_KEY` only if you use the Gemini feature.
3. Start the app:
   `npm start` (or `npm run dev` during development)

If `tsx: not found` appears, make sure `npm install` completed successfully in this same folder. `tsx` is included as a regular dependency because the start script needs it.


## Photo and song uploads (Supabase)

This version uses Supabase Storage for uploaded photos and songs, and Supabase Database for shared memory metadata. Follow [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md): create a Supabase project, copy `.env.example` to `.env.local`, fill in the Supabase project URL and publishable/anon key, and run [`supabase-setup.sql`](./supabase-setup.sql) in Supabase SQL Editor. Restart the app after setting environment variables.

**Important:** the supplied SQL uses public demo write policies because this app's existing login is client-side only. Read the security note in `SUPABASE_SETUP.md` before deploying publicly. Old Firebase data is not automatically copied, although locally cached memories can be migrated when the new Supabase database starts empty.
