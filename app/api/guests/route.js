// app/api/guests/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan env vars: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

function coercePositiveInt(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i >= 1 ? i : fallback;
}

function pickMaxGuests(body) {
  // Soporta varios nombres (por si el dashboard manda otro)
  // Prioridad: max_guests (real) > passes_allowed > passes > tickets
  if (body && body.max_guests != null) return coercePositiveInt(body.max_guests, 1);
  if (body && body.passes_allowed != null) return coercePositiveInt(body.passes_allowed, 1);
  if (body && body.passes != null) return coercePositiveInt(body.passes, 1);
  if (body && body.tickets != null) return coercePositiveInt(body.tickets, 1);
  return 1;
}

// GET /api/guests?event_id=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const event_id = searchParams.get("event_id");

    if (!event_id) {
      return NextResponse.json({ error: "Falta event_id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("guests")
      .select(
        `
        id,
        event_id,
        name,
        email,
        phone,
        max_guests,
        table_assignment,
        token,
        created_at,
        rsvps (
          attending,
          party_size,
          updated_at
        )
      `
      )
      .eq("event_id", event_id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // rsvps viene como arreglo (relación) o como objeto, dependiendo del motor/cliente
    const guests = (data || []).map((g) => {
      const r = Array.isArray(g.rsvps) ? g.rsvps[0] : g.rsvps;

      return {
        id: g.id,
        event_id: g.event_id,
        name: g.name,
        email: g.email,
        phone: g.phone,
        max_guests: g.max_guests,
        table_assignment: g.table_assignment,
        token: g.token,
        created_at: g.created_at,
        rsvp_status: r ? (r.attending ? "yes" : "no") : null,
        rsvp_count: r ? r.party_size : null,
        rsvp_updated_at: r ? r.updated_at : null,
      };
    });

    return NextResponse.json({ guests });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/guests
// body: { event_id, name, max_guests? , email?, phone? }
// También acepta passes / passes_allowed por compatibilidad.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    const event_id = body?.event_id;
    const name = (body?.name || "").trim();
    const email = (body?.email || "").trim() || null;
    const phone = (body?.phone || "").trim() || null;
    const table_assignment = (body?.table_assignment || "").trim() || null;

    if (!event_id || !name) {
      return NextResponse.json(
        { error: "Faltan event_id o name" },
        { status: 400 }
      );
    }

    const safeMax = pickMaxGuests(body);
    const token = crypto.randomUUID();

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("guests")
      .insert({
        event_id,
        name,
        max_guests: safeMax,
        email,
        phone,
        table_assignment,
        token,
      })
      .select("id,event_id,name,email,phone,max_guests,table_assignment,token,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ guest: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/guests
// body: { id, name?, email?, phone?, max_guests? }
export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => null);
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const updates = {};
    if (body.name != null) updates.name = String(body.name).trim();
    if ("email" in body) updates.email = (body.email || "").trim() || null;
    if ("phone" in body) updates.phone = (body.phone || "").trim() || null;
    if (body.max_guests != null) updates.max_guests = pickMaxGuests(body);
    if ("table_assignment" in body) updates.table_assignment = (body.table_assignment || "").trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const supabase = supaAdmin();
    const { data, error } = await supabase
      .from("guests")
      .update(updates)
      .eq("id", id)
      .select("id,event_id,name,email,phone,max_guests,table_assignment,token,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ guest: data });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/guests?id=...
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // Borra primero el RSVP asociado (si existe) para evitar FK constraint
    await supabase.from("rsvps").delete().eq("guest_id", id);

    const { error } = await supabase.from("guests").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}