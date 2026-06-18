// components/dashboard/Sidebar.jsx — organización + RSVP (look "Olivos")
"use client";

import { useState } from "react";
import { C, glass, eyebrow, initialsOf } from "./theme";

function PlusIcon({ size = 13, sw = 2.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function OrgPanel({ orgs, selectedOrgId, onSelectOrg, onCreateOrg, eventsCount }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    const ok = await onCreateOrg(name);
    setBusy(false);
    if (ok) {
      setName("");
      setAdding(false);
    }
  }

  return (
    <section style={glass(22, 18)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={eyebrow}>Organización</span>
        <button
          onClick={() => setAdding((a) => !a)}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
            background: "rgba(196,163,94,0.16)", border: "none", borderRadius: 9,
            color: C.goldDeep, fontWeight: 700, fontSize: 11.5, cursor: "pointer",
          }}
        >
          <PlusIcon />
          {adding ? "Cerrar" : "Nueva"}
        </button>
      </div>

      {adding && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nueva organización…"
            autoFocus
            style={{
              flex: 1, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(120,115,95,0.2)",
              borderRadius: 11, padding: "10px 12px", fontSize: 13, color: C.ink, outline: "none",
            }}
          />
          <button
            onClick={submit}
            disabled={busy || !name.trim()}
            style={{
              padding: "0 14px", background: C.gold, border: "none", borderRadius: 11,
              color: C.cream, fontWeight: 700, fontSize: 13, cursor: "pointer",
              opacity: busy || !name.trim() ? 0.5 : 1,
            }}
          >
            {busy ? "…" : "Crear"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {orgs.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: C.mutedSoft, fontWeight: 500 }}>
            Crea tu primera organización para empezar.
          </p>
        )}
        {orgs.map((o) => {
          const active = o.id === selectedOrgId;
          return (
            <div
              key={o.id}
              onClick={() => onSelectOrg(o.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
                borderRadius: 13, cursor: "pointer", transition: ".15s",
                border: "1px solid " + (active ? "rgba(196,163,94,0.5)" : "transparent"),
                background: active ? "rgba(196,163,94,0.16)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: "linear-gradient(135deg,#e0cd96,#c9a85a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 12.5, flex: "none",
                }}
              >
                {initialsOf(o.name)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {o.name}
                </span>
                <span style={{ fontSize: 11.5, color: C.mutedSoft, fontWeight: 600 }}>
                  {active
                    ? `${eventsCount} evento${eventsCount !== 1 ? "s" : ""}`
                    : "Seleccionar"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RsvpPanel({ event, stats, totalGuests }) {
  if (!event || totalGuests === 0) return null;

  const responded = stats.yes + stats.no + stats.pending;
  const ringPct = responded ? Math.round((stats.yes / responded) * 100) : 0;

  const cells = [
    { k: "Confirman", v: stats.yes, c: C.olive },
    { k: "No van", v: stats.no, c: C.terracotta },
    { k: "Pendientes", v: stats.pending, c: C.goldText },
    { k: "Personas", v: stats.confirmed, c: C.ink },
  ];

  return (
    <section style={glass(22, 20)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span style={eyebrow}>RSVP</span>
          <span className="font-serif-ltd" style={{ fontWeight: 600, fontSize: 20, color: C.ink }}>
            {event.name}
          </span>
        </div>
        <div
          style={{
            position: "relative", width: 62, height: 62, borderRadius: "50%", flex: "none",
            background: `conic-gradient(${C.gold} ${ringPct}%, rgba(120,115,95,0.16) 0)`,
          }}
        >
          <div
            style={{
              position: "absolute", inset: 7, borderRadius: "50%", background: "rgba(252,251,247,0.92)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 16, color: C.goldDeep }}>{ringPct}%</span>
            <span style={{ fontSize: 8, color: C.mutedSoft, fontWeight: 700, letterSpacing: ".5px" }}>CONF.</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cells.map((s) => (
          <div
            key={s.k}
            style={{
              background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: 15, padding: "13px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.c, flex: "none" }} />
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{s.k}</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: s.c, letterSpacing: "-.5px" }}>{s.v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Sidebar({
  orgs,
  selectedOrgId,
  onSelectOrg,
  onCreateOrg,
  currentEvent,
  guestsCount,
  eventsCount = 0,
  rsvpStats,
}) {
  return (
    <>
      <OrgPanel
        orgs={orgs}
        selectedOrgId={selectedOrgId}
        onSelectOrg={onSelectOrg}
        onCreateOrg={onCreateOrg}
        eventsCount={eventsCount}
      />
      <RsvpPanel event={currentEvent} stats={rsvpStats} totalGuests={guestsCount} />
    </>
  );
}
