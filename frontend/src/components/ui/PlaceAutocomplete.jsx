// src/components/ui/PlaceAutocomplete.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

// Composant léger d'autocomplete basé sur le backend /api/geocode
// Props:
// - value: string (valeur contrôlée)
// - onChange: (string) => void
// - onSelect: (GeocodeResult) => void
// - placeholder
// - minLength (default 2)
export default function PlaceAutocomplete({
                                              value,
                                              onChange,
                                              onSelect,
                                              placeholder = 'Ville, adresse ou code postal',
                                              minLength = 2,
                                          }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔒 l’ouverture est contrôlée UNIQUEMENT par le clic utilisateur
    const [open, setOpen] = useState(false);

    const debounceRef = useRef(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // garde l’input en phase avec value externe
    useEffect(() => setQuery(value || ''), [value]);

    // fetch suggestions mais NE CHANGE PAS `open`
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query || query.length < minLength) {
            setSuggestions([]);
            // ❌ ne pas ouvrir automatiquement
            return;
        }
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query, minLength]);

    async function fetchSuggestions(q) {
        setLoading(true);
        try {
            const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=6`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(Array.isArray(data) ? data : []);
            } else {
                setSuggestions([]);
            }
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSelect(item) {
        onSelect && onSelect(item);
        onChange && onChange(item.label || '');
        // ferme + blur pour empêcher toute réouverture indirecte
        setOpen(false);
        inputRef.current?.blur();
    }

    function handleChange(e) {
        const v = e.target.value;
        setQuery(v);
        onChange && onChange(v);
        // ❌ ne pas ouvrir ici
    }

    // fermer si clic à l’extérieur
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
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="h-12 w-full text-base leading-none border border-gray-300 rounded-lg px-4 shadow-sm"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-haspopup="listbox"
                // ✅ ouvre uniquement quand l’utilisateur clique
                onMouseDown={() => setOpen(true)}
                // ❌ ne pas ouvrir au focus
                onFocus={() => {}}
            />

            {open && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto"
                >
                    {loading && (
                        <li className="px-3 py-2 text-sm text-muted-foreground">Chargement...</li>
                    )}
                    {!loading && suggestions.length === 0 && (
                        <li className="px-3 py-2 text-sm text-muted-foreground">Aucune suggestion</li>
                    )}
                    {!loading &&
                        suggestions.map((s, i) => (
                            <li
                                key={i}
                                role="option"
                                onMouseDown={(e) => e.preventDefault()} // évite le blur avant le click
                                onClick={() => handleSelect(s)}
                                className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                                <div className="truncate">{s.label}</div>
                                <div className="text-xs text-muted-foreground">
                                    {s.postcode
                                        ? `${s.city ?? ''} • ${s.postcode}`
                                        : s.city ?? s.country}
                                </div>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
