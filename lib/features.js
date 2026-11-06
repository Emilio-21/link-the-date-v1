// lib/features.js — interruptores de funcionalidades provisionales.
//
// CÓMO QUITAR UNA FUNCIÓN: pon su bandera en false y desaparece de la interfaz
// sin tocar nada más. Para borrarla del código por completo, busca el nombre de
// la bandera (grep) y elimina los bloques que la usan.

// QR por invitación. Herramienta temporal para imprimir los códigos, recortarlos
// y meterlos en las invitaciones físicas. Vive SOLO en el dashboard: la
// invitación que ve el invitado nunca muestra un QR.
// Archivos implicados: components/dashboard/GuestsSection.jsx,
// app/u/[tenant]/dashboard/qr/[eventId]/page.js, lib/qr/inviteQr.js
export const FEATURE_QR = true;
