# Relic — Backend

Express API, MongoDB models, and the AI ingestion pipeline. See the [root README](../README.md) for the project overview.

## Setup

```bash
npm install
cp .env.example .env   # fill in every value — the server refuses to boot otherwise
npm run dev
```

`server.js` validates all required environment variables at startup and exits with a list of anything missing, rather than failing later at the first request.

## Free-tier keep-alive

Relic runs on free tiers that pause or archive resources that go quiet, and each provider measures activity differently. Critically, **none of them count a plain HTTP request to the platform** — a keep-alive that only pings a URL will let the project pause anyway.

| Service | Pauses after | What actually counts as activity |
|---|---|---|
| Render (API host) | 15 min idle → ~50s cold start | Any HTTP request |
| MongoDB Atlas | ~30 days idle | Real database queries |
| Supabase | ~7 days idle | Real Postgres queries |
| Pinecone | Starter indexes archived when idle | Index operations |

`GET /health` handles all four. It performs a genuine `ping` command against MongoDB — not a `mongoose.connection.readyState` check, which does no I/O and would report healthy even against an unreachable cluster — and piggybacks throttled Supabase and Pinecone probes on the same request. Point an uptime monitor at it every 13 minutes and every service stays warm.

The response reports database health via its status code (`200` / `503`) and includes the last keep-alive outcomes for debugging:

```json
{
  "status": "ok",
  "db": "connected",
  "keepalive": {
    "supabase": "ok @ 2026-08-03T09:14:22.114Z",
    "pinecone": "ok @ 2026-08-03T09:14:22.902Z"
  }
}
```

Third-party probe failures are logged and surfaced here but deliberately do **not** affect the status code — an outage at Supabase should not make the uptime monitor report this API as down.

### Required one-time Supabase setup

The Supabase probe reads a one-row table. Without it the probe logs `table public.keepalive not found` and the project will still pause. Run once in the Supabase SQL editor:

```sql
create table public.keepalive (
  id smallint primary key,
  pinged_at timestamptz not null default now()
);
insert into public.keepalive (id) values (1);

alter table public.keepalive enable row level security;

-- Both layers are required. The GRANT decides whether anon may touch the table
-- at all; the policy decides which rows it sees. Projects created before the
-- default public-schema grants were removed may already have the GRANT — running
-- it again is harmless.
grant select on table public.keepalive to anon;

create policy "anon can read keepalive"
  on public.keepalive for select to anon using (true);
```

If `/health` reports `permission denied for table keepalive`, the `GRANT` is missing.
If it reports `table public.keepalive not found`, the table was never created.

### Watch the Render hour budget

Render allows **750 free instance hours per workspace per calendar month**, and a 31-day month is 744 hours. Keeping one service awake around the clock consumes nearly the entire allowance, so run the cron from an external monitor rather than a second Render service — exhausting the budget suspends free services until the 1st of the next month.
