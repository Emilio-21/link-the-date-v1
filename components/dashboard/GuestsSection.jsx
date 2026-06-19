// components/dashboard/GuestsSection.jsx — invitados con 3 vistas (look "Olivos")
"use client";

import { useMemo, useState } from "react";
import {
  C, glass, eyebrow, goldButton, fieldInput,
  RSVP, rsvpKey, AVATAR_BGS, initialsOf,
} from "./theme";

const EMPTY = { name: "", passes: 1, email: "", phone: "", table: "" };

const ICONS = {
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9b9486" strokeWidth="1.9">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  copy: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4 20h4L19 9a2.6 2.6 0 0 0-4-4L4 16v4Z" />
      <path d="M14 6l4 4" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
    </svg>
  ),
};

function guestView(g, i) {
  const m = RSVP[rsvpKey(g.rsvp_status)];
  return {
    raw: g,
    initials: initialsOf(g.name),
    avatarBg: AVATAR_BGS[i % AVATAR_BGS.length],
    name: g.name,
    email: g.email || "—",
    phone: g.phone || "—",
    pases: g.max_guests ?? 1,
    mesa: g.table_assignment || "—",
    asistentes: g.rsvp_status === "yes" ? g.rsvp_count ?? 1 : 0,
    rsvpLabel: m.label,
    rsvpColor: m.color,
    rsvpBg: m.bg,
  };
}

const rsvpPill = (gv) => ({
  display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 99,
  fontWeight: 700, fontSize: 12, color: gv.rsvpColor, background: gv.rsvpBg, whiteSpace: "nowrap",
});

const iconBtn = (danger) => ({
  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid " + (danger ? "rgba(176,106,82,0.25)" : "rgba(120,115,95,0.18)"),
  borderRadius: 9, color: danger ? "#a85c43" : C.textSoft, cursor: "pointer",
});

const copyBtnSmall = {
  display: "flex", alignItems: "center", gap: 6, padding: "6px 11px",
  background: "rgba(196,163,94,0.16)", border: "none", borderRadius: 9,
  color: C.goldDeep, fontWeight: 700, fontSize: 11.5, cursor: "pointer", whiteSpace: "nowrap",
};

const statCell = {
  display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 12px",
  background: "rgba(120,115,95,0.1)", borderRadius: 11, lineHeight: 1.1,
};
const statCellLabel = { fontSize: 9, letterSpacing: "1px", color: C.mutedSoft, fontWeight: 700, textTransform: "uppercase" };
const statCellVal = { fontWeight: 800, fontSize: 15, color: C.inkSoft };

function GuestForm({ initial, editing, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!form.name.trim()) return;
    const ok = await onSubmit({
      name: form.name,
      max_guests: form.passes,
      email: form.email,
      phone: form.phone,
      table_assignment: form.table,
    });
    if (ok && !editing) setForm(EMPTY);
  }

  const field = (label, key, props = {}) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={{ fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: C.mutedSoft, fontWeight: 700 }}>{label}</span>
      <input value={form[key]} onChange={set(key)} style={fieldInput} {...props} />
    </label>
  );

  return (
    <div style={{ ...glass(18, 20), marginBottom: 16, background: "rgba(255,255,255,0.6)" }}>
      <span style={eyebrow}>{editing ? "Editar invitado" : "Nuevo invitado"}</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 14, margin: "12px 0 14px" }}>
        {field("Nombre *", "name", { placeholder: "Nombre completo" })}
        {field("Pases", "passes", { type: "number", min: 1, max: 20 })}
        {field("Email", "email", { placeholder: "Opcional" })}
        {field("Teléfono", "phone", { placeholder: "Opcional" })}
        {field("Mesa", "table", { placeholder: "Opcional (ej. 5)" })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{ padding: "10px 18px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(120,115,95,0.2)", borderRadius: 12, color: "#5a564b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={busy || !form.name.trim()}
          style={{ ...goldButton, opacity: busy || !form.name.trim() ? 0.5 : 1 }}
        >
          {busy ? "Guardando…" : editing ? "Guardar cambios" : "Agregar invitado"}
        </button>
      </div>
    </div>
  );
}

function GuestActions({ gv, hasToken, onCopy, onEdit, onDelete, layout = "icons" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
      {hasToken && (
        <button onClick={onCopy} style={copyBtnSmall}>{ICONS.copy}Copiar</button>
      )}
      <button title="Editar" onClick={onEdit} style={iconBtn(false)}>{ICONS.edit}</button>
      <button title="Borrar" onClick={onDelete} style={iconBtn(true)}>{ICONS.trash}</button>
    </div>
  );
}

function TableView({ rows, onCopy, onEdit, onDelete }) {
  const th = { padding: "13px 12px", fontWeight: 700 };
  return (
    <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 18, background: "rgba(255,255,255,0.42)" }}>
      <table style={{ width: "100%", minWidth: 880, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: C.mutedSoft, fontSize: 10.5, letterSpacing: "1.2px", textTransform: "uppercase" }}>
            <th style={{ ...th, padding: "13px 16px" }}>Nombre</th>
            <th style={th}>Contacto</th>
            <th style={{ ...th, textAlign: "center" }}>Pases</th>
            <th style={{ ...th, textAlign: "center" }}>Mesa</th>
            <th style={th}>RSVP</th>
            <th style={{ ...th, textAlign: "center" }}>Asisten</th>
            <th style={{ ...th, padding: "13px 16px", textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((gv) => (
            <tr key={gv.raw.id} style={{ borderTop: "1px solid rgba(120,115,95,0.12)" }}>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: gv.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11.5, flex: "none" }}>{gv.initials}</div>
                  <span style={{ fontWeight: 700, color: C.inkSoft, whiteSpace: "nowrap" }}>{gv.name}</span>
                </div>
              </td>
              <td style={{ padding: "12px 12px", color: C.textSoft }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{gv.email}</div>
                <div style={{ fontSize: 11.5, color: C.mutedSoft, whiteSpace: "nowrap" }}>{gv.phone}</div>
              </td>
              <td style={{ padding: "12px 12px", textAlign: "center", fontWeight: 700, color: C.inkSoft }}>{gv.pases}</td>
              <td style={{ padding: "12px 12px", textAlign: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 30, padding: "4px 9px", background: "rgba(120,115,95,0.12)", borderRadius: 8, fontWeight: 700, color: "#5a564b" }}>{gv.mesa}</span>
              </td>
              <td style={{ padding: "12px 12px" }}>
                <span style={rsvpPill(gv)}><span style={{ width: 6, height: 6, borderRadius: "50%", background: gv.rsvpColor }} />{gv.rsvpLabel}</span>
              </td>
              <td style={{ padding: "12px 12px", textAlign: "center", fontWeight: 700, color: C.inkSoft }}>{gv.asistentes}</td>
              <td style={{ padding: "12px 16px" }}>
                <GuestActions gv={gv} hasToken={!!gv.raw.token} onCopy={() => onCopy(gv.raw)} onEdit={() => onEdit(gv.raw)} onDelete={() => onDelete(gv.raw)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowsView({ rows, onCopy, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((gv) => (
        <div key={gv.raw.id} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "14px 18px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 16, boxShadow: "0 4px 14px rgba(74,78,52,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, flex: "1 1 240px", minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: gv.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flex: "none" }}>{gv.initials}</div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.inkSoft }}>{gv.name}</span>
              <span style={{ fontSize: 12, color: C.mutedSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gv.email} · {gv.phone}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={statCell}><span style={statCellLabel}>Pases</span><span style={statCellVal}>{gv.pases}</span></span>
            <span style={statCell}><span style={statCellLabel}>Mesa</span><span style={statCellVal}>{gv.mesa}</span></span>
            <span style={statCell}><span style={statCellLabel}>Asisten</span><span style={statCellVal}>{gv.asistentes}</span></span>
            <span style={{ ...rsvpPill(gv), padding: "7px 13px", fontSize: 12.5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: gv.rsvpColor }} />{gv.rsvpLabel}</span>
            <GuestActions gv={gv} hasToken={!!gv.raw.token} onCopy={() => onCopy(gv.raw)} onEdit={() => onEdit(gv.raw)} onDelete={() => onDelete(gv.raw)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsView({ rows, onCopy, onEdit, onDelete }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,248px),1fr))", gap: 14 }}>
      {rows.map((gv) => (
        <div key={gv.raw.id} style={{ display: "flex", flexDirection: "column", gap: 13, padding: 18, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 18, boxShadow: "0 6px 18px rgba(74,78,52,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: gv.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flex: "none" }}>{gv.initials}</div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gv.name}</span>
                <span style={{ fontSize: 11.5, color: C.mutedSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gv.email}</span>
              </div>
            </div>
            <span style={{ ...rsvpPill(gv), padding: "5px 10px", fontSize: 11, flex: "none" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: gv.rsvpColor }} />{gv.rsvpLabel}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["Pases", gv.pases], ["Mesa", gv.mesa], ["Asist", gv.asistentes]].map(([k, val]) => (
              <div key={k} style={{ textAlign: "center", padding: "9px 4px", background: "rgba(120,115,95,0.09)", borderRadius: 11 }}>
                <div style={{ fontSize: 9, letterSpacing: ".8px", color: C.mutedSoft, fontWeight: 700, textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: C.inkSoft }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {gv.raw.token && (
              <button onClick={() => onCopy(gv.raw)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, background: C.gold, border: "none", borderRadius: 12, color: C.cream, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {ICONS.copy}Copiar link
              </button>
            )}
            <button title="Editar" onClick={() => onEdit(gv.raw)} style={{ ...iconBtn(false), width: 40, height: 40 }}>{ICONS.edit}</button>
            <button title="Borrar" onClick={() => onDelete(gv.raw)} style={{ ...iconBtn(true), width: 40, height: 40 }}>{ICONS.trash}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GuestsSection({
  currentEvent,
  selectedEventId,
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  onCopyGuestLink,
}) {
  const [variant, setVariant] = useState("rows");
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? guests.filter((g) =>
          [g.name, g.email, g.phone].filter(Boolean).some((s) => s.toLowerCase().includes(q))
        )
      : guests;
    return list.map((g, i) => guestView(g, i));
  }, [guests, query]);

  async function handleAdd(data) {
    setBusy(true);
    const ok = await onAddGuest(data);
    setBusy(false);
    if (ok) setShowForm(false);
    return ok;
  }

  async function handleUpdate(data) {
    if (!editingGuest) return false;
    setBusy(true);
    const ok = await onUpdateGuest(editingGuest.id, data);
    setBusy(false);
    if (ok) setEditingGuest(null);
    return ok;
  }

  async function handleDelete(g) {
    if (!window.confirm(`¿Borrar a ${g.name}?`)) return;
    await onDeleteGuest(g.id);
  }

  function openAdd() {
    setEditingGuest(null);
    setShowForm((s) => !s);
  }

  function openEdit(g) {
    setShowForm(false);
    setEditingGuest(g);
  }

  const seg = (key, label) => {
    const active = variant === key;
    return (
      <button
        key={key}
        onClick={() => setVariant(key)}
        style={{
          padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
          fontWeight: 700, fontSize: 12.5,
          background: active ? C.gold : "transparent",
          color: active ? C.cream : "#7a756a", transition: ".15s",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <section className="ltd-section" style={{ ...glass(24, null), background: "rgba(255,255,255,0.5)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span style={eyebrow}>{currentEvent ? currentEvent.name : "Sin evento seleccionado"}</span>
          <span className="font-serif-ltd" style={{ fontWeight: 600, fontSize: 24, color: C.ink }}>
            Invitados{" "}
            <span className="font-sans-ltd" style={{ fontSize: 15, color: C.mutedSoft, fontWeight: 600 }}>· {guests.length}</span>
          </span>
        </div>
        {selectedEventId && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(120,115,95,0.18)", borderRadius: 11, minWidth: 180 }}>
              {ICONS.search}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar invitado…"
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#3a382f", width: "100%" }}
              />
            </div>
            <button onClick={openAdd} style={goldButton}>{ICONS.plus}{showForm ? "Cerrar" : "Agregar"}</button>
          </div>
        )}
      </div>

      {!selectedEventId ? (
        <div style={{ padding: "48px 20px", textAlign: "center", border: "1.5px dashed rgba(120,115,95,0.28)", borderRadius: 18, color: C.mutedSoft }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Selecciona un evento (botón “Invitados”) para gestionar su lista.</p>
        </div>
      ) : (
        <>
          {showForm && (
            <GuestForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} busy={busy} />
          )}
          {editingGuest && (
            <GuestForm
              editing
              initial={{
                name: editingGuest.name ?? "",
                passes: Number(editingGuest.max_guests) || 1,
                email: editingGuest.email ?? "",
                phone: editingGuest.phone ?? "",
                table: editingGuest.table_assignment ?? "",
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingGuest(null)}
              busy={busy}
            />
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: 4, background: "rgba(120,115,95,0.1)", borderRadius: 12 }}>
              {seg("table", "Tabla")}
              {seg("rows", "Filas")}
              {seg("cards", "Tarjetas")}
            </div>
            <span style={{ fontSize: 11.5, color: C.mutedSoft, fontWeight: 600 }}>
              Edita o copia el link de cada invitado
            </span>
          </div>

          {guests.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", border: "1.5px dashed rgba(120,115,95,0.28)", borderRadius: 18, color: C.mutedSoft }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Sin invitados todavía.</p>
              <p style={{ margin: "4px 0 0", fontSize: 12.5 }}>Presiona “Agregar” para empezar.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.mutedSoft, fontWeight: 600, fontSize: 14 }}>
              Ningún invitado coincide con “{query}”.
            </div>
          ) : variant === "table" ? (
            <TableView rows={filtered} onCopy={onCopyGuestLink} onEdit={openEdit} onDelete={handleDelete} />
          ) : variant === "rows" ? (
            <RowsView rows={filtered} onCopy={onCopyGuestLink} onEdit={openEdit} onDelete={handleDelete} />
          ) : (
            <CardsView rows={filtered} onCopy={onCopyGuestLink} onEdit={openEdit} onDelete={handleDelete} />
          )}
        </>
      )}
    </section>
  );
}
