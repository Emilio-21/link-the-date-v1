// app/templates/plantilla_olivos/PlantillaOlivos.jsx
// Plantilla "Olivos" — editorial moderno: crema/hueso + azul empolvado profundo,
// fotografía a sangre y serif display de gran tamaño.
// Contrato: { event, guest, rsvp }.
// Notas:
//  - El ritmo visual alterna foto a sangre → crema → azul → crema…
//  - Los títulos de sección se arman con dos slots que se leen como una sola
//    frase; se deja la fuente por separado por si se quiere contrastar.
//  - Las animaciones scroll-driven se omiten a propósito (no funcionan en
//    Safari iOS y dejaban el contenido en opacity:0).
//  - RSVP conectado a /api/rsvp con selector de pases.
"use client";

import { useEffect, useMemo, useState } from "react";
import { rsvpDeadlineText, localeOf, wallClockISO, eventTimeText } from "@/lib/dashboard/utils";
import { resolveFont, fontKind, googleFontsHref, fontFaceCss } from "@/lib/templates/fonts";
import { OLIVOS_SLOT_MAP } from "./content";

const ASSET = (n) => `/template/plantilla_olivos/${n}`;

// ── paleta / tokens ────────────────────────────────────────────────────────
// Azul empolvado (#7D8DA6 de la paleta del cliente) llevado a un tono profundo:
// el color de la paleta es de media luz y, como fondo de sección, dejaba el
// texto crema en 2.8:1 de contraste. Bajado a #2E3D4D da 9.2:1 conservando el
// matiz (mismo azul grisáceo, ~215°) y la sensación empolvada.
// Los tokens se llaman "dark/onDark" y no "blue": describen el papel que
// cumplen, así el siguiente cambio de color no deja nombres mintiendo.
const T = {
  ink: "#202A36",        // azul casi negro — texto principal sobre crema
  inkSoft: "#47505C",    // texto secundario sobre crema
  muted: "#7B818C",      // texto terciario / etiquetas
  dark: "#2E3D4D",       // azul empolvado profundo — secciones oscuras
  darkDeep: "#222E3B",
  cream: "#F7F5EE",      // crema principal
  cream2: "#EFEBE0",     // crema alterno (tarjetas)
  onDark: "#EDEAE0",     // texto sobre el azul
  onDarkSoft: "rgba(237,234,224,.62)",
  line: "rgba(32,42,54,.14)",
  lineOn: "rgba(237,234,224,.22)",
  accent: "#A08B5B",     // dorado apagado, contrapunto cálido al azul frío
};
// Serif display propia del estudio: nombres, lugar, etiquetas de regalo.
const DISPLAY = "'Ancora',serif";
const SANS = "'Jost',sans-serif";

// Paleta de vestimenta, del más claro al más oscuro. Se muestran en barras de
// cinco por fila; en una sola fila cada barra quedaría demasiado angosta para
// leer su nombre en pantalla de celular.
// Se quitó "Marfil cálido" (#E6DDC6) a petición del cliente: rozaba el blanco,
// que la propia sección reserva para la novia.
const DRESS_PALETTE = [
  { c: "#C8B8A3", n: "Arena suave" },
  { c: "#B7B1A6", n: "Lino natural" },
  { c: "#8A8F7A", n: "Olivo claro" },
  { c: "#7D8DA6", n: "Azul polvoriento" },
  { c: "#A08972", n: "Taupe suave" },
  { c: "#7A5B47", n: "Marrón tostado" },
  { c: "#615E5A", n: "Gris pizarra" },
  { c: "#4A5A46", n: "Verde bosque" },
  { c: "#3A3632", n: "Carbón suave" },
];

// ── helpers de fecha / nombre ───────────────────────────────────────────────
function splitCouple(name) {
  const raw = (name || "").trim();
  if (!raw) return ["", ""];
  const m = raw.split(/\s+(?:y|&|and)\s+/i);
  if (m.length >= 2) return [m[0].trim(), m.slice(1).join(" ").trim()];
  return [raw, ""];
}
function monthES(d, locale = "es-MX") {
  try { return d.toLocaleDateString(locale, { month: "long" }); } catch { return ""; }
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// Etiqueta pequeña en versales espaciadas (el recurso tipográfico del estilo).
const label = (extra = {}) => ({
  fontFamily: SANS, fontSize: 10, fontWeight: 500, letterSpacing: "0.3em",
  textTransform: "uppercase", ...extra,
});

// ── countdown ───────────────────────────────────────────────────────────────
function Countdown({ iso }) {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });
  useEffect(() => {
    if (!iso) return;
    const target = new Date(iso).getTime();
    const p = (n) => String(n).padStart(2, "0");
    function tick() {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      setT({ d: p(d), h: p(h), m: p(m), s: p(s) });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);

  const Unit = ({ val, lbl }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 56 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 42, lineHeight: 0.95, color: T.onDark, fontVariantNumeric: "tabular-nums" }}>{val}</div>
      <div style={label({ fontSize: 8.5, letterSpacing: "0.26em", color: T.onDarkSoft })}>{lbl}</div>
    </div>
  );
  const Sep = () => <div style={{ fontFamily: DISPLAY, fontSize: 30, lineHeight: 1.1, color: "rgba(237,234,224,.28)" }}>:</div>;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 10 }}>
      <Unit val={t.d} lbl="Días" />
      <Sep />
      <Unit val={t.h} lbl="Horas" />
      <Sep />
      <Unit val={t.m} lbl="Min" />
      <Sep />
      <Unit val={t.s} lbl="Seg" />
    </div>
  );
}

// ── filete fino (sustituye al separador botánico) ───────────────────────────
function Rule({ color = T.line, width = 54, margin = "22px auto" }) {
  return <div style={{ width, height: 1, background: color, margin }} />;
}

// ── texturas de papel/cera (ruido SVG inline, sin assets externos) ──────────
// Grano fino (para papel y superficie de la cera).
const GRAIN_URI = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/><feColorMatrix type='saturate' values='0'/></filter><rect width='240' height='240' filter='url(%23g)'/></svg>")`;
// Fibras / moteado amplio (veta del papel).
const FIBER_URI = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.02' numOctaves='4' seed='11'/><feColorMatrix type='saturate' values='0'/></filter><rect width='600' height='600' filter='url(%23f)'/></svg>")`;

// Ramita de olivo en relieve para el centro del sello.
function SealBranch({ color = "#c98e5f" }) {
  return (
    <svg width="26" height="54" viewBox="0 0 26 54" aria-hidden="true" style={{ filter: "drop-shadow(0 1.5px 1.5px rgba(60,30,12,.55)) drop-shadow(0 -0.5px 0.5px rgba(255,228,196,.4))" }}>
      <path d="M13 6 C 12 22, 14 38, 13 50" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <ellipse cx="13" cy="5" rx="3" ry="4.5" fill={color} />
      <ellipse cx="5.5" cy="16" rx="7" ry="3.2" transform="rotate(-38 5.5 16)" fill={color} />
      <ellipse cx="20.5" cy="22" rx="7" ry="3.2" transform="rotate(34 20.5 22)" fill={color} />
      <ellipse cx="5.5" cy="30" rx="6.5" ry="3" transform="rotate(-30 5.5 30)" fill={color} />
      <ellipse cx="20" cy="36" rx="6" ry="2.8" transform="rotate(28 20 36)" fill={color} />
    </svg>
  );
}

// ── intro tipo carta: sobre sellado que se abre al tocar el sello ───────────
function EnvelopeIntro({ sealText, sealFont, hint, hintFont }) {
  // 0 = cerrado · 1 = abriéndose (sello → solapa → sobre sube) · 2 = terminado
  const [phase, setPhase] = useState(0);

  // Bloquea el scroll de fondo mientras el sobre está visible.
  useEffect(() => {
    if (phase === 2) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [phase]);

  if (phase === 2) return null;
  const opening = phase === 1;
  const open = () => {
    if (opening) return;
    setPhase(1);
    setTimeout(() => setPhase(2), 2100);
  };

  return (
    <div
      onClick={open}
      role="button"
      aria-label="Abrir invitación"
      style={{
        position: "fixed", inset: 0, zIndex: 1000, cursor: "pointer",
        perspective: 1400, overflow: "hidden",
        background: "linear-gradient(165deg, #f6f3ec, #ece7db 52%, #e0dacb)",
        transform: opening ? "translateY(-102%)" : "none",
        transition: "transform .95s cubic-bezier(.65,.05,.35,1) 1.05s",
      }}
    >
      <style>{`@keyframes olHintPulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }`}</style>

      {/* pliegues laterales del sobre (sutiles) */}
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 0 100%, 50% 55%)", background: "rgba(125,112,88,.05)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(100% 0, 100% 100%, 50% 55%)", background: "rgba(125,112,88,.05)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 100%, 100% 100%, 50% 42%)", background: "rgba(125,112,88,.08)", boxShadow: "0 -14px 30px rgba(125,112,88,.2)" }} />

      {/* textura de papel: fibras + grano + viñeta */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: FIBER_URI, backgroundSize: "420px 420px", opacity: 0.34, mixBlendMode: "multiply", pointerEvents: "none", zIndex: 1, filter: "contrast(.62) brightness(1.42)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN_URI, backgroundSize: "170px 170px", opacity: 0.38, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 100% at 50% 38%, transparent 52%, rgba(125,110,84,.22))", pointerEvents: "none", zIndex: 1 }} />

      {/* solapa superior — se abre girando hacia arriba */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "54%",
        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        background: "linear-gradient(180deg, #f2eee2, #e4ded0)",
        boxShadow: "0 18px 38px rgba(115,100,75,.35)",
        transformOrigin: "top center",
        transform: opening ? "rotateX(-180deg)" : "rotateX(0deg)",
        transition: "transform 1s cubic-bezier(.65,.05,.35,1) .4s",
        backfaceVisibility: "hidden",
        zIndex: 2,
      }}>
        {/* textura de papel de la solapa */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: FIBER_URI, backgroundSize: "420px 420px", opacity: 0.34, mixBlendMode: "multiply", filter: "contrast(.62) brightness(1.42)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN_URI, backgroundSize: "170px 170px", opacity: 0.38, mixBlendMode: "overlay" }} />
        {/* luz en el doblez superior */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,.5), transparent 12%)" }} />
      </div>

      {/* sello de cera con iniciales */}
      <div style={{
        position: "absolute", top: "54%", left: "50%", width: 126, height: 126, zIndex: 3,
        transform: opening ? "translate(-50%,-50%) scale(.5) rotate(-16deg)" : "translate(-50%,-50%)",
        opacity: opening ? 0 : 1,
        transition: "transform .45s ease, opacity .45s ease",
      }}>
        {/* derrame de cera: base irregular más ancha que el disco */}
        <div style={{
          position: "absolute", inset: -13, transform: "rotate(9deg)",
          borderRadius: "58% 42% 47% 53% / 45% 60% 40% 55%",
          background: "radial-gradient(circle at 40% 32%, #b57b4e, #91572f 58%, #6b3d20)",
          boxShadow: "0 14px 30px rgba(95,62,35,.5), 0 3px 8px rgba(95,62,35,.3), inset 0 -3px 7px rgba(50,26,10,.4)",
        }} />
        {/* lengüetas de cera fundidas al borde (mismo color plano que el borde del derrame) */}
        <div style={{ position: "absolute", left: -22, bottom: 22, width: 34, height: 22, transform: "rotate(-28deg)", borderRadius: "70% 30% 60% 40% / 60% 55% 45% 40%", background: "#7e4a27", boxShadow: "0 6px 12px rgba(95,62,35,.4)" }} />
        <div style={{ position: "absolute", right: -19, top: 30, width: 30, height: 19, transform: "rotate(22deg)", borderRadius: "40% 60% 50% 50% / 55% 45% 60% 40%", background: "#7b4826", boxShadow: "0 5px 10px rgba(95,62,35,.35)" }} />
        <div style={{ position: "absolute", left: 30, top: -18, width: 22, height: 15, transform: "rotate(-12deg)", borderRadius: "55% 45% 65% 35% / 50% 60% 40% 50%", background: "#7e4a27", boxShadow: "0 4px 8px rgba(95,62,35,.3)" }} />
        <div style={{ position: "absolute", right: 24, bottom: -14, width: 18, height: 13, transform: "rotate(14deg)", borderRadius: "45% 55% 50% 50% / 60% 40% 60% 40%", background: "#764424", boxShadow: "0 4px 8px rgba(95,62,35,.3)" }} />

        {/* disco: aro grueso del sello */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden",
          borderRadius: "48% 52% 50% 50% / 53% 46% 54% 47%",
          background: "radial-gradient(circle at 36% 28%, #c68b5e, #a4693e 52%, #83512c 86%, #6f401f)",
          boxShadow: "inset 0 3px 9px rgba(255,225,190,.45), inset 0 -8px 16px rgba(60,32,14,.55), inset 3px 0 8px rgba(255,225,190,.14), 0 8px 18px rgba(95,62,35,.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* grano de la cera */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN_URI, backgroundSize: "120px 120px", opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
          {/* brillo especular */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 62% 40% at 32% 20%, rgba(255,235,210,.38), transparent 65%)", pointerEvents: "none" }} />
          {/* cara interior hundida (donde estampa el cuño) */}
          <div style={{
            position: "absolute", inset: 13, borderRadius: "50%", overflow: "hidden",
            background: "radial-gradient(circle at 38% 30%, #ab6f42, #935c35 55%, #7b4826)",
            boxShadow: "inset 0 3px 8px rgba(55,30,14,.5), inset 0 -2px 5px rgba(245,200,160,.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* estrías radiales de la cera prensada */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-conic-gradient(from 10deg, rgba(255,220,185,.045) 0deg 2deg, transparent 2deg 7deg, rgba(70,38,16,.04) 7deg 9deg, transparent 9deg 13deg)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN_URI, backgroundSize: "120px 120px", opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} />
            {/* iniciales en relieve a los lados de la ramita de olivo */}
            {(() => {
              const letterStyle = { fontFamily: sealFont, fontSize: 29, fontWeight: 600, color: "#c98e5f", textShadow: "0 -1px 1px rgba(255,228,196,.5), 0 2px 2px rgba(60,30,12,.6)", lineHeight: 1 };
              const m = String(sealText).match(/^(\S{1,3})\s*&\s*(\S{1,3})$/);
              return m ? (
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={letterStyle}>{m[1]}</span>
                  <SealBranch />
                  <span style={letterStyle}>{m[2]}</span>
                </div>
              ) : (
                <span style={{ ...letterStyle, whiteSpace: "nowrap", position: "relative" }}>{sealText}</span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* indicación */}
      <div style={{
        position: "absolute", top: "calc(54% + 96px)", left: 0, right: 0, zIndex: 3,
        textAlign: "center", fontFamily: hintFont, fontSize: 11, fontWeight: 500,
        letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(111,106,88,.9)",
        opacity: opening ? 0 : 1, transition: "opacity .3s ease",
        animation: "olHintPulse 2.6s ease-in-out infinite",
      }}>{hint}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function PlantillaOlivos({ event, guest, rsvp }) {
  // ── personalización (texto + fuente por sección) ─────────────────────────
  const cz = event?.customization && typeof event.customization === "object" ? event.customization : {};
  // Texto del slot. Si el anfitrión guardó un texto, manda ese — aunque lo haya
  // dejado en blanco: borrar un campo tiene que hacer desaparecer el texto, no
  // resucitar el default. Sólo un slot que nunca se tocó cae al default.
  const tx = (key) => {
    const o = cz[key];
    if (o && typeof o.text === "string") return o.text.trim();
    return OLIVOS_SLOT_MAP[key]?.default || "";
  };
  const fontKeyOf = (key) => (cz[key] || {}).font || OLIVOS_SLOT_MAP[key]?.font;
  // Fuente del slot: usa el override o la fuente por defecto del registro.
  const ff = (key) => resolveFont(fontKeyOf(key));
  // Estilo de título: itálica del display, salvo si la fuente ya es caligráfica.
  const titleFont = (key) => ({
    fontFamily: ff(key),
    fontStyle: fontKind(fontKeyOf(key)) === "script" ? "normal" : "italic",
  });
  // Fuentes en uso: base de la plantilla + cualquier personalizada del evento.
  // Las de Google entran por <link>; las propias como @font-face.
  const { fontsHref, faceCss } = useMemo(() => {
    // Romance Dream ya no entra aquí: sólo se descarga si algún slot la elige.
    const base = ["ancora", "tokyoDreams", "jost", "cormorant"];
    const overrides = Object.values(cz).map((o) => o?.font).filter(Boolean);
    const keys = [...base, ...overrides];
    return { fontsHref: googleFontsHref(keys), faceCss: fontFaceCss(keys) };
  }, [event?.customization]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── datos ──────────────────────────────────────────────────────────────
  const [partnerA, partnerB] = splitCouple(event?.couple_name || "");
  // Iniciales para el sello del sobre: "S & B" (o texto personalizado del slot).
  const autoInitials = [partnerA, partnerB]
    .map((n) => (n || "").trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join(" & ");
  const sealText = tx("envelope_seal") || autoInitials || "♥";
  const eventDate = event?.event_date || "";
  const eventISO = wallClockISO(event); // hora de pared fija (no se ajusta a zonas horarias)
  const dateObj = eventDate ? new Date(`${eventDate}T00:00:00`) : null;

  const locale = localeOf(event);
  const dateText = dateObj
    ? `${dateObj.getDate()} de ${cap(monthES(dateObj, locale))} de ${dateObj.getFullYear()}`
    : (event?.date_text || "");
  const longDate = dateObj
    ? `${cap(dateObj.toLocaleDateString(locale, { weekday: "long" }))} · ${dateObj.getDate()}${locale === "en-US" ? " " : " de "}${cap(monthES(dateObj, locale))}`
    : "";
  // Hora de pared fija. "3:30 pm" → "3:30 p.m." en español.
  const { time: evTime, ampm: evAmpm } = eventTimeText(event);
  const timeText = evTime
    ? `${evTime} ${locale === "en-US" ? evAmpm : evAmpm === "pm" ? "p.m." : "a.m."}`
    : "";

  const venueName = event?.venue_name || "";
  const cityLine = event?.location || "";
  const mapUrl = event?.location_url || null;
  // Query para el mapa embebido (no requiere API key). Prefiere venue + ciudad.
  const mapQuery = [venueName, cityLine].filter(Boolean).join(", ");
  const mapEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;
  // Ilustración del lugar: si está, ocupa el sitio del mapa.
  const venueImage = tx("venue_image");

  const guestName = (guest?.name || "").trim() || "Invitado especial";
  const maxGuests = Math.max(1, Number(guest?.max_guests) || 1);
  const tableLabel = event?.show_table && guest?.table_assignment ? guest.table_assignment : null;

  const bankHolder = event?.bank_holder || null;

  const mainMessage = event?.main_message
    || "Será un honor contar con tu presencia para celebrar el comienzo de nuestra nueva vida juntos. Hemos reservado un lugar especial para ti.";

  const dressCodeText = event?.dress_code_text || "Formal & Elegante";
  const kidsPolicyText = event?.kids_policy_text || "";
  const showDressCode = event?.show_dress_code !== false;
  const showKidsPolicy = event?.show_kids_policy !== false && !!kidsPolicyText;

  const giftsMessage = event?.gifts_message
    || "Tu compañía es nuestro mayor regalo. Si además deseas tener un detalle con nosotros, te dejamos algunas opciones.";
  const giftLabel1 = event?.gift_label_1 || "Mesa de regalos";
  const giftUrl1 = event?.gift_url_1 || null;
  const giftLabel2 = event?.gift_label_2 || null;
  const giftUrl2 = event?.gift_url_2 || null;
  const bankName = event?.bank_name || null;
  const bankAccount = event?.bank_account || null;
  const showGifts = event?.show_gifts !== false && (!!giftUrl1 || !!giftUrl2);
  const showBank = event?.show_bank !== false && !!bankAccount;

  const rsvpDeadline = rsvpDeadlineText(event, {
    es: "Confírmanos tu asistencia antes del",
    en: "Please confirm your attendance before",
  });
  const coverUrl = event?.cover_url || ASSET("portada.jpeg");
  const gallery = Array.isArray(event?.gallery_urls) ? event.gallery_urls.filter(Boolean).slice(0, 10) : [];

  // Reparto de la galería: las 5 primeras fotos encabezan las secciones, en el
  // orden en que aparecen (Celebración, Vestimenta, Regalos, Galería, RSVP), y
  // las siguientes forman el mosaico. Así el anfitrión decide qué foto va en
  // qué sección sólo ordenándolas en el dashboard, sin selector aparte.
  // Si hay 5 o menos, se reciclan para los encabezados y el mosaico las repite.
  const HEADER_PHOTOS = 5;
  const headerPool = gallery.length ? gallery.slice(0, HEADER_PHOTOS) : [coverUrl];
  const secPhoto = (i) => headerPool[i % headerPool.length];
  const mosaic = gallery.length > HEADER_PHOTOS ? gallery.slice(HEADER_PHOTOS) : gallery;

  // ── RSVP ───────────────────────────────────────────────────────────────
  const [attending, setAttending] = useState(rsvp?.attending ?? null);
  const [partySize, setPartySize] = useState(
    rsvp?.party_size ? Math.min(maxGuests, rsvp.party_size) : 1
  );
  const [confirmed, setConfirmed] = useState(rsvp?.attending != null);
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [copied, setCopied] = useState(false);

  async function submitRSVP() {
    if (attending === null || !guest?.id) {
      if (!guest?.id) setErrMsg("No se encontró el invitado.");
      return;
    }
    try {
      setBusy(true); setErrMsg("");
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          guest_id: guest.id,
          attending,
          party_size: attending ? Math.max(1, Math.min(maxGuests, Number(partySize) || 1)) : 0,
        }),
      });
      const txt = await res.text();
      let json = null;
      try { json = txt ? JSON.parse(txt) : null; } catch {}
      if (!res.ok) { setErrMsg(json?.error || `No se pudo confirmar (status ${res.status}).`); return; }
      setConfirmed(true);
    } catch (e) {
      setErrMsg(e?.message || "Error enviando confirmación.");
    } finally { setBusy(false); }
  }

  async function copyBank() {
    try { await navigator.clipboard.writeText(String(bankAccount).replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  }

  const yes = attending === true;
  const no = attending === false;
  const segBase = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "15px 0", borderRadius: 2, fontSize: 10.5, fontWeight: 500,
    letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
    transition: "all .25s ease", userSelect: "none",
  };

  const passOptions = useMemo(
    () => Array.from({ length: maxGuests }, (_, i) => i + 1),
    [maxGuests]
  );

  // Título de sección: las dos partes se leen como una sola frase itálica.
  const SectionTitle = ({ a, b, color = T.ink, size = 37 }) => (
    <h2 style={{
      margin: 0, textAlign: "center", fontWeight: 400, fontSize: size,
      lineHeight: 1.16, color, textWrap: "balance", overflowWrap: "anywhere",
    }}>
      {tx(a) && <span style={titleFont(a)}>{tx(a)} </span>}
      {tx(b) && <span style={titleFont(b)}>{tx(b)}</span>}
    </h2>
  );

  // Portada de sección: foto a sangre con el título encima, y el detalle debajo.
  // Es el recurso que da ritmo a la invitación y mete más fotos de los novios.
  // El velo oscuro va siempre, con o sin foto, para que el título se lea.
  // minHeight (no height fija): un título largo crece la banda en vez de pegarse
  // a los bordes. La foto queda de fondo absoluto, así que acompaña el alto.
  const SectionCover = ({ img, a, b, minHeight = 208, size = 36, pos = "center 38%" }) => (
    <div style={{
      position: "relative", minHeight, overflow: "hidden", background: T.darkDeep,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "38px 26px",
    }}>
      {img && (
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${img}')`, backgroundSize: "cover", backgroundPosition: pos, filter: "saturate(.78) contrast(1.03)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(18,26,38,.34), rgba(18,26,38,.52))" }} />
      <div style={{ position: "relative", width: "100%", textShadow: "0 2px 20px rgba(18,26,38,.55)" }}>
        <SectionTitle a={a} b={b} color="#FBFAF6" size={size} />
      </div>
    </div>
  );

  // Estilos de sección reutilizables.
  const secCream = { position: "relative", background: T.cream, padding: "76px 34px 80px" };
  const secDark = { position: "relative", background: T.dark, padding: "76px 34px 80px", color: T.onDark };
  const bodyText = (over = false) => ({
    fontFamily: SANS, fontSize: 13, fontWeight: 300, lineHeight: 2,
    color: over ? T.onDarkSoft : T.inkSoft, textWrap: "pretty", whiteSpace: "pre-line",
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#E6E3DA", display: "flex", justifyContent: "center", fontFamily: SANS, color: T.ink, WebkitFontSmoothing: "antialiased" }}>
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}
      {faceCss && <style>{faceCss}</style>}

      {/* Intro: sobre sellado que se abre como carta */}
      <EnvelopeIntro sealText={sealText} sealFont={ff("envelope_seal")} hint={tx("envelope_hint")} hintFont={ff("envelope_hint")} />

      <div style={{ width: "100%", maxWidth: 452, position: "relative", backgroundColor: T.cream, boxShadow: "0 0 80px rgba(34,46,59,.22)", overflow: "hidden" }}>

        {/* ============ 1 · PORTADA (foto a sangre) ============ */}
        <section style={{ position: "relative", height: "clamp(540px, 82vh, 680px)", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${coverUrl}')`, backgroundSize: "cover", backgroundPosition: "center 32%", filter: "saturate(.82) contrast(1.04)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,28,40,.42) 0%, rgba(20,28,40,.10) 34%, rgba(20,28,40,.30) 62%, rgba(20,28,40,.80) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", textAlign: "center", padding: "0 28px 54px" }}>
            {tx("cover_intro") && (
              <div style={{ fontFamily: ff("cover_intro"), fontSize: 9.5, fontWeight: 400, letterSpacing: "0.26em", textTransform: "uppercase", lineHeight: 2, color: "rgba(247,245,238,.9)", maxWidth: 300, marginBottom: 18, textWrap: "balance", whiteSpace: "pre-line" }}>
                {tx("cover_intro")}
              </div>
            )}
            <div style={{ ...titleFont("couple_name"), fontSize: 52, lineHeight: 1.1, color: "#FBFAF6", textShadow: "0 2px 24px rgba(18,26,38,.45)", overflowWrap: "anywhere", maxWidth: "100%", textWrap: "balance" }}>
              {partnerB ? `${partnerA} & ${partnerB}` : (partnerA || "Los novios")}
            </div>
            <Rule color="rgba(247,245,238,.34)" width={40} margin="20px auto 16px" />
            {dateText && (
              <div style={{ fontFamily: ff("cover_date"), fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(247,245,238,.94)" }}>{dateText}</div>
            )}
            {timeText && (
              <div style={{ fontFamily: ff("cover_time"), fontSize: 10.5, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(247,245,238,.8)", marginTop: 7 }}>{timeText}</div>
            )}
            {(venueName || cityLine) && (
              <div style={{ fontFamily: ff("cover_venue"), fontSize: 9.5, fontWeight: 300, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(247,245,238,.7)", marginTop: 12, lineHeight: 1.8 }}>
                {[venueName, cityLine].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </section>

        {/* ============ 2 · SALUDO ============ */}
        <section style={{ ...secCream, textAlign: "center" }}>
          <div style={{ fontFamily: ff("greeting_intro"), ...label({ fontSize: 9.5, color: T.muted }), marginBottom: 20 }}>{tx("greeting_intro")}</div>
          <div style={{ ...titleFont("guest_name"), fontSize: 40, lineHeight: 1.2, color: T.ink, overflowWrap: "anywhere", textWrap: "balance" }}>{guestName}</div>

          <p style={{ fontFamily: ff("passes_text"), fontSize: 11, fontWeight: 400, letterSpacing: "0.08em", lineHeight: 1.9, color: T.accent, margin: "18px auto 0", maxWidth: 280, textWrap: "pretty", whiteSpace: "pre-line" }}>
            {tx("passes_text").replace(/\{n\}/g, maxGuests)}
          </p>
          {tableLabel && (
            <div style={{ display: "inline-block", marginTop: 12, padding: "6px 16px", border: `1px solid ${T.line}`, borderRadius: 2, ...label({ fontSize: 9, color: T.inkSoft }) }}>
              Mesa {tableLabel}
            </div>
          )}

          <Rule margin="28px auto" />

          <p style={{ ...bodyText(), fontFamily: ff("main_message"), margin: "0 auto", maxWidth: 330 }}>{mainMessage}</p>
        </section>

        {/* ============ 3 · CUENTA REGRESIVA ============ */}
        <section style={{ ...secDark, textAlign: "center" }}>
          <div style={{ ...titleFont("countdown_script"), fontSize: 34, lineHeight: 1.2, color: T.onDark }}>{tx("countdown_script")}</div>
          <div style={{ fontFamily: ff("countdown_label"), ...label({ fontSize: 9, color: T.onDarkSoft }), margin: "12px 0 34px" }}>{tx("countdown_label")}</div>
          <Countdown iso={eventISO} />
          {longDate && (
            <>
              <Rule color={T.lineOn} margin="34px auto 18px" />
              <div style={label({ fontSize: 10, letterSpacing: "0.24em", color: "rgba(237,234,224,.8)" })}>{longDate}</div>
            </>
          )}
        </section>

        {/* ============ 4 · CELEBRACIÓN / UBICACIÓN ============ */}
        <section style={{ position: "relative", background: T.cream }}>
          <SectionCover img={secPhoto(0)} a="venue_script" b="venue_title" />
          <div style={{ padding: "52px 34px 0", textAlign: "center" }}>
            <p style={{ ...bodyText(), fontFamily: ff("venue_text"), margin: "0 auto 40px", maxWidth: 320 }}>{tx("venue_text")}</p>
          </div>

          {/* Ilustración del lugar si la hay; si no, el mapa embebido de siempre.
              La ilustración se muestra completa (contain) sobre el crema: es un
              dibujo, recortarlo a sangre le cortaría el arco. */}
          {venueImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={venueImage}
              alt={venueName ? `Ilustración de ${venueName}` : "Ilustración del lugar"}
              style={{ display: "block", width: "100%", maxWidth: 400, margin: "0 auto", height: "auto", mixBlendMode: "multiply" }}
            />
          ) : mapEmbedUrl ? (
            <iframe
              title="Mapa de la ubicación"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ display: "block", width: "100%", height: 236, border: 0, filter: "saturate(.72) contrast(1.02)" }}
            />
          ) : (
            <div style={{ height: 180, background: "linear-gradient(135deg,#3A4A5C,#6E7E94)" }} />
          )}

          <div style={{ padding: "34px 34px 80px", textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 30, lineHeight: 1.2, color: T.ink }}>{venueName || "Nuestro lugar"}</div>
            {cityLine && <div style={{ ...label({ fontSize: 9.5, color: T.muted }), marginTop: 10 }}>{cityLine}</div>}
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 24, padding: "13px 30px", border: `1px solid ${T.ink}`, borderRadius: 2, textDecoration: "none", fontFamily: ff("venue_button"), ...label({ fontSize: 9.5, letterSpacing: "0.24em", color: T.ink }) }}>
                {tx("venue_button")}
              </a>
            )}
          </div>
        </section>

        {/* ============ 5 · CÓDIGO DE VESTIMENTA ============ */}
        {showDressCode && (
          <section style={{ position: "relative", background: T.dark, color: T.onDark }}>
            <SectionCover img={secPhoto(1)} a="dress_script" b="dress_title" />
            <div style={{ padding: "52px 34px 80px", textAlign: "center" }}>
            <div style={{ fontFamily: ff("dress_value"), fontSize: 15, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase", color: T.onDark }}>{dressCodeText}</div>
            <p style={{ ...bodyText(true), fontFamily: ff("dress_text"), margin: "16px auto 34px", maxWidth: 300 }}>{tx("dress_text")}</p>
            {/* Barras de cinco por fila. Flex y no grid a propósito: si el número
                de tonos no es múltiplo de cinco, la última fila queda centrada
                en vez de descolgada a la izquierda. */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "22px 7px", maxWidth: 340, margin: "0 auto" }}>
              {DRESS_PALETTE.map((p) => (
                <div key={p.n} style={{ width: "calc(20% - 6px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, minWidth: 0 }}>
                  <span style={{ width: "100%", height: 74, background: p.c, boxShadow: "0 0 0 1px rgba(237,234,224,.28)" }} />
                  <span style={label({ fontSize: 7.5, letterSpacing: "0.09em", color: T.onDarkSoft, lineHeight: 1.6 })}>{p.n}</span>
                </div>
              ))}
            </div>
            {showKidsPolicy && (
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 300, color: T.onDarkSoft, letterSpacing: "0.06em", marginTop: 30 }}>{kidsPolicyText}</p>
            )}
            </div>
          </section>
        )}

        {/* ============ 6 · MESA DE REGALOS ============ */}
        {(showGifts || showBank) && (
          <section style={{ position: "relative", background: T.cream }}>
            <SectionCover img={secPhoto(2)} a="gifts_script" b="gifts_title" size={34} />
            <div style={{ padding: "52px 34px 80px" }}>
            {tx("gifts_lead") && (
              <p style={{
                ...titleFont("gifts_lead"), textAlign: "center", fontSize: 23, lineHeight: 1.4,
                color: T.ink, margin: "0 auto 22px", maxWidth: 300,
                textWrap: "balance", overflowWrap: "anywhere", whiteSpace: "pre-line",
              }}>
                {tx("gifts_lead")}
              </p>
            )}
            <p style={{ ...bodyText(), fontFamily: SANS, textAlign: "center", margin: "0 auto 34px", maxWidth: 320 }}>{giftsMessage}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {showGifts && giftUrl1 && (
                <a href={giftUrl1} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, textDecoration: "none", background: T.cream2, border: `1px solid ${T.line}`, borderRadius: 2, padding: "20px 22px" }}>
                  <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 19, color: T.ink }}>{giftLabel1}</span>
                  <span style={{ fontFamily: ff("gifts_link"), ...label({ fontSize: 9, letterSpacing: "0.2em", color: T.accent }), whiteSpace: "nowrap" }}>{tx("gifts_link")} →</span>
                </a>
              )}
              {showGifts && giftUrl2 && (
                <a href={giftUrl2} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, textDecoration: "none", background: T.cream2, border: `1px solid ${T.line}`, borderRadius: 2, padding: "20px 22px" }}>
                  <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 19, color: T.ink }}>{giftLabel2 || "Mesa de regalos 2"}</span>
                  <span style={{ fontFamily: ff("gifts_link"), ...label({ fontSize: 9, letterSpacing: "0.2em", color: T.accent }), whiteSpace: "nowrap" }}>{tx("gifts_link")} →</span>
                </a>
              )}
              {showBank && (
                <div style={{ background: T.cream2, border: `1px solid ${T.line}`, borderRadius: 2, padding: "22px 22px 20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
                    <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 19, color: T.ink }}>{bankName || "Transferencia"}</span>
                    <span onClick={copyBank} style={{ ...label({ fontSize: 9, letterSpacing: "0.2em", color: T.accent }), cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "✓ Copiado" : "Copiar"}</span>
                  </div>
                  <div style={{ height: 1, background: T.line, margin: "14px 0" }} />
                  {bankHolder && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                      <span style={label({ fontSize: 8.5, color: T.muted, flex: "none", minWidth: 58 })}>Titular</span>
                      <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 400, color: T.inkSoft, overflowWrap: "anywhere" }}>{bankHolder}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={label({ fontSize: 8.5, color: T.muted, flex: "none", minWidth: 58 })}>CLABE</span>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 400, color: T.inkSoft, letterSpacing: "0.04em", overflowWrap: "anywhere" }}>{bankAccount}</span>
                  </div>
                </div>
              )}
            </div>
            </div>
          </section>
        )}

        {/* ============ 7 · GALERÍA (fotos a sangre) ============ */}
        {gallery.length > 0 && (
          <section style={{ position: "relative", background: T.dark }}>
            <SectionCover img={secPhoto(3)} a="gallery_script" b="gallery_title" size={34} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: 148, gap: 3 }}>
              {mosaic.map((src, i) => {
                // ritmo del mosaico: cada 6 fotos, una alta y una ancha
                const r = i % 6;
                const span = r === 0 ? { gridRow: "span 2" } : r === 3 ? { gridColumn: "span 2" } : {};
                return (
                  <div key={i} style={{ ...span, position: "relative", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.86)" }} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ 8 · RSVP ============ */}
        <section style={{ position: "relative", background: T.cream, paddingBottom: 92 }}>
          {!confirmed ? (
            <>
              <SectionCover img={secPhoto(4)} a="rsvp_title" size={38} />
              <div style={{ textAlign: "center", padding: "52px 0 0" }}>
                <p style={{ ...bodyText(), fontSize: 12.5, margin: "0 auto 34px", maxWidth: 310 }}>
                  {rsvpDeadline || "Confírmanos tu asistencia, por favor."}
                </p>
              </div>
              <div style={{ padding: "0 34px" }}>

              <div style={{ fontFamily: ff("rsvp_question"), ...label({ fontSize: 9, color: T.muted }), textAlign: "center", marginBottom: 14 }}>{tx("rsvp_question")}</div>
              <div style={{ display: "flex", gap: 10, marginBottom: yes ? 24 : 30 }}>
                <div onClick={() => setAttending(true)} style={{ ...segBase, fontFamily: ff("rsvp_yes"), ...(yes ? { background: T.dark, color: T.onDark, border: `1px solid ${T.dark}` } : { background: "transparent", color: T.inkSoft, border: `1px solid ${T.line}` }) }}>{tx("rsvp_yes")}</div>
                <div onClick={() => setAttending(false)} style={{ ...segBase, fontFamily: ff("rsvp_no"), ...(no ? { background: T.muted, color: T.cream, border: `1px solid ${T.muted}` } : { background: "transparent", color: T.inkSoft, border: `1px solid ${T.line}` }) }}>{tx("rsvp_no")}</div>
              </div>

              {yes && maxGuests > 1 && (
                <div style={{ marginBottom: 30, textAlign: "center" }}>
                  <div style={{ fontFamily: ff("rsvp_count"), ...label({ fontSize: 9, color: T.muted }), marginBottom: 14 }}>{tx("rsvp_count")}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    {passOptions.map((n) => (
                      <div key={n} onClick={() => setPartySize(n)} style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: DISPLAY, fontSize: 16, transition: "all .2s ease", ...(partySize === n ? { background: T.dark, color: T.onDark } : { background: "transparent", color: T.inkSoft, border: `1px solid ${T.line}` }) }}>{n}</div>
                    ))}
                  </div>
                </div>
              )}

              {errMsg && <div style={{ textAlign: "center", color: "#9c4a3c", fontFamily: SANS, fontSize: 11.5, marginBottom: 16 }}>{errMsg}</div>}

              <div onClick={() => !busy && submitRSVP()} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "18px 0", borderRadius: 2, background: T.dark, color: T.onDark, fontFamily: ff("rsvp_submit"), fontSize: 10.5, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", cursor: "pointer", ...(attending === null || busy ? { opacity: 0.35, pointerEvents: "none" } : {}) }}>
                {busy ? "Enviando…" : tx("rsvp_submit")}
              </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "76px 34px 0" }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 26px", borderRadius: "50%", border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  {attending ? <path d="M5 12.5 L10 17.5 L19 6.5" /> : <path d="M6 6 L18 18 M18 6 L6 18" />}
                </svg>
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 38, lineHeight: 1.18, color: T.ink }}>{attending ? "¡Confirmado!" : "Gracias por avisar"}</div>
              <Rule margin="22px auto" />
              <p style={{ ...bodyText(), fontFamily: ff(attending ? "rsvp_confirmed_yes" : "rsvp_confirmed_no"), margin: "0 auto 26px", maxWidth: 310 }}>
                {tx(attending ? "rsvp_confirmed_yes" : "rsvp_confirmed_no")}
              </p>
              <div onClick={() => setConfirmed(false)} style={{ display: "inline-block", cursor: "pointer", ...label({ fontSize: 9, color: T.accent }), borderBottom: `1px solid ${T.accent}`, paddingBottom: 4 }}>Modificar mi respuesta</div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default PlantillaOlivos;
