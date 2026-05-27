# SQL — Soporte para múltiples plantillas

Corre este SQL una sola vez en el **SQL Editor** de Supabase. Es seguro: usa
`IF NOT EXISTS`, no rompe datos existentes y asigna la plantilla clásica
(`plantilla_v1`) a todos los eventos previos.

```sql
-- Agrega la columna template a events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'plantilla_v1';

-- Backfill: cualquier evento existente queda con la plantilla clásica
UPDATE events SET template = 'plantilla_v1' WHERE template IS NULL;

-- Opcional: índice si en algún momento quieres filtrar reportes por plantilla
CREATE INDEX IF NOT EXISTS idx_events_template ON events(template);
```

## Plantillas disponibles

| slug             | nombre   | usar cuando…                                   |
| ---------------- | -------- | ---------------------------------------------- |
| `plantilla_v1`   | Clásica  | Boda con mesas de regalos visibles             |
| `plantilla_dusk` | Dusk     | Otoñal, editorial, sin mesa de regalos         |

Para agregar otra plantilla:

1. Crea el archivo en `app/templates/plantilla_<slug>/Plantilla<Nombre>.jsx`
   con el contrato `({ event, guest, rsvp }) => JSX`.
2. Registra el slug en `lib/templates/index.js`.
3. No necesitas migración: el campo `template` ya acepta cualquier string.
