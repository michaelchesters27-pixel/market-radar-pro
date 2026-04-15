# Market Radar Pro

Premium-style Netlify + Supabase scanner dashboard for forex, crypto and metals.

## What is included
- Polished responsive scanner UI
- Filters for asset class, timeframe and state
- Top Pick panel with green-ring emphasis
- Netlify function to read signals from Supabase
- Netlify function to run a basic scan and upsert rows
- Demo fallback so the app still looks complete before wiring live data
- Supabase SQL schema

## Deploy to Netlify
1. Upload this folder to a new Netlify site.
2. Add environment variables in Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. In Supabase SQL editor, run `sql/schema.sql`.
4. Open the site.
5. Click **Refresh Scan** or call `/.netlify/functions/scan-markets` once to seed rows.

## Important
This package is a premium front-end and backend scaffold.
The scan function currently uses starter placeholder logic so the product is deployable immediately.
Next phase is replacing `netlify/functions/scan-markets.mjs` with your real market-data and red-folder logic.

## Recommended next env vars for live feeds
- `MARKET_DATA_API_KEY`
- `ECONOMIC_CALENDAR_API_KEY`

## Notes
- Frontend shows all scanned markets by default.
- Top Pick appears only when a row qualifies in the scan logic.
- Demo mode activates automatically if Supabase keys are missing.


## Index mapping
The visible index rows remain:
- US500
- NAS100
- US30
- UK100

Underlying references used by the scanner:
- US500 -> ES
- NAS100 -> NQ
- US30 -> YM
- UK100 -> UK100


Build V14 fixes duplicate row logic, uses Supabase rows directly, integrates upcoming news_events into signals, and makes both the manual refresh button and the 60-second timer trigger /api/refresh before reloading signals.
