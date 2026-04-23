-- ============================================================
-- ArcPetShop — Store Migration
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Enums ─────────────────────────────────────────────────────
create type order_status as enum (
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- ── TABLE: product_categories ─────────────────────────────────
create table public.product_categories (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  name         text not null,
  description  text,
  display_order integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.product_categories enable row level security;
create policy "product_categories: public read"
  on public.product_categories for select using (is_active = true);

-- ── TABLE: products ────────────────────────────────────────────
create table public.products (
  id                uuid primary key default uuid_generate_v4(),
  category_id       uuid references public.product_categories(id) on delete set null,
  sku               text unique,
  name              text not null,
  brand             text not null,
  description       text not null,
  short_description text,
  price             numeric(10, 2) not null,
  original_price    numeric(10, 2),
  stock_quantity    integer not null default 0,
  image_url         text,
  images            text[] not null default '{}',
  tag               text,
  is_active         boolean not null default true,
  display_order     integer not null default 0,
  rating            numeric(3, 1) not null default 0,
  review_count      integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index products_is_active_idx   on public.products(is_active);

alter table public.products enable row level security;
create policy "products: public read"
  on public.products for select using (is_active = true);
create policy "products: admins can manage"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'root_admin')
    )
  );

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ── TABLE: orders ──────────────────────────────────────────────
create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete restrict,
  status           order_status not null default 'pending_payment',
  subtotal         numeric(10, 2) not null,
  shipping         numeric(10, 2) not null default 0,
  total            numeric(10, 2) not null,
  shipping_name    text,
  shipping_address text,
  shipping_city    text,
  shipping_state   text,
  shipping_zip     text,
  mp_payment_id    text,
  mp_status        text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx  on public.orders(status);

alter table public.orders enable row level security;
create policy "orders: users can view own"
  on public.orders for select using (auth.uid() = user_id);
create policy "orders: users can insert own"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "orders: admins can manage"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'root_admin')
    )
  );

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ── TABLE: order_items ─────────────────────────────────────────
create table public.order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_brand text not null,
  unit_price    numeric(10, 2) not null,
  quantity      integer not null,
  subtotal      numeric(10, 2) not null,
  created_at    timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;
create policy "order_items: users can view own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );
create policy "order_items: users can insert own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );
create policy "order_items: admins can manage"
  on public.order_items for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'root_admin')
    )
  );

-- ── TABLE: payments ────────────────────────────────────────────
create table public.payments (
  id                   uuid primary key default uuid_generate_v4(),
  order_id             uuid not null references public.orders(id) on delete cascade,
  mp_payment_id        text not null,
  mp_status            text not null,
  mp_status_detail     text,
  mp_payment_method    text,
  mp_payment_type      text,
  pix_qr_code          text,
  pix_qr_code_base64   text,
  pix_expiration_date  text,
  boleto_url           text,
  boleto_barcode       text,
  raw_response         jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index payments_order_id_idx     on public.payments(order_id);
create index payments_mp_payment_id_idx on public.payments(mp_payment_id);

alter table public.payments enable row level security;
create policy "payments: users can view own"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );
create policy "payments: admins can manage"
  on public.payments for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'root_admin')
    )
  );

create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

-- ── Seed: Categories ───────────────────────────────────────────
insert into public.product_categories (id, slug, name, display_order) values
  ('10000000-0000-0000-0000-000000000001', 'alimentacao', 'Alimentação', 1),
  ('10000000-0000-0000-0000-000000000002', 'higiene',     'Higiene & Beleza', 2),
  ('10000000-0000-0000-0000-000000000003', 'brinquedos',  'Brinquedos', 3),
  ('10000000-0000-0000-0000-000000000004', 'acessorios',  'Acessórios', 4),
  ('10000000-0000-0000-0000-000000000005', 'saude',       'Saúde', 5);

-- ── Seed: Products ─────────────────────────────────────────────
insert into public.products (id, category_id, name, brand, description, price, original_price, rating, review_count, tag, stock_quantity, display_order) values
  -- Alimentação
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Ração Premium Adulto Frango', 'Royal Canin',
   'Fórmula balanceada para cães adultos de porte médio. Rico em proteínas e vitaminas.',
   189.90, 229.90, 4.8, 312, 'Oferta', 50, 1),

  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Ração Gatos Castrados', 'Hills Science',
   'Desenvolvida para gatos castrados, controla o peso e protege o trato urinário.',
   149.90, null, 4.7, 198, null, 40, 2),

  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'Petisco Natural Carne Seca', 'Biofresh',
   'Petisco 100% natural, sem conservantes. Ideal para recompensa e adestramento.',
   34.90, null, 4.9, 87, 'Novo', 100, 3),

  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   'Sachê Úmido para Gatos', 'Whiskas',
   'Sachê com molho saboroso de atum. Complemento alimentar rico em nutrientes.',
   4.90, null, 4.5, 543, null, 200, 4),

  -- Higiene & Beleza
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002',
   'Shampoo Hidratante para Cães', 'PetSmell',
   'Fórmula suave com óleos naturais. Deixa o pelo macio, brilhante e perfumado por dias.',
   42.90, 55.00, 4.6, 156, 'Oferta', 60, 5),

  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002',
   'Condicionador Pelo Longo', 'PetSmell',
   'Desembaraça e hidrata pelos longos. Facilita a escovação e evita nós.',
   38.90, null, 4.5, 89, null, 45, 6),

  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002',
   'Escova Removedora de Pelo', 'FurFree',
   'Remove pelo solto com facilidade. Ergonômica e adequada para todos os tamanhos de pet.',
   59.90, null, 4.8, 204, null, 35, 7),

  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002',
   'Kit Higiene Dental Pets', 'OralPet',
   'Kit com escova e pasta dental sabor carne. Previne tártaro e mau hálito.',
   29.90, null, 4.4, 67, 'Novo', 80, 8),

  -- Brinquedos
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003',
   'Bola Interativa Anti-Tédio', 'PlayPet',
   'Bola que libera petiscos ao rolar. Estimula o instinto natural e combate o sedentarismo.',
   49.90, null, 4.7, 132, null, 70, 9),

  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003',
   'Arranhador para Gatos c/ Sisal', 'KittyCat',
   'Torre arranhadora com sisal natural e plataformas. Preserva seus móveis.',
   89.90, 110.00, 4.6, 78, 'Oferta', 25, 10),

  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003',
   'Corda de Puxar para Cães', 'TugPlay',
   'Corda resistente de algodão trançado. Fortalece dentes e distrai por horas.',
   24.90, null, 4.5, 91, null, 90, 11),

  -- Acessórios
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004',
   'Coleira Antipulgas Refletiva', 'SafePet',
   'Coleira com tecnologia antipulgas e faixa refletiva para passeios noturnos seguros.',
   79.90, null, 4.8, 267, null, 55, 12),

  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004',
   'Cama Ortopédica M', 'SleepyPet',
   'Espuma viscoelástica de alta densidade. Alivia articulações e proporciona sono profundo.',
   139.90, 179.90, 4.9, 183, 'Oferta', 20, 13),

  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004',
   'Mochila Transportadora Pet', 'TravelPaw',
   'Mochila ventilada com visor panorâmico. Aprovada por companhias aéreas.',
   169.90, null, 4.7, 112, 'Novo', 30, 14),

  -- Saúde
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005',
   'Suplemento Articular Omega 3', 'VetPlus',
   'Rico em EPA e DHA. Melhora a mobilidade articular e o brilho do pelo.',
   64.90, null, 4.7, 145, null, 60, 15),

  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005',
   'Antipulgas Spot-On 3 doses', 'Frontline',
   'Proteção por até 3 meses contra pulgas, carrapatos e mosquitos.',
   119.90, null, 4.9, 398, null, 75, 16);
