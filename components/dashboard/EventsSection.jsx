// components/dashboard/EventsSection.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Btn, Card, Ico } from "./primitives";
import EventForm, { eventToForm } from "./EventForm";
import { fmtDate, fmtDateTime } from "@/lib/dashboard/utils";

function EventCard({
  event,
  isSelected,
  isEditing,
  onView,
  onCopyLink,
  onToggleEdit,
  onSelectForGuests,
  onSaveEdit,
  busyEdit,
}) {
  return (
    <Card className={`overflow-hidden transition-shadow ${isSelected ? "ring-2 ring-rose-200 ring-offset-1 shadow-md" : ""}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-stone-900">{event.name}</h3>
              {isSelected && <Badge color="green">Activo</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400">
              {(event.event_datetime || event.event_date) && (
                <span className="flex items-center gap-1">
                  <Ico.Cal />
                  {event.event_datetime ? fmtDateTime(event.event_datetime) : fmtDate(event.event_date)}
                </span>
              )}
              {(event.location || event.venue_name) && (
                <span className="flex items-center gap-1">
                  <Ico.Pin />
                  {[event.venue_name, event.location].filter(Boolean).join(" · ")}
                </span>
              )}
              {(event.gift_url_1 || event.gift_url_2) && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Ico.Gift />
                  {[event.gift_url_1 && "Mesa 1", event.gift_url_2 && "Mesa 2"].filter(Boolean).join(" + ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <Btn variant="outline" size="sm" onClick={onView}>
              <Ico.Eye />
              Ver
            </Btn>
            <Btn variant="outline" size="sm" onClick={onCopyLink}>
              <Ico.Copy />
              Link
            </Btn>
            <Btn variant={isEditing ? "amber" : "outline"} size="sm" onClick={onToggleEdit}>
              <Ico.Edit />
              {isEditing ? "Cancelar" : "Editar"}
            </Btn>
            <Btn variant={isSelected ? "primary" : "outline"} size="sm" onClick={onSelectForGuests}>
              <Ico.Users />
              {isSelected ? "Invitados ✓" : "Invitados"}
            </Btn>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-stone-100 bg-amber-50/30 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">
            Editar evento
          </p>
          <EventForm
            mode="edit"
            initial={eventToForm(event)}
            eventId={event.id}
            onSubmit={onSaveEdit}
            onCancel={onToggleEdit}
            busy={busyEdit}
          />
        </div>
      )}
    </Card>
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
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-stone-900">Eventos</h2>
          <p className="text-xs text-stone-400">
            {events.length} evento{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Btn
          variant={showNew ? "outline" : "rose"}
          size="sm"
          onClick={() => setShowNew(!showNew)}
          disabled={!selectedOrgId}
        >
          {showNew ? (
            <>
              <Ico.X />
              Cancelar
            </>
          ) : (
            <>
              <Ico.Plus />
              Nuevo evento
            </>
          )}
        </Btn>
      </div>

      {showNew && (
        <Card className="mb-4 p-5 border-rose-100 bg-gradient-to-b from-rose-50/60 to-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-4">
            Nuevo evento
          </p>
          <EventForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setShowNew(false)}
            busy={busyCreate}
          />
        </Card>
      )}

      {events.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm font-medium text-stone-400">Sin eventos todavía</p>
          <p className="text-xs text-stone-300 mt-1">Presiona "Nuevo evento" para comenzar</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isSelected={selectedEventId === ev.id}
              isEditing={editingId === ev.id}
              onView={() => router.push(`/events/${ev.slug}`)}
              onCopyLink={() => onCopyInviteLink(ev.slug)}
              onToggleEdit={() => setEditingId(editingId === ev.id ? null : ev.id)}
              onSelectForGuests={() => onSelectEvent(ev.id)}
              onSaveEdit={(form) => handleUpdate(ev.id, form)}
              busyEdit={busyUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
