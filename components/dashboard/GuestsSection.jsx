// components/dashboard/GuestsSection.jsx
"use client";

import { useState } from "react";
import { Badge, Btn, Card, Ico, Input, Label } from "./primitives";

const EMPTY_NEW = { name: "", passes: 1, email: "", phone: "", table: "" };

function NewGuestForm({ onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(EMPTY_NEW);
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
    if (ok) setForm(EMPTY_NEW);
  }

  return (
    <Card className="mb-4 p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
        Nuevo invitado
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Nombre *</Label>
          <Input value={form.name} onChange={set("name")} placeholder="Nombre completo" />
        </div>
        <div>
          <Label>Pases</Label>
          <Input type="number" min={1} max={20} value={form.passes} onChange={set("passes")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={set("email")} placeholder="Opcional" />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input value={form.phone} onChange={set("phone")} placeholder="Opcional" />
        </div>
        <div>
          <Label>Mesa</Label>
          <Input value={form.table} onChange={set("table")} placeholder="Opcional (ej. 5 o Jardín)" />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Btn>
        <Btn variant="primary" onClick={submit} disabled={busy || !form.name.trim()}>
          {busy ? (
            "Agregando…"
          ) : (
            <>
              <Ico.Plus />
              Agregar invitado
            </>
          )}
        </Btn>
      </div>
    </Card>
  );
}

function GuestRow({ guest, onCopyLink, onSaveEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: guest.name ?? "",
    email: guest.email ?? "",
    phone: guest.phone ?? "",
    passes: Number(guest.max_guests) || 1,
    table: guest.table_assignment ?? "",
  });
  const [busyUpdate, setBusyUpdate] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function startEdit() {
    setForm({
      name: guest.name ?? "",
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      passes: Number(guest.max_guests) || 1,
      table: guest.table_assignment ?? "",
    });
    setEditing(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setBusyUpdate(true);
    const ok = await onSaveEdit(guest.id, {
      name: form.name,
      email: form.email,
      phone: form.phone,
      max_guests: form.passes,
      table_assignment: form.table,
    });
    setBusyUpdate(false);
    if (ok) setEditing(false);
  }

  async function remove() {
    if (!window.confirm("¿Borrar este invitado?")) return;
    setBusyDelete(true);
    await onDelete(guest.id);
    setBusyDelete(false);
  }

  return (
    <tr className={`transition-colors ${editing ? "bg-stone-50" : "hover:bg-stone-50/40"}`}>
      <td className="px-4 py-3">
        {editing ? (
          <Input className="py-1.5 text-xs" value={form.name} onChange={set("name")} />
        ) : (
          <span className="font-semibold text-stone-800">{guest.name}</span>
        )}
      </td>
      <td className="px-4 py-3 text-stone-400 text-xs">
        {editing ? (
          <Input className="py-1.5 text-xs" value={form.email} onChange={set("email")} placeholder="—" />
        ) : (
          guest.email ?? <span className="text-stone-200">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-stone-400 text-xs">
        {editing ? (
          <Input className="py-1.5 text-xs" value={form.phone} onChange={set("phone")} placeholder="—" />
        ) : (
          guest.phone ?? <span className="text-stone-200">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <Input
            type="number"
            min={1}
            max={20}
            className="py-1.5 text-xs w-16"
            value={form.passes}
            onChange={set("passes")}
          />
        ) : (
          <Badge>{guest.max_guests ?? 1}</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-stone-500 text-xs">
        {editing ? (
          <Input className="py-1.5 text-xs w-24" value={form.table} onChange={set("table")} placeholder="Mesa" />
        ) : (
          guest.table_assignment
            ? <Badge color="amber">{guest.table_assignment}</Badge>
            : <span className="text-stone-200">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {guest.rsvp_status === "yes" && <Badge color="green">Sí ✓</Badge>}
        {guest.rsvp_status === "no" && <Badge color="red">No</Badge>}
        {!guest.rsvp_status && <span className="text-stone-200 text-xs">—</span>}
      </td>
      <td className="px-4 py-3 text-center font-bold text-stone-700">
        {guest.rsvp_count ?? <span className="text-stone-200 font-normal text-xs">—</span>}
      </td>
      <td className="px-4 py-3">
        {guest.token && (
          <Btn variant="ghost" size="sm" onClick={() => onCopyLink(guest)}>
            <Ico.Copy />
            Copiar
          </Btn>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex gap-1.5">
            <Btn variant="primary" size="sm" onClick={save} disabled={busyUpdate}>
              {busyUpdate ? "…" : <Ico.Check />}
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => setEditing(false)}>
              <Ico.X />
            </Btn>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <Btn variant="ghost" size="sm" onClick={startEdit}>
              <Ico.Edit />
            </Btn>
            <Btn variant="danger" size="sm" onClick={remove} disabled={busyDelete}>
              {busyDelete ? "…" : <Ico.Trash />}
            </Btn>
          </div>
        )}
      </td>
    </tr>
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
  const [showForm, setShowForm] = useState(false);
  const [busyAdd, setBusyAdd] = useState(false);

  async function handleAdd(data) {
    setBusyAdd(true);
    const ok = await onAddGuest(data);
    setBusyAdd(false);
    if (ok) setShowForm(false);
    return ok;
  }

  const headers = ["Nombre", "Email", "Teléfono", "Pases", "Mesa", "RSVP", "Asistentes", "Link", ""];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-stone-900">Invitados</h2>
          <p className="text-xs text-stone-400">
            {currentEvent ? (
              <>
                Para <span className="font-semibold text-stone-600">{currentEvent.name}</span> —{" "}
                {guests.length} invitado{guests.length !== 1 ? "s" : ""}
              </>
            ) : (
              "Selecciona un evento arriba"
            )}
          </p>
        </div>
        {selectedEventId && (
          <Btn
            variant={showForm ? "outline" : "primary"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <Ico.X />
                Cancelar
              </>
            ) : (
              <>
                <Ico.Plus />
                Agregar
              </>
            )}
          </Btn>
        )}
      </div>

      {showForm && (
        <NewGuestForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} busy={busyAdd} />
      )}

      {!selectedEventId ? (
        <Card className="p-10 text-center border-dashed">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm font-medium text-stone-400">
            Selecciona un evento para gestionar invitados
          </p>
        </Card>
      ) : guests.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm font-medium text-stone-400">Sin invitados todavía</p>
          <p className="text-xs text-stone-300 mt-1">Presiona "Agregar" para empezar</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/80">
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-stone-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {guests.map((g) => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    onCopyLink={onCopyGuestLink}
                    onSaveEdit={onUpdateGuest}
                    onDelete={onDeleteGuest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
