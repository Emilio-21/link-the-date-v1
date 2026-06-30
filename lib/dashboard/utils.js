// lib/dashboard/utils.js — utilidades puras del dashboard

const DIACRITICS = /[̀-ͯ]/g;
const NON_ALNUM = /[^a-z0-9]+/g;
const EDGE_DASHES = /(^-|-$)+/g;

function baseSlug(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(NON_ALNUM, "-")
    .replace(EDGE_DASHES, "");
}

export function slugify(str) {
  return baseSlug(str).slice(0, 60);
}

export function slugifyName(str) {
  return baseSlug(str);
}

// Idioma del evento -> locale para formatear fechas. Default español (es-MX).
export function localeOf(event, fallback = "es-MX") {
  const lang = (event?.language || "").toLowerCase();
  if (lang.startsWith("en")) return "en-US";
  if (lang.startsWith("es")) return "es-MX";
  return fallback;
}

export function fmtDate(s, locale = "es-MX") {
  try {
    if (!s) return "";
    return new Date(`${s}T00:00:00`).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

export function fmtDateTime(s, locale = "es-MX") {
  try {
    if (!s) return "";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Formatea una fecha DATE (YYYY-MM-DD): "1 de noviembre de 2026" / "November 1, 2026".
export function fmtDeadline(s, locale = "es-MX") {
  try {
    if (!s) return "";
    return new Date(`${s}T00:00:00`).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// Línea de "límite para confirmar" que se muestra en la invitación.
// - La fecha se formatea según el idioma del evento (localeOf).
// - Si el evento tiene `rsvp_deadline_label`, se usa esa frase (otro idioma/otra
//   frase). Si contiene el token {fecha}, se reemplaza por la fecha; si no, la
//   fecha se añade al final cuando existe.
// - Sin frase personalizada, se usa la frase por defecto según el idioma:
//   `defaults` puede ser un string o un objeto { es, en }.
// Devuelve null si no hay nada que mostrar.
export function rsvpDeadlineText(event, defaults = {}) {
  const locale = localeOf(event);
  const date = fmtDeadline(event?.rsvp_deadline, locale);
  const label = (event?.rsvp_deadline_label || "").trim();
  if (label) {
    if (label.includes("{fecha}")) {
      return label.replace(/\{fecha\}/g, date).replace(/\s+/g, " ").trim();
    }
    return date ? `${label} ${date}` : label;
  }
  if (!date) return null;
  const lead =
    typeof defaults === "string"
      ? defaults
      : locale === "en-US"
      ? defaults.en || "Please RSVP by"
      : defaults.es || "Confirma tu asistencia antes del";
  return `${lead} ${date}`;
}

export async function safeJson(res) {
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text), text };
  } catch {
    return { ok: res.ok, status: res.status, json: null, text };
  }
}

// ── Fecha/hora como "hora de pared" (sin zona horaria) ────────────────────
// La invitación maneja la fecha y hora del evento como un valor FIJO: la hora
// que el anfitrión escribe es la que se ve, igual para todos, sin convertirse
// a la zona horaria de quien abre la invitación. Para lograrlo nunca pasamos
// el valor por `new Date(iso)` (que reinterpreta según la zona del visitante);
// leemos siempre los componentes literales del string.

// Extrae { y, mo, d, h, mi } de un string de fecha/hora, ignorando cualquier
// offset o "Z" que traiga (lo tratamos como hora de pared).
export function wallClockParts(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] };
}

const pad2 = (n) => String(n).padStart(2, "0");

// ISO "naive" (sin zona) del evento para el countdown y la hora.
// Usa event_datetime si existe; si no, event_date con hora por defecto 17:00.
// Al ser naive, `new Date(iso)` lo interpreta como hora local del visitante,
// de modo que la cuenta regresiva apunta a esa misma hora de pared.
export function wallClockISO(event, defaultHour = 17) {
  const p = wallClockParts(event?.event_datetime);
  if (p) return `${p.y}-${pad2(p.mo)}-${pad2(p.d)}T${pad2(p.h)}:${pad2(p.mi)}:00`;
  const md = String(event?.event_date || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  if (md) return `${md[1]}-${md[2]}-${md[3]}T${pad2(defaultHour)}:00:00`;
  return null;
}

// Hora del evento como texto ("5:00 pm" / "17:00") desde la hora de pared.
export function eventTimeText(event, { hour12 = true } = {}) {
  const p = wallClockParts(event?.event_datetime);
  if (!p) return { time: "", ampm: "" };
  let h = p.h;
  const ampm = h >= 12 ? "pm" : "am";
  if (hour12) h = h % 12 || 12;
  const time = p.mi === 0 ? String(h) : `${h}:${pad2(p.mi)}`;
  return { time, ampm };
}

// Guarda la fecha/hora del form como string naive (hora de pared), sin convertir
// a UTC. Entrada: "YYYY-MM-DDTHH:mm" del <input type="datetime-local">.
export function toIsoOrNull(d) {
  if (!d) return null;
  const m = String(d).match(/(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}:00` : null;
}

// Extrae la parte de fecha (YYYY-MM-DD) de forma literal, sin tocar la zona.
export function dateOnly(d) {
  if (!d) return null;
  const m = String(d).match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// Convierte el valor guardado a formato de <input type="datetime-local">,
// leyendo los componentes literales (sin conversión de zona horaria).
export function isoToDateTimeLocal(iso) {
  const p = wallClockParts(iso);
  return p ? `${p.y}-${pad2(p.mo)}-${pad2(p.d)}T${pad2(p.h)}:${pad2(p.mi)}` : "";
}

// Columnas del evento que se piden a Supabase desde el cliente
export const EVENT_COLUMNS =
  "id,org_id,name,event_date,event_datetime,slug,description,location," +
  "venue_name,location_url,gift_url_1,gift_url_2,bank_account," +
  "couple_name,main_message,dress_code_text,kids_policy_text," +
  "gift_label_1,gift_label_2,gifts_message,bank_name,bank_holder," +
  "show_dress_code,show_kids_policy,show_gifts,show_bank,show_table,template," +
  "cover_url,gallery_urls,rsvp_deadline,rsvp_deadline_label,language,customization,created_at";
