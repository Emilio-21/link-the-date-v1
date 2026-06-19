// components/dashboard/theme.js
// Tokens y helpers del look "Olivos" (cálido dorado / marfil) del dashboard.
// Se mantienen como objetos/strings de estilo inline para reproducir fielmente el diseño.

export const C = {
  ink: "#2c2a24",
  inkSoft: "#34322b",
  text: "#4a473e",
  textSoft: "#6b665b",
  muted: "#8d877a",
  mutedSoft: "#9b9486",
  gold: "#b08d4c",
  goldDeep: "#9a7a38",
  goldText: "#9a7836",
  olive: "#707d3c",
  terracotta: "#a85c43",
  cream: "#fbfaf6",
};

// Tarjeta "glass" reutilizable.
// Pasa padding = null para controlarlo con CSS (clases responsivas).
export const glass = (radius = 22, padding = 20) => ({
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.68)",
  borderRadius: radius,
  boxShadow: "0 12px 36px rgba(74,78,52,0.09)",
  ...(padding != null ? { padding } : {}),
});

// Botón dorado principal
export const goldButton = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "11px 18px",
  background: C.gold,
  border: "none",
  borderRadius: 13,
  color: C.cream,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(176,141,76,0.28)",
};

// Botón secundario (contorno suave)
export const ghostButton = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(120,115,95,0.18)",
  borderRadius: 10,
  color: C.text,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
};

// Etiqueta uppercase tenue
export const eyebrow = {
  fontSize: 11,
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: C.mutedSoft,
  fontWeight: 700,
};

// Input del dashboard
export const fieldInput = {
  width: "100%",
  background: "rgba(255,255,255,0.65)",
  border: "1px solid rgba(120,115,95,0.18)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: C.ink,
  outline: "none",
};

// Mapa de estados RSVP -> etiqueta + colores
export const RSVP = {
  yes: { label: "Sí", color: C.olive, bg: "rgba(150,162,84,0.2)" },
  no: { label: "No van", color: C.terracotta, bg: "rgba(176,106,82,0.16)" },
  pending: { label: "Pendiente", color: C.goldText, bg: "rgba(176,138,62,0.16)" },
};

export function rsvpKey(status) {
  if (status === "yes") return "yes";
  if (status === "no") return "no";
  return "pending";
}

// Degradados para avatares (rotan por índice)
export const AVATAR_BGS = [
  "linear-gradient(135deg,#e0cd96,#c9a85a)",
  "linear-gradient(135deg,#c8a48f,#a06a52)",
  "linear-gradient(135deg,#a9b0a0,#7d8470)",
  "linear-gradient(135deg,#c2b08a,#9a7836)",
];

// "14 Feb 2026 · 17:00" — compacto para las tarjetas
export function fmtCompact(datetime, dateOnlyStr) {
  try {
    const d = datetime
      ? new Date(datetime)
      : dateOnlyStr
      ? new Date(`${dateOnlyStr}T00:00:00`)
      : null;
    if (!d || Number.isNaN(d.getTime())) return "Sin fecha";
    const date = d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    if (!datetime) return date;
    const time = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    return `${date} · ${time}`;
  } catch {
    return "Sin fecha";
  }
}

// Días que faltan para la fecha (>=0) o null si ya pasó / sin fecha
export function daysUntil(datetime, dateOnlyStr) {
  try {
    const d = datetime
      ? new Date(datetime)
      : dateOnlyStr
      ? new Date(`${dateOnlyStr}T00:00:00`)
      : null;
    if (!d || Number.isNaN(d.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    return diff >= 0 ? diff : null;
  } catch {
    return null;
  }
}

export function initialsOf(name = "") {
  return (name || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "·";
}
