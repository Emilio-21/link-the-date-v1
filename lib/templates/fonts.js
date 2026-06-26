// lib/templates/fonts.js — catálogo de fuentes disponibles para personalizar invitaciones.
//
// Cada fuente tiene:
//   - label:  nombre visible en el selector del dashboard
//   - stack:  CSS font-family listo para usar en style={{ fontFamily }}
//   - g:      fragmento "family=..." para construir la URL de Google Fonts
//   - kind:   categoría (sirve para agrupar/ordenar el selector)
//
// Las claves (playfair, pinyon, …) son lo que se guarda en la columna JSON
// `customization` del evento. No las cambies una vez en uso.

export const FONTS = {
  // Serif / títulos
  playfair:   { label: "Playfair Display", kind: "serif",  stack: "'Playfair Display', serif",   g: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600" },
  cormorant:  { label: "Cormorant Garamond", kind: "serif", stack: "'Cormorant Garamond', serif", g: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400" },
  ebGaramond: { label: "EB Garamond", kind: "serif", stack: "'EB Garamond', serif", g: "EB+Garamond:ital,wght@0,400;0,500;0,600;1,400" },
  cinzel:     { label: "Cinzel", kind: "serif", stack: "'Cinzel', serif", g: "Cinzel:wght@400;500;600;700" },

  // Caligrafía / script
  pinyon:        { label: "Pinyon Script (caligrafía)", kind: "script", stack: "'Pinyon Script', cursive", g: "Pinyon+Script" },
  greatVibes:    { label: "Great Vibes (caligrafía)", kind: "script", stack: "'Great Vibes', cursive", g: "Great+Vibes" },
  dancingScript: { label: "Dancing Script (caligrafía)", kind: "script", stack: "'Dancing Script', cursive", g: "Dancing+Script:wght@400;500;600;700" },
  tangerine:     { label: "Tangerine (caligrafía)", kind: "script", stack: "'Tangerine', cursive", g: "Tangerine:wght@400;700" },
  parisienne:    { label: "Parisienne (caligrafía)", kind: "script", stack: "'Parisienne', cursive", g: "Parisienne" },

  // Sans / cuerpo / máquina
  jost:         { label: "Jost (sans)", kind: "sans", stack: "'Jost', sans-serif", g: "Jost:wght@300;400;500;600" },
  montserrat:   { label: "Montserrat (sans)", kind: "sans", stack: "'Montserrat', sans-serif", g: "Montserrat:wght@300;400;500;600;700" },
  specialElite: { label: "Special Elite (máquina)", kind: "mono", stack: "'Special Elite', monospace", g: "Special+Elite" },
};

export const DEFAULT_FONT_KEY = "playfair";

// Devuelve el CSS font-family para una clave (o el default si no existe).
export function resolveFont(key) {
  return (FONTS[key] || FONTS[DEFAULT_FONT_KEY]).stack;
}

// Opciones para un <select> en el dashboard.
export function fontOptions() {
  return Object.entries(FONTS).map(([value, f]) => ({ value, label: f.label, kind: f.kind }));
}

// Construye la URL de Google Fonts para el conjunto de claves usadas.
export function googleFontsHref(keys) {
  const fams = [...new Set((keys || []).filter(Boolean))]
    .map((k) => FONTS[k]?.g)
    .filter(Boolean);
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join("&")}&display=swap`;
}
