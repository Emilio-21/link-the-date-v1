// app/dashboard/page.js — orquestador delgado
"use client";

import { Btn, ErrorBanner, Ico, Toast } from "@/components/dashboard/primitives";
import Sidebar from "@/components/dashboard/Sidebar";
import EventsSection from "@/components/dashboard/EventsSection";
import GuestsSection from "@/components/dashboard/GuestsSection";
import { useDashboard } from "@/components/dashboard/useDashboard";

export default function DashboardPage() {
  const d = useDashboard();

  if (d.loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-rose-400 animate-spin" />
          <span className="text-sm font-medium">Cargando tu dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Toast toast={d.toast} />

      <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white text-xs font-black tracking-tight">
              L
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-stone-900">Link the Date</div>
              {d.email && (
                <div className="text-[11px] text-stone-400 leading-none mt-0.5">{d.email}</div>
              )}
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={d.logout}>
            <Ico.Logout />
            Salir
          </Btn>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        <ErrorBanner message={d.errorMsg} onClose={() => d.setErrorMsg(null)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <Sidebar
            orgs={d.orgs}
            selectedOrgId={d.selectedOrgId}
            onSelectOrg={d.setSelectedOrgId}
            onCreateOrg={d.createOrganization}
            currentEvent={d.currentEvent}
            guestsCount={d.guests.length}
            rsvpStats={d.rsvpStats}
          />

          <div className="space-y-6 min-w-0">
            <EventsSection
              events={d.events}
              selectedEventId={d.selectedEventId}
              selectedOrgId={d.selectedOrgId}
              onCreateEvent={d.createEvent}
              onUpdateEvent={d.updateEvent}
              onSelectEvent={d.selectEventAndLoadGuests}
              onCopyInviteLink={d.copyInviteLink}
            />

            <GuestsSection
              currentEvent={d.currentEvent}
              selectedEventId={d.selectedEventId}
              guests={d.guests}
              onAddGuest={d.addGuest}
              onUpdateGuest={d.updateGuest}
              onDeleteGuest={d.deleteGuest}
              onCopyGuestLink={d.copyGuestLink}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
