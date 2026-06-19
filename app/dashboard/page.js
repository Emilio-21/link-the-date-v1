// app/dashboard/page.js — orquestador del dashboard (look "Olivos")
"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import EventsSection from "@/components/dashboard/EventsSection";
import GuestsSection from "@/components/dashboard/GuestsSection";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { C, glass, eyebrow, initialsOf, fmtCompact, daysUntil } from "@/components/dashboard/theme";

function BackgroundDecor() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: "linear-gradient(140deg,#fbfaf5 0%,#f6efe1 55%,#fcf9f3 100%)",
      }}
    >
      <div
        style={{
          position: "absolute", top: -140, left: -90, width: 520, height: 520, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(196,163,94,0.42),transparent 68%)",
          filter: "blur(26px)", animation: "ltdBlob 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute", top: "38%", right: -120, width: 460, height: 460, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(190,150,138,0.34),transparent 70%)",
          filter: "blur(30px)", animation: "ltdBlob2 22s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -160, left: "34%", width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(212,184,120,0.3),transparent 70%)",
          filter: "blur(34px)", animation: "ltdBlob 26s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function Topbar({ email, displayName, onLogout }) {
  return (
    <header
      className="ltd-topbar"
      style={{
        position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 14,
        background: "rgba(252,251,247,0.62)",
        backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)",
        borderBottom: "1px solid rgba(255,255,255,0.6)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 13,
            background: "linear-gradient(135deg,#c9a85a,#9a7a38)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(176,141,76,0.32)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f6f5ee" strokeWidth="1.7">
            <circle cx="9" cy="13" r="6" />
            <circle cx="15" cy="13" r="6" />
            <path d="M9 5.2 10.3 7M15 5.2 13.7 7" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
          <span className="font-serif-ltd" style={{ fontWeight: 700, fontSize: 23, letterSpacing: ".2px", color: C.ink }}>
            Link the Date
          </span>
          <span style={{ fontSize: 10.5, letterSpacing: "2.5px", textTransform: "uppercase", color: C.mutedSoft, fontWeight: 600 }}>
            Panel de bodas
          </span>
        </div>
      </div>

      <UserMenu email={email} displayName={displayName} onLogout={onLogout} />
    </header>
  );
}

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12H3M3 12l4-4M3 12l4 4" />
  </svg>
);

function UserMenu({ email, displayName, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="ltd-user-chip"
        aria-label="Menú de usuario"
        style={{
          display: "flex", alignItems: "center", gap: 9, padding: "5px 6px 5px 14px",
          background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: 99, boxShadow: "0 4px 14px rgba(74,78,52,0.06)", cursor: "pointer",
        }}
      >
        <div className="ltd-user-info" style={{ flexDirection: "column", alignItems: "flex-end", lineHeight: 1.15 }}>
          <span className="ltd-email" style={{ fontSize: 12.5, fontWeight: 700, color: "#3a382f" }}>{email || "—"}</span>
          <span style={{ fontSize: 10.5, color: C.mutedSoft, fontWeight: 600 }}>Plan Pareja</span>
        </div>
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#c8a48f,#a8b082)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13, flex: "none",
          }}
        >
          {initialsOf(displayName || email || "·")}
        </div>
      </button>

      <button onClick={onLogout} className="ltd-logout-btn"
        style={{
          display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
          background: "rgba(255,255,255,0.5)", border: "1px solid rgba(120,115,95,0.2)",
          borderRadius: 12, color: "#5a564b", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
        }}
      >
        <LogoutIcon />
        Salir
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 45 }} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 50, minWidth: 220,
              ...glass(16, 8), background: "rgba(252,251,247,0.96)", boxShadow: "0 16px 40px rgba(74,78,52,0.18)",
            }}
          >
            <div style={{ padding: "10px 12px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg,#c8a48f,#a8b082)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 14, flex: "none",
                  }}
                >
                  {initialsOf(displayName || email || "·")}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: C.mutedSoft, fontWeight: 600 }}>Plan Pareja</div>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
                background: "transparent", border: "none", borderTop: "1px solid rgba(120,115,95,0.15)",
                color: C.terracotta, fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: "0 0 12px 12px",
              }}
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function WelcomeHeader({ displayName, eventsCount, nextEvent, rsvpStats }) {
  const responded = rsvpStats.yes + rsvpStats.no + rsvpStats.pending;
  const confPct = responded ? Math.round((rsvpStats.yes / responded) * 100) : 0;
  const chip = {
    display: "flex", flexDirection: "column", gap: 2, padding: "13px 16px",
    background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.72)",
    borderRadius: 16,
  };
  const chipLabel = { fontSize: 10.5, letterSpacing: "1px", textTransform: "uppercase", color: "#b09a6a", fontWeight: 700 };
  const chipVal = { fontWeight: 800, fontSize: 15, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const chipSub = { fontSize: 11.5, color: C.mutedSoft, fontWeight: 600 };

  return (
    <header
      className="ltd-welcome"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
        gap: 20, ...glass(24, null),
        boxShadow: "0 12px 36px rgba(176,141,76,0.1)",
      }}
    >
      <div className="ltd-welcome-text" style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 240px" }}>
        <span style={{ ...eyebrow, color: "#b09a6a", letterSpacing: "2.5px" }}>
          {displayName} · {eventsCount} evento{eventsCount !== 1 ? "s" : ""}
        </span>
        <h1 className="font-serif-ltd ltd-welcome-title" style={{ margin: 0, fontWeight: 700, letterSpacing: "-.3px", color: C.ink, lineHeight: 1.02 }}>
          Hola, {displayName}
        </h1>
        <p style={{ margin: "3px 0 0", fontSize: 14, color: C.muted, fontWeight: 500 }}>
          Administra tus eventos, invitaciones y confirmaciones desde un solo lugar.
        </p>
      </div>
      <div className="ltd-stat-grid" style={{ flex: "1 1 320px" }}>
        <div style={chip}>
          <span style={chipLabel}>Próximo evento</span>
          <span style={chipVal} title={nextEvent ? nextEvent.name : "—"}>
            {nextEvent ? nextEvent.name : "—"}
          </span>
          <span style={chipSub}>
            {nextEvent ? fmtCompact(nextEvent.event_datetime, nextEvent.event_date) : "Sin eventos"}
          </span>
        </div>
        <div style={chip}>
          <span style={chipLabel}>Confirmados</span>
          <span style={{ ...chipVal, color: C.goldDeep }}>{confPct}%</span>
          <span style={chipSub}>{rsvpStats.yes} de {responded || 0}</span>
        </div>
        <div style={chip}>
          <span style={chipLabel}>Personas</span>
          <span style={chipVal}>{rsvpStats.confirmed}</span>
          <span style={chipSub}>total asistentes</span>
        </div>
      </div>
    </header>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed", left: "50%", bottom: 34, zIndex: 60, transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 10, padding: "13px 22px",
        background: "rgba(44,42,36,0.94)", backdropFilter: "blur(8px)", borderRadius: 14,
        boxShadow: "0 12px 34px rgba(0,0,0,0.25)", animation: "ltdToast .25s ease",
      }}
    >
      <span
        style={{
          width: 22, height: 22, borderRadius: "50%",
          background: toast.type === "error" ? C.terracotta : "#c9a85a",
          display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12l5 5L20 6" />
        </svg>
      </span>
      <span style={{ color: "#f6f5ee", fontWeight: 600, fontSize: 13.5 }}>{toast.msg}</span>
    </div>
  );
}

function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
        background: "rgba(176,106,82,0.12)", border: "1px solid rgba(176,106,82,0.32)",
        borderRadius: 16, color: "#8a4a35", fontSize: 13.5, fontWeight: 600,
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a85c43", fontWeight: 700 }}>
        ✕
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const d = useDashboard();

  const selectedOrg = useMemo(
    () => d.orgs.find((o) => o.id === d.selectedOrgId) || null,
    [d.orgs, d.selectedOrgId]
  );

  const displayName = selectedOrg?.name || (d.email ? d.email.split("@")[0] : "tus eventos");

  const nextEvent = useMemo(() => {
    const upcoming = d.events
      .map((e) => ({ e, days: daysUntil(e.event_datetime, e.event_date) }))
      .filter((x) => x.days !== null)
      .sort((a, b) => a.days - b.days);
    if (upcoming.length) return upcoming[0].e;
    return d.currentEvent || d.events[0] || null;
  }, [d.events, d.currentEvent]);

  if (d.loading) {
    return (
      <div className="font-sans-ltd" style={{ minHeight: "100vh", position: "relative", color: C.ink }}>
        <BackgroundDecor />
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: C.muted }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "3px solid rgba(176,141,76,0.18)", borderTopColor: C.gold,
                animation: "ltdSpin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando tu dashboard…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ltd-scope font-sans-ltd" style={{ position: "relative", minHeight: "100vh", color: C.ink, overflow: "hidden" }}>
      <BackgroundDecor />
      <Toast toast={d.toast} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Topbar email={d.email} displayName={displayName} onLogout={d.logout} />

        <div className="ltd-page">
          <ErrorBanner message={d.errorMsg} onClose={() => d.setErrorMsg(null)} />

          <WelcomeHeader
            displayName={displayName}
            eventsCount={d.events.length}
            nextEvent={nextEvent}
            rsvpStats={d.rsvpStats}
          />

          <div className="ltd-cols">
            <aside className="ltd-aside">
              <Sidebar
                orgs={d.orgs}
                selectedOrgId={d.selectedOrgId}
                onSelectOrg={d.setSelectedOrgId}
                onCreateOrg={d.createOrganization}
                currentEvent={d.currentEvent}
                guestsCount={d.guests.length}
                eventsCount={d.events.length}
                rsvpStats={d.rsvpStats}
              />
            </aside>

            <main className="ltd-main">
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
