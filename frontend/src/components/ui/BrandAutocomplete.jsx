import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

// Composant d'autocomplete local pour la marque
// Props:
// - value: string
// - onChange: (string) => void
// - onSelect: (string) => void
// - options: string[] (liste des marques)
// - placeholder: string
// - requireMatch: boolean (si true, n'autorise que les sélections présentes dans options)
// - disabled: boolean
export default function BrandAutocomplete({ value, onChange, onSelect, options = [], placeholder = 'Marque', requireMatch = false, disabled = false }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => setQuery(value || ''), [value]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      return;
    }
    if (!query) {
      setOpen(false);
      return;
    }
    const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
    setOpen(filtered.length > 0);
  }, [query, options, disabled]);

  function handleChange(e) {
    if (disabled) return;
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
  }

  function handleSelect(item) {
    if (disabled) return;
    setQuery(item);
    onChange && onChange(item);
    onSelect && onSelect(item);
    setOpen(false);
  }

  // Si requireMatch=true, au blur on réinitialise si la valeur ne correspond pas exactement à une option
  function handleBlur() {
    if (disabled) return;
    if (!requireMatch) return;
    const exact = options.find((o) => o.toLowerCase() === (query || '').toLowerCase());
    if (!exact) {
      setQuery('');
      onChange && onChange('');
    } else {
      // normalize to the exact option casing
      if (exact !== query) {
        setQuery(exact);
        onChange && onChange(exact);
        onSelect && onSelect(exact);
      }
    }
    setOpen(false);
  }

  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const filtered = query ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : options.slice(0, 6);

  return (
    <div className="relative" ref={containerRef}>
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-12 w-full text-base leading-none border border-gray-300 rounded-lg px-4 shadow-sm"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
        autoComplete="off"
        disabled={disabled}
        aria-disabled={disabled}
      />

      {open && !disabled && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Aucune suggestion</li>
          )}
          {filtered.map((s, i) => (
            <li
              key={i}
              role="option"
              onMouseDown={(e) => e.preventDefault()} /* empêche le blur avant le click */
              onClick={() => handleSelect(s)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm"
            >
              <div className="truncate">{s}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
