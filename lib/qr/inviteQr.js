// lib/qr/inviteQr.js — construcción del enlace de invitado y su QR.
//
// El QR codifica exactamente el mismo enlace que el botón "Copiar" del
// dashboard, para que apunten siempre al mismo sitio.
"use client";

import QRCode from "qrcode";
import { slugifyName } from "@/lib/dashboard/utils";

// Enlace personal del invitado. Mismo formato que copyGuestLink().
export function inviteUrl(guest, origin) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  if (!guest?.token) return "";
  return `${base}/i/${guest.token}/${slugifyName(guest?.name || "invitado")}`;
}

// Opciones comunes. Nivel de corrección "M": aguanta un recorte o una mancha
// sin volver el código tan denso que se pierda al imprimirlo pequeño.
const OPTS = { errorCorrectionLevel: "M", margin: 0 };

// QR como SVG en línea (vectorial: nítido a cualquier tamaño de impresión).
export function qrSvg(url) {
  return QRCode.toString(url, { ...OPTS, type: "svg" });
}

// QR como PNG en data URI, para descargar uno suelto.
export function qrPngDataUrl(url, width = 1024) {
  return QRCode.toDataURL(url, { ...OPTS, margin: 1, width });
}
