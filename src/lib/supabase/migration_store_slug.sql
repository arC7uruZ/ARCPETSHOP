-- ============================================================
-- ArcPetShop — Add slug to products
-- Run AFTER migration_store.sql
-- ============================================================

-- Adiciona coluna slug (nullable primeiro para poder popular)
alter table public.products
  add column if not exists slug text;

-- Popula slugs dos produtos semeados
update public.products set slug = 'racao-premium-adulto-frango'    where id = '20000000-0000-0000-0000-000000000001';
update public.products set slug = 'racao-gatos-castrados'          where id = '20000000-0000-0000-0000-000000000002';
update public.products set slug = 'petisco-natural-carne-seca'     where id = '20000000-0000-0000-0000-000000000003';
update public.products set slug = 'sache-umido-para-gatos'         where id = '20000000-0000-0000-0000-000000000004';
update public.products set slug = 'shampoo-hidratante-caes'        where id = '20000000-0000-0000-0000-000000000005';
update public.products set slug = 'condicionador-pelo-longo'       where id = '20000000-0000-0000-0000-000000000006';
update public.products set slug = 'escova-removedora-de-pelo'      where id = '20000000-0000-0000-0000-000000000007';
update public.products set slug = 'kit-higiene-dental-pets'        where id = '20000000-0000-0000-0000-000000000008';
update public.products set slug = 'bola-interativa-anti-tedio'     where id = '20000000-0000-0000-0000-000000000009';
update public.products set slug = 'arranhador-gatos-sisal'         where id = '20000000-0000-0000-0000-000000000010';
update public.products set slug = 'corda-de-puxar-caes'            where id = '20000000-0000-0000-0000-000000000011';
update public.products set slug = 'coleira-antipulgas-refletiva'   where id = '20000000-0000-0000-0000-000000000012';
update public.products set slug = 'cama-ortopedica-m'              where id = '20000000-0000-0000-0000-000000000013';
update public.products set slug = 'mochila-transportadora-pet'     where id = '20000000-0000-0000-0000-000000000014';
update public.products set slug = 'suplemento-articular-omega-3'   where id = '20000000-0000-0000-0000-000000000015';
update public.products set slug = 'antipulgas-spot-on-3-doses'     where id = '20000000-0000-0000-0000-000000000016';

-- Torna not null e unique após popular
alter table public.products
  alter column slug set not null;

create unique index if not exists products_slug_idx on public.products(slug);
