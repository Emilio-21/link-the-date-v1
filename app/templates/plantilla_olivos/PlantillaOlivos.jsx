// app/templates/plantilla_olivos/PlantillaOlivos.jsx
// Plantilla "Olivos" — botánica salvia + azul polvo + champagne.
// Portada desde editor visual (x-dc) a React. Contrato: { event, guest, rsvp }.
// Notas:
//  - Las animaciones scroll-driven del original (animation-timeline:view()) se
//    omiten a propósito: no funcionan en Safari iOS y dejaban el contenido en
//    opacity:0. Aquí todo es visible por defecto.
//  - RSVP conectado a /api/rsvp con selector de pases.
"use client";

import { useEffect, useMemo, useState } from "react";
import { rsvpDeadlineText, localeOf, wallClockISO, eventTimeText } from "@/lib/dashboard/utils";
import { resolveFont, googleFontsHref } from "@/lib/templates/fonts";
import { OLIVOS_SLOT_MAP } from "./content";

const ASSET = (n) => `/template/plantilla_olivos/${n}`;

// ── paleta / tokens ────────────────────────────────────────────────────────
const T = {
  navy: "#4E6679",
  ink: "#4A4A42",
  soft: "#6F6A58",
  gold: "#B08D52",
  goldSoft: "#C2A878",
  goldDark: "#8a6d3e",
  sage: "#93A07F",
  blue: "#6F8AA3",
  paper: "#F5F0E6",
  paper2: "#F8F4EA",
  paper3: "#F1ECE0",
};
const SERIF = "'Playfair Display',serif";
const SCRIPT = "'Pinyon Script',cursive";
const MONO = "'Special Elite',monospace";

// Paleta de vestimenta (fija para esta plantilla)
const DRESS_PALETTE = [
  { c: "#6F8AA3", n: "Azul polvo" },
  { c: "#4E6679", n: "Azul noche" },
  { c: "#93A07F", n: "Salvia" },
  { c: "#F1ECE0", n: "Marfil", border: true },
  { c: "#B08D52", n: "Champagne" },
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

  const Unit = ({ val, label, color = T.navy }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 60 }}>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 48, lineHeight: 0.9, color, fontVariantNumeric: "tabular-nums" }}>{val}</div>
      <div style={{ fontSize: 9.5, letterSpacing: "0.3em", textTransform: "uppercase", color: T.soft, fontFamily: "'Jost',sans-serif" }}>{label}</div>
    </div>
  );
  const Dot = () => <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 40, lineHeight: 1.05, color: T.goldSoft }}>·</div>;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 12 }}>
      <Unit val={t.d} label="Días" />
      <Dot />
      <Unit val={t.h} label="Horas" />
      <Dot />
      <Unit val={t.m} label="Min" />
      <Dot />
      <Unit val={t.s} label="Seg" color={T.sage} />
    </div>
  );
}

// ── separador decorativo (rombo + líneas) ───────────────────────────────────
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, margin: "26px 0 0" }}>
      <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,#C2A878)" }} />
      <span style={{ width: 5, height: 5, background: T.gold, transform: "rotate(45deg)" }} />
      <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,#C2A878,transparent)" }} />
    </div>
  );
}

function SectionTitle({ script, caps, scriptColor = T.sage, scriptFont = SCRIPT, capsFont = SERIF }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "center", gap: 10, marginBottom: 16, maxWidth: "100%", textAlign: "center" }}>
      <span style={{ fontFamily: scriptFont, fontSize: 46, color: scriptColor, lineHeight: 1.1, paddingBottom: 2, overflowWrap: "anywhere", maxWidth: "100%", textAlign: "center" }}>{script}</span>
      <span style={{ fontFamily: capsFont, fontWeight: 700, fontSize: 28, letterSpacing: "0.14em", textTransform: "uppercase", color: T.navy, overflowWrap: "anywhere", maxWidth: "100%", textAlign: "center", lineHeight: 1.35, textWrap: "balance" }}>{caps}</span>
    </div>
  );
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
  // Texto del slot: usa el override si tiene contenido, si no el default del registro.
  const tx = (key) => {
    const o = cz[key] || {};
    const t = typeof o.text === "string" ? o.text.trim() : "";
    return t || OLIVOS_SLOT_MAP[key]?.default || "";
  };
  // Fuente del slot: usa el override o la fuente por defecto del registro.
  const ff = (key) => resolveFont((cz[key] || {}).font || OLIVOS_SLOT_MAP[key]?.font);
  // URL de Google Fonts: base de la plantilla + cualquier fuente personalizada.
  const fontsHref = useMemo(() => {
    const base = ["playfair", "pinyon", "specialElite", "jost"];
    const overrides = Object.values(cz).map((o) => o?.font).filter(Boolean);
    return googleFontsHref([...base, ...overrides]);
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
    ? `${dateObj.getDate()} · ${cap(monthES(dateObj, locale))} · ${dateObj.getFullYear()}`
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
  const gallery = Array.isArray(event?.gallery_urls) ? event.gallery_urls.filter(Boolean).slice(0, 6) : [];

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
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
    padding: "15px 0", borderRadius: 3, fontFamily: SERIF, fontSize: 12, fontWeight: 600,
    letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", transition: "all .25s ease", userSelect: "none",
  };

  const passOptions = useMemo(
    () => Array.from({ length: maxGuests }, (_, i) => i + 1),
    [maxGuests]
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(120% 80% at 50% 0%, #e1e4dd, #c4ccc5 120%)", display: "flex", justifyContent: "center", fontFamily: MONO, color: T.ink, WebkitFontSmoothing: "antialiased" }}>
      {/* Fuentes + filtros SVG (self-contained) */}
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}

      {/* Intro: sobre sellado que se abre como carta */}
      <EnvelopeIntro sealText={sealText} sealFont={ff("envelope_seal")} hint={tx("envelope_hint")} hintFont={ff("envelope_hint")} />
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="ol-deckle"><feTurbulence type="fractalNoise" baseFrequency="0.013 0.017" numOctaves="3" seed="7" result="t" /><feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="ol-deckle2"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.015" numOctaves="3" seed="22" result="t" /><feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G" /></filter>
        </defs>
      </svg>

      <div style={{ width: "100%", maxWidth: 452, position: "relative", backgroundColor: T.paper, boxShadow: "0 0 80px rgba(60,62,52,.3)", overflow: "hidden" }}>

        {/* ============ 1 · PORTADA ============ */}
        <section style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 32px 52px", textAlign: "center" }}>
          <div style={{ position: "relative", width: "calc(100% + 64px)", margin: "0 -32px", height: 600, overflow: "hidden", WebkitMaskImage: "linear-gradient(#000 80%,transparent)", maskImage: "linear-gradient(#000 80%,transparent)" }}>
            <div style={{ position: "absolute", inset: "-8% 0", backgroundImage: `url('${coverUrl}')`, backgroundSize: "cover", backgroundPosition: "center 30%", filter: "saturate(.72) contrast(1.03) brightness(.95)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(74,90,105,.34),rgba(74,74,66,.06) 42%,rgba(245,240,230,0) 80%)" }} />
          </div>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", marginTop: -66 }}>
            <img src={ASSET("flor-azul.png")} alt="" style={{ position: "absolute", width: 150, top: 30, left: -58, opacity: 0.6, transform: "rotate(-18deg)", pointerEvents: "none", zIndex: 0 }} />
            <img src={ASSET("flor-seca.png")} alt="" style={{ position: "absolute", width: 150, bottom: -30, right: -56, opacity: 0.5, transform: "rotate(14deg) scaleX(-1)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, fontFamily: ff("cover_intro"), fontWeight: 500, fontSize: 11, letterSpacing: "0.34em", textTransform: "uppercase", color: "#6F6A58", lineHeight: 1.7, marginBottom: 14, whiteSpace: "pre-line" }}>{tx("cover_intro")}</div>
            <div style={{ position: "relative", zIndex: 1, fontFamily: ff("couple_name"), fontSize: 80, lineHeight: 1.1, paddingBottom: 4, color: T.navy, overflowWrap: "anywhere", maxWidth: "100%" }}>{partnerA || "Los novios"}</div>
            {partnerB && (
              <>
                <div style={{ position: "relative", zIndex: 1, fontFamily: SCRIPT, fontSize: 34, color: T.gold, lineHeight: 0.7, margin: "2px 0" }}>&amp;</div>
                <div style={{ position: "relative", zIndex: 1, fontFamily: ff("couple_name"), fontSize: 80, lineHeight: 1.1, paddingBottom: 4, color: T.navy, overflowWrap: "anywhere", maxWidth: "100%" }}>{partnerB}</div>
              </>
            )}
            <Divider />
            {dateText && <div style={{ fontFamily: ff("cover_date"), fontWeight: 600, fontSize: 17, letterSpacing: "0.3em", textTransform: "uppercase", color: T.blue, marginTop: 18 }}>{dateText}</div>}
            {timeText && <div style={{ fontFamily: ff("cover_time"), fontWeight: 600, fontSize: 14, letterSpacing: "0.24em", textTransform: "uppercase", color: T.blue, marginTop: 7 }}>{timeText}</div>}
            {(venueName || cityLine) && (
              <div style={{ fontFamily: ff("cover_venue"), fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: T.soft, marginTop: 11, lineHeight: 1.7 }}>
                {[venueName, cityLine].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </section>

        {/* ============ 2 · SALUDO ============ */}
        <section style={{ position: "relative", padding: "34px 30px 52px" }}>
          <div style={{ position: "relative", padding: 3 }}>
            <div style={{ position: "absolute", inset: 0, background: T.paper2, filter: "url(#ol-deckle)", boxShadow: "0 16px 36px rgba(74,74,66,.13)" }} />
            <img src={ASSET("flor-azul.png")} alt="" style={{ position: "absolute", top: -40, right: -30, width: 130, opacity: 0.62, transform: "rotate(12deg)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", padding: "42px 30px 40px", textAlign: "center" }}>
              <div style={{ fontFamily: ff("greeting_intro"), fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: T.soft, marginBottom: 18 }}>{tx("greeting_intro")}</div>
              <div style={{ fontFamily: ff("guest_name"), fontSize: 54, lineHeight: 1.12, paddingBottom: 4, color: T.navy }}>{guestName}</div>
              <p style={{ fontFamily: ff("passes_text"), fontSize: 11.5, letterSpacing: "0.1em", lineHeight: 1.7, color: T.goldDark, margin: "16px auto 0", maxWidth: 280, textWrap: "pretty", whiteSpace: "pre-line" }}>
                {tx("passes_text").replace(/\{n\}/g, maxGuests)}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14 }}>
                {tableLabel && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", border: "1px solid rgba(78,102,121,.35)", borderRadius: 40, background: "rgba(111,138,163,.1)" }}>
                    <span style={{ width: 5, height: 5, background: T.blue, transform: "rotate(45deg)" }} />
                    <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.navy }}>Mesa {tableLabel}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, margin: "22px 0" }}>
                <span style={{ width: 28, height: 1, background: "rgba(78,102,121,.3)" }} />
                <span style={{ width: 4, height: 4, background: T.sage, transform: "rotate(45deg)" }} />
                <span style={{ width: 28, height: 1, background: "rgba(78,102,121,.3)" }} />
              </div>
              <p style={{ fontFamily: ff("main_message"), fontSize: 12.5, lineHeight: 1.9, color: T.soft, margin: 0, textWrap: "pretty", whiteSpace: "pre-line" }}>{mainMessage}</p>
            </div>
          </div>
        </section>

        {/* ============ 3 · CUENTA REGRESIVA ============ */}
        <section style={{ position: "relative", overflow: "hidden", padding: "54px 30px 58px", background: "linear-gradient(180deg,rgba(111,138,163,.07),rgba(111,138,163,.14))", borderTop: "1px solid rgba(78,102,121,.12)", borderBottom: "1px solid rgba(78,102,121,.12)" }}>
          <img src={ASSET("flor-azul.png")} alt="" style={{ position: "absolute", bottom: -34, left: -46, width: 140, opacity: 0.5, transform: "rotate(-14deg)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: ff("countdown_script"), fontSize: 44, color: T.sage, lineHeight: 1.25, paddingBottom: 4 }}>{tx("countdown_script")}</div>
            <div style={{ fontFamily: ff("countdown_label"), fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: T.soft, fontWeight: 500, margin: "10px 0 26px" }}>{tx("countdown_label")}</div>
            <Countdown iso={eventISO} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 28 }}>
              <span style={{ width: 32, height: 1, background: "linear-gradient(90deg,transparent,#C2A878)" }} />
              <span style={{ width: 5, height: 5, background: T.gold, transform: "rotate(45deg)" }} />
              <span style={{ width: 32, height: 1, background: "linear-gradient(90deg,#C2A878,transparent)" }} />
            </div>
            {longDate && <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14, letterSpacing: "0.24em", textTransform: "uppercase", color: T.navy, marginTop: 18 }}>{longDate}</div>}
          </div>
        </section>

        {/* ============ 4 · CELEBRACIÓN / UBICACIÓN ============ */}
        <section style={{ position: "relative", padding: "58px 30px 60px", overflow: "hidden" }}>
          <img src={ASSET("flor-seca.png")} alt="" style={{ position: "absolute", top: 20, left: -50, width: 150, opacity: 0.5, transform: "rotate(-12deg)", pointerEvents: "none", zIndex: 0 }} />
          <img src={ASSET("flor-azul.png")} alt="" style={{ position: "absolute", bottom: 24, right: -52, width: 150, opacity: 0.55, transform: "rotate(18deg) scaleX(-1)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative" }}>
            <SectionTitle script={tx("venue_script")} caps={tx("venue_title")} scriptFont={ff("venue_script")} capsFont={ff("venue_title")} />
            <p style={{ textAlign: "center", fontFamily: ff("venue_text"), fontSize: 12.5, lineHeight: 1.9, color: T.soft, margin: "0 auto 30px", maxWidth: 330, textWrap: "pretty", whiteSpace: "pre-line" }}>
              {tx("venue_text")}
            </p>
            <div style={{ background: T.paper2, borderRadius: 3, overflow: "hidden", boxShadow: "0 14px 32px rgba(74,74,66,.12)" }}>
              {mapEmbedUrl ? (
                <iframe
                  title="Mapa de la ubicación"
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ display: "block", width: "100%", height: 200, border: 0, filter: "saturate(.88) contrast(1.02)" }}
                />
              ) : (
                <div style={{ position: "relative", height: 150, overflow: "hidden", background: "linear-gradient(135deg,#8b9fae,#a7b1a0)" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 11px,rgba(0,0,0,.04) 11px 22px)" }} />
                  <div style={{ position: "absolute", top: 46, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50% 50% 50% 0", background: T.gold, transform: "rotate(-45deg)", boxShadow: "0 6px 12px rgba(120,93,52,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ width: 10, height: 10, background: T.paper2, borderRadius: "50%", transform: "rotate(45deg)" }} />
                    </div>
                  </div>
                </div>
              )}
              <div style={{ padding: "24px 24px 26px", textAlign: "center" }}>
                <div style={{ fontFamily: SCRIPT, fontSize: 42, color: T.navy, lineHeight: 1, paddingBottom: 3 }}>{venueName || "Nuestro lugar"}</div>
                {cityLine && <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: T.soft, margin: "8px 0 18px", lineHeight: 1.6 }}>{cityLine}</div>}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 26px", border: "1px solid rgba(78,102,121,.4)", borderRadius: 40, textDecoration: "none", background: "rgba(111,138,163,.07)" }}>
                    <span style={{ width: 6, height: 6, background: T.blue, transform: "rotate(45deg)" }} />
                    <span style={{ fontFamily: ff("venue_button"), fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.navy, fontWeight: 600 }}>{tx("venue_button")}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 5 · CÓDIGO DE VESTIMENTA ============ */}
        {showDressCode && (
          <section style={{ position: "relative", overflow: "hidden", padding: "56px 30px 58px", background: "linear-gradient(180deg,rgba(111,138,163,.06),rgba(111,138,163,.12))", borderTop: "1px solid rgba(78,102,121,.12)", borderBottom: "1px solid rgba(78,102,121,.12)" }}>
            <img src={ASSET("flor-seca.png")} alt="" style={{ position: "absolute", top: -30, right: -46, width: 140, opacity: 0.45, transform: "rotate(20deg)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <SectionTitle script={tx("dress_script")} caps={tx("dress_title")} scriptFont={ff("dress_script")} capsFont={ff("dress_title")} />
              <div style={{ fontFamily: ff("dress_value"), fontWeight: 800, fontSize: 34, letterSpacing: "0.04em", textTransform: "uppercase", color: T.blue, lineHeight: 1.05 }}>{dressCodeText}</div>
              <p style={{ fontFamily: ff("dress_text"), fontSize: 12.5, color: T.soft, lineHeight: 1.85, margin: "16px auto 30px", maxWidth: 300, textWrap: "pretty", whiteSpace: "pre-line" }}>
                {tx("dress_text")}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                {DRESS_PALETTE.map((p) => (
                  <div key={p.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
                    <span style={{ width: 50, height: 50, borderRadius: "50%", background: p.c, border: p.border ? "1px solid rgba(176,141,82,.25)" : "none", boxShadow: "0 6px 14px rgba(90,100,95,.28),inset 0 2px 5px rgba(255,255,255,.3)" }} />
                    <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.soft }}>{p.n}</span>
                  </div>
                ))}
              </div>
              {showKidsPolicy && (
                <p style={{ fontFamily: MONO, fontSize: 11, color: T.soft, letterSpacing: "0.06em", marginTop: 26 }}>{kidsPolicyText}</p>
              )}
            </div>
          </section>
        )}

        {/* ============ 6 · MESA DE REGALOS ============ */}
        {(showGifts || showBank) && (
          <section style={{ position: "relative", overflow: "hidden", padding: "56px 30px 58px" }}>
            <img src={ASSET("flor-azul.png")} alt="" style={{ position: "absolute", top: 40, left: -54, width: 140, opacity: 0.45, transform: "rotate(-20deg) scaleX(-1)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <SectionTitle script={tx("gifts_script")} caps={tx("gifts_title")} scriptFont={ff("gifts_script")} capsFont={ff("gifts_title")} />
              <p style={{ textAlign: "center", fontFamily: MONO, fontSize: 12.5, color: T.soft, lineHeight: 1.85, margin: "0 auto 28px", maxWidth: 310, textWrap: "pretty", whiteSpace: "pre-line" }}>{giftsMessage}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {showGifts && giftUrl1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, background: T.paper2, borderRadius: 3, padding: "20px 22px", boxShadow: "0 10px 26px rgba(74,74,66,.1)" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(111,138,163,.12)", border: "1px solid rgba(78,102,121,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8 H19 L18 20 H6 Z" /><path d="M8.5 8 V6.5 A3.5 3.5 0 0 1 15.5 6.5 V8" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.navy, lineHeight: 1.2, letterSpacing: "0.02em" }}>{giftLabel1}</div>
                    </div>
                    <a href={giftUrl1} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontFamily: ff("gifts_link"), fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDark, fontWeight: 700, whiteSpace: "nowrap" }}>{tx("gifts_link")}</a>
                  </div>
                )}
                {showGifts && giftUrl2 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, background: T.paper2, borderRadius: 3, padding: "20px 22px", boxShadow: "0 10px 26px rgba(74,74,66,.1)" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(176,141,82,.14)", border: "1px solid rgba(176,141,82,.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.goldDark} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9 L12 4 L20 9" /><path d="M5 9 V19 H19 V9" /><line x1="3" y1="19" x2="21" y2="19" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.navy, lineHeight: 1.2, letterSpacing: "0.02em" }}>{giftLabel2 || "Mesa de regalos 2"}</div>
                    </div>
                    <a href={giftUrl2} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontFamily: ff("gifts_link"), fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDark, fontWeight: 700, whiteSpace: "nowrap" }}>{tx("gifts_link")}</a>
                  </div>
                )}
                {showBank && (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, background: T.paper2, borderRadius: 3, padding: "20px 22px", boxShadow: "0 10px 26px rgba(74,74,66,.1)" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(176,141,82,.14)", border: "1px solid rgba(176,141,82,.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.goldDark} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9 L12 4 L20 9" /><path d="M5 9 V19 H19 V9" /><line x1="3" y1="19" x2="21" y2="19" /><line x1="12" y1="12" x2="12" y2="16" /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.navy, lineHeight: 1.2, letterSpacing: "0.02em" }}>{bankName || "Transferencia"}</div>
                      {bankHolder && <div style={{ fontFamily: MONO, fontSize: 10, color: T.soft, marginTop: 4, letterSpacing: "0.04em" }}>Titular: {bankHolder}</div>}
                      <div style={{ fontFamily: MONO, fontSize: 10, color: T.soft, marginTop: 3, letterSpacing: "0.04em", overflowWrap: "anywhere" }}>CLABE: {bankAccount}</div>
                    </div>
                    <span onClick={copyBank} style={{ fontFamily: SERIF, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDark, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "✓ Copiado" : "Copiar"}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============ 7 · GALERÍA ============ */}
        {gallery.length > 0 && (
          <section style={{ position: "relative", overflow: "hidden", padding: "56px 26px 58px", background: "linear-gradient(180deg,rgba(147,160,127,.07),rgba(111,138,163,.1))", borderTop: "1px solid rgba(147,160,127,.16)", borderBottom: "1px solid rgba(78,102,121,.12)" }}>
            <img src={ASSET("flor-seca.png")} alt="" style={{ position: "absolute", bottom: -30, right: -50, width: 150, opacity: 0.45, transform: "rotate(14deg)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: 28 }}>
                <SectionTitle script={tx("gallery_script")} caps={tx("gallery_title")} scriptFont={ff("gallery_script")} capsFont={ff("gallery_title")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: 118, gap: 9 }}>
                {gallery.map((src, i) => {
                  // posiciones: 0 = alto (span 2), 3 = ancho (span 2)
                  const span = i === 0 ? { gridRow: "span 2" } : i === 3 ? { gridColumn: "span 2" } : {};
                  return (
                    <div key={i} style={{ ...span, position: "relative", borderRadius: 2, overflow: "hidden", boxShadow: "0 5px 14px rgba(70,80,95,.14)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ============ 8 · RSVP ============ */}
        <section style={{ position: "relative", padding: "58px 30px 70px", overflow: "hidden" }}>
          <img src={ASSET("flor-seca.png")} alt="" style={{ position: "absolute", top: 0, right: -44, width: 135, opacity: 0.5, transform: "rotate(16deg)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontFamily: ff("rsvp_title"), fontSize: 48, color: T.sage, lineHeight: 1.3, paddingBottom: 6 }}>{tx("rsvp_title")}</div>
            </div>
            <div style={{ position: "relative", padding: 3 }}>
              <div style={{ position: "absolute", inset: 0, background: T.paper2, filter: "url(#ol-deckle2)", boxShadow: "0 16px 38px rgba(74,74,66,.14)" }} />
              <div style={{ position: "relative", padding: "34px 26px 36px" }}>
                {!confirmed ? (
                  <>
                    <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 12.5, color: T.soft, lineHeight: 1.75, marginBottom: 24 }}>
                      {rsvpDeadline || "Confírmanos tu asistencia, por favor."}
                    </div>
                    <div style={{ fontFamily: ff("rsvp_question"), fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: T.soft, fontWeight: 600, marginBottom: 11, textAlign: "center" }}>{tx("rsvp_question")}</div>
                    <div style={{ display: "flex", gap: 12, marginBottom: yes ? 18 : 26 }}>
                      <div onClick={() => setAttending(true)} style={{ ...segBase, fontFamily: ff("rsvp_yes"), ...(yes ? { background: T.sage, color: T.paper, boxShadow: "0 7px 16px rgba(120,140,105,.3)" } : { background: "transparent", color: T.soft, border: "1px solid rgba(78,102,121,.25)" }) }}>{tx("rsvp_yes")}</div>
                      <div onClick={() => setAttending(false)} style={{ ...segBase, fontFamily: ff("rsvp_no"), ...(no ? { background: T.soft, color: T.paper, boxShadow: "0 7px 16px rgba(80,76,62,.3)" } : { background: "transparent", color: T.soft, border: "1px solid rgba(78,102,121,.25)" }) }}>{tx("rsvp_no")}</div>
                    </div>

                    {yes && maxGuests > 1 && (
                      <div style={{ marginBottom: 26, textAlign: "center" }}>
                        <div style={{ fontFamily: ff("rsvp_count"), fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: T.soft, fontWeight: 600, marginBottom: 11 }}>{tx("rsvp_count")}</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                          {passOptions.map((n) => (
                            <div key={n} onClick={() => setPartySize(n)} style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: SERIF, fontSize: 15, fontWeight: 600, transition: "all .2s ease", ...(partySize === n ? { background: T.navy, color: T.paper } : { background: "transparent", color: T.soft, border: "1px solid rgba(78,102,121,.3)" }) }}>{n}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errMsg && <div style={{ textAlign: "center", color: "#b04a3e", fontFamily: MONO, fontSize: 11, marginBottom: 14 }}>{errMsg}</div>}

                    <div onClick={() => !busy && submitRSVP()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, width: "100%", padding: "17px 0", borderRadius: 3, background: "linear-gradient(180deg,#c2a06a,#B08D52)", color: T.paper2, fontFamily: ff("rsvp_submit"), fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 11px 24px rgba(150,120,75,.32)", ...(attending === null || busy ? { opacity: 0.45, pointerEvents: "none", boxShadow: "none" } : {}) }}>
                      <span style={{ width: 7, height: 7, background: T.paper2, transform: "rotate(45deg)" }} />
                      {busy ? "Enviando…" : tx("rsvp_submit")}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "14px 4px 8px" }}>
                    <div style={{ width: 74, height: 74, margin: "0 auto 22px", borderRadius: "50%", background: "radial-gradient(circle at 36% 30%,#d6b87f,#B08D52 46%,#8a6d3e)", boxShadow: "inset 0 2px 6px rgba(255,247,232,.4),inset 0 -6px 11px rgba(78,57,28,.4),0 9px 20px rgba(120,93,52,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={T.paper2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {attending ? <path d="M5 12.5 L10 17.5 L19 6.5" /> : <path d="M6 6 L18 18 M18 6 L6 18" />}
                      </svg>
                    </div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: "0.06em", textTransform: "uppercase", color: T.navy, lineHeight: 1.1 }}>{attending ? "¡Confirmado!" : "Gracias por avisar"}</div>
                    <div style={{ fontFamily: SCRIPT, fontSize: 38, color: T.sage, margin: "4px 0 16px", lineHeight: 1.2, paddingBottom: 4 }}>con todo el corazón</div>
                    <p style={{ fontFamily: ff(attending ? "rsvp_confirmed_yes" : "rsvp_confirmed_no"), fontSize: 12.5, lineHeight: 1.85, color: T.soft, margin: "0 0 22px", textWrap: "pretty", whiteSpace: "pre-line" }}>
                      {tx(attending ? "rsvp_confirmed_yes" : "rsvp_confirmed_no")}
                    </p>
                    <div onClick={() => setConfirmed(false)} style={{ display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer", fontFamily: SERIF, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: T.goldDark, fontWeight: 600, borderBottom: "1px solid rgba(138,109,62,.4)", paddingBottom: 3 }}>Modificar mi respuesta</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default PlantillaOlivos;
