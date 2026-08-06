-- Habilita o S3 Storage para a tabela de objects e cria os buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'receipts', 
  'receipts', 
  false, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==========================================
-- RLS para Avatars (Público para leitura)
-- ==========================================
DROP POLICY IF EXISTS "Avatars são públicos para leitura" ON storage.objects;
CREATE POLICY "Avatars são públicos para leitura" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários podem fazer upload do próprio avatar" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload do próprio avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Usuários podem atualizar o próprio avatar" ON storage.objects;
CREATE POLICY "Usuários podem atualizar o próprio avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Usuários podem deletar o próprio avatar" ON storage.objects;
CREATE POLICY "Usuários podem deletar o próprio avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ==========================================
-- RLS para Receipts (Privado)
-- ==========================================
DROP POLICY IF EXISTS "Usuários podem ver os próprios receipts" ON storage.objects;
CREATE POLICY "Usuários podem ver os próprios receipts" ON storage.objects FOR SELECT USING (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Usuários podem fazer upload de receipts" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de receipts" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Usuários podem atualizar os próprios receipts" ON storage.objects;
CREATE POLICY "Usuários podem atualizar os próprios receipts" ON storage.objects FOR UPDATE USING (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Usuários podem deletar os próprios receipts" ON storage.objects;
CREATE POLICY "Usuários podem deletar os próprios receipts" ON storage.objects FOR DELETE USING (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ==========================================
-- Trigger para Arquivos Órfãos (Receipts)
-- ==========================================
-- Assume que futuramente a tabela transactions terá a coluna receipt_url com o caminho do storage ('user_id/file_name.ext')
CREATE OR REPLACE FUNCTION delete_receipt_on_transaction_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verifica se a transação possui um comprovante vinculado
    -- Ajuste o nome da coluna (receipt_url) conforme a modelagem final
    IF OLD.receipt_url IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'receipts' 
          AND name = OLD.receipt_url;
    END IF;
    RETURN OLD;
EXCEPTION
    WHEN undefined_column THEN
        -- Ignora silenciosamente se a coluna receipt_url ainda não existir
        RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_delete_receipt ON transactions;
CREATE TRIGGER tr_delete_receipt
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION delete_receipt_on_transaction_delete();
