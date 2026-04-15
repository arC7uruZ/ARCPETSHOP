-- ============================================================
-- ArcPetShop — Migration: Painel de Administração
-- Execute no: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Enum: funções de usuário ─────────────────────────────────
create type user_role as enum ('customer', 'admin', 'root_admin');

-- ── Coluna role em profiles ───────────────────────────────────
alter table public.profiles
  add column if not exists role user_role not null default 'customer';

-- ── Funções helper de permissão ───────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'root_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_root_admin()
returns boolean
language sql
stable security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'root_admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.get_user_role()
returns user_role
language sql
stable security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'customer'::user_role
  );
$$;

-- ── TABLE: caretakers (cuidadores) ───────────────────────────
create table if not exists public.caretakers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  bio         text,
  specialties uuid[] not null default '{}',   -- ids de serviços
  is_active   boolean not null default true,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.caretakers enable row level security;

create policy "caretakers: leitura pública de ativos"
  on public.caretakers for select
  using (is_active = true or is_admin());

create policy "caretakers: admin inserir"
  on public.caretakers for insert
  with check (is_admin());

create policy "caretakers: admin atualizar"
  on public.caretakers for update
  using (is_admin())
  with check (is_admin());

create policy "caretakers: admin deletar"
  on public.caretakers for delete
  using (is_admin());

create trigger caretakers_updated_at
  before update on public.caretakers
  for each row execute procedure public.set_updated_at();

-- ── TABLE: caretaker_schedules (horários recorrentes) ────────
create table if not exists public.caretaker_schedules (
  id            uuid primary key default uuid_generate_v4(),
  caretaker_id  uuid not null references public.caretakers(id) on delete cascade,
  day_of_week   smallint not null check (day_of_week between 0 and 6), -- 0=Dom, 6=Sáb
  start_time    time not null,
  end_time      time not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint schedules_tempo_valido check (end_time > start_time)
);

create index caretaker_schedules_caretaker_idx on public.caretaker_schedules(caretaker_id);
create index caretaker_schedules_day_idx on public.caretaker_schedules(day_of_week);

alter table public.caretaker_schedules enable row level security;

create policy "caretaker_schedules: leitura pública de ativos"
  on public.caretaker_schedules for select
  using (is_active = true or is_admin());

create policy "caretaker_schedules: admin gerenciar"
  on public.caretaker_schedules for all
  using (is_admin())
  with check (is_admin());

create trigger caretaker_schedules_updated_at
  before update on public.caretaker_schedules
  for each row execute procedure public.set_updated_at();

-- ── TABLE: caretaker_blocked_slots (bloqueios específicos) ───
create table if not exists public.caretaker_blocked_slots (
  id            uuid primary key default uuid_generate_v4(),
  caretaker_id  uuid not null references public.caretakers(id) on delete cascade,
  blocked_date  date not null,
  start_time    time,           -- null = dia inteiro bloqueado
  end_time      time,           -- null = dia inteiro bloqueado
  reason        text,
  created_at    timestamptz not null default now()
);

create index caretaker_blocked_slots_idx
  on public.caretaker_blocked_slots(caretaker_id, blocked_date);

alter table public.caretaker_blocked_slots enable row level security;

create policy "caretaker_blocked_slots: leitura pública"
  on public.caretaker_blocked_slots for select
  using (true);

create policy "caretaker_blocked_slots: admin gerenciar"
  on public.caretaker_blocked_slots for all
  using (is_admin())
  with check (is_admin());

-- ── Alter appointments: adicionar caretaker_id ───────────────
alter table public.appointments
  add column if not exists caretaker_id uuid references public.caretakers(id) on delete set null;

create index if not exists appointments_caretaker_id_idx
  on public.appointments(caretaker_id);

-- ── View: appointments_full atualizada ───────────────────────
drop view if exists public.appointments_full;

create view public.appointments_full as
  select
    a.id,
    a.status,
    a.scheduled_at,
    a.duration_min,
    a.price_charged,
    a.notes,
    a.internal_notes,
    a.whatsapp_notified,
    a.cancelled_at,
    a.cancellation_reason,
    a.caretaker_id,
    a.created_at,
    a.updated_at,
    p.id          as user_id,
    p.full_name   as user_name,
    p.phone       as user_phone,
    pt.id         as pet_id,
    pt.name       as pet_name,
    pt.species    as pet_species,
    pt.breed      as pet_breed,
    s.id          as service_id,
    s.slug        as service_slug,
    s.name        as service_name,
    s.image_url   as service_image_url,
    c.name        as caretaker_name
  from public.appointments a
  join public.profiles  p  on p.id  = a.user_id
  join public.pets      pt on pt.id = a.pet_id
  join public.services  s  on s.id  = a.service_id
  left join public.caretakers c on c.id = a.caretaker_id;

-- ── Políticas RLS para admins nas tabelas existentes ─────────

-- profiles: admins veem todos
drop policy if exists "profiles: admin view all" on public.profiles;
create policy "profiles: admin view all"
  on public.profiles for select
  using (is_admin());

-- profiles: admins podem atualizar (para gerenciar roles)
drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin update"
  on public.profiles for update
  using (is_admin())
  with check (is_admin());

-- pets: admins veem todos
drop policy if exists "pets: admin view" on public.pets;
create policy "pets: admin view"
  on public.pets for select
  using (is_admin());

-- appointments: admins veem todos
drop policy if exists "appointments: admin view all" on public.appointments;
create policy "appointments: admin view all"
  on public.appointments for select
  using (is_admin());

-- appointments: admins atualizam qualquer agendamento
drop policy if exists "appointments: admin update" on public.appointments;
create policy "appointments: admin update"
  on public.appointments for update
  using (is_admin());

-- appointments: admins criam agendamentos
drop policy if exists "appointments: admin insert" on public.appointments;
create policy "appointments: admin insert"
  on public.appointments for insert
  with check (is_admin());

-- services: admins gerenciam serviços
drop policy if exists "services: admin manage" on public.services;
create policy "services: admin manage"
  on public.services for all
  using (is_admin())
  with check (is_admin());
