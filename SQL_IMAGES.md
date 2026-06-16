# SQL — Subida de imágenes

Habilita la foto principal + galería de hasta 6 imágenes por evento. Corre este
SQL una sola vez en **SQL Editor** de Supabase. Es seguro y backwards-compatible.

## 1. Columnas en `events`

```sql
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS cover_url     TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls  TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gifts_message TEXT;
```

## 2. Bucket público en Storage

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,                              -- lectura pública (invitaciones)
  5242880,                           -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
```

## 3. Políticas RLS sobre `storage.objects`

Las imágenes se guardan en el path `{user_id}/{...}/archivo.jpg`, de modo que
cada usuario solo puede tocar su propia carpeta.

```sql
-- Lectura pública (invitaciones se ven sin login)
DROP POLICY IF EXISTS "event_images_read" ON storage.objects;
CREATE POLICY "event_images_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

-- INSERT: solo en tu propia carpeta {auth.uid()}/...
DROP POLICY IF EXISTS "event_images_insert" ON storage.objects;
CREATE POLICY "event_images_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: solo en tu propia carpeta
DROP POLICY IF EXISTS "event_images_update" ON storage.objects;
CREATE POLICY "event_images_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: solo en tu propia carpeta
DROP POLICY IF EXISTS "event_images_delete" ON storage.objects;
CREATE POLICY "event_images_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Verificación

1. **Storage** en el menú lateral → debe aparecer el bucket `event-images` con badge "Public"
2. **Authentication → Policies** → en `storage.objects` deberías ver las 4 políticas `event_images_*`
3. En el dashboard de la app, edita un evento — verás la sección "Foto principal" y "Galería"
