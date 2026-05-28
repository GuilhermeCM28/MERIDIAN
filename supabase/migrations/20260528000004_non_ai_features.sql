-- ============================================================
-- Meridian Finance App — Features sem IA
-- 2026-05-28
-- ============================================================

-- ── 1. Orçamento por categoria ────────────────────────────────
-- Adiciona limite mensal opcional a cada categoria
alter table public.categories
  add column if not exists monthly_limit numeric(12, 2) default null;

comment on column public.categories.monthly_limit
  is 'Limite de gastos mensais para esta categoria (opcional, em BRL)';

-- ── 2. Aportes em Metas (goal_contributions) ─────────────────
create table if not exists public.goal_contributions (
  id         uuid        primary key default uuid_generate_v4(),
  goal_id    uuid        not null references public.goals(id) on delete cascade,
  user_id    uuid        not null references auth.users(id)   on delete cascade,
  amount     numeric(12, 2) not null check (amount > 0),
  note       text,
  date       date        not null default current_date,
  created_at timestamptz default now() not null
);

comment on table  public.goal_contributions        is 'Histórico de aportes em metas financeiras';
comment on column public.goal_contributions.amount is 'Valor aportado em BRL';
comment on column public.goal_contributions.note   is 'Observação opcional do aporte';

-- RLS
alter table public.goal_contributions enable row level security;

create policy "Usuário gerencia apenas seus aportes"
  on public.goal_contributions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_goal_contributions_goal_id
  on public.goal_contributions (goal_id, created_at desc);

-- ── 3. Transações Recorrentes ─────────────────────────────────
alter table public.transactions
  add column if not exists is_recurring        boolean default false,
  add column if not exists recurrence_interval text    default null
    check (recurrence_interval in ('daily', 'weekly', 'monthly', 'yearly') or recurrence_interval is null),
  add column if not exists next_due_date       date    default null;

comment on column public.transactions.is_recurring        is 'Indica se a transação se repete automaticamente';
comment on column public.transactions.recurrence_interval is 'Intervalo: daily, weekly, monthly ou yearly';
comment on column public.transactions.next_due_date       is 'Data da próxima ocorrência da transação recorrente';

-- Índice para processamento de recorrências vencidas
create index if not exists idx_transactions_recurring
  on public.transactions (user_id, next_due_date)
  where is_recurring = true;
