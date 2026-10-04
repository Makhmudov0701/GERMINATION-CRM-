create table if not exists public.crm_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.crm_state enable row level security;

create policy "crm_select" on public.crm_state
  for select to authenticated using (true);

create policy "crm_insert" on public.crm_state
  for insert to authenticated with check (true);

create policy "crm_update" on public.crm_state
  for update to authenticated using (true) with check (true);
