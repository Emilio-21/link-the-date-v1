// components/dashboard/EventForm.jsx
// Formulario de evento reutilizado para "crear" (modo compacto) y "editar" (modo completo con personalización).
"use client";

import { useEffect, useState } from "react";
import { Btn, Ico, Input, Label, Switch, Textarea } from "./primitives";
import { isoToDateTimeLocal } from "@/lib/dashboard/utils";
import { DEFAULT_TEMPLATE, listTemplates } from "@/lib/templates";
import ImageUploader from "./ImageUploader";

export const GALLERY_SIZE = 3;

const EMPTY = {
  title: "",
  datetime: "",
  location: "",
  description: "",
  venueName: "",
  locationUrl: "",
  giftUrl1: "",
  giftUrl2: "",
  bankAccount: "",
  coupleName: "",
  mainMessage: "",
  dressCodeText: "Formal",
  kidsPolicyText: "Sin niños",
  giftLabel1: "Liverpool",
  giftLabel2: "Amazon",
  giftsMessage: "",
  bankName: "",
  showDressCode: true,
  showKidsPolicy: true,
  showGifts: true,
  showBank: true,
  template: DEFAULT_TEMPLATE,
  coverUrl: "",
  galleryUrls: Array(GALLERY_SIZE).fill(""),
};

function padGallery(arr) {
  const list = Array.isArray(arr) ? arr.slice(0, GALLERY_SIZE) : [];
  while (list.length < GALLERY_SIZE) list.push("");
  return list;
}

export function eventToForm(ev) {
  if (!ev) return { ...EMPTY };
  return {
    title: ev.name ?? "",
    datetime: isoToDateTimeLocal(ev.event_datetime),
    location: ev.location ?? "",
    description: ev.description ?? "",
    venueName: ev.venue_name ?? "",
    locationUrl: ev.location_url ?? "",
    giftUrl1: ev.gift_url_1 ?? "",
    giftUrl2: ev.gift_url_2 ?? "",
    bankAccount: ev.bank_account ?? "",
    coupleName: ev.couple_name ?? "",
    mainMessage: ev.main_message ?? "",
    dressCodeText: ev.dress_code_text ?? "Formal",
    kidsPolicyText: ev.kids_policy_text ?? "Sin niños",
    giftLabel1: ev.gift_label_1 ?? "Liverpool",
    giftLabel2: ev.gift_label_2 ?? "Amazon",
    giftsMessage: ev.gifts_message ?? "",
    bankName: ev.bank_name ?? "",
    showDressCode: ev.show_dress_code !== false,
    showKidsPolicy: ev.show_kids_policy !== false,
    showGifts: ev.show_gifts !== false,
    showBank: ev.show_bank !== false,
    template: ev.template || DEFAULT_TEMPLATE,
    coverUrl: ev.cover_url ?? "",
    galleryUrls: padGallery(ev.gallery_urls),
  };
}

export default function EventForm({
  mode = "create", // "create" | "edit"
  initial,
  eventId,         // requerido para subir imágenes (solo modo edit)
  onSubmit,
  onCancel,
  busy,
}) {
  const [form, setForm] = useState(initial || { ...EMPTY });

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e?.target?.value ?? e }));
  const toggle = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const canSubmit = !!form.title.trim() && !!form.datetime && !busy;
  const isEdit = mode === "edit";
  const templates = listTemplates();

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Plantilla</Label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setForm((f) => ({ ...f, template: t.slug }))}
                className={`text-left rounded-xl border px-3.5 py-3 transition ${
                  form.template === t.slug
                    ? "border-rose-300 bg-rose-50/60 ring-2 ring-rose-100"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="text-sm font-bold text-stone-800">{t.name}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label>Nombre *</Label>
          <Input value={form.title} onChange={set("title")} placeholder="Ej. Nuestra Boda" />
        </div>
        <div>
          <Label>Fecha y hora *</Label>
          <Input type="datetime-local" value={form.datetime} onChange={set("datetime")} />
        </div>
        <div>
          <Label>Venue</Label>
          <Input value={form.venueName} onChange={set("venueName")} placeholder="Ej. Edificio Ipiña" />
        </div>
        <div>
          <Label>Ciudad / Lugar</Label>
          <Input value={form.location} onChange={set("location")} placeholder="Ej. San Luis Potosí" />
        </div>
        <div>
          <Label>Google Maps</Label>
          <Input value={form.locationUrl} onChange={set("locationUrl")} placeholder="https://maps.google.com/…" />
        </div>

        <div className="sm:col-span-2">
          <Label>Descripción corta</Label>
          <Input value={form.description} onChange={set("description")} placeholder="Mensaje breve para invitados…" />
        </div>

        {/* ── PERSONALIZACIÓN (arriba) ───────────────────────────────── */}
        {isEdit && (
          <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-stone-50 p-4 mt-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">
              Personalización de la invitación
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Nombre de la pareja / festejado</Label>
                <Input value={form.coupleName} onChange={set("coupleName")} placeholder="Ej. Andy y Emilio" />
              </div>

              <div className="sm:col-span-2">
                <Label>Mensaje principal</Label>
                <Textarea
                  rows={3}
                  value={form.mainMessage}
                  onChange={set("mainMessage")}
                  placeholder="Nos encantaría contar con tu presencia..."
                />
              </div>

              {/* ── REGALOS Y BANCO (consolidado, fácil de acceder) ── */}
              <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                <div className="mb-3">
                  <Switch
                    checked={form.showGifts}
                    onChange={toggle("showGifts")}
                    label="Mostrar mesas de regalos / cuenta"
                  />
                </div>

                {form.showGifts && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label>Mensaje de regalos</Label>
                      <Textarea
                        rows={2}
                        value={form.giftsMessage}
                        onChange={set("giftsMessage")}
                        placeholder="Si quieres bendecirnos, te dejamos nuestras mesas de regalos o una cuenta de banco."
                      />
                    </div>

                    <div>
                      <Label>Título botón #1</Label>
                      <Input value={form.giftLabel1} onChange={set("giftLabel1")} placeholder="Liverpool" />
                    </div>
                    <div>
                      <Label>Link botón #1</Label>
                      <Input value={form.giftUrl1} onChange={set("giftUrl1")} placeholder="https://…" />
                    </div>

                    <div>
                      <Label>Título botón #2</Label>
                      <Input value={form.giftLabel2} onChange={set("giftLabel2")} placeholder="Amazon" />
                    </div>
                    <div>
                      <Label>Link botón #2</Label>
                      <Input value={form.giftUrl2} onChange={set("giftUrl2")} placeholder="https://…" />
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-amber-200/70">
                  <Switch
                    checked={form.showBank}
                    onChange={toggle("showBank")}
                    label="Mostrar cuenta bancaria"
                  />
                </div>
                {form.showBank && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <Label>Nombre del banco</Label>
                      <Input value={form.bankName} onChange={set("bankName")} placeholder="BANAMEX, BBVA, SPEI…" />
                    </div>
                    <div>
                      <Label>Número de cuenta / CLABE</Label>
                      <Input value={form.bankAccount} onChange={set("bankAccount")} placeholder="CLABE / tarjeta" />
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <Switch
                  checked={form.showDressCode}
                  onChange={toggle("showDressCode")}
                  label="Mostrar Dress Code"
                />
              </div>
              {form.showDressCode && (
                <div>
                  <Label>Texto Dress Code</Label>
                  <Input value={form.dressCodeText} onChange={set("dressCodeText")} placeholder="Formal" />
                </div>
              )}

              <Switch
                checked={form.showKidsPolicy}
                onChange={toggle("showKidsPolicy")}
                label="Política de niños"
              />
              {form.showKidsPolicy && (
                <div>
                  <Label>Texto política niños</Label>
                  <Input value={form.kidsPolicyText} onChange={set("kidsPolicyText")} placeholder="Sin niños" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOTOS (hasta abajo) ─────────────────────────────────────── */}
        {isEdit && (
          <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-white p-4 mt-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">
              Fotos del evento
            </p>
            <ImageUploader
              label="Foto principal (hero)"
              value={form.coverUrl}
              onChange={(url) => setForm((f) => ({ ...f, coverUrl: url || "" }))}
              eventId={eventId}
              kind="cover"
              aspect="video"
            />
            <Label>Galería ({GALLERY_SIZE} fotos — 1 arriba, 2 abajo)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.galleryUrls.map((url, i) => (
                <ImageUploader
                  key={i}
                  label={null}
                  value={url}
                  onChange={(newUrl) =>
                    setForm((f) => {
                      const next = [...f.galleryUrls];
                      next[i] = newUrl || "";
                      return { ...f, galleryUrls: next };
                    })
                  }
                  eventId={eventId}
                  kind="gallery"
                  galleryIndex={i}
                  aspect="square"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Btn>
        <Btn
          variant={isEdit ? "amber" : "rose"}
          size={isEdit ? "sm" : "md"}
          onClick={() => canSubmit && onSubmit(form)}
          disabled={!canSubmit}
        >
          {busy ? (isEdit ? "Guardando…" : "Creando…") : isEdit ? (
            <>
              <Ico.Check />
              Guardar cambios
            </>
          ) : (
            "Crear evento"
          )}
        </Btn>
      </div>
    </div>
  );
}
