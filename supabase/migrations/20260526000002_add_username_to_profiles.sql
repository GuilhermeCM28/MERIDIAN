-- ============================================================
-- Adiciona campo username na tabela profiles
-- ============================================================

alter table public.profiles
  add column if not exists username text unique;

-- Índice para busca rápida por username
create unique index if not exists idx_profiles_username on public.profiles (username);

comment on column public.profiles.username is 'Nome de usuário único (handle), ex: @guilherme';
