// components/dashboard/useDashboard.js
// Hook que encapsula la lógica del dashboard: datos, selección actual y acciones CRUD.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  dateOnly,
  EVENT_COLUMNS,
  safeJson,
  slugify,
  slugifyName,
  toIsoOrNull,
} from "@/lib/dashboard/utils";

export function useDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(null);

  const [orgs, setOrgs] = useState([]);
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");

  const [errorMsg, setErrorMsg] = useState(null);
  const [toast, setToast] = useState(null);

  const currentEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── carga de datos ────────────────────────────────────────────────────
  const loadGuests = useCallback(async (eventId) => {
    if (!eventId) {
      setGuests([]);
      return;
    }
    const res = await fetch(`/api/guests?event_id=${encodeURIComponent(eventId)}`);
    const p = await safeJson(res);
    setGuests(p.ok && p.json?.guests ? p.json.guests : []);
  }, []);

  const refreshEventsForOrg = useCallback(
    async (orgId, { selectFirst = false } = {}) => {
      if (!orgId) {
        setEvents([]);
        setSelectedEventId("");
        setGuests([]);
        return;
      }
      const { data, error } = await supabase
        .from("events")
        .select(EVENT_COLUMNS)
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      const list = data || [];
      setEvents(list);

      if (selectFirst) {
        const first = list[0];
        if (first?.id) {
          setSelectedEventId(first.id);
          await loadGuests(first.id);
        } else {
          setSelectedEventId("");
          setGuests([]);
        }
      } else {
        setSelectedEventId((prev) => {
          if (prev && !list.some((e) => e.id === prev)) {
            setGuests([]);
            return "";
          }
          return prev;
        });
      }
    },
    [supabase, loadGuests]
  );

  const refreshAll = useCallback(
    async ({ initial = false } = {}) => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id,name,slug,created_at")
        .order("created_at", { ascending: false });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      const list = data || [];
      setOrgs(list);
      const orgId = selectedOrgId || list?.[0]?.id || "";
      if (!selectedOrgId && orgId) setSelectedOrgId(orgId);
      if (orgId) await refreshEventsForOrg(orgId, { selectFirst: initial });
      else {
        setEvents([]);
        setSelectedEventId("");
        setGuests([]);
      }
    },
    [supabase, selectedOrgId, refreshEventsForOrg]
  );

  // ── boot ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: ur } = await supabase.auth.getUser();
      const user = ur?.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!mounted) return;
      setEmail(user.email ?? null);
      await refreshAll({ initial: true });
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    refreshEventsForOrg(selectedOrgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgId]);

  // ── acciones de org/evento/invitados ──────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [supabase, router]);

  const createOrganization = useCallback(
    async (name) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return false;
      const { data: ur } = await supabase.auth.getUser();
      const user = ur?.user;
      if (!user) {
        router.replace("/login");
        return false;
      }
      const slug = slugify(trimmed) || `org-${Date.now()}`;
      const { data: org, error } = await supabase
        .from("organizations")
        .insert({ name: trimmed, slug, created_by: user.id })
        .select("id,name,slug,created_at")
        .single();
      if (error) {
        setErrorMsg(error.message);
        return false;
      }
      await supabase
        .from("organization_members")
        .insert({ org_id: org.id, user_id: user.id, role: "owner" });
      setSelectedOrgId(org.id);
      await refreshAll();
      showToast("Organización creada ✓");
      return true;
    },
    [supabase, router, refreshAll, showToast]
  );

  const createEvent = useCallback(
    async (form) => {
      if (!selectedOrgId) return false;
      const title = form.title.trim();
      if (!title) return false;
      const event_datetime = toIsoOrNull(form.datetime);
      if (!event_datetime) {
        setErrorMsg("Selecciona fecha y hora.");
        return false;
      }
      const event_date = dateOnly(form.datetime) || new Date().toISOString().slice(0, 10);
      const slug = slugify(title) || `evento-${Date.now()}`;
      const { data: ev, error } = await supabase
        .from("events")
        .insert({
          org_id: selectedOrgId,
          name: title,
          event_date,
          event_datetime,
          slug,
          description: form.description?.trim() || null,
          location: form.location?.trim() || null,
          venue_name: form.venueName?.trim() || null,
          location_url: form.locationUrl?.trim() || null,
          gift_url_1: form.giftUrl1?.trim() || null,
          gift_url_2: form.giftUrl2?.trim() || null,
          bank_account: form.bankAccount?.trim() || null,
          template: form.template || null,
        })
        .select(EVENT_COLUMNS)
        .single();
      if (error) {
        setErrorMsg(error.message);
        return false;
      }
      await refreshEventsForOrg(selectedOrgId);
      setSelectedEventId(ev.id);
      await loadGuests(ev.id);
      showToast("Evento creado ✓");
      return true;
    },
    [supabase, selectedOrgId, refreshEventsForOrg, loadGuests, showToast]
  );

  const updateEvent = useCallback(
    async (eventId, form) => {
      if (!eventId) return false;
      const title = form.title.trim();
      if (!title) return false;
      const event_datetime = toIsoOrNull(form.datetime);
      if (!event_datetime) {
        setErrorMsg("Selecciona fecha y hora.");
        return false;
      }
      const event_date = dateOnly(form.datetime) || new Date().toISOString().slice(0, 10);
      const { data: updated, error } = await supabase
        .from("events")
        .update({
          name: title,
          event_date,
          event_datetime,
          location: form.location?.trim() || null,
          description: form.description?.trim() || null,
          venue_name: form.venueName?.trim() || null,
          location_url: form.locationUrl?.trim() || null,
          gift_url_1: form.giftUrl1?.trim() || null,
          gift_url_2: form.giftUrl2?.trim() || null,
          bank_account: form.bankAccount?.trim() || null,
          couple_name: form.coupleName?.trim() || null,
          main_message: form.mainMessage?.trim() || null,
          dress_code_text: form.dressCodeText?.trim() || null,
          kids_policy_text: form.kidsPolicyText?.trim() || null,
          gift_label_1: form.giftLabel1?.trim() || null,
          gift_label_2: form.giftLabel2?.trim() || null,
          gifts_message: form.giftsMessage?.trim() || null,
          bank_name: form.bankName?.trim() || null,
          bank_holder: form.bankHolder?.trim() || null,
          show_dress_code: form.showDressCode,
          show_kids_policy: form.showKidsPolicy,
          show_gifts: form.showGifts,
          show_bank: form.showBank,
          show_table: form.showTable,
          rsvp_deadline: form.rsvpDeadline || null,
          rsvp_deadline_label: form.rsvpDeadlineLabel?.trim() || null,
          language: form.language || "es",
          template: form.template || null,
          cover_url: form.coverUrl?.trim() || null,
          gallery_urls: Array.isArray(form.galleryUrls)
            ? form.galleryUrls.map((u) => (u || "").trim()).filter(Boolean)
            : [],
          customization: form.customization && typeof form.customization === "object" ? form.customization : {},
        })
        .eq("id", eventId)
        .select(EVENT_COLUMNS)
        .single();
      if (error) {
        setErrorMsg(error.message);
        return false;
      }
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      showToast("Evento actualizado ✓");
      return true;
    },
    [supabase, showToast]
  );

  const selectEventAndLoadGuests = useCallback(
    async (eventId) => {
      setSelectedEventId(eventId);
      await loadGuests(eventId);
    },
    [loadGuests]
  );

  // ── invitados ─────────────────────────────────────────────────────────
  const addGuest = useCallback(
    async ({ name, max_guests, email: gEmail, phone, table_assignment }) => {
      if (!selectedEventId) return false;
      const trimmed = (name || "").trim();
      if (!trimmed) return false;
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedEventId,
          name: trimmed,
          max_guests: Number(max_guests) || 1,
          email: gEmail?.trim() || null,
          phone: phone?.trim() || null,
          table_assignment: table_assignment?.trim() || null,
        }),
      });
      const p = await safeJson(res);
      if (!p.ok) {
        setErrorMsg(`Error ${p.status}`);
        return false;
      }
      await loadGuests(selectedEventId);
      showToast("Invitado agregado ✓");
      return true;
    },
    [selectedEventId, loadGuests, showToast]
  );

  const updateGuest = useCallback(
    async (id, { name, email: gEmail, phone, max_guests, table_assignment }) => {
      if (!id) return false;
      const trimmed = (name || "").trim();
      if (!trimmed) return false;
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: trimmed,
          email: gEmail?.trim() || null,
          phone: phone?.trim() || null,
          max_guests: Number(max_guests) || 1,
          table_assignment: table_assignment?.trim() || null,
        }),
      });
      const p = await safeJson(res);
      if (!p.ok) {
        setErrorMsg(`Error ${p.status}`);
        return false;
      }
      await loadGuests(selectedEventId);
      showToast("Invitado actualizado ✓");
      return true;
    },
    [selectedEventId, loadGuests, showToast]
  );

  const deleteGuest = useCallback(
    async (id) => {
      if (!id) return false;
      const res = await fetch(`/api/guests?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const p = await safeJson(res);
      if (!p.ok) {
        setErrorMsg(`Error ${p.status}`);
        return false;
      }
      await loadGuests(selectedEventId);
      showToast("Invitado eliminado ✓");
      return true;
    },
    [selectedEventId, loadGuests, showToast]
  );

  // ── links públicos ────────────────────────────────────────────────────
  const copyInviteLink = useCallback(
    async (slug) => {
      const url = `${window.location.origin}/events/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copiado ✓");
      } catch {
        window.prompt("Copia este link:", url);
      }
    },
    [showToast]
  );

  const copyGuestLink = useCallback(
    async (guest) => {
      const token = guest?.token;
      if (!token) return;
      const url = `${window.location.origin}/i/${token}/${slugifyName(guest?.name || "invitado")}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link del invitado copiado ✓");
      } catch {
        window.prompt("Copia este link:", url);
      }
    },
    [showToast]
  );

  // ── stats RSVP ────────────────────────────────────────────────────────
  const rsvpStats = useMemo(() => {
    const yes = guests.filter((g) => g.rsvp_status === "yes").length;
    const no = guests.filter((g) => g.rsvp_status === "no").length;
    const pending = guests.filter((g) => !g.rsvp_status).length;
    const confirmed = guests.reduce(
      (s, g) => s + (g.rsvp_status === "yes" ? g.rsvp_count ?? 1 : 0),
      0
    );
    return { yes, no, pending, confirmed };
  }, [guests]);

  return {
    // estado
    loading,
    email,
    orgs,
    events,
    guests,
    selectedOrgId,
    selectedEventId,
    currentEvent,
    errorMsg,
    toast,
    rsvpStats,
    // setters
    setSelectedOrgId,
    setErrorMsg,
    // acciones
    logout,
    createOrganization,
    createEvent,
    updateEvent,
    selectEventAndLoadGuests,
    addGuest,
    updateGuest,
    deleteGuest,
    copyInviteLink,
    copyGuestLink,
  };
}
