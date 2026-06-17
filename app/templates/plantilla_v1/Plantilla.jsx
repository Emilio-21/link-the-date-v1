// app/templates/plantilla_v1/Plantilla.jsx
// Plantilla "Clásica" — romántica crema con guiones dorados.
// Reescrita a FLUJO responsivo (antes era layout fijo 440x1750 en px absolutos).
// Contrato: { event, guest, rsvp }. RSVP funcional con selector de pases.
"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtDeadline } from "@/lib/dashboard/utils";

const IMG = (name) => `/template/plantilla_v1/${name}`;

// ── helpers ──────────────────────────────────────────────────────────────
function monthES(s) {
  try { return new Date(`${s}T00:00:00`).toLocaleDateString("es-MX", { month: "long" }); } catch { return ""; }
}
function dayNum(s) {
  try { return String(new Date(`${s}T00:00:00`).getDate()); } catch { return ""; }
}
function yearNum(s) {
  try { return String(new Date(`${s}T00:00:00`).getFullYear()); } catch { return ""; }
}
function weekdayES(s) {
  try { const d = new Date(`${s}T00:00:00`).toLocaleDateString("es-MX", { weekday: "long" }); return d.charAt(0).toUpperCase() + d.slice(1); } catch { return ""; }
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ── countdown inline (4 cajas) ─────────────────────────────────────────────
function Countdown({ iso }) {
  const target = useMemo(() => (iso ? new Date(iso).getTime() : null), [iso]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return null;
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  const p = (n) => String(n).padStart(2, "0");
  const units = [[p(d), "días"], [p(h), "hrs"], [p(m), "min"], [p(s), "seg"]];
  return (
    <div className="flex items-start justify-center gap-3 sm:gap-4">
      {units.map(([val, label], i) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div className="font-cinzel text-3xl sm:text-4xl text-[#3f3a34] tabular-nums leading-none">{val}</div>
          <div className="font-cinzel text-[9px] tracking-[0.3em] uppercase text-[#8a6d3e]">{label}</div>
        </div>
      ))}
    </div>
  );
}

// separador con rombo dorado
function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 my-5">
      <span className="w-9 h-px bg-gradient-to-r from-transparent to-[#c2a878]" />
      <span className="w-1.5 h-1.5 bg-[#b08d52] rotate-45" />
      <span className="w-9 h-px bg-gradient-to-r from-[#c2a878] to-transparent" />
    </div>
  );
}

function Heading({ children }) {
  return (
    <h2 className="font-cinzel text-center text-[22px] tracking-[0.18em] uppercase text-[#3f3a34] font-bold">
      {children}
    </h2>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export function Plantilla({ event, guest, rsvp }) {
  // ── datos ──────────────────────────────────────────────────────────────
  const coupleName = event?.couple_name || "Los novios";
  const eventDate = event?.event_date || "";
  const eventISO = event?.event_datetime || (eventDate ? `${eventDate}T17:00:00` : null);
  const venueName = event?.venue_name || "";
  const city = event?.location || "";
  const mapUrl = event?.location_url || null;

  const mainMessage = event?.main_message
    || "Nos encantaría contar con tu presencia en este día tan especial para nosotros.";
  const dressCodeText = event?.dress_code_text || "Formal";
  const kidsPolicyText = event?.kids_policy_text || "Sin niños";

  const giftsMessage = event?.gifts_message || "";
  const giftLabel1 = event?.gift_label_1 || "Mesa de regalos";
  const giftLabel2 = event?.gift_label_2 || "Mesa de regalos";
  const gift1 = event?.gift_url_1 || null;
  const gift2 = event?.gift_url_2 || null;
  const bankAccount = event?.bank_account || null;
  const bankName = event?.bank_name || null;

  const showDressCode = event?.show_dress_code !== false;
  const showKidsPolicy = event?.show_kids_policy !== false;
  const showGifts = event?.show_gifts !== false && (!!gift1 || !!gift2);
  const showBank = event?.show_bank !== false && !!bankAccount;

  const coverUrl = event?.cover_url || IMG("anillo-de-compromiso-44-1.png");
  const gallery = Array.isArray(event?.gallery_urls) ? event.gallery_urls.filter(Boolean) : [];
  const rsvpDeadline = fmtDeadline(event?.rsvp_deadline);

  const guestName = (guest?.name || "").trim() || "Invitación especial";
  const maxGuests = Math.max(1, Number(guest?.max_guests) || 1);
  const tableLabel = event?.show_table && guest?.table_assignment ? guest.table_assignment : null;

  const [copied, setCopied] = useState(false);

  // ── RSVP ───────────────────────────────────────────────────────────────
  const [attending, setAttending] = useState(rsvp?.attending ?? null);
  const [partySize, setPartySize] = useState(rsvp?.party_size ? Math.min(maxGuests, rsvp.party_size) : 1);
  const [confirmed, setConfirmed] = useState(rsvp?.attending != null);
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const passOptions = useMemo(() => Array.from({ length: maxGuests }, (_, i) => i + 1), [maxGuests]);

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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen w-full bg-[#e7e0d6] flex justify-center">
      <div className="w-full max-w-[452px] bg-[#fff3e7] text-[#4a4a42] shadow-[0_0_80px_rgba(60,62,52,.25)] overflow-hidden">

        {/* ===== PORTADA ===== */}
        <section className="relative">
          <div className="relative h-[360px] overflow-hidden">
            <img src={coverUrl} alt="Portada" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0)_55%,rgba(255,243,231,1)_100%)]" />
            <div className="absolute top-9 left-0 w-full text-center px-6">
              <div className="font-pinyon text-white text-[52px] leading-tight drop-shadow">{coupleName}</div>
              <div className="font-cinzel text-white text-[12px] tracking-[0.35em] uppercase mt-1">¡Nos casamos!</div>
            </div>
          </div>
          <div className="text-center px-8 -mt-2 pb-6">
            <Divider />
            {eventDate && (
              <div className="font-cinzel text-[15px] tracking-[0.28em] uppercase text-[#6f8aa3] font-semibold">
                {dayNum(eventDate)} · {cap(monthES(eventDate))} · {yearNum(eventDate)}
              </div>
            )}
            {(venueName || city) && (
              <div className="font-cinzel text-[10px] tracking-[0.22em] uppercase text-[#8a7a5e] mt-2 leading-relaxed">
                {[venueName, city].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </section>

        {/* ===== SALUDO ===== */}
        <section className="relative px-8 py-8 text-center">
          <img src={IMG("flores-izquierda.svg")} alt="" className="absolute -left-3 top-2 w-12 opacity-50 pointer-events-none" />
          <img src={IMG("flores-derecha.svg")} alt="" className="absolute -right-3 top-2 w-12 opacity-50 pointer-events-none" />
          <div className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-[#8a7a5e] mb-3">Con todo nuestro cariño,</div>
          <div className="font-pinyon text-[44px] leading-tight text-[#3f3a34]">{guestName}</div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#b08d52]/40 bg-[#c2a878]/10">
              <span className="w-1.5 h-1.5 bg-[#b08d52] rotate-45" />
              <span className="font-cinzel text-[9.5px] tracking-[0.16em] uppercase text-[#8a6d3e]">
                {maxGuests === 1 ? "1 pase reservado" : `${maxGuests} pases reservados`}
              </span>
            </span>
            {tableLabel && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6f8aa3]/40 bg-[#6f8aa3]/10">
                <span className="w-1.5 h-1.5 bg-[#6f8aa3] rotate-45" />
                <span className="font-cinzel text-[9.5px] tracking-[0.16em] uppercase text-[#4e6679]">Mesa {tableLabel}</span>
              </span>
            )}
          </div>

          <p className="font-cinzel text-[13px] leading-relaxed text-[#6f6a58] mt-5 whitespace-pre-line">{mainMessage}</p>
        </section>

        {/* ===== COUNTDOWN ===== */}
        {eventISO && (
          <section className="px-8 py-8 text-center bg-[#6f8aa3]/[0.07] border-y border-[#4e6679]/10">
            <div className="font-pinyon text-[38px] text-[#93a07f] leading-none">Falta muy poco</div>
            <div className="font-cinzel text-[9px] tracking-[0.4em] uppercase text-[#8a7a5e] mt-2 mb-5">Cuenta regresiva</div>
            <Countdown iso={eventISO} />
            {eventDate && (
              <div className="font-cinzel text-[12px] tracking-[0.22em] uppercase text-[#4e6679] font-semibold mt-5">
                {weekdayES(eventDate)} · {dayNum(eventDate)} de {cap(monthES(eventDate))}
              </div>
            )}
          </section>
        )}

        {/* ===== UBICACIÓN ===== */}
        <section className="px-8 py-9 text-center">
          <Heading>La Celebración</Heading>
          <Divider />
          <div className="rounded-2xl bg-white/60 border border-[#4e6679]/10 p-6 shadow-sm">
            <div className="font-pinyon text-[36px] text-[#4e6679] leading-none">{venueName || "Nuestro lugar"}</div>
            {city && <div className="font-cinzel text-[11px] tracking-[0.12em] text-[#6f6a58] mt-2">{city}</div>}
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full border border-[#4e6679]/40 bg-[#6f8aa3]/10">
                <span className="w-1.5 h-1.5 bg-[#6f8aa3] rotate-45" />
                <span className="font-cinzel text-[11px] tracking-[0.2em] uppercase text-[#4e6679] font-semibold">Cómo llegar</span>
              </a>
            )}
          </div>
        </section>

        {/* ===== DRESS CODE ===== */}
        {showDressCode && (
          <section className="px-8 py-8 text-center bg-[#93a07f]/[0.07] border-y border-[#93a07f]/15">
            <Heading>Código de vestimenta</Heading>
            <Divider />
            <div className="font-cinzel text-[26px] tracking-[0.04em] uppercase text-[#6f8aa3] font-extrabold">{dressCodeText}</div>
            {showKidsPolicy && (
              <p className="font-cinzel text-[11px] tracking-[0.06em] text-[#6f6a58] mt-4">{kidsPolicyText}</p>
            )}
          </section>
        )}

        {/* ===== REGALOS / BANCO ===== */}
        {(showGifts || showBank) && (
          <section className="px-8 py-9 text-center">
            <Heading>Mesa de Regalos</Heading>
            <Divider />
            {giftsMessage && <p className="font-cinzel text-[12px] leading-relaxed text-[#6f6a58] mb-5 whitespace-pre-line">{giftsMessage}</p>}
            <div className="flex flex-col gap-3">
              {showGifts && gift1 && (
                <a href={gift1} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-xl bg-white/70 border border-[#4e6679]/10 px-5 py-4 shadow-sm">
                  <span className="font-cinzel text-[13px] tracking-[0.06em] text-[#3f3a34] font-semibold">{giftLabel1}</span>
                  <span className="font-cinzel text-[10px] tracking-[0.16em] uppercase text-[#8a6d3e] font-bold whitespace-nowrap">Ver lista →</span>
                </a>
              )}
              {showGifts && gift2 && (
                <a href={gift2} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-xl bg-white/70 border border-[#4e6679]/10 px-5 py-4 shadow-sm">
                  <span className="font-cinzel text-[13px] tracking-[0.06em] text-[#3f3a34] font-semibold">{giftLabel2}</span>
                  <span className="font-cinzel text-[10px] tracking-[0.16em] uppercase text-[#8a6d3e] font-bold whitespace-nowrap">Ver lista →</span>
                </a>
              )}
              {showBank && (
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white/70 border border-[#b08d52]/25 px-5 py-4 shadow-sm">
                  <div className="text-left">
                    <div className="font-cinzel text-[13px] tracking-[0.06em] text-[#3f3a34] font-semibold">{bankName || "Transferencia"}</div>
                    <div className="font-cinzel text-[11px] text-[#6f6a58] mt-0.5 tabular-nums">{bankAccount}</div>
                  </div>
                  <button onClick={copyBank} className="font-cinzel text-[10px] tracking-[0.16em] uppercase text-[#8a6d3e] font-bold whitespace-nowrap">
                    {copied ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== GALERÍA ===== */}
        {gallery.length > 0 && (
          <section className="px-6 py-9 bg-[#93a07f]/[0.07] border-y border-[#93a07f]/15">
            <Heading>Nuestra Historia</Heading>
            <Divider />
            <div className="flex flex-col gap-2">
              <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 10" }}>
                <img src={gallery[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {gallery.slice(1, 3).map((src, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "1 / 1" }}>
                      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== RSVP ===== */}
        <section className="relative px-8 py-10 text-center">
          <img src={IMG("flores-derecha.svg")} alt="" className="absolute -right-3 top-4 w-12 opacity-40 pointer-events-none" />
          <div className="font-pinyon text-[42px] text-[#93a07f] leading-tight mb-5">¿Nos acompañas?</div>

          <div className="rounded-2xl bg-white/70 border border-[#4e6679]/10 p-7 shadow-sm">
            {!confirmed ? (
              <>
                <div className="font-cinzel text-[12px] leading-relaxed text-[#6f6a58] mb-5">
                  {rsvpDeadline
                    ? <>Confirma tu asistencia antes del <strong className="text-[#4e6679]">{rsvpDeadline}</strong></>
                    : "Confírmanos tu asistencia, por favor."}
                </div>

                <div className="flex gap-3 mb-5">
                  <button onClick={() => setAttending(true)}
                    className={`flex-1 py-3 rounded-xl font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition ${yes ? "bg-[#93a07f] text-white shadow" : "border border-[#4e6679]/25 text-[#6f6a58]"}`}>
                    Sí, asistiré
                  </button>
                  <button onClick={() => setAttending(false)}
                    className={`flex-1 py-3 rounded-xl font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition ${no ? "bg-[#6f6a58] text-white shadow" : "border border-[#4e6679]/25 text-[#6f6a58]"}`}>
                    No podré
                  </button>
                </div>

                {yes && maxGuests > 1 && (
                  <div className="mb-5">
                    <div className="font-cinzel text-[10px] tracking-[0.22em] uppercase text-[#6f6a58] font-semibold mb-3">¿Cuántos asistirán?</div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {passOptions.map((n) => (
                        <button key={n} onClick={() => setPartySize(n)}
                          className={`w-10 h-10 rounded-full font-cinzel text-sm font-semibold transition ${partySize === n ? "bg-[#4e6679] text-white" : "border border-[#4e6679]/30 text-[#6f6a58]"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {errMsg && <div className="font-cinzel text-[11px] text-rose-600 mb-3">{errMsg}</div>}

                <button onClick={() => !busy && submitRSVP()} disabled={attending === null || busy}
                  className="w-full py-3.5 rounded-xl font-cinzel text-[11px] tracking-[0.2em] uppercase font-semibold text-white bg-gradient-to-b from-[#c2a06a] to-[#b08d52] shadow-md disabled:opacity-40 disabled:shadow-none">
                  {busy ? "Enviando…" : "Enviar confirmación"}
                </button>
              </>
            ) : (
              <div className="py-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#d6b87f] to-[#8a6d3e] flex items-center justify-center shadow-lg">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {attending ? <path d="M5 12.5 L10 17.5 L19 6.5" /> : <path d="M6 6 L18 18 M18 6 L6 18" />}
                  </svg>
                </div>
                <div className="font-cinzel text-[20px] tracking-[0.06em] uppercase text-[#4e6679] font-bold">{attending ? "¡Confirmado!" : "Gracias por avisar"}</div>
                <p className="font-cinzel text-[12px] leading-relaxed text-[#6f6a58] mt-3">
                  {attending
                    ? `Qué alegría, te esperamos${partySize > 1 ? ` a los ${partySize}` : ""} para celebrar juntos.`
                    : "Lamentamos que no puedas acompañarnos. Te tendremos presente."}
                </p>
                <button onClick={() => setConfirmed(false)}
                  className="mt-4 font-cinzel text-[10px] tracking-[0.18em] uppercase text-[#8a6d3e] font-semibold border-b border-[#8a6d3e]/40 pb-0.5">
                  Modificar mi respuesta
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

export default Plantilla;
