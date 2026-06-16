// components/dashboard/ImageUploader.jsx — un slot de imagen (subir / preview / quitar)
"use client";

import { useRef, useState } from "react";
import { Btn, Ico, Label } from "./primitives";
import { deleteEventImageByUrl, uploadEventImage } from "@/lib/upload/uploadImage";

export default function ImageUploader({
  label = "Imagen",
  value,                 // URL actual (string) o null
  onChange,              // (newUrl | null) => void
  eventId,
  kind = "cover",        // "cover" | "gallery"
  galleryIndex,
  className = "",
  aspect = "video",      // "video" (16/9) o "square"
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const disabled = !eventId;

  async function handleFile(file) {
    setErr(null);
    if (!file) return;
    try {
      setBusy(true);
      const oldUrl = value;
      const { url } = await uploadEventImage(file, { eventId, kind, galleryIndex });
      onChange?.(url);
      // best-effort: borrar la anterior (si era nuestra)
      if (oldUrl) deleteEventImageByUrl(oldUrl).catch(() => {});
    } catch (e) {
      setErr(e?.message || "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!value) return;
    const prev = value;
    onChange?.(null);
    deleteEventImageByUrl(prev).catch(() => {});
  }

  const aspectClass = aspect === "square" ? "aspect-square" : "aspect-video";

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}

      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition ${
          value ? "border-stone-200 bg-stone-50" : "border-stone-200 bg-white hover:border-rose-200"
        } ${aspectClass}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-stone-400 hover:text-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span className="text-xs font-semibold">Subiendo…</span>
              </>
            ) : (
              <>
                <Ico.Plus />
                <span className="text-xs font-semibold">
                  {disabled ? "Guarda el evento primero" : "Subir imagen"}
                </span>
                {!disabled && <span className="text-[10px] text-stone-300">JPG · PNG · WEBP · máx 5 MB</span>}
              </>
            )}
          </button>
        )}

        {value && (
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Btn
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="bg-white/95 backdrop-blur-sm"
            >
              <Ico.Edit />
            </Btn>
            <Btn
              variant="danger"
              size="sm"
              onClick={handleRemove}
              disabled={busy}
              className="bg-white/95 backdrop-blur-sm"
            >
              <Ico.Trash />
            </Btn>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {err && <p className="mt-1 text-xs text-rose-500">{err}</p>}
    </div>
  );
}
