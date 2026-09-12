// lib/templates/fonts.js — catálogo de fuentes disponibles para personalizar invitaciones.
//
// Cada fuente tiene:
//   - label:  nombre visible en el selector del dashboard
//   - stack:  CSS font-family listo para usar en style={{ fontFamily }}
//   - kind:   categoría (sirve para agrupar/ordenar el selector)
//   - g:      fragmento "family=..." para construir la URL de Google Fonts
//   - src:    alternativa a `g` para fuentes propias alojadas en /public/fonts;
//             { woff2, ttf }. Se emiten como @font-face con fontFaceCss().
//
// Las claves (playfair, pinyon, …) son lo que se guarda en la columna JSON
// `customization` del evento. No las cambies una vez en uso.

export const FONTS = {
  // Serif / títulos
  // Fuentes propias del estudio (no Google): archivos en /public/fonts.
  ancora:     { label: "Ancora (serif display propia)", kind: "serif", stack: "'Ancora', serif", src: { woff2: "/fonts/Ancora-Regular.woff2" } },
  // OJO: Tokyo Dreams no trae mayúsculas acentuadas (Á É Í Ó Ú Ñ). Evítala en
  // textos en VERSALES que puedan llevar acento: esas letras caerían a otra
  // fuente y se vería mezclado. En minúsculas no hay problema.
  tokyoDreams:{ label: "Tokyo Dreams (versales propia)", kind: "serif", stack: "'Tokyo Dreams', serif", src: { woff2: "/fonts/TokyoDreams-Regular.woff2" } },
  playfair:   { label: "Playfair Display", kind: "serif",  stack: "'Playfair Display', serif",   g: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600" },
  cormorant:  { label: "Cormorant Garamond", kind: "serif", stack: "'Cormorant Garamond', serif", g: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400" },
  ebGaramond: { label: "EB Garamond", kind: "serif", stack: "'EB Garamond', serif", g: "EB+Garamond:ital,wght@0,400;0,500;0,600;1,400" },
  cinzel:     { label: "Cinzel", kind: "serif", stack: "'Cinzel', serif", g: "Cinzel:wght@400;500;600;700" },

  // Caligrafía / script
  // Fuente propia del estudio (no Google): archivos en /public/fonts.
  romanceDream:  { label: "Romance Dream (cursiva propia)", kind: "script", stack: "'Romance Dream', cursive", src: { woff2: "/fonts/Romance-Dream-Italic.woff2", ttf: "/fonts/Romance-Dream-Italic.ttf" } },
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

// Categoría de la fuente ("serif" | "script" | "sans" | "mono").
// Útil para no aplicar itálica sintética a una caligráfica, que ya es inclinada.
export function fontKind(key) {
  return (FONTS[key] || FONTS[DEFAULT_FONT_KEY]).kind;
}

// Opciones para un <select> en el dashboard.
export function fontOptions() {
  return Object.entries(FONTS).map(([value, f]) => ({ value, label: f.label, kind: f.kind }));
}

// Construye la URL de Google Fonts para el conjunto de claves usadas.
// Las fuentes propias no tienen `g`, así que quedan fuera por sí solas.
export function googleFontsHref(keys) {
  const fams = [...new Set((keys || []).filter(Boolean))]
    .map((k) => FONTS[k]?.g)
    .filter(Boolean);
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join("&")}&display=swap`;
}

// Reglas @font-face de las fuentes propias en uso (las que tienen `src`).
// Cada familia se declara en normal E italic apuntando al mismo archivo. Son
// fuentes de display con un solo corte: así el navegador nunca les inventa una
// itálica sintética (que en una cursiva ya inclinada la deforma, y en una recta
// de alto contraste la arruina). font-style: italic queda como no-op.
export function fontFaceCss(keys) {
  return [...new Set((keys || []).filter(Boolean))]
    .map((k) => FONTS[k])
    .filter((f) => f?.src)
    .map((f) => {
      const name = f.stack.split(",")[0].replace(/['"]/g, "").trim();
      const src = [
        f.src.woff2 && `url('${f.src.woff2}') format('woff2')`,
        f.src.ttf && `url('${f.src.ttf}') format('truetype')`,
      ].filter(Boolean).join(",");
      return ["normal", "italic"]
        .map((style) => `@font-face{font-family:'${name}';src:${src};font-weight:400;font-style:${style};font-display:swap;}`)
        .join("");
    })
    .join("");
}
