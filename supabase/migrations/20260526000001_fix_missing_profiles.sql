-- ============================================================
-- Fix: Garante que todo usuário em auth.users tenha um perfil
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Cria perfis para usuários já existentes que não os têm
insert into public.profiles (id, name)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 2. Recria o trigger (caso não exista ou esteja desatualizado)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Remove o trigger antigo se existir e recria
drop trigger if exists trg_auth_user_created on auth.users;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
