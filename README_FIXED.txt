Market Radar Pro - fixed package

What changed:
- schema replaced with one clean Supabase schema
- scanner function now matches that schema
- reader function now matches that schema
- removed BNB drift from the fallback board
- board now shows demo status when API/data is missing

Important truth:
- this package WORKS end-to-end against Supabase
- the scanner intelligence is still template-driven, not live market-feed driven
- news_events are live if you populate that table

Deploy order:
1. In Supabase SQL editor, run sql/schema.sql
2. In Netlify env vars add:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
3. Deploy this ZIP to Netlify
4. Open /api/refresh once to seed scanner_signals
5. Open the site

API routes:
- /api/refresh -> runs scan and writes rows
- /api/signals -> reads current board rows
