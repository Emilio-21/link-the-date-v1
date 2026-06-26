-- Agrega la columna `customization` a la tabla events.
-- Guarda los overrides de texto y tipografía por sección de cada invitación:
--   { "<slotKey>": { "text": "...", "font": "playfair" }, ... }
-- Es opcional: si está vacío, la plantilla usa sus textos/fuentes por defecto.
--
-- Correr una sola vez en el SQL editor de Supabase.

alter table public.events
  add column if not exists customization jsonb not null default '{}'::jsonb;
