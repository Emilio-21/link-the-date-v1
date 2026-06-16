// lib/upload/uploadImage.js — subida de imágenes a Supabase Storage
"use client";

import { createClient } from "@/lib/supabase/client";

export const BUCKET = "event-images";
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function extFromMime(mime) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

/**
 * Sube una imagen al bucket público `event-images`.
 *
 * @param {File}   file
 * @param {object} opts
 * @param {string} opts.eventId          ID del evento (parte del path)
 * @param {string} opts.kind             "cover" | "gallery"
 * @param {number} [opts.galleryIndex]   índice para galería (0-5)
 * @returns {Promise<{url:string, path:string}>}
 */
export async function uploadEventImage(file, { eventId, kind, galleryIndex }) {
  if (!file) throw new Error("No se eligió archivo.");
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Formato no soportado. Usa JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`La imagen pesa más de 5 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
  }
  if (!eventId) throw new Error("Falta event_id.");

  const supabase = createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error("No hay sesión activa.");

  const ext = extFromMime(file.type);
  const ts = Date.now();
  const slot = kind === "gallery" ? `gallery-${galleryIndex ?? 0}` : "cover";
  // Path: {user_id}/{event_id}/{slot}-{timestamp}.{ext}
  // El primer segmento (user_id) es lo que las políticas RLS verifican.
  const path = `${user.id}/${eventId}/${slot}-${ts}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}

/**
 * Borra una imagen del bucket, recibiendo la URL pública.
 * Si la URL no es del bucket, no hace nada.
 */
export async function deleteEventImageByUrl(url) {
  if (!url) return;
  const supabase = createClient();
  // Extraer el path interno: .../storage/v1/object/public/event-images/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
