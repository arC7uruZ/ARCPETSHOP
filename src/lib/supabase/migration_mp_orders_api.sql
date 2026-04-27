-- ============================================================
-- ArcPetShop — MP Orders API Migration
-- Renames mp_payment_id → mp_order_id on the orders table.
-- The payments table keeps mp_payment_id (unchanged).
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.orders
  rename column mp_payment_id to mp_order_id;

-- Replace old index with one that reflects the new column name
drop index if exists public.orders_mp_payment_id_idx;
create index if not exists orders_mp_order_idx on public.orders(mp_order_id);
