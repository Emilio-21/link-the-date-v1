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

export function toIsoOrNull(d) {
  if (!d) return null;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x.toISOString();
}

export function dateOnly(d) {
  if (!d) return null;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x.toISOString().slice(0, 10);
}

// Convierte un ISO a valor compatible con <input type="datetime-local">
// usando la zona horaria de México (donde corre el evento).
export function isoToDateTimeLocal(iso, timeZone = "America/Mexico_City") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("sv-SE", { timeZone }).replace(" ", "T").slice(0, 16);
}

// Columnas del evento que se piden a Supabase desde el cliente
export const EVENT_COLUMNS =
  "id,org_id,name,event_date,event_datetime,slug,description,location," +
  "venue_name,location_url,gift_url_1,gift_url_2,bank_account," +
  "couple_name,main_message,dress_code_text,kids_policy_text," +
  "gift_label_1,gift_label_2,gifts_message,bank_name," +
  "show_dress_code,show_kids_policy,show_gifts,show_bank,show_table,template," +
  "cover_url,gallery_urls,rsvp_deadline,rsvp_deadline_label,language,customization,created_at";
