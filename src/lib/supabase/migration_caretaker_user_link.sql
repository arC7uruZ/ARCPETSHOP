-- ============================================================
-- ArcPetShop — Migration: Vincular cuidador a perfil de usuário
-- Execute no: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Adicionar valor 'caretaker' ao enum user_role ────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'caretaker';

-- ── Adicionar coluna user_id em caretakers ───────────────────
ALTER TABLE public.caretakers
  ADD COLUMN IF NOT EXISTS user_id uuid unique references public.profiles(id) on delete set null;

CREATE INDEX IF NOT EXISTS caretakers_user_id_idx ON public.caretakers(user_id);

-- ── Atualizar is_admin para não incluir caretaker ────────────
-- (já está correto — caretaker não está incluso em 'admin'/'root_admin')

-- ── Política: cuidador pode ver sua própria entrada ──────────
DROP POLICY IF EXISTS "caretakers: own self view" ON public.caretakers;
CREATE POLICY "caretakers: own self view"
  ON public.caretakers FOR SELECT
  USING (user_id = auth.uid());
