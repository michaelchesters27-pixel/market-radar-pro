begin;

-- Market Radar Pro - clean reset schema

drop trigger if exists trg_scanner_signals_set_updated_at on public.scanner_signals;
drop trigger if exists trg_scanner_settings_set_updated_at on public.scanner_settings;

drop function if exists public.set_updated_at();

drop table if exists public.signal_history cascade;
drop table if exists public.scanner_signals cascade;
drop table if exists public.scanner_runs cascade;
drop table if exists public.news_events cascade;
drop table if exists public.scanner_settings cascade;
drop table if exists public.assets cascade;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.assets (
  id bigint generated always as identity primary key,
  symbol text not null unique,
  display_name text not null,
  asset_class text not null check (asset_class in ('forex','crypto','metal','index')),
  underlying_symbol text,
  default_timeframe text not null default '15m' check (default_timeframe in ('15m','1h','4h')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_assets_asset_class on public.assets(asset_class);
create index idx_assets_is_active on public.assets(is_active);
create index idx_assets_sort_order on public.assets(sort_order);

create table public.scanner_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running','completed','failed')),
  assets_scanned integer not null default 0 check (assets_scanned >= 0),
  top_pick_symbol text,
  engine_version text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_scanner_runs_status on public.scanner_runs(status);
create index idx_scanner_runs_started_at on public.scanner_runs(started_at desc);

create table public.scanner_signals (
  id bigint generated always as identity primary key,
  asset_id bigint not null references public.assets(id) on delete cascade,
  symbol text not null,
  timeframe text not null check (timeframe in ('15m','1h','4h')),
  state text not null check (state in ('Bullish','Bearish','Consolidating')),
  strength_score integer not null check (strength_score between 0 and 100),
  confidence_score integer check (confidence_score between 0 and 100),
  confidence_level text check (confidence_level in ('High','Medium','Low')),
  volume_status text not null,
  bias_note text not null,
  news_risk text not null,
  news_level text not null default 'low' check (news_level in ('low','medium','high')),
  entry_text text not null default 'None',
  entry_status text not null default 'Waiting' check (entry_status in ('Valid','Near','Triggered','Expired','Waiting','None')),
  reason text,
  is_top_pick boolean not null default false,
  scan_run_id bigint references public.scanner_runs(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (asset_id, timeframe)
);
create index idx_scanner_signals_asset_timeframe on public.scanner_signals(asset_id, timeframe);
create index idx_scanner_signals_symbol on public.scanner_signals(symbol);
create index idx_scanner_signals_timeframe on public.scanner_signals(timeframe);
create index idx_scanner_signals_state on public.scanner_signals(state);
create index idx_scanner_signals_top_pick on public.scanner_signals(is_top_pick);
create index idx_scanner_signals_updated_at on public.scanner_signals(updated_at desc);
create index idx_scanner_signals_scan_run_id on public.scanner_signals(scan_run_id);
create unique index uq_scanner_signals_one_top_pick_per_run
on public.scanner_signals(scan_run_id)
where is_top_pick = true and scan_run_id is not null;

create table public.signal_history (
  id bigint generated always as identity primary key,
  asset_id bigint not null references public.assets(id) on delete cascade,
  symbol text not null,
  timeframe text not null check (timeframe in ('15m','1h','4h')),
  state text not null check (state in ('Bullish','Bearish','Consolidating')),
  strength_score integer not null check (strength_score between 0 and 100),
  confidence_score integer check (confidence_score between 0 and 100),
  confidence_level text check (confidence_level in ('High','Medium','Low')),
  volume_status text not null,
  bias_note text not null,
  news_risk text not null,
  news_level text not null default 'low' check (news_level in ('low','medium','high')),
  entry_text text not null default 'None',
  entry_status text not null check (entry_status in ('Valid','Near','Triggered','Expired','Waiting','None')),
  reason text,
  is_top_pick boolean not null default false,
  scan_run_id bigint references public.scanner_runs(id) on delete set null,
  captured_at timestamptz not null default now()
);
create index idx_signal_history_asset_timeframe on public.signal_history(asset_id, timeframe);
create index idx_signal_history_symbol on public.signal_history(symbol);
create index idx_signal_history_timeframe on public.signal_history(timeframe);
create index idx_signal_history_captured_at on public.signal_history(captured_at desc);
create index idx_signal_history_scan_run_id on public.signal_history(scan_run_id);

create table public.news_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  currency text,
  country text,
  impact_level text not null check (impact_level in ('low','medium','high')),
  event_time timestamptz not null,
  event_status text not null default 'upcoming' check (event_status in ('upcoming','live','passed','cancelled')),
  headline text,
  affected_assets text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);
create index idx_news_events_event_time on public.news_events(event_time);
create index idx_news_events_status on public.news_events(event_status);
create index idx_news_events_impact on public.news_events(impact_level);

create table public.scanner_settings (
  id bigint generated always as identity primary key,
  scan_interval_seconds integer not null default 60 check (scan_interval_seconds > 0),
  top_pick_min_score integer not null default 75 check (top_pick_min_score between 0 and 100),
  high_news_block_minutes integer not null default 30 check (high_news_block_minutes >= 0),
  medium_news_caution_minutes integer not null default 60 check (medium_news_caution_minutes >= 0),
  strength_weight numeric(5,2) not null default 25.00,
  confidence_weight numeric(5,2) not null default 20.00,
  volume_weight numeric(5,2) not null default 15.00,
  bias_weight numeric(5,2) not null default 15.00,
  news_weight numeric(5,2) not null default 15.00,
  entry_weight numeric(5,2) not null default 10.00,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
create unique index uq_scanner_settings_one_active on public.scanner_settings(is_active) where is_active = true;

create trigger trg_scanner_signals_set_updated_at
before update on public.scanner_signals
for each row execute function public.set_updated_at();

create trigger trg_scanner_settings_set_updated_at
before update on public.scanner_settings
for each row execute function public.set_updated_at();

insert into public.assets (symbol, display_name, asset_class, underlying_symbol, default_timeframe, is_active, sort_order)
values
  ('EUR/USD', 'EUR/USD', 'forex', null, '15m', true, 1),
  ('GBP/USD', 'GBP/USD', 'forex', null, '15m', true, 2),
  ('USD/JPY', 'USD/JPY', 'forex', null, '15m', true, 3),
  ('USD/CHF', 'USD/CHF', 'forex', null, '15m', true, 4),
  ('AUD/USD', 'AUD/USD', 'forex', null, '15m', true, 5),
  ('NZD/USD', 'NZD/USD', 'forex', null, '15m', true, 6),
  ('USD/CAD', 'USD/CAD', 'forex', null, '15m', true, 7),
  ('EUR/JPY', 'EUR/JPY', 'forex', null, '15m', true, 8),
  ('GBP/JPY', 'GBP/JPY', 'forex', null, '15m', true, 9),
  ('EUR/GBP', 'EUR/GBP', 'forex', null, '15m', true, 10),
  ('EUR/CHF', 'EUR/CHF', 'forex', null, '15m', true, 11),
  ('GBP/CHF', 'GBP/CHF', 'forex', null, '15m', true, 12),
  ('AUD/JPY', 'AUD/JPY', 'forex', null, '15m', true, 13),
  ('NZD/JPY', 'NZD/JPY', 'forex', null, '15m', true, 14),
  ('XAU/USD', 'Gold', 'metal', null, '15m', true, 15),
  ('XAG/USD', 'Silver', 'metal', null, '15m', true, 16),
  ('BTC/USD', 'Bitcoin', 'crypto', null, '15m', true, 17),
  ('ETH/USD', 'Ethereum', 'crypto', null, '15m', true, 18),
  ('SOL/USD', 'Solana', 'crypto', null, '15m', true, 19),
  ('XRP/USD', 'XRP', 'crypto', null, '15m', true, 20),
  ('US500', 'S&P 500', 'index', 'ES', '15m', true, 21),
  ('NAS100', 'NASDAQ-100', 'index', 'NQ', '15m', true, 22),
  ('US30', 'Dow Jones', 'index', 'YM', '15m', true, 23),
  ('UK100', 'FTSE 100', 'index', 'UK100', '15m', true, 24);

insert into public.scanner_settings (
  scan_interval_seconds, top_pick_min_score, high_news_block_minutes, medium_news_caution_minutes,
  strength_weight, confidence_weight, volume_weight, bias_weight, news_weight, entry_weight, is_active
) values (60, 75, 30, 60, 25.00, 20.00, 15.00, 15.00, 15.00, 10.00, true);

alter table public.assets enable row level security;
alter table public.scanner_runs enable row level security;
alter table public.scanner_signals enable row level security;
alter table public.signal_history enable row level security;
alter table public.news_events enable row level security;
alter table public.scanner_settings enable row level security;

create policy "assets_public_read" on public.assets for select to anon, authenticated using (true);
create policy "scanner_signals_public_read" on public.scanner_signals for select to anon, authenticated using (true);
create policy "scanner_settings_public_read" on public.scanner_settings for select to anon, authenticated using (true);
create policy "news_events_public_read" on public.news_events for select to anon, authenticated using (true);

commit;
