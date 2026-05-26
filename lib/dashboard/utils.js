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

export function fmtDate(s) {
  try {
    if (!s) return "";
    return new Date(`${s}T00:00:00`).toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

export function fmtDateTime(s) {
  try {
    if (!s) return "";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-MX", {
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
  "gift_label_1,gift_label_2,bank_name," +
  "show_dress_code,show_kids_policy,show_gifts,show_bank,created_at";
