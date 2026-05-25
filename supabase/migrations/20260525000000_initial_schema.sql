-- ============================================================
-- Meridian Finance App — Schema Inicial
-- Gerado em: 2026-05-25
--
-- Execute no SQL Editor do Supabase ou via: supabase db push
-- ============================================================

-- ── Extensões ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
--    Estende auth.users com dados do perfil do usuário.
-- ============================================================
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           text,
  monthly_budget numeric(12, 2) default 0,
  created_at     timestamptz    default now() not null,
  updated_at     timestamptz    default now() not null
);

comment on table  public.profiles                is 'Dados de perfil do usuário (1:1 com auth.users)';
comment on column public.profiles.monthly_budget is 'Meta mensal de gastos em BRL';

-- RLS
alter table public.profiles enable row level security;

create policy "Usuário vê apenas seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza apenas seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuário cria seu próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger: atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Trigger: cria perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES
--    Categorias de transação por usuário.
-- ============================================================
create table if not exists public.categories (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  color      text        default '#6366f1',
  created_at timestamptz default now() not null,
  unique (user_id, name)  -- um usuário não pode ter duas categorias com o mesmo nome
);

comment on table public.categories is 'Categorias de transação definidas por cada usuário';

-- RLS
alter table public.categories enable row level security;

create policy "Usuário gerencia apenas suas categorias"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índice para filtragem frequente por user_id
create index if not exists idx_categories_user_id on public.categories (user_id);

-- ============================================================
-- 3. TRANSACTIONS
--    Receitas e despesas do usuário.
-- ============================================================
create table if not exists public.transactions (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  category_id uuid        references public.categories(id) on delete set null,
  description text        not null,
  amount      numeric(12, 2) not null check (amount > 0),
  type        text        not null check (type in ('income', 'expense')),
  date        date        not null default current_date,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

comment on table  public.transactions        is 'Receitas e despesas registradas pelo usuário';
comment on column public.transactions.amount is 'Valor absoluto em BRL (sempre positivo)';
comment on column public.transactions.type   is '''income'' = receita, ''expense'' = gasto';

-- RLS
alter table public.transactions enable row level security;

create policy "Usuário gerencia apenas suas transações"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger para updated_at
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Índices para as queries mais frequentes
create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);

create index if not exists idx_transactions_user_type
  on public.transactions (user_id, type);

create index if not exists idx_transactions_category_id
  on public.transactions (category_id);

-- ============================================================
-- 4. GOALS
--    Metas financeiras do usuário.
-- ============================================================
create table if not exists public.goals (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  title          text        not null,
  target_amount  numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  deadline       date,
  color          text        default '#2563eb',
  created_at     timestamptz default now() not null
);

comment on table  public.goals                is 'Objetivos financeiros do usuário';
comment on column public.goals.target_amount  is 'Valor alvo da meta em BRL';
comment on column public.goals.current_amount is 'Valor já economizado/investido';

-- RLS
alter table public.goals enable row level security;

create policy "Usuário gerencia apenas suas metas"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índice
create index if not exists idx_goals_user_id on public.goals (user_id, created_at desc);
