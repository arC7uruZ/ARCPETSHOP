-- ============================================================
-- ArcPetShop — Supabase Schema
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
create type pet_species as enum ('dog', 'cat', 'bird', 'rabbit', 'other');
create type pet_size as enum ('small', 'medium', 'large', 'extra_large');
create type appointment_status as enum (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

-- ── Updated-at trigger function ───────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── TABLE: profiles ───────────────────────────────────────────
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null,
  phone          text,
  cpf            text unique,
  avatar_url     text,
  address_street text,
  address_city   text,
  address_state  text,
  address_zip    text,
  whatsapp_opt_in boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: users can view own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: users can insert own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: users can update own"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── TABLE: pets ───────────────────────────────────────────────
create table public.pets (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  species      pet_species not null default 'dog',
  breed        text,
  size         pet_size,
  birth_date   date,
  weight_kg    numeric(5, 2),
  color        text,
  notes        text,
  avatar_url   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index pets_owner_id_idx on public.pets(owner_id);

alter table public.pets enable row level security;

create policy "pets: owners can view"   on public.pets for select using (auth.uid() = owner_id);
create policy "pets: owners can insert" on public.pets for insert with check (auth.uid() = owner_id);
create policy "pets: owners can update" on public.pets for update using (auth.uid() = owner_id);
create policy "pets: owners can delete" on public.pets for delete using (auth.uid() = owner_id);

create trigger pets_updated_at
  before update on public.pets
  for each row execute procedure public.set_updated_at();

-- ── TABLE: services ───────────────────────────────────────────
create table public.services (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  name          text not null,
  description   text not null,
  short_desc    text not null,
  price_from    numeric(10, 2) not null,
  duration_min  integer not null,
  image_url     text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index services_slug_idx on public.services(slug);
alter table public.services enable row level security;
create policy "services: public read" on public.services for select using (is_active = true);

create trigger services_updated_at
  before update on public.services
  for each row execute procedure public.set_updated_at();

-- Seed services
insert into public.services (slug, name, description, short_desc, price_from, duration_min, display_order) values
  ('banho-tosa',           'Banho e Tosa',          'Serviço completo de banho e tosa para cães e gatos de todos os portes. Inclui banho com shampoo especializado, secagem, tosa, corte de unhas, limpeza de ouvidos e perfume.',  'Banho completo com tosa e perfume.',       45.00,   90,  1),
  ('consulta-veterinaria', 'Consulta Veterinária',  'Consulta clínica geral com veterinário especializado. Avaliação completa de saúde, diagnóstico e prescrição. Atendemos cães, gatos e pequenos animais.',                        'Avaliação completa com veterinário.',      120.00,  45,  2),
  ('vacinacao',            'Vacinação',             'Aplicação de vacinas essenciais: V8, V10, Antirrábica, Gripe e outras. Realizamos o calendário completo de vacinação com carteirinha atualizada.',                              'Vacinas essenciais com carteirinha.',      80.00,   20,  3),
  ('hospedagem-pet',       'Hospedagem Pet',        'Hotel para pets com acomodações confortáveis, alimentação personalizada, monitoramento 24h e atividades recreativas.',                                                          'Hotel confortável com cuidados 24h.',      80.00,  1440, 4),
  ('adestramento',         'Adestramento',          'Treinamento comportamental positivo para cães. Ensinamos comandos básicos, controle de ansiedade e socialização.',                                                              'Treinamento positivo e socialização.',     150.00,  60,  5),
  ('pet-taxi',             'Pet Taxi',              'Transporte seguro e confortável para seu pet. Buscamos e levamos para consultas, banho ou qualquer destino. Veículo adaptado e motorista treinado.',                            'Transporte seguro de porta a porta.',      35.00,   30,  6);

-- ── TABLE: appointments ───────────────────────────────────────
create table public.appointments (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  pet_id               uuid not null references public.pets(id) on delete restrict,
  service_id           uuid not null references public.services(id) on delete restrict,
  status               appointment_status not null default 'pending',
  scheduled_at         timestamptz not null,
  duration_min         integer not null,
  price_charged        numeric(10, 2),
  notes                text,
  internal_notes       text,
  cancelled_at         timestamptz,
  cancellation_reason  text,
  whatsapp_notified    boolean not null default false,
  notification_sid     text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index appointments_user_id_idx      on public.appointments(user_id);
create index appointments_scheduled_at_idx on public.appointments(scheduled_at);
create index appointments_status_idx       on public.appointments(status);

alter table public.appointments enable row level security;

create policy "appointments: users can view own"   on public.appointments for select using (auth.uid() = user_id);
create policy "appointments: users can create own" on public.appointments for insert with check (auth.uid() = user_id);
create policy "appointments: users can update own pending/confirmed"
  on public.appointments for update
  using (auth.uid() = user_id and status in ('pending', 'confirmed'));

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

-- ── VIEW: appointments_full ───────────────────────────────────
create view public.appointments_full as
  select
    a.id, a.status, a.scheduled_at, a.duration_min, a.price_charged,
    a.notes, a.whatsapp_notified, a.created_at, a.updated_at,
    p.id as user_id, p.full_name as user_name, p.phone as user_phone,
    pt.id as pet_id, pt.name as pet_name, pt.species as pet_species, pt.breed as pet_breed,
    s.id as service_id, s.slug as service_slug, s.name as service_name, s.image_url as service_image_url
  from public.appointments a
  join public.profiles  p  on p.id  = a.user_id
  join public.pets      pt on pt.id = a.pet_id
  join public.services  s  on s.id  = a.service_id;

-- ── Storage Buckets ───────────────────────────────────────────
-- Run in Supabase Dashboard > Storage or via CLI:
-- supabase storage create avatars --public
-- supabase storage create pet-avatars --public
