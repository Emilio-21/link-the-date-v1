// app/templates/plantilla_v1/Plantilla.jsx
// Plantilla "Clásica" — recreación del diseño original (crema + Pinyon + Cinzel,
// píldoras durazno) pero en layout de FLUJO responsivo (ya no 440x1750 absoluto).
// Contrato: { event, guest, rsvp }.
"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtDeadline } from "@/lib/dashboard/utils";

const IMG = (name) => `/template/plantilla_v1/${name}`;

// ── helpers de fecha ───────────────────────────────────────────────────────
function monthES(s) { try { return new Date(`${s}T00:00:00`).toLocaleDateString("es-MX", { month: "long" }); } catch { return ""; } }
function dayNum(s) { try { return String(new Date(`${s}T00:00:00`).getDate()); } catch { return ""; } }
function yearNum(s) { try { return String(new Date(`${s}T00:00:00`).getFullYear()); } catch { return ""; } }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function extractTime(iso) {
  if (!iso) return { time: "", ampm: "" };
  try {
    const d = new Date(iso);
    let h = d.getHours();
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    const m = d.getMinutes();
    return { time: m === 0 ? String(h) : `${h}:${String(m).padStart(2, "0")}`, ampm };
  } catch { return { time: "", ampm: "" }; }
}

// ── countdown (numeros grandes + labels) ───────────────────────────────────
function Countdown({ iso }) {
  const target = useMemo(() => (iso ? new Date(iso).getTime() : null), [iso]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (!target) return null;
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  const p = (n) => String(n).padStart(2, "0");
  const units = [[p(d), "dias"], [p(h), "hrs"], [p(m), "min"], [p(s), "sec"]];
  return (
    <div className="flex items-start justify-center gap-5 sm:gap-7">
      {units.map(([val, label]) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <div className="font-cinzel text-3xl text-black tabular-nums leading-none">{val}</div>
          <div className="font-cinzel text-[12px] tracking-[3px] text-black">{label}</div>
        </div>
      ))}
    </div>
  );
}

// flores laterales decorativas
function FlowerSides({ className = "" }) {
  return (
    <>
      <img src={IMG("flores-izquierda.svg")} alt="" className={`absolute left-0 w-12 opacity-90 pointer-events-none select-none ${className}`} />
      <img src={IMG("flores-derecha.svg")} alt="" className={`absolute right-0 w-12 opacity-90 pointer-events-none select-none ${className}`} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export function Plantilla({ event, guest, rsvp }) {
  // ── datos ──────────────────────────────────────────────────────────────
  const coupleName = event?.couple_name || "Los novios";
  const eventDate = event?.event_date || "";
  const eventISO = event?.event_datetime || (eventDate ? `${eventDate}T17:00:00` : null);
  const { time, ampm } = extractTime(event?.event_datetime);
  const venueName = event?.venue_name || "";
  const city = event?.location || "";
  const mapUrl = event?.location_url || null;

  const mainMessage = event?.main_message
    || "Nos encantaría contar con tu\npresencia en este día tan especial\npara nosotros";
  const dressCodeText = event?.dress_code_text || "Formal";
  const kidsPolicyText = event?.kids_policy_text || "Sin niños";

  const giftsMessage = event?.gifts_message
    || "Lo más importante es tu presencia,\npero si quieres bendecirnos con algo\naquí tienes algunas sugerencias";
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

  // ── RSVP ───────────────────────────────────────────────────────────────
  const [attending, setAttending] = useState(rsvp?.attending ?? null);
  const [partySize, setPartySize] = useState(rsvp?.party_size ? Math.min(maxGuests, rsvp.party_size) : 1);
  const [confirmed, setConfirmed] = useState(rsvp?.attending != null);
  const [busy, setBusy] = useState(false);
  const [rsvpMsg, setRsvpMsg] = useState(
    rsvp?.attending === true ? `¡CONFIRMADO! ✅ (${rsvp.party_size || 1})`
    : rsvp?.attending === false ? "Registramos que no podrás asistir" : ""
  );
  const passOptions = useMemo(() => Array.from({ length: maxGuests }, (_, i) => i + 1), [maxGuests]);

  async function submitRSVP(att) {
    if (!guest?.id) { setRsvpMsg("No se encontró el invitado."); return; }
    const size = att ? Math.max(1, Math.min(maxGuests, Number(partySize) || 1)) : 0;
    try {
      setBusy(true); setRsvpMsg("");
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ guest_id: guest.id, attending: att, party_size: size }),
      });
      const txt = await res.text();
      let json = null; try { json = txt ? JSON.parse(txt) : null; } catch {}
      if (!res.ok) { setRsvpMsg(json?.error || `No se pudo registrar (status ${res.status})`); return; }
      setAttending(att);
      setConfirmed(true);
      setRsvpMsg(att ? `¡CONFIRMADO! ✅ (${size})` : "Registramos que no podrás asistir");
    } catch (e) {
      setRsvpMsg(e?.message || "Error registrando.");
    } finally { setBusy(false); }
  }

  const [copied, setCopied] = useState(false);
  async function copyBank() {
    try { await navigator.clipboard.writeText(String(bankAccount).replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  }

  // estilos reutilizables (look original)
  const pinyonHead = "font-pinyon text-black text-[40px] leading-[0.95]";
  const cinzelCaps = "font-cinzel text-black text-[13px] tracking-[4.94px]";
  const peachBtn = "inline-flex items-center justify-center min-w-[120px] h-9 px-4 rounded-[21px] bg-[#f2ccaa] font-cinzel text-[10px] tracking-[3.4px] text-black text-center";
  // botón de regalos con más contraste (dorado sólido + borde)
  const giftBtn = "inline-flex items-center justify-center min-w-[170px] h-12 px-7 rounded-[26px] bg-[#d99f5c] border border-[#a9762f] font-cinzel text-[13px] tracking-[3.6px] text-black font-bold shadow-sm hover:bg-[#cf9149] transition";
  // desvanece las flores arriba y abajo para que no se vea el corte
  const flowerMask = "linear-gradient(to bottom, transparent 0%, #000 16%, #000 80%, transparent 100%)";
  const flowerStrip = (side, src) => ({
    backgroundImage: `url(${IMG(src)})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "104px auto",
    backgroundPosition: `top ${side}`,
    WebkitMaskImage: flowerMask,
    maskImage: flowerMask,
  });
  const outlineBtn = "inline-flex items-center justify-center w-[128px] h-[45px] rounded-[31px] border border-black font-cinzel text-[10px] tracking-[3.2px] text-black text-center transition";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen w-full bg-[#0f0f10] flex justify-center">
      <div className="w-full max-w-[440px] bg-[#fff3e7] overflow-hidden">

        {/* ===== HERO ===== */}
        <div className="relative">
          <img src={coverUrl} alt="Portada" className="w-full h-[390px] object-cover" />
          <div className="absolute top-0 left-0 w-full h-[248px] bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0)_100%)]" />
          <div className="absolute bottom-0 left-0 w-full h-[150px] bg-[linear-gradient(0deg,#fff3e7_0%,rgba(255,243,231,0)_100%)]" />
          <div className="absolute top-9 left-0 w-full text-center px-5">
            <div className="font-pinyon text-white text-[40px] leading-[1.05]">{coupleName}</div>
            <div className="font-cinzel text-white text-[13px] tracking-[4.94px] mt-2">¡Nos casamos!</div>
          </div>
        </div>

        {/* ===== COUNTDOWN ===== */}
        {eventISO && (
          <section className="px-6 pt-2 pb-8 text-center">
            <Countdown iso={eventISO} />
          </section>
        )}

        {/* ===== INVITADO ===== */}
        <section className="px-7 pb-8 text-center">
          <div className={pinyonHead}>{guestName}</div>
          <div className={`${cinzelCaps} mt-3`}>¡ESTÁN INVITADOS!</div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/30">
              <span className="w-1.5 h-1.5 bg-black/60 rotate-45" />
              <span className="font-cinzel text-[9.5px] tracking-[3px] text-black/70">
                {maxGuests === 1 ? "1 ENTRADA" : `${maxGuests} ENTRADAS`}
              </span>
            </span>
            {tableLabel && (
              <span className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#d99f5c] border border-[#a9762f] shadow-sm">
                <span className="w-2.5 h-2.5 bg-black/70 rotate-45" />
                <span className="font-cinzel text-[19px] tracking-[4px] text-black font-bold">MESA {tableLabel}</span>
              </span>
            )}
          </div>

          <p className="font-cinzel text-black text-sm leading-relaxed mt-5 whitespace-pre-line">{mainMessage}</p>
        </section>

        {/* ===== FECHA + LUGAR (racimo floral con fade) ===== */}
        <div className="relative">
          <div className="absolute inset-y-0 -left-3 w-[104px] z-0 pointer-events-none" style={flowerStrip("center", "flores-izquierda.svg")} />
          <div className="absolute inset-y-0 -right-3 w-[104px] z-0 pointer-events-none" style={flowerStrip("center", "flores-derecha.svg")} />

          {/* FECHA + HORA */}
          <section className="relative z-10 px-6 pt-6 pb-4">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="font-pinyon text-black text-5xl leading-none">{cap(monthES(eventDate)) || "Mes"}</div>
                <div className="font-cinzel text-black text-4xl mt-1">{dayNum(eventDate) || "--"}</div>
                <div className="font-cinzel text-black text-base tracking-[8px] mt-1">{yearNum(eventDate)}</div>
              </div>
              {(time || ampm) && (
                <>
                  <span className="w-px h-28 bg-black/40" />
                  <div className="text-center">
                    <div className="font-pinyon text-black text-5xl leading-none">{time}</div>
                    <div className="font-cinzel text-black text-2xl mt-1">{ampm}</div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* LUGAR */}
          <section className="relative z-10 px-7 pt-4 pb-8 text-center">
            {venueName && <div className={pinyonHead}>{venueName}</div>}
            {city && <div className={`${cinzelCaps} mt-2`}>{city}</div>}
            {mapUrl && (
              <div className="mt-4">
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={peachBtn}>Ubicación</a>
              </div>
            )}
          </section>
        </div>

        {/* ===== DRESS CODE (sin flores a los lados) ===== */}
        {showDressCode && (
          <section className="px-7 pt-10 pb-8 text-center">
            <div className={pinyonHead}>Dress Code</div>
            <div className={`${cinzelCaps} mt-3`}>{dressCodeText}</div>
            <p className="font-cinzel text-black text-sm leading-relaxed mt-3">
              ¡luce tu mejor look!<br />obviamente el color blanco está prohibido
            </p>
            {showKidsPolicy && <div className={`${cinzelCaps} mt-5`}>{kidsPolicyText}</div>}
          </section>
        )}

        {/* ===== REGALOS / BANCO (racimo floral con fade) ===== */}
        {(showGifts || showBank) && (
          <div className="relative">
            <div className="absolute inset-y-0 -left-3 w-[104px] z-0 pointer-events-none" style={flowerStrip("center", "flores-izquierda.svg")} />
            <div className="absolute inset-y-0 -right-3 w-[104px] z-0 pointer-events-none" style={flowerStrip("center", "flores-derecha.svg")} />

            <section className="relative z-10 px-5 pt-8 pb-10 text-center">
              <div className="mx-auto max-w-[300px] rounded-3xl bg-[#fbf1e2]/85 border border-[#d99f5c]/50 shadow-sm backdrop-blur-[1px] px-6 py-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d99f5c] mb-2">
                  <span className="font-cinzel text-[9px] tracking-[3px] text-black font-bold">MESA DE REGALOS</span>
                </div>
                <div className={pinyonHead}>Regalos</div>
                <p className="font-cinzel text-black text-[12.5px] leading-relaxed mt-3 whitespace-pre-line">{giftsMessage}</p>
                <div className="flex flex-col items-center gap-3 mt-5">
                  {showGifts && gift1 && <a href={gift1} target="_blank" rel="noopener noreferrer" className={giftBtn}>{giftLabel1}</a>}
                  {showGifts && gift2 && <a href={gift2} target="_blank" rel="noopener noreferrer" className={giftBtn}>{giftLabel2}</a>}
                </div>
                {showBank && (
                  <div className="mt-7 pt-6 border-t border-[#d99f5c]/40">
                    <p className="font-cinzel text-black text-[11px] leading-relaxed">
                      DE IGUAL MANERA SI NOS QUIERES BENDECIR<br />CON DINERO, TE DEJAMOS UNA CUENTA
                    </p>
                    <div className="mt-3 inline-flex items-center gap-3 px-5 h-11 rounded-[24px] bg-[#d99f5c] border border-[#a9762f]">
                      <span className="font-cinzel text-black text-[11px] tracking-[2px] tabular-nums font-bold">{bankAccount}</span>
                      <button onClick={copyBank} className="font-cinzel text-black text-[9px] tracking-[2px] underline font-semibold">
                        {copied ? "✓" : "COPIAR"}
                      </button>
                    </div>
                    {bankName && <div className="font-cinzel text-black text-[9px] tracking-[2.66px] mt-2 font-semibold">{bankName.toUpperCase()}</div>}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ===== GALERÍA ===== */}
        {gallery.length > 0 && (
          <section className="px-6 py-7">
            <div className={`${cinzelCaps} text-center mb-4`}>RECUERDOS</div>
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
        <section className="relative px-7 pt-7 pb-12 text-center">
          <img src={IMG("flores-derecha.svg")} alt="" className="absolute -right-1 top-2 w-12 opacity-80 pointer-events-none" />
          <div className={pinyonHead}>Confirma tu asistencia</div>
          {rsvpDeadline && (
            <div className="font-cinzel text-black text-[11px] tracking-[2px] mt-2">Confirma antes del {rsvpDeadline}</div>
          )}
          <div className={`${cinzelCaps} mt-3`}>CUENTAS CON {maxGuests} ENTRADA{maxGuests !== 1 ? "S" : ""}</div>

          {confirmed ? (
            <div className="mt-6">
              <div className="font-cinzel text-black text-[12px] tracking-[2px] inline-block bg-white/70 border border-black rounded-full px-4 py-1.5">
                {rsvpMsg}
              </div>
              <div className="mt-4">
                <button onClick={() => { setConfirmed(false); setRsvpMsg(""); }} className="font-cinzel text-black text-[10px] tracking-[2px] underline">
                  MODIFICAR RESPUESTA
                </button>
              </div>
            </div>
          ) : (
            <>
              {maxGuests > 1 && (
                <div className="mt-5">
                  <div className="font-cinzel text-black text-[10px] tracking-[3px] mb-2">PASES</div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {passOptions.map((n) => (
                      <button key={n} onClick={() => setPartySize(n)}
                        className={`w-9 h-9 rounded-full font-cinzel text-sm transition ${partySize === n ? "bg-black text-white" : "border border-black/40 text-black"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {rsvpMsg && <div className="font-cinzel text-rose-700 text-[11px] mt-3">{rsvpMsg}</div>}

              <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => !busy && submitRSVP(true)} disabled={busy}
                  className={`${outlineBtn} hover:bg-black hover:text-white disabled:opacity-40`}>
                  {busy ? "..." : "SÍ AHÍ ESTARÉ"}
                </button>
                <button onClick={() => !busy && submitRSVP(false)} disabled={busy}
                  className={`${outlineBtn} hover:bg-black hover:text-white disabled:opacity-40`}>
                  NO PODRÉ
                </button>
              </div>
            </>
          )}
        </section>

      </div>
    </main>
  );
}

export default Plantilla;
