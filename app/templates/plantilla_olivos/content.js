// app/templates/plantilla_olivos/content.js
// Registro de textos editables ("slots") de la plantilla Olivos.
//
// Cada slot describe un texto de la invitación que el anfitrión puede
// personalizar desde el dashboard, tanto en su CONTENIDO como en su FUENTE.
//
// Campos de cada slot:
//   key       Identificador único. Se usa como clave en la columna JSON
//             `customization` del evento. NO cambiar una vez en uso.
//   section   Sección visible a la que pertenece (para agrupar en el form).
//   label     Etiqueta que ve el anfitrión en el dashboard.
//   default   Texto por defecto (si no se personaliza).
//   font      Clave de fuente por defecto (ver lib/templates/fonts.js).
//   multiline true si el texto admite varias líneas (textarea).
//   textEditable=false  → el contenido viene de otro campo del evento
//             (nombre de novios, invitado, mensaje principal, etc.);
//             aquí sólo se personaliza la FUENTE.
//
// Las secciones se listan en SECTIONS en el orden en que aparecen en la
// invitación, para que el formulario respete ese orden.

export const OLIVOS_SECTIONS = [
  "Sobre (intro)",
  "Portada",
  "Saludo",
  "Cuenta regresiva",
  "Celebración",
  "Vestimenta",
  "Mesa de regalos",
  "Galería",
  "Confirmación (RSVP)",
];

export const OLIVOS_SLOTS = [
  // ── Sobre (intro con sello de cera) ──────────────────────────────────
  { key: "envelope_seal", section: "Sobre (intro)", label: "Texto del sello (vacío = iniciales automáticas)", default: "", font: "cormorant" },
  { key: "envelope_hint", section: "Sobre (intro)", label: "Indicación bajo el sello", default: "Toca el sello para abrir", font: "playfair" },

  // ── Portada ──────────────────────────────────────────────────────────
  { key: "cover_intro",   section: "Portada", label: "Frase de invitación", default: "Tienen el honor de acompañarnos\nen la boda de", font: "playfair", multiline: true },
  { key: "couple_name",   section: "Portada", label: "Nombres de los novios (fuente)", font: "pinyon", textEditable: false },
  { key: "cover_date",    section: "Portada", label: "Fecha en portada (fuente)", font: "playfair", textEditable: false },
  { key: "cover_time",    section: "Portada", label: "Hora en portada (fuente)", font: "playfair", textEditable: false },
  { key: "cover_venue",   section: "Portada", label: "Lugar en portada (fuente)", font: "specialElite", textEditable: false },

  // ── Saludo ───────────────────────────────────────────────────────────
  { key: "greeting_intro", section: "Saludo", label: "Antetítulo del saludo", default: "Con todo nuestro cariño,", font: "playfair" },
  { key: "guest_name",     section: "Saludo", label: "Nombre del invitado (fuente)", font: "pinyon", textEditable: false },
  { key: "main_message",   section: "Saludo", label: "Mensaje principal (fuente)", font: "specialElite", textEditable: false },
  { key: "passes_text",    section: "Saludo", label: "Frase de lugares reservados (usa {n} para el número)", default: "Se han reservado {n} lugares especialmente para ustedes", font: "specialElite", multiline: true },

  // ── Cuenta regresiva ─────────────────────────────────────────────────
  { key: "countdown_script", section: "Cuenta regresiva", label: "Frase caligráfica", default: "Falta muy poco", font: "pinyon" },
  { key: "countdown_label",  section: "Cuenta regresiva", label: "Subtítulo", default: "Cuenta regresiva", font: "playfair" },

  // ── Celebración / ubicación ──────────────────────────────────────────
  { key: "venue_script", section: "Celebración", label: "Título · 1ª palabra (cursiva, corta)", default: "La", font: "pinyon" },
  { key: "venue_title",  section: "Celebración", label: "Título · 2ª palabra (mayúsculas)", default: "Celebración", font: "playfair" },
  { key: "venue_text",   section: "Celebración", label: "Texto de la sección", default: "La ceremonia y la fiesta serán en el mismo lugar. Aquí abajo les compartimos la ubicación.", font: "specialElite", multiline: true },
  { key: "venue_button", section: "Celebración", label: "Texto del botón de mapa", default: "Cómo llegar", font: "playfair" },

  // ── Vestimenta ───────────────────────────────────────────────────────
  { key: "dress_script", section: "Vestimenta", label: "Título · 1ª palabra (cursiva, corta)", default: "¿Qué", font: "pinyon" },
  { key: "dress_title",  section: "Vestimenta", label: "Título · 2ª palabra (mayúsculas)", default: "me pongo?", font: "playfair" },
  { key: "dress_text",   section: "Vestimenta", label: "Texto de la sección", default: "Inspírate en nuestra paleta de tonos suaves. Reservamos el blanco para la novia.", font: "specialElite", multiline: true },
  { key: "dress_value",  section: "Vestimenta", label: "Código de vestimenta (fuente)", font: "playfair", textEditable: false },

  // ── Mesa de regalos ──────────────────────────────────────────────────
  { key: "gifts_script", section: "Mesa de regalos", label: "Título · 1ª palabra (cursiva, corta)", default: "Mesa de", font: "pinyon" },
  { key: "gifts_title",  section: "Mesa de regalos", label: "Título · 2ª palabra (mayúsculas)", default: "Regalos", font: "playfair" },
  { key: "gifts_link",   section: "Mesa de regalos", label: "Texto del enlace de cada mesa", default: "Ver lista →", font: "playfair" },

  // ── Galería ──────────────────────────────────────────────────────────
  { key: "gallery_script", section: "Galería", label: "Título · 1ª palabra (cursiva, corta)", default: "Nuestra", font: "pinyon" },
  { key: "gallery_title",  section: "Galería", label: "Título · 2ª palabra (mayúsculas)", default: "Historia", font: "playfair" },

  // ── RSVP ─────────────────────────────────────────────────────────────
  { key: "rsvp_title",    section: "Confirmación (RSVP)", label: "Título caligráfico", default: "¿Nos acompañas?", font: "pinyon" },
  { key: "rsvp_question", section: "Confirmación (RSVP)", label: "Pregunta de asistencia", default: "¿Asistirás?", font: "playfair" },
  { key: "rsvp_yes",      section: "Confirmación (RSVP)", label: "Botón — sí asistiré", default: "Sí, asistiré", font: "playfair" },
  { key: "rsvp_no",       section: "Confirmación (RSVP)", label: "Botón — no podré", default: "No podré", font: "playfair" },
  { key: "rsvp_count",    section: "Confirmación (RSVP)", label: "Pregunta — cuántos asistirán", default: "¿Cuántos asistirán?", font: "playfair" },
  { key: "rsvp_submit",   section: "Confirmación (RSVP)", label: "Botón — enviar confirmación", default: "Enviar confirmación", font: "playfair" },
  { key: "rsvp_confirmed_yes", section: "Confirmación (RSVP)", label: "Mensaje al confirmar asistencia", default: "¡Qué alegría! Los esperamos para celebrar este día tan especial.", font: "specialElite", multiline: true },
  { key: "rsvp_confirmed_no",  section: "Confirmación (RSVP)", label: "Mensaje al declinar asistencia", default: "Lamentamos que no puedas acompañarnos. Te tendremos presente.", font: "specialElite", multiline: true },
];

// Mapa key → slot, para acceso rápido desde la plantilla.
export const OLIVOS_SLOT_MAP = Object.fromEntries(OLIVOS_SLOTS.map((s) => [s.key, s]));
