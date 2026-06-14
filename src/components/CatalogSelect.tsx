"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CatalogOption {
  id: string;
  label: string;
}

interface CatalogSelectProps {
  label: string;
  options: CatalogOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  loading?: boolean;
  emptyLabel?: string;
}

export function CatalogSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  required = false,
  disabled = false,
  searchable = true,
  loading = false,
  emptyLabel = "Sin opciones disponibles",
}: CatalogSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query, searchable]);

  const isDisabled = disabled || loading;
  const emptyText = loading ? "Cargando opciones..." : emptyLabel;
  const showDropdown = isOpen && !isDisabled;
  const displayValue = isOpen ? query : (selectedOption?.label ?? "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openDropdown() {
    if (isDisabled) return;
    setIsOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleSelect(optionId: string) {
    onChange(optionId);
    setIsOpen(false);
    setQuery("");
  }

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    if (!isOpen) setIsOpen(true);
    if (value && nextValue !== selectedOption?.label) {
      onChange("");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      return;
    }

    if (event.key === "Enter" && filtered.length === 1) {
      event.preventDefault();
      handleSelect(filtered[0].id);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm text-iaas-earth">
        {label}
        {required && " *"}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          required={required && !value}
          disabled={isDisabled}
          value={displayValue}
          placeholder={loading ? "Cargando opciones..." : placeholder}
          onFocus={openDropdown}
          onClick={openDropdown}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-lg border border-iaas-earth/20 bg-white px-3 py-2 pr-9 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-iaas-green focus:ring-2 focus:ring-iaas-green/20 disabled:bg-iaas-light/50",
          )}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iaas-earth/60 transition-transform",
            showDropdown && "rotate-180",
          )}
        />
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-iaas-earth/15 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-iaas-earth/70">{emptyText}</li>
          ) : (
            filtered.map((option) => (
              <li key={option.id} role="option" aria-selected={option.id === value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition hover:bg-iaas-light",
                    option.id === value && "bg-iaas-light font-medium text-iaas-green",
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => undefined}
          className="sr-only"
        />
      )}
    </div>
  );
}
