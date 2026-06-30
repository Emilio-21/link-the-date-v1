-- Agrega la columna `bank_holder` (titular de la cuenta) a la tabla events.
-- Se muestra en la sección de datos bancarios de la invitación, junto al
-- nombre del banco y la CLABE.
--
-- Correr una sola vez en el SQL editor de Supabase.

alter table public.events
  add column if not exists bank_holder text;
