// components/dashboard/Sidebar.jsx — organización + stats RSVP
"use client";

import { useState } from "react";
import { Btn, Card, Ico, Input, Label } from "./primitives";

function OrgPanel({ orgs, selectedOrgId, onSelectOrg, onCreateOrg }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    const ok = await onCreateOrg(name);
    setBusy(false);
    if (ok) setName("");
  }

  return (
    <Card className="p-4">
      <Label>Organización</Label>
      {orgs.length > 0 && (
        <div className="mb-3 space-y-1">
          {orgs.map((o) => (
            <button
              key={o.id}
              onClick={() => onSelectOrg(o.id)}
              className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                selectedOrgId === o.id
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nueva organización…"
          className="text-xs py-2"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Btn variant="outline" size="sm" onClick={submit} disabled={busy || !name.trim()}>
          <Ico.Plus />
        </Btn>
      </div>
    </Card>
  );
}

function RsvpPanel({ event, stats, totalGuests }) {
  if (!event || totalGuests === 0) return null;
  const items = [
    { val: stats.yes, label: "Confirman", bg: "bg-emerald-50 border-emerald-100", tx: "text-emerald-600" },
    { val: stats.no, label: "No van", bg: "bg-rose-50 border-rose-100", tx: "text-rose-500" },
    { val: stats.pending, label: "Pendientes", bg: "bg-amber-50 border-amber-100", tx: "text-amber-500" },
    { val: stats.confirmed, label: "Personas", bg: "bg-stone-100 border-stone-200", tx: "text-stone-700" },
  ];
  return (
    <Card className="p-4">
      <Label>RSVP — {event.name}</Label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map(({ val, label, bg, tx }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
            <div className={`text-2xl font-black ${tx}`}>{val}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${tx} opacity-70`}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Sidebar({
  orgs,
  selectedOrgId,
  onSelectOrg,
  onCreateOrg,
  currentEvent,
  guestsCount,
  rsvpStats,
}) {
  return (
    <aside className="space-y-4">
      <OrgPanel
        orgs={orgs}
        selectedOrgId={selectedOrgId}
        onSelectOrg={onSelectOrg}
        onCreateOrg={onCreateOrg}
      />
      <RsvpPanel event={currentEvent} stats={rsvpStats} totalGuests={guestsCount} />
    </aside>
  );
}
