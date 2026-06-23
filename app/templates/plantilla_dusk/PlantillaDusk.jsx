"use client";

/* ────────────────────────────────────────────────────────────────────────
   PlantillaDusk.jsx
   Wedding invitation — "Moody Dusk" direction · warm autumn palette
   Same contract as Plantilla.jsx: { event, guest, rsvp }, /api/rsvp, etc.

   Drop-in usage (matches your existing system):
     import { PlantillaDusk } from "./PlantillaDusk";
     <PlantillaDusk event={event} guest={guest} rsvp={rsvp} />

   The hero image is read from event.cover_url (falls back to
   /template/plantilla_dusk/hero.jpg). Replace the asset path in your /public
   tree or pass cover_url on the event row.

   Fonts: this file uses two font-family CSS variables that you can map to
   whatever you've loaded globally (Cinzel + an italic display serif). If
   your project already exposes `font-cinzel` and `font-pinyon` (or
   `font-cormorant`) Tailwind classes, keep them — otherwise the inline
   styles below will fall back gracefully to the system serif stack.
   ──────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { rsvpDeadlineText, localeOf } from "@/lib/dashboard/utils";

/* ── Theme tokens — warm autumn palette ─────────────────────────────── */
const T = {
  bg:       "#1c0f0a",
  bgSoft:   "#2a160d",
  ink:      "#f3e2c8",
  inkSoft:  "rgba(243,226,200,0.7)",
  gold:     "#d4a574",
  ember:    "#e07b3f",
  rust:     "#b8542c",
  burgundy: "#8b2832",
  ochre:    "#c9863f",
  cocoa:    "#7a4b1f",
  rule:     "rgba(212,165,116,0.32)",
};

const DISPLAY = '"Cormorant Garamond", "EB Garamond", "Pinyon Script", serif';
const CAPS    = '"Cinzel", "Cormorant SC", serif';
const BODY    = '"EB Garamond", "Cormorant Garamond", serif';

/* ── Date helpers (English month) ──────────────────────────────────── */
function monthEN(s, locale = "en-US")  { try { return new Date(`${s}T00:00:00`).toLocaleDateString(locale, { month: "long" }); } catch { return ""; } }
function dayNum(s)   { try { return String(new Date(`${s}T00:00:00`).getDate()); } catch { return ""; } }
function yearNum(s)  { try { return String(new Date(`${s}T00:00:00`).getFullYear()); } catch { return ""; } }
function weekdayEN(s, locale = "en-US"){ try { return new Date(`${s}T00:00:00`).toLocaleDateString(locale, { weekday: "short" }).toUpperCase(); } catch { return ""; } }

/* ── Countdown ─────────────────────────────────────────────────────── */
function useCountdown(targetISO) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetISO) return { days: "00", hrs: "00", mins: "00", secs: "00" };
  const target = new Date(targetISO).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hrs  = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return { days: pad(days), hrs: pad(hrs), mins: pad(mins), secs: pad(secs) };
}

/* ── Reusable atoms ────────────────────────────────────────────────── */
const Caps = ({ children, size = 11, tracking = 4, color = T.ink, style }) => (
  <div style={{
    fontFamily: CAPS, fontSize: size, letterSpacing: tracking,
    textTransform: "uppercase", color, fontWeight: 500, ...style,
  }}>{children}</div>
);

const Display = ({ children, size = 56, italic = true, color = T.ink, style }) => (
  <div style={{
    fontFamily: DISPLAY, fontSize: size, lineHeight: 0.95,
    fontStyle: italic ? "italic" : "normal", fontWeight: 400,
    color, letterSpacing: -0.5, ...style,
  }}>{children}</div>
);

const Body = ({ children, size = 14, color = T.inkSoft, style }) => (
  <div style={{
    fontFamily: BODY, fontSize: size, lineHeight: 1.45,
    color, fontWeight: 400, ...style,
  }}>{children}</div>
);

const AutumnLeaf = ({ color = T.ember, size = 14, rotate = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       style={{ transform: `rotate(${rotate}deg)`, display: "inline-block" }}>
    <path d="M12 2 C 6 6, 4 12, 12 22 C 20 12, 18 6, 12 2 Z" fill={color} opacity="0.95"/>
    <path d="M12 4 L 12 21" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6"/>
  </svg>
);

function GradientRule({ from, mid, to, width = 220 }) {
  const id = "gr-" + Math.random().toString(36).slice(2, 8);
  return (
    <svg width={width} height="14" viewBox={`0 0 ${width} 14`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={from} stopOpacity="0"/>
          <stop offset="0.2" stopColor={from}/>
          <stop offset="0.5" stopColor={mid}/>
          <stop offset="0.8" stopColor={to}/>
          <stop offset="1" stopColor={to} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <line x1="0" y1="7" x2={width} y2="7" stroke={`url(#${id})`} strokeWidth="1"/>
      <circle cx={width / 2} cy="7" r="2" fill={mid}/>
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────── */
export function PlantillaDusk({ event, guest, rsvp }) {
  /* event fields — same keys as Plantilla.jsx, with English defaults */
  const coupleName = event?.couple_name || event?.couple_top || "The Couple";
  const eventDate  = event?.event_date  || event?.date       || "";
  const eventISO   = event?.event_datetime || (eventDate ? `${eventDate}T17:00:00` : null);
  const venueName  = event?.venue_name  || event?.location_name || "";
  const city       = event?.city        || event?.location || "";
  const mapUrl     = event?.map_url     || event?.location_url || null;
  const coverUrl   = event?.cover_url   || "/template/plantilla_dusk/hero.jpg";
  const gallery    = Array.isArray(event?.gallery_urls)
    ? event.gallery_urls.filter(Boolean)
    : [];
  const tableLabel = event?.show_table && guest?.table_assignment ? guest.table_assignment : null;

  /* time extraction (mirrors Plantilla.jsx) */
  const rawTime = (() => {
    if (!eventISO) return { time: "", ampm: "" };
    try {
      const d = new Date(eventISO);
      let h = d.getHours();
      const ampm = h >= 12 ? "pm" : "am";
      h = h % 12 || 12;
      const m = d.getMinutes();
      const time = m === 0 ? String(h) : `${h}:${String(m).padStart(2, "0")}`;
      return { time, ampm };
    } catch { return { time: "", ampm: "" }; }
  })();
  const time = event?.time || rawTime.time;
  const ampm = event?.ampm || rawTime.ampm;

  /* customizable copy */
  const mainMessage    = event?.main_message
    || "We would love to share this special day with you — and celebrate the start of our forever, together.";
  const dressCodeText  = event?.dress_code_text  || "Warm Autumn";
  const dressCodeBody  = event?.dress_code_body
    || "Oranges, reds, burgundy & browns — let the season dress you.";
  const kidsPolicyText = event?.kids_policy_text || "Adults only celebration";
  const bankAccount    = event?.bank_account     || null;
  const bankName       = event?.bank_name        || null;
  const locale = localeOf(event, "en-US");
  const rsvpDeadline   = rsvpDeadlineText(event, {
    es: "Confirmar antes del",
    en: "Please reply before",
  });
  const giftsMessage   = event?.gifts_message    || null;
  const giftUrl1       = event?.gift_url_1        || null;
  const giftUrl2       = event?.gift_url_2        || null;
  const giftLabel1     = event?.gift_label_1      || "Mesa de regalos 1";
  const giftLabel2     = event?.gift_label_2      || "Mesa de regalos 2";

  /* section toggles */
  const showDressCode  = event?.show_dress_code  !== false;
  const showKidsPolicy = event?.show_kids_policy !== false;
  const showBank       = event?.show_bank        !== false && !!bankAccount;
  const showGifts      = event?.show_gifts        === true && (!!giftUrl1 || !!giftUrl2);
  const showCountdown  = event?.show_countdown   !== false;

  /* RSVP state — same shape as Plantilla.jsx */
  const [showYesPanel, setShowYesPanel] = useState(false);
  const [partySize, setPartySize] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [busyYes, setBusyYes] = useState(false);
  const [yesConfirmed, setYesConfirmed] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    if (!rsvp) return;
    if (rsvp.attending === true) {
      setYesConfirmed(true);
      setPartySize(Math.max(1, Number(rsvp.party_size || 1)));
    }
    if (rsvp.attending === false) {
      setDeclined(true);
    }
  }, [rsvp]);

  const maxGuests = Math.max(1, Number(guest?.max_guests || 1));
  const { days, hrs, mins, secs } = useCountdown(eventISO);

  async function confirmYes() {
    if (!guest?.id) { setRsvpMsg("Guest not found."); return; }
    const size = Math.max(1, Math.min(maxGuests, Number(partySize) || 1));
    try {
      setBusyYes(true); setRsvpMsg("");
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ guest_id: guest.id, attending: true, party_size: size }),
      });
      const text = await res.text();
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) { setRsvpMsg(json?.error || `Could not confirm (status ${res.status})`); return; }
      setYesConfirmed(true); setDeclined(false);
      setShowYesPanel(false);
    } catch (e) { setRsvpMsg(e?.message || "Error confirming."); }
    finally { setBusyYes(false); }
  }

  async function declineRSVP() {
    if (!guest?.id) { setRsvpMsg("Guest not found."); return; }
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ guest_id: guest.id, attending: false }),
      });
      if (!res.ok) { setRsvpMsg(`Could not register (status ${res.status})`); return; }
      setDeclined(true); setYesConfirmed(false);
    } catch (e) { setRsvpMsg(e?.message || "Error."); }
  }

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <main style={{ minHeight: "100vh", width: "100%", background: T.bg, color: T.ink,
                   display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 440, background: T.bg, paddingBottom: 56 }}>

        {/* HERO — mask-fades into bg, no hard edge */}
        <div style={{ position: "relative", height: 540 }}>
          <div style={{
            position: "absolute", inset: 0, overflow: "hidden",
            WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 50%, rgba(0,0,0,0.55) 78%, transparent 100%)",
            maskImage:       "linear-gradient(180deg, #000 0%, #000 50%, rgba(0,0,0,0.55) 78%, transparent 100%)",
          }}>
            <img src={coverUrl} alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 40%",
              filter: "sepia(0.22) saturate(1) contrast(0.98) brightness(1.05)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(48,12,8,0.85) 0%, rgba(40,20,12,0.35) 16%, rgba(28,15,10,0) 40%)",
            }} />
            <div style={{
              position: "absolute", inset: 0, mixBlendMode: "screen",
              background: "radial-gradient(120% 60% at 50% 70%, rgba(224,123,63,0.22) 0%, transparent 65%)",
            }} />
          </div>

          {/* halo behind names */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0, height: 240,
            background: "radial-gradient(120% 80% at 50% 100%, rgba(48,18,8,0.55) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* top mark */}
          <div style={{ position: "absolute", top: 30, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GradientRule from={T.gold} mid={T.ember} to={T.gold} width={160} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Caps size={9} tracking={6} color={T.gold}>The Wedding of</Caps>
            </div>
          </div>

          {/* names */}
          <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center" }}>
            <Display size={72} color={T.ink} style={{ letterSpacing: -1, lineHeight: 0.9 }}>
              {coupleName.split(/\s+y\s+|\s+&\s+|\s+and\s+/i)[0] || coupleName}
            </Display>
            {coupleName.match(/\s+y\s+|\s+&\s+|\s+and\s+/i) && (
              <>
                <div style={{ margin: "4px 0", fontFamily: DISPLAY, fontSize: 30,
                              fontStyle: "italic", color: T.ember, lineHeight: 1 }}>&amp;</div>
                <Display size={72} color={T.ink} style={{ letterSpacing: -1, lineHeight: 0.9 }}>
                  {coupleName.split(/\s+y\s+|\s+&\s+|\s+and\s+/i)[1]}
                </Display>
              </>
            )}
          </div>
        </div>

        {/* COUNTDOWN */}
        {showCountdown && (
          <div style={{ marginTop: 12, padding: "0 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { v: days, l: "days" }, { v: hrs, l: "hrs" },
                { v: mins, l: "min" }, { v: secs, l: "sec" },
              ].map((c, i) => (
                <div key={c.l} style={{
                  textAlign: "center", padding: "4px 0",
                  borderRight: i < 3 ? `1px solid ${T.rule}` : "none",
                }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 30, fontStyle: "italic",
                                color: T.ember, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{c.v}</div>
                  <div style={{ marginTop: 6, fontFamily: CAPS, fontSize: 9,
                                letterSpacing: 3, color: T.inkSoft, textTransform: "uppercase" }}>{c.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DATE */}
        <div style={{ padding: "44px 24px 0", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 14,
                        padding: "14px 22px",
                        borderTop: `1px solid ${T.ember}`, borderBottom: `1px solid ${T.ember}` }}>
            <Caps size={11} tracking={4} color={T.ember}>{weekdayEN(eventDate, locale) || "FRI"}</Caps>
            <div style={{ fontFamily: DISPLAY, fontSize: 42, fontStyle: "italic", color: T.ink, lineHeight: 1 }}>
              {monthEN(eventDate, locale) || "October"} <span style={{ fontStyle: "normal" }}>{dayNum(eventDate)}</span>
            </div>
            <Caps size={11} tracking={4} color={T.ember}>{yearNum(eventDate)}</Caps>
          </div>
          {time && (
            <div style={{ marginTop: 14 }}>
              <Caps size={10} tracking={5} color={T.inkSoft}>Ceremony at {time} {ampm}</Caps>
            </div>
          )}
        </div>

        {/* GUEST */}
        <div style={{ textAlign: "center", marginTop: 56, padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <AutumnLeaf color={T.ember} size={14} rotate={-30} />
            <Caps size={10} tracking={5} color={T.rust}>For our dear</Caps>
            <AutumnLeaf color={T.gold} size={14} rotate={30} />
          </div>
          <Display size={52} color={T.ink}>{(guest?.name || "").trim() || "You're invited"}</Display>
          {tableLabel && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", border: `1px solid ${T.ember}`, borderRadius: 40, fontFamily: CAPS, fontSize: 10, letterSpacing: 3, color: T.ember }}>
                Mesa {tableLabel}
              </span>
            </div>
          )}
          <div style={{ height: 18 }} />
          <Body size={14} color={T.inkSoft}
                style={{ maxWidth: 280, margin: "0 auto", textWrap: "pretty", whiteSpace: "pre-line" }}>
            {mainMessage}
          </Body>
        </div>

        {/* GALLERY — después del invitado, 1 arriba + 2 abajo */}
        {gallery.length > 0 && (
          <div style={{ marginTop: 40, padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* foto grande arriba */}
            <div style={{ position: "relative", aspectRatio: "16 / 10", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.rule}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallery[0]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* dos fotos abajo */}
            {gallery.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {gallery.slice(1, 3).map((src, i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.rule}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VENUE */}
        <div style={{ textAlign: "center", marginTop: 64, padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GradientRule from={T.gold} mid={T.ember} to={T.rust} width={220} />
          </div>
          <div style={{ height: 16 }} />
          <Caps size={10} tracking={5} color={T.ember}>Celebration at</Caps>
          <div style={{ height: 10 }} />
          <Display size={48} color={T.ink}>{venueName}</Display>
          <div style={{ height: 6 }} />
          <Caps size={10} tracking={4} color={T.gold}>{city}</Caps>
          {mapUrl && (
            <>
              <div style={{ height: 18 }} />
              <a href={mapUrl} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 20px", borderRadius: 999, textDecoration: "none",
                background: "transparent", color: T.ember, border: `1px solid ${T.ember}`,
                fontFamily: CAPS, fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
              }}>
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                  <path d="M5.5 0.5 C 2.74 0.5 0.5 2.74 0.5 5.5 C 0.5 9.25 5.5 12.5 5.5 12.5 C 5.5 12.5 10.5 9.25 10.5 5.5 C 10.5 2.74 8.26 0.5 5.5 0.5 Z M 5.5 7.25 C 4.53 7.25 3.75 6.47 3.75 5.5 C 3.75 4.53 4.53 3.75 5.5 3.75 C 6.47 3.75 7.25 4.53 7.25 5.5 C 7.25 6.47 6.47 7.25 5.5 7.25 Z"
                        fill={T.ember}/>
                </svg>
                <span>How to get there</span>
              </a>
            </>
          )}
        </div>

        {/* DRESS CODE */}
        {showDressCode && (
          <div style={{ textAlign: "center", marginTop: 64, padding: "0 24px" }}>
            <Caps size={10} tracking={5} color={T.ochre}>Dress Code</Caps>
            <div style={{ height: 10 }} />
            <Display size={44} color={T.ink}>{dressCodeText}</Display>
            <div style={{ height: 14 }} />
            <Body size={13} color={T.inkSoft}
                  style={{ maxWidth: 270, margin: "0 auto", whiteSpace: "pre-line" }}>
              {dressCodeBody}
            </Body>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
                          gap: 8, marginTop: 22, padding: "0 6px" }}>
              {[
                { c: T.ember, n: "Ember" }, { c: T.rust, n: "Rust" },
                { c: T.burgundy, n: "Burgundy" }, { c: T.cocoa, n: "Cocoa" },
                { c: T.gold, n: "Gold" },
              ].map((s) => (
                <div key={s.c} style={{ textAlign: "center" }}>
                  <div style={{
                    width: "100%", aspectRatio: "1 / 1", borderRadius: 999, background: s.c,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)", marginBottom: 6,
                  }} />
                  <div style={{ fontFamily: CAPS, fontSize: 7.5, letterSpacing: 1.5,
                                color: T.inkSoft, textTransform: "uppercase" }}>{s.n}</div>
                </div>
              ))}
            </div>
            {showKidsPolicy && (
              <div style={{ marginTop: 26 }}>
                <Caps size={10} tracking={4} color={T.inkSoft}>{kidsPolicyText}</Caps>
              </div>
            )}
          </div>
        )}

        {/* GIFTS & BANK */}
        {(giftsMessage || showGifts || showBank) && (
          <div style={{ marginTop: 64, textAlign: "center", padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <AutumnLeaf color={T.ember} size={14} rotate={-25} />
              <Caps size={10} tracking={5} color={T.ember}>With Love</Caps>
              <AutumnLeaf color={T.ember} size={14} rotate={25} />
            </div>

            {giftsMessage && (
              <Body size={13} color={T.inkSoft}
                    style={{ maxWidth: 300, margin: "0 auto 18px", lineHeight: 1.55, whiteSpace: "pre-line", textWrap: "pretty" }}>
                {giftsMessage}
              </Body>
            )}

            {showGifts && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: showBank ? 20 : 0 }}>
                {giftUrl1 && (
                  <a href={giftUrl1} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "11px 26px", borderRadius: 999, textDecoration: "none",
                    background: "transparent", border: `1px solid ${T.ember}`,
                    fontFamily: CAPS, fontSize: 11, letterSpacing: 3, color: T.ember,
                  }}>{giftLabel1}</a>
                )}
                {giftUrl2 && (
                  <a href={giftUrl2} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "11px 26px", borderRadius: 999, textDecoration: "none",
                    background: "transparent", border: `1px solid ${T.ember}`,
                    fontFamily: CAPS, fontSize: 11, letterSpacing: 3, color: T.ember,
                  }}>{giftLabel2}</a>
                )}
              </div>
            )}

            {showBank && (
              <BankBlock account={bankAccount} bankName={bankName} hideCaption={!!giftsMessage} />
            )}
          </div>
        )}

        {/* RSVP */}
        <div style={{ marginTop: 64, padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <Caps size={10} tracking={5} color={T.ember}>Kindly Reply</Caps>
            <div style={{ height: 10 }} />
            <Display size={36} color={T.ink}>Will you join us?</Display>
            {rsvpDeadline && (
              <div style={{ marginTop: 8 }}>
                <Caps size={9} tracking={4} color={T.inkSoft}>{rsvpDeadline}</Caps>
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <Caps size={10} tracking={4} color={T.inkSoft}>
                You have {maxGuests} {maxGuests === 1 ? "pass" : "passes"} available
              </Caps>
            </div>
          </div>

          {yesConfirmed ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 22px",
                background: `linear-gradient(135deg, ${T.ember} 0%, ${T.rust} 100%)`,
                color: T.bg, borderRadius: 999,
                fontFamily: CAPS, fontSize: 11, letterSpacing: 4,
              }}>
                <span>✓</span>
                <span>CONFIRMED · {partySize} {partySize === 1 ? "GUEST" : "GUESTS"}</span>
              </div>
            </div>
          ) : declined ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: BODY, fontSize: 14, fontStyle: "italic",
                            color: T.inkSoft, lineHeight: 1.5 }}>
                We're sorry you can't make it —<br/>we'll be thinking of you on the day.
              </div>
            </div>
          ) : (
            <>
              {showYesPanel && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, marginBottom: 14, padding: "10px 12px", borderRadius: 999,
                  border: `1px solid ${T.ember}`, background: "rgba(255,255,255,0.02)",
                }}>
                  <Caps size={9} tracking={3} color={T.inkSoft}>Passes</Caps>
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPartySize(n)} style={{
                      width: 26, height: 26, borderRadius: 999,
                      border: `1px solid ${T.rule}`, cursor: "pointer",
                      background: partySize === n ? T.ember : "transparent",
                      color: partySize === n ? T.bg : T.ink,
                      fontFamily: BODY, fontSize: 14, fontStyle: "italic",
                    }}>{n}</button>
                  ))}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  onClick={() => showYesPanel ? confirmYes() : setShowYesPanel(true)}
                  disabled={busyYes}
                  style={{
                    padding: "14px 8px", cursor: "pointer",
                    background: `linear-gradient(135deg, ${T.ember} 0%, ${T.rust} 100%)`,
                    color: "#fff8ec", border: "none", borderRadius: 999,
                    fontFamily: CAPS, fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
                    boxShadow: "0 4px 14px rgba(184,84,44,0.35)",
                  }}>
                  {busyYes ? "…" : showYesPanel ? `Confirm · ${partySize}` : "I'll be there"}
                </button>
                <button onClick={declineRSVP} style={{
                  padding: "14px 8px", cursor: "pointer",
                  background: "transparent", color: T.ink, border: `1px solid ${T.ink}`,
                  borderRadius: 999, fontFamily: CAPS, fontSize: 10, letterSpacing: 3,
                  textTransform: "uppercase",
                }}>Can't make it</button>
              </div>
            </>
          )}
          {rsvpMsg && (
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: 999,
                            background: "rgba(0,0,0,0.25)", border: `1px solid ${T.rule}`,
                            fontFamily: CAPS, fontSize: 9, letterSpacing: 3, color: T.ink }}>
                {rsvpMsg}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GradientRule from={T.burgundy} mid={T.ember} to={T.gold} width={180} />
          </div>
          <div style={{ marginTop: 12 }}>
            <Caps size={8} tracking={5} color={T.inkSoft}>
              {dayNum(eventDate) || "23"} · {monthEN(eventDate, locale)?.[0]?.toUpperCase()}{monthEN(eventDate, locale)?.slice(1, 3).toLowerCase()} · {yearNum(eventDate) || "2026"}
            </Caps>
          </div>
        </div>
      </div>
    </main>
  );
}

/* Bank chip — separate so you can swap it for a project-wide component */
function BankBlock({ account, bankName, hideCaption = false }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(String(account).replace(/\s/g, "")); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div style={{ textAlign: "center", padding: "0 24px" }}>
      {!hideCaption && (
        <Body size={11} style={{ marginBottom: 14, lineHeight: 1.55 }}>
          If you'd like to bless us with a gift,<br/>here's our account.
        </Body>
      )}
      <button onClick={onCopy} style={{
        display: "inline-flex", alignItems: "center", gap: 12,
        padding: "11px 22px", borderRadius: 999, cursor: "pointer",
        background: T.bgSoft, border: `1px solid ${T.rule}`,
        fontFamily: CAPS, fontSize: 11, letterSpacing: 3,
        color: T.ink, fontVariantNumeric: "tabular-nums",
      }}>
        <span>{account}</span>
        <span style={{ opacity: 0.5, fontSize: 9 }}>
          {copied ? "✓ COPIED" : "TAP TO COPY"}
        </span>
      </button>
      {bankName && (
        <div style={{ marginTop: 8 }}>
          <Caps size={8} tracking={2.5} color={T.inkSoft}>{bankName}</Caps>
        </div>
      )}
    </div>
  );
}

export default PlantillaDusk;
