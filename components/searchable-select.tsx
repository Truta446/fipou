"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show search input only when there are at least this many options. */
  searchThreshold?: number;
  mono?: boolean;
};

/**
 * Lightweight searchable combobox (no extra deps). Filters by typed text,
 * supports keyboard nav, closes on outside-click / Escape. Tuned for the
 * Fipou dark theme.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  disabled = false,
  searchThreshold = 8,
  mono = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const showSearch = options.length >= searchThreshold;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Focus the search field when opening.
  useEffect(() => {
    if (open && showSearch) inputRef.current?.focus();
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open, showSearch]);

  function choose(opt: Option) {
    onChange(opt.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    }
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-white/[0.06] bg-[#0A0A0A] px-3 py-2.5 text-left text-sm text-[#FAFAFA] transition-colors hover:border-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={`truncate ${selected ? "" : "text-[#52525B]"} ${mono ? "font-mono" : ""}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#52525B] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-white/[0.08] bg-[#0A0A0A] shadow-xl shadow-black/50">
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-[#52525B]" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Pesquisar…"
                className="w-full bg-transparent text-sm text-[#FAFAFA] outline-none placeholder:text-[#52525B]"
                aria-label="Pesquisar opções"
                aria-controls={listId}
              />
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#52525B]">
                Nada encontrado
              </li>
            ) : (
              filtered.map((opt, i) => {
                const isSel = opt.value === value;
                const isActive = i === active;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(opt)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${
                      isActive ? "bg-white/[0.06]" : ""
                    } ${isSel ? "text-[#60A5FA]" : "text-[#FAFAFA]"} ${mono ? "font-mono" : ""}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSel && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
