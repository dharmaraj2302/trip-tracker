# Tripline — Travel & Expense Tracker

Plan trips (dates, flight, hotel) before you travel, log food and conveyance
expenses under each trip as you go, upload receipt photos, and export an
Excel sheet for office reimbursement. Built on Supabase + GitHub Pages —
same stack as Cortex.

## 1. Supabase setup

1. Create a project at https://supabase.com (free tier is fine).
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
   This creates the `trips`, `flights`, `hotels`, `expenses` tables, a public
   `receipts` storage bucket, and RLS policies scoped to authenticated users.
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
4. Go to **Authentication → Providers** and make sure **Email** (magic link /
   OTP) is enabled — that's how you'll sign in, no password to remember.

## 2. Local setup

```bash
cd travel-tracker
cp .env.example .env
# paste your Supabase URL + anon key into .env
npm install
npm run dev
```

Open the local URL, sign in with your email (you'll get a magic link), and
start adding trips.

## 3. Deploy to GitHub Pages

1. Push this folder to a new GitHub repo.
2. In `vite.config.js`, set `base: '/<your-repo-name>/'`.
3. In the repo **Settings → Pages**, set source to **GitHub Actions**.
4. In **Settings → Secrets and variables → Actions**, add repo secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Push to `main` — the included workflow (`.github/workflows/deploy.yml`)
   builds and deploys automatically. Your app will be live at
   `https://<username>.github.io/<repo-name>/`.

## How it maps to your pain points

- **Forgetting dates**: every trip is created with from/to dates, flight
  (airline, flight number, PNR, departure/arrival) and hotel (name, ref,
  check-in/out) *before* you travel — it's the plan, not a memory test.
- **Scattered expenses across apps**: one place to log food and conveyance
  (cab, Rapido, train, etc.) against the trip, with an optional receipt
  photo attached to each entry so you never need to dig through other apps.
- **Food budget band (₹750–₹850/day)**: the trip view shows a daily strip —
  amber if you're under ₹750, teal if you're in the ₹750–₹850 band, rust if
  you've gone over — calculated live from what you've logged that day.
- **Office reimbursement**: "Export to Excel" on any trip produces a dated,
  categorized `.xlsx` with a total row, ready to attach to your claim.

## Extending later

- Add a `reimbursed` boolean + date on `expenses` to track claim status.
- Add a monthly/quarterly rollup view across trips (sum by category).
- Swap the single-user email OTP for nothing at all if you'd rather keep
  RLS open to just your own Supabase project without login — fine for a
  personal tool, just know the anon key + open policies means anyone with
  the URL could read/write, so keep the repo (and API keys) private if so.
