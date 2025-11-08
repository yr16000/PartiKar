import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

// Composant léger d'autocomplete basé sur le backend /api/geocode
// Props:
// - value: string (valeur contrôlée)
// - onChange: (string) => void
// - onSelect: (GeocodeResult) => void
// - placeholder
// - minLength (default 2)
export default function PlaceAutocomplete({ value, onChange, onSelect, placeholder = 'Ville, adresse ou code postal', minLength = 2 }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => setQuery(value || ''), [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < minLength) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function fetchSuggestions(q) {
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data || []);
        setOpen((data || []).length > 0);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch (e) {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(item) {
    onSelect && onSelect(item);
    onChange && onChange(item.label || '');
    setOpen(false);
  }

  function handleChange(e) {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
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

  return (
    <div className="relative" ref={containerRef}>
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-12 w-full text-base leading-none border border-gray-300 rounded-lg px-4 shadow-sm"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
      />

      {open && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {loading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Chargement...</li>
          )}
          {!loading && suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Aucune suggestion</li>
          )}
          {!loading && suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              onClick={() => handleSelect(s)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm"
            >
              <div className="truncate">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.postcode ? `${s.city ?? ''} • ${s.postcode}` : s.city ?? s.country}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

