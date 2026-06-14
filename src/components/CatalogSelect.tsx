"use client";

import { useMemo, useState } from "react";

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
}: CatalogSelectProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !filter.trim()) return options;
    const needle = filter.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [filter, options, searchable]);

  return (
    <div>
      <label className="mb-1 block text-sm text-iaas-earth">
        {label}
        {required && " *"}
      </label>
      {searchable && options.length > 8 && (
        <input
          type="text"
          placeholder="Buscar..."
          value={filter}
          disabled={disabled}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-2 w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20"
        />
      )}
      <select
        required={required}
        disabled={disabled || options.length === 0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20 disabled:bg-iaas-light/50"
      >
        <option value="">{options.length === 0 ? "Sin opciones disponibles" : placeholder}</option>
        {filtered.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
