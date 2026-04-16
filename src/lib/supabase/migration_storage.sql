-- ── Storage Buckets para Avatars ──────────────────────────────────────────
-- Execute este script no Supabase Dashboard > SQL Editor

-- Bucket público para fotos de perfil de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Bucket público para fotos dos pets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-avatars',
  'pet-avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ── Policies para avatars ─────────────────────────────────────────────────
-- Leitura pública (qualquer um pode ver as fotos)
CREATE POLICY "Avatars são públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Upload: apenas o próprio usuário pode enviar/atualizar sua foto
-- O path é: {userId}/{timestamp}.{ext} — o primeiro segmento é o userId
CREATE POLICY "Usuário faz upload do próprio avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuário atualiza o próprio avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Policies para pet-avatars ─────────────────────────────────────────────
-- O path é: {ownerId}/{petId}/{timestamp}.{ext}
CREATE POLICY "Pet-avatars são públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-avatars');

CREATE POLICY "Usuário faz upload de avatar do pet" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuário atualiza avatar do pet" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
