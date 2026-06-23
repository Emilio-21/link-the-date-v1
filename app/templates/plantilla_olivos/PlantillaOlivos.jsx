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
import { rsvpDeadlineText } from "@/lib/dashboard/utils";

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
function monthES(d) {
  try { return d.toLocaleDateString("es-MX", { month: "long" }); } catch { return ""; }
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

function SectionTitle({ script, caps, scriptColor = T.sage }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10, marginBottom: 16 }}>
      <span style={{ fontFamily: SCRIPT, fontSize: 46, color: scriptColor, lineHeight: 1, paddingBottom: 2 }}>{script}</span>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.14em", textTransform: "uppercase", color: T.navy }}>{caps}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function PlantillaOlivos({ event, guest, rsvp }) {
  // ── datos ──────────────────────────────────────────────────────────────
  const [partnerA, partnerB] = splitCouple(event?.couple_name || "");
  const eventDate = event?.event_date || "";
  const eventISO = event?.event_datetime || (eventDate ? `${eventDate}T17:00:00` : null);
  const dateObj = eventDate ? new Date(`${eventDate}T00:00:00`) : null;

  const dateText = dateObj
    ? `${dateObj.getDate()} · ${cap(monthES(dateObj))} · ${dateObj.getFullYear()}`
    : (event?.date_text || "");
  const longDate = dateObj
    ? `${cap(dateObj.toLocaleDateString("es-MX", { weekday: "long" }))} · ${dateObj.getDate()} de ${cap(monthES(dateObj))}`
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
  const passesWord = maxGuests === 1 ? "1 pase reservado" : `${maxGuests} pases reservados`;
  const tableLabel = event?.show_table && guest?.table_assignment ? guest.table_assignment : null;

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

  const rsvpDeadline = rsvpDeadlineText(event, "Confírmanos tu asistencia antes del");
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Pinyon+Script&family=Special+Elite&family=Jost:wght@300;400;500;600&display=swap" />
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
            <div style={{ position: "relative", zIndex: 1, fontFamily: SERIF, fontWeight: 500, fontSize: 11, letterSpacing: "0.34em", textTransform: "uppercase", color: "#6F6A58", lineHeight: 1.7, marginBottom: 14 }}>Tienen el honor de acompañarnos<br />en la boda de</div>
            <div style={{ position: "relative", zIndex: 1, fontFamily: SCRIPT, fontSize: 62, whiteSpace: "nowrap", lineHeight: 1.1, paddingBottom: 4, color: T.navy }}>{partnerA || "Los novios"}</div>
            {partnerB && (
              <>
                <div style={{ position: "relative", zIndex: 1, fontFamily: SCRIPT, fontSize: 34, color: T.gold, lineHeight: 0.7, margin: "2px 0" }}>&amp;</div>
                <div style={{ position: "relative", zIndex: 1, fontFamily: SCRIPT, fontSize: 62, whiteSpace: "nowrap", lineHeight: 1.1, paddingBottom: 4, color: T.navy }}>{partnerB}</div>
              </>
            )}
            <Divider />
            {dateText && <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, letterSpacing: "0.3em", textTransform: "uppercase", color: T.blue, marginTop: 18 }}>{dateText}</div>}
            {(venueName || cityLine) && (
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: T.soft, marginTop: 11, lineHeight: 1.7 }}>
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
              <div style={{ fontFamily: SERIF, fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: T.soft, marginBottom: 18 }}>Con todo nuestro cariño,</div>
              <div style={{ fontFamily: SCRIPT, fontSize: 54, lineHeight: 1.12, paddingBottom: 4, color: T.navy }}>{guestName}</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", border: "1px solid rgba(176,141,82,.4)", borderRadius: 40, background: "rgba(194,168,120,.1)" }}>
                  <span style={{ width: 5, height: 5, background: T.gold, transform: "rotate(45deg)" }} />
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDark }}>{passesWord}</span>
                </div>
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
              <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9, color: T.soft, margin: 0, textWrap: "pretty", whiteSpace: "pre-line" }}>{mainMessage}</p>
            </div>
          </div>
        </section>

        {/* ============ 3 · CUENTA REGRESIVA ============ */}
        <section style={{ position: "relative", overflow: "hidden", padding: "54px 30px 58px", background: "linear-gradient(180deg,rgba(111,138,163,.07),rgba(111,138,163,.14))", borderTop: "1px solid rgba(78,102,121,.12)", borderBottom: "1px solid rgba(78,102,121,.12)" }}>
          <img src={ASSET("flor-azul.png")} alt="" style={{ position: "absolute", bottom: -34, left: -46, width: 140, opacity: 0.5, transform: "rotate(-14deg)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 44, color: T.sage, lineHeight: 1.25, paddingBottom: 4 }}>Falta muy poco</div>
            <div style={{ fontFamily: SERIF, fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: T.soft, fontWeight: 500, margin: "10px 0 26px" }}>Cuenta regresiva</div>
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
            <SectionTitle script="La" caps="Celebración" />
            <p style={{ textAlign: "center", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9, color: T.soft, margin: "0 auto 30px", maxWidth: 330, textWrap: "pretty" }}>
              La ceremonia y la fiesta serán en el mismo lugar. Aquí abajo les compartimos la ubicación.
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
                    <span style={{ fontFamily: SERIF, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.navy, fontWeight: 600 }}>Cómo llegar</span>
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
              <SectionTitle script="¿Qué" caps="me pongo?" />
              <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, letterSpacing: "0.04em", textTransform: "uppercase", color: T.blue, lineHeight: 1.05 }}>{dressCodeText}</div>
              <p style={{ fontFamily: MONO, fontSize: 12.5, color: T.soft, lineHeight: 1.85, margin: "16px auto 30px", maxWidth: 300, textWrap: "pretty" }}>
                Inspírate en nuestra paleta de tonos suaves. Reservamos el blanco para la novia.
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
              <SectionTitle script="Mesa de" caps="Regalos" />
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
                    <a href={giftUrl1} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontFamily: SERIF, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDark, fontWeight: 700, whiteSpace: "nowrap" }}>Ver lista →</a>
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
                    <a href={giftUrl2} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontFamily: SERIF, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDark, fontWeight: 700, whiteSpace: "nowrap" }}>Ver lista →</a>
                  </div>
                )}
                {showBank && (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, background: T.paper2, borderRadius: 3, padding: "20px 22px", boxShadow: "0 10px 26px rgba(74,74,66,.1)" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(176,141,82,.14)", border: "1px solid rgba(176,141,82,.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.goldDark} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9 L12 4 L20 9" /><path d="M5 9 V19 H19 V9" /><line x1="3" y1="19" x2="21" y2="19" /><line x1="12" y1="12" x2="12" y2="16" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.navy, lineHeight: 1.2, letterSpacing: "0.02em" }}>{bankName || "Transferencia"}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: T.soft, marginTop: 4, letterSpacing: "0.04em" }}>{bankAccount}</div>
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
                <SectionTitle script="Nuestra" caps="Historia" />
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
              <div style={{ fontFamily: SCRIPT, fontSize: 48, color: T.sage, lineHeight: 1.3, paddingBottom: 6 }}>¿Nos acompañas?</div>
            </div>
            <div style={{ position: "relative", padding: 3 }}>
              <div style={{ position: "absolute", inset: 0, background: T.paper2, filter: "url(#ol-deckle2)", boxShadow: "0 16px 38px rgba(74,74,66,.14)" }} />
              <div style={{ position: "relative", padding: "34px 26px 36px" }}>
                {!confirmed ? (
                  <>
                    <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 12.5, color: T.soft, lineHeight: 1.75, marginBottom: 24 }}>
                      {rsvpDeadline || "Confírmanos tu asistencia, por favor."}
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: T.soft, fontWeight: 600, marginBottom: 11, textAlign: "center" }}>¿Asistirás?</div>
                    <div style={{ display: "flex", gap: 12, marginBottom: yes ? 18 : 26 }}>
                      <div onClick={() => setAttending(true)} style={{ ...segBase, ...(yes ? { background: T.sage, color: T.paper, boxShadow: "0 7px 16px rgba(120,140,105,.3)" } : { background: "transparent", color: T.soft, border: "1px solid rgba(78,102,121,.25)" }) }}>Sí, asistiré</div>
                      <div onClick={() => setAttending(false)} style={{ ...segBase, ...(no ? { background: T.soft, color: T.paper, boxShadow: "0 7px 16px rgba(80,76,62,.3)" } : { background: "transparent", color: T.soft, border: "1px solid rgba(78,102,121,.25)" }) }}>No podré</div>
                    </div>

                    {yes && maxGuests > 1 && (
                      <div style={{ marginBottom: 26, textAlign: "center" }}>
                        <div style={{ fontFamily: SERIF, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: T.soft, fontWeight: 600, marginBottom: 11 }}>¿Cuántos asistirán?</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                          {passOptions.map((n) => (
                            <div key={n} onClick={() => setPartySize(n)} style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: SERIF, fontSize: 15, fontWeight: 600, transition: "all .2s ease", ...(partySize === n ? { background: T.navy, color: T.paper } : { background: "transparent", color: T.soft, border: "1px solid rgba(78,102,121,.3)" }) }}>{n}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errMsg && <div style={{ textAlign: "center", color: "#b04a3e", fontFamily: MONO, fontSize: 11, marginBottom: 14 }}>{errMsg}</div>}

                    <div onClick={() => !busy && submitRSVP()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, width: "100%", padding: "17px 0", borderRadius: 3, background: "linear-gradient(180deg,#c2a06a,#B08D52)", color: T.paper2, fontFamily: SERIF, fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 11px 24px rgba(150,120,75,.32)", ...(attending === null || busy ? { opacity: 0.45, pointerEvents: "none", boxShadow: "none" } : {}) }}>
                      <span style={{ width: 7, height: 7, background: T.paper2, transform: "rotate(45deg)" }} />
                      {busy ? "Enviando…" : "Enviar confirmación"}
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
                    <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.85, color: T.soft, margin: "0 0 22px", textWrap: "pretty" }}>
                      {attending
                        ? `Qué alegría, te esperamos${partySize > 1 ? ` a los ${partySize}` : ""} para celebrar juntos este día tan especial.`
                        : "Lamentamos que no puedas acompañarnos. Te tendremos presente."}
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
