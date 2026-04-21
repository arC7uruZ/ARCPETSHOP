-- ─── RBAC: Permissions / Roles / Role-Permissions / User-Roles ──────────────
--
-- Lógica de acesso:
--   root_admin → acesso total, sem checar tabelas
--   admin      → acesso total, EXCETO gerenciar usuários com role admin/root_admin
--   caretaker  → apenas as permissões explícitas em role_permissions
--   customer   → sem acesso ao painel admin

-- ─── Tabela de permissões ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.permissions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz DEFAULT now()
);

-- ─── Tabela de roles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roles (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  description text,
  is_system   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─── Relacionamento role <-> permission (M:M) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ─── Relacionamento user <-> role (M:M) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id     uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- ─── Seed: permissões disponíveis ────────────────────────────────────────────
-- admin e root_admin não precisam de entradas aqui — a lógica de acesso
-- deles é tratada no servidor (bypass por role).
-- As permissões abaixo são usadas principalmente para caretakers e
-- para exibição na interface de gerenciamento de roles.
INSERT INTO public.permissions (name, description) VALUES
  ('dashboard:read',        'Ver o painel de controle'),
  ('appointments:read',     'Ver os próprios agendamentos'),
  ('appointments:read:all', 'Ver todos os agendamentos'),
  ('appointments:write',    'Atualizar status e notas de agendamentos'),
  ('caretakers:read',       'Ver lista de cuidadores'),
  ('caretakers:write',      'Gerenciar cuidadores e horários'),
  ('users:read',            'Ver lista de usuários'),
  ('users:write',           'Associar roles a clientes e cuidadores'),
  ('services:read',         'Ver serviços'),
  ('services:write',        'Gerenciar serviços'),
  ('stats:read',            'Ver estatísticas do painel')
ON CONFLICT (name) DO NOTHING;

-- ─── Seed: roles do sistema ───────────────────────────────────────────────────
INSERT INTO public.roles (name, description, is_system) VALUES
  ('customer',   'Cliente comum',        true),
  ('caretaker',  'Cuidador de animais',  true),
  ('admin',      'Administrador',        true),
  ('root_admin', 'Super administrador',  true)
ON CONFLICT (name) DO NOTHING;

-- ─── Seed: caretaker — permissões explícitas ─────────────────────────────────
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'caretaker'
  AND p.name IN ('dashboard:read', 'appointments:read')
ON CONFLICT DO NOTHING;

-- ─── Migrar usuários existentes para user_roles ───────────────────────────────
INSERT INTO public.user_roles (user_id, role_id)
SELECT p.id, r.id
FROM public.profiles p
JOIN public.roles r ON r.name = p.role::text
ON CONFLICT DO NOTHING;

-- ─── Trigger: sincroniza profiles.role -> user_roles ─────────────────────────
CREATE OR REPLACE FUNCTION sync_profile_role_to_user_roles()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    DELETE FROM public.user_roles ur
    WHERE ur.user_id = NEW.id
      AND ur.role_id IN (SELECT id FROM public.roles WHERE is_system = true);

    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id FROM public.roles r WHERE r.name = NEW.role::text
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION sync_profile_role_to_user_roles();

-- ─── Função: retorna permissões explícitas de um usuário ─────────────────────
-- Atenção: admin e root_admin têm bypass no servidor — esta função
-- é relevante principalmente para caretakers e roles customizadas.
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid)
RETURNS TABLE(name text) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pm.name
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  JOIN public.permissions pm ON pm.id = rp.permission_id
  WHERE ur.user_id = p_user_id;
END;
$$;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.permissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles       ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado lê permissões e roles (para exibição na UI)
CREATE POLICY "permissions_select" ON public.permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "roles_select" ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "role_permissions_select" ON public.role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins gerenciam role_permissions (mas não podem criar novas permissões core)
CREATE POLICY "role_permissions_admin_write" ON public.role_permissions
  FOR ALL USING (is_admin());

-- user_roles: usuário vê as próprias; admins veem todas
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- Admins inserem/removem roles de usuários não-admin; root_admin faz tudo
-- A restrição "não gerenciar admins" é aplicada no servidor TypeScript
CREATE POLICY "user_roles_insert" ON public.user_roles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "user_roles_delete" ON public.user_roles
  FOR DELETE USING (is_admin());
