// components/dashboard/EventsSection.jsx — tarjetas de eventos (look "Olivos")
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm, { eventToForm } from "./EventForm";
import { C, glass, eyebrow, goldButton, ghostButton, fmtCompact, daysUntil } from "./theme";

function tplLabel(t) {
  if (!t) return "Sin plantilla";
  const map = { plantilla_olivos: "Olivos", plantilla_dusk: "Dusk", plantilla_v1: "Clásica", olivos: "Olivos", dusk: "Dusk", clasica: "Clásica" };
  return map[t] || t.charAt(0).toUpperCase() + t.slice(1);
}

const ICONS = {
  cal: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9b9486" strokeWidth="1.8">
      <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9b9486" strokeWidth="1.8">
      <path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
  clock: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  ),
  gift: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13M12 8s-1-5-4-5-2 5 4 5Zm0 0s1-5 4-5 2 5-4 5Z" strokeLinecap="round" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M9 15l6-6M10.5 6.5l1.4-1.4a3.8 3.8 0 0 1 5.4 5.4l-1.9 1.9M13.5 17.5l-1.4 1.4a3.8 3.8 0 0 1-5.4-5.4l1.9-1.9" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4 20h4L19 9a2.6 2.6 0 0 0-4-4L4 16v4Z" />
      <path d="M14 6l4 4" />
    </svg>
  ),
  users: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.6a3.2 3.2 0 0 1 0 4.8M21 20a6 6 0 0 0-4-5.7" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

const chip = (color, bg) => ({
  display: "inline-flex", alignItems: "center", gap: 6, width: "fit-content",
  padding: "4px 11px", background: bg, borderRadius: 99, fontSize: 11.5, fontWeight: 700, color,
});

function EventCard({ event, isSelected, onView, onCopyLink, onEdit, onSelectForGuests }) {
  const days = daysUntil(event.event_datetime, event.event_date);
  const place = [event.venue_name, event.location].filter(Boolean).join(", ") || "Sin ubicación";
  const hasGifts = !!(event.gift_url_1 || event.gift_url_2 || event.bank_account);

  return (
    <article
      style={{
        display: "flex", flexDirection: "column", gap: 12, padding: 17, borderRadius: 18,
        background: "rgba(255,255,255,0.5)", boxShadow: "0 6px 20px rgba(74,78,52,0.06)", transition: ".15s",
        border: "1.5px solid " + (isSelected ? C.gold : "rgba(255,255,255,0.62)"),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px",
            background: "rgba(196,163,94,0.16)", borderRadius: 99, fontSize: 11, fontWeight: 700,
            color: C.goldDeep, letterSpacing: ".3px",
          }}
        >
          Plantilla · {tplLabel(event.template)}
        </span>
        {isSelected && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: C.goldDeep }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold }} />
            Activo
          </span>
        )}
      </div>

      <h3 className="font-serif-ltd" style={{ margin: 0, fontWeight: 700, fontSize: 26, color: C.ink, lineHeight: 1.05 }}>
        {event.name}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: C.textSoft, fontSize: 13, fontWeight: 600 }}>
          {ICONS.cal}
          {fmtCompact(event.event_datetime, event.event_date)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: C.textSoft, fontSize: 13, fontWeight: 600 }}>
          {ICONS.pin}
          {place}
        </div>
        {days !== null && (
          <span style={{ ...chip(C.goldDeep, "rgba(196,163,94,0.18)"), marginTop: 2 }}>
            {ICONS.clock}
            {days === 0 ? "¡Es hoy!" : `Faltan ${days} días`}
          </span>
        )}
        {hasGifts && (
          <span style={{ ...chip("#a06a52", "rgba(190,150,138,0.16)"), fontSize: 11, marginTop: 2 }}>
            {ICONS.gift}
            Mesa de regalos
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 2 }}>
        <button onClick={onView} style={ghostButton}>{ICONS.eye}Ver</button>
        <button onClick={onCopyLink} style={ghostButton}>{ICONS.link}Link</button>
        <button onClick={onEdit} style={ghostButton}>{ICONS.edit}Editar</button>
        <button
          onClick={onSelectForGuests}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
            background: isSelected ? C.gold : "#3b3a32", border: "none", borderRadius: 10,
            color: "#f6f5ee", fontWeight: 700, fontSize: 12, cursor: "pointer",
          }}
        >
          {ICONS.users}Invitados
        </button>
      </div>
    </article>
  );
}

function FormPanel({ title, eyebrowText, children }) {
  return (
    <div style={{ ...glass(18, 20), marginBottom: 16, background: "rgba(255,255,255,0.6)" }}>
      <div style={{ marginBottom: 14 }}>
        <span style={eyebrow}>{eyebrowText}</span>
        <h3 className="font-serif-ltd" style={{ margin: "2px 0 0", fontWeight: 600, fontSize: 22, color: C.ink }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export default function EventsSection({
  events,
  selectedEventId,
  selectedOrgId,
  onCreateEvent,
  onUpdateEvent,
  onSelectEvent,
  onCopyInviteLink,
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyUpdate, setBusyUpdate] = useState(false);

  const editingEvent = events.find((e) => e.id === editingId) || null;

  async function handleCreate(form) {
    setBusyCreate(true);
    const ok = await onCreateEvent(form);
    setBusyCreate(false);
    if (ok) setShowNew(false);
  }

  async function handleUpdate(id, form) {
    setBusyUpdate(true);
    const ok = await onUpdateEvent(id, form);
    setBusyUpdate(false);
    if (ok) setEditingId(null);
  }

  return (
    <section className="ltd-section" style={{ ...glass(24, null), background: "rgba(255,255,255,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span style={eyebrow}>Tus eventos</span>
          <span className="font-serif-ltd" style={{ fontWeight: 600, fontSize: 24, color: C.ink }}>
            Eventos
          </span>
        </div>
        <button
          onClick={() => { setShowNew((s) => !s); setEditingId(null); }}
          disabled={!selectedOrgId}
          style={{ ...goldButton, opacity: selectedOrgId ? 1 : 0.5, cursor: selectedOrgId ? "pointer" : "not-allowed" }}
        >
          {ICONS.plus}{showNew ? "Cerrar" : "Nuevo evento"}
        </button>
      </div>

      {showNew && (
        <FormPanel eyebrowText="Crear" title="Nuevo evento">
          <EventForm mode="create" onSubmit={handleCreate} onCancel={() => setShowNew(false)} busy={busyCreate} />
        </FormPanel>
      )}

      {editingEvent && (
        <FormPanel eyebrowText="Editar evento" title={editingEvent.name}>
          <EventForm
            mode="edit"
            initial={eventToForm(editingEvent)}
            eventId={editingEvent.id}
            onSubmit={(form) => handleUpdate(editingEvent.id, form)}
            onCancel={() => setEditingId(null)}
            busy={busyUpdate}
          />
        </FormPanel>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 16 }}>
        {events.map((ev) => (
          <EventCard
            key={ev.id}
            event={ev}
            isSelected={selectedEventId === ev.id}
            onView={() => router.push(`/events/${ev.slug}`)}
            onCopyLink={() => onCopyInviteLink(ev.slug)}
            onEdit={() => { setEditingId(ev.id); setShowNew(false); }}
            onSelectForGuests={() => onSelectEvent(ev.id)}
          />
        ))}

        <button
          onClick={() => { if (selectedOrgId) { setShowNew(true); setEditingId(null); } }}
          disabled={!selectedOrgId}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            minHeight: 200, background: "rgba(255,255,255,0.28)", border: "1.5px dashed rgba(120,115,95,0.32)",
            borderRadius: 18, cursor: selectedOrgId ? "pointer" : "not-allowed", color: C.muted,
            opacity: selectedOrgId ? 1 : 0.5,
          }}
        >
          <span
            style={{
              width: 42, height: 42, borderRadius: 13, background: "rgba(196,163,94,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center", color: C.goldDeep,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span style={{ fontWeight: 700, fontSize: 13, color: C.textSoft }}>
            {events.length === 0 ? "Crea tu primer evento" : "Crear otro evento"}
          </span>
        </button>
      </div>
    </section>
  );
}
