// app/dashboard/qr/[eventId]/page.js
// Hojas de QR para imprimir y recortar. Se abre desde el dashboard, en pestaña
// aparte, y está pensada para mandarla directo a la impresora (Ctrl/Cmd + P).
//
// Provisional: depende de FEATURE_QR (ver lib/features.js).
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FEATURE_QR } from "@/lib/features";
import { inviteUrl, qrSvg } from "@/lib/qr/inviteQr";

// Tamaños de recorte, en milímetros de lado del QR. El nombre va debajo.
const SIZES = [
  { key: "s", label: "Chico", mm: 30 },
  { key: "m", label: "Mediano", mm: 38 },
  { key: "l", label: "Grande", mm: 46 },
];

export default function QrSheetPage() {
  const params = useParams();
  const eventId = params?.eventId;

  const [guests, setGuests] = useState([]);
  const [eventName, setEventName] = useState("");
  const [svgs, setSvgs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sizeKey, setSizeKey] = useState("m");
  const [showTable, setShowTable] = useState(true);

  const size = SIZES.find((s) => s.key === sizeKey) || SIZES[1];

  // Invitados del evento (mismo endpoint que usa el dashboard).
  useEffect(() => {
    if (!eventId) return;
    let alive = true;
    (async () => {
      try {
        const gRes = await fetch(`/api/guests?event_id=${encodeURIComponent(eventId)}`, { cache: "no-store" });
        const gJson = await gRes.json();
        if (!alive) return;
        if (!gRes.ok) throw new Error(gJson?.error || "No se pudieron cargar los invitados.");
        setGuests((gJson.guests || []).filter((g) => g.token));

        // El nombre es sólo para el encabezado; se lee con la sesión del
        // anfitrión (RLS), así que si no hay sesión simplemente no aparece.
        const { data: ev } = await createClient()
          .from("events").select("name,couple_name").eq("id", eventId).maybeSingle();
        if (alive && ev) setEventName(ev.name || ev.couple_name || "");
      } catch (e) {
        if (alive) setError(e?.message || "Error cargando la lista.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [eventId]);

  // Un SVG por invitado. Se generan una sola vez: no dependen del tamaño,
  // porque el SVG escala solo.
  useEffect(() => {
    if (!guests.length) return;
    let alive = true;
    (async () => {
      const out = {};
      for (const g of guests) {
        try { out[g.id] = await qrSvg(inviteUrl(g)); } catch { /* se omite ese QR */ }
      }
      if (alive) setSvgs(out);
    })();
    return () => { alive = false; };
  }, [guests]);

  const ready = useMemo(
    () => guests.length > 0 && Object.keys(svgs).length === guests.length,
    [guests, svgs]
  );

  return (
    <div className="qr-root">
      <style>{`
        .qr-root { background:#efece3; min-height:100vh; padding:24px 16px 60px;
                   font-family: ui-sans-serif, system-ui, sans-serif; color:#3a382f; }
        .qr-bar { max-width:210mm; margin:0 auto 18px; display:flex; flex-wrap:wrap;
                  align-items:center; gap:12px; justify-content:space-between; }
        .qr-btn { padding:10px 18px; border-radius:11px; border:1px solid rgba(120,115,95,.2);
                  background:#fff; font-weight:700; font-size:13px; cursor:pointer; color:#5a564b; }
        .qr-btn.primary { background:#c4a35e; border-color:#c4a35e; color:#fff; }
        .qr-seg { display:flex; gap:2px; padding:3px; background:#fff;
                  border:1px solid rgba(120,115,95,.2); border-radius:11px; }
        .qr-seg button { padding:6px 12px; border:none; border-radius:8px; cursor:pointer;
                         font-weight:700; font-size:12px; background:transparent; color:#8a8577; }
        .qr-seg button[data-on="1"] { background:rgba(196,163,94,.22); color:#876a28; }

        /* La hoja: A4 con margen, y dentro una rejilla que se llena sola. */
        .qr-sheet { max-width:210mm; margin:0 auto; background:#fff; padding:10mm;
                    box-shadow:0 10px 40px rgba(74,78,52,.14); }
        .qr-grid { display:grid; gap:4mm;
                   grid-template-columns:repeat(auto-fill, minmax(var(--cell), 1fr)); }
        .qr-card { border:1px dashed #c9c4b4; border-radius:2mm; padding:3mm 2mm;
                   display:flex; flex-direction:column; align-items:center; gap:2mm;
                   text-align:center; break-inside:avoid; page-break-inside:avoid; }
        .qr-card svg { width:var(--qr); height:var(--qr); display:block; }
        .qr-name { font-size:9pt; font-weight:700; line-height:1.25; overflow-wrap:anywhere; }
        .qr-meta { font-size:7pt; color:#8a8577; letter-spacing:.04em; }

        @media print {
          @page { size:A4; margin:10mm; }
          .qr-root { background:#fff; padding:0; }
          .qr-bar, .qr-hint { display:none !important; }
          .qr-sheet { box-shadow:none; padding:0; max-width:none; }
        }
      `}</style>

      {!FEATURE_QR ? (
        <p style={{ textAlign: "center", marginTop: 60 }}>
          La función de códigos QR está desactivada.
        </p>
      ) : (
        <>
          <div className="qr-bar">
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Hojas de QR para recortar</div>
              <div style={{ fontSize: 13, color: "#8a8577" }}>
                {eventName ? `${eventName} · ` : ""}
                {loading ? "Cargando…" : `${guests.length} invitado${guests.length !== 1 ? "s" : ""}`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="qr-seg">
                {SIZES.map((s) => (
                  <button key={s.key} data-on={sizeKey === s.key ? "1" : "0"} onClick={() => setSizeKey(s.key)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="qr-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={showTable} onChange={(e) => setShowTable(e.target.checked)} />
                Mesa y pases
              </label>
              <button className="qr-btn primary" onClick={() => window.print()} disabled={!ready}>
                Imprimir
              </button>
            </div>
          </div>

          {error ? (
            <p style={{ textAlign: "center", color: "#9c4a3c" }}>{error}</p>
          ) : loading ? (
            <p style={{ textAlign: "center", color: "#8a8577" }}>Cargando invitados…</p>
          ) : guests.length === 0 ? (
            <p style={{ textAlign: "center", color: "#8a8577" }}>
              Este evento todavía no tiene invitados con enlace.
            </p>
          ) : (
            <>
              <p className="qr-hint" style={{ maxWidth: "210mm", margin: "0 auto 10px", fontSize: 12.5, color: "#8a8577" }}>
                Imprime sin ajustar la escala (100%) para que los códigos conserven su tamaño.
                Las líneas punteadas son las guías de corte.
              </p>
              <div
                className="qr-sheet"
                // La celda ciñe al QR (+6mm de respiro). Con +8mm cabía una
                // columna menos por hoja y las tarjetas quedaban muy sueltas.
                style={{ "--qr": `${size.mm}mm`, "--cell": `${size.mm + 6}mm` }}
              >
                <div className="qr-grid">
                  {guests.map((g) => (
                    <div className="qr-card" key={g.id}>
                      {svgs[g.id]
                        ? <div dangerouslySetInnerHTML={{ __html: svgs[g.id] }} />
                        : <div style={{ width: size.mm + "mm", height: size.mm + "mm", background: "#f2f0e9" }} />}
                      <div className="qr-name">{g.name}</div>
                      {showTable && (
                        <div className="qr-meta">
                          {g.table_assignment ? `Mesa ${g.table_assignment} · ` : ""}
                          {g.max_guests ?? 1} pase{(g.max_guests ?? 1) !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
