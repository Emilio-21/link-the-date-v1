// components/dashboard/primitives.jsx — átomos de UI del dashboard
"use client";

export function Label({ children }) {
  return (
    <span className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">
      {children}
    </span>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none ${className}`}
      {...props}
    />
  );
}

const BTN_VARIANTS = {
  primary: "bg-stone-900 text-white hover:bg-stone-700 active:scale-95 shadow-sm",
  outline: "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 active:scale-95",
  rose: "bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-sm shadow-rose-200",
  amber: "bg-amber-400 text-stone-900 hover:bg-amber-500 active:scale-95 shadow-sm",
  ghost: "text-stone-500 hover:bg-stone-100 hover:text-stone-800 active:scale-95",
  danger: "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95",
};
const BTN_SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export function Btn({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none";
  return (
    <button className={`${base} ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-stone-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const BADGE_COLORS = {
  stone: "bg-stone-100 text-stone-600",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  red: "bg-rose-50 text-rose-600 border border-rose-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
};

export function Badge({ children, color = "stone" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_COLORS[color]}`}
    >
      {children}
    </span>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-rose-500" : "bg-stone-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      {label && <Label>{label}</Label>}
    </div>
  );
}

// ── íconos ───────────────────────────────────────────────────────────────
const svg = (size, children) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Ico = {
  Logout: () =>
    svg(15, (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    )),
  Eye: () =>
    svg(14, (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )),
  Copy: () =>
    svg(14, (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    )),
  Edit: () =>
    svg(14, (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    )),
  Trash: () =>
    svg(14, (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </>
    )),
  Users: () =>
    svg(14, (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    )),
  Gift: () =>
    svg(14, (
      <>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </>
    )),
  Cal: () =>
    svg(13, (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    )),
  Pin: () =>
    svg(13, (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    )),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// ── Toast flotante ───────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl animate-in slide-in-from-top-2 duration-200 ${
        toast.type === "success" ? "bg-stone-900 text-white" : "bg-rose-500 text-white"
      }`}
    >
      <Ico.Check />
      {toast.msg}
    </div>
  );
}

export function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <Ico.X />
      <span className="flex-1">{message}</span>
      <button className="opacity-50 hover:opacity-100" onClick={onClose}>
        <Ico.X />
      </button>
    </div>
  );
}
