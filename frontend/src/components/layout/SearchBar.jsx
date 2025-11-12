// src/components/layout/SearchBar.jsx
import React, { useMemo, useState, useEffect } from "react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/ui/DateRangePicker";

/**
 * Props:
 * - onSearch({ city, from, to, latitude, longitude })
 * - variant: "plain" | "hero"
 * - initialCity, initialFrom (YYYY-MM-DD or Date), initialTo
 * - initialLatitude, initialLongitude  <-- NEW: fallback coords if user doesn't re-select a place
 */
export default function SearchBar({
                                      onSearch,
                                      variant = "plain",
                                      initialCity,
                                      initialFrom,
                                      initialTo,
                                      initialLatitude,
                                      initialLongitude,
                                  }) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [city, setCity] = useState(initialCity ?? "");
    // Keep both current picked coords AND a stable fallback from props
    const [cityCoords, setCityCoords] = useState(
        initialLatitude != null && initialLongitude != null
            ? { latitude: Number(initialLatitude), longitude: Number(initialLongitude) }
            : null
    );
    const [fallbackCoords, setFallbackCoords] = useState(
        initialLatitude != null && initialLongitude != null
            ? { latitude: Number(initialLatitude), longitude: Number(initialLongitude) }
            : null
    );

    const [range, setRange] = useState({
        from: initialFrom ? new Date(initialFrom) : today,
        to: initialTo ? new Date(initialTo) : today,
    });

    // Sync when parent updates initial values (e.g., via URL changes)
    useEffect(() => {
        setCity(initialCity ?? "");
    }, [initialCity]);

    useEffect(() => {
        const from = initialFrom ? new Date(initialFrom) : today;
        const to = initialTo ? new Date(initialTo) : today;
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        setRange({ from, to });
    }, [initialFrom, initialTo, today]);

    useEffect(() => {
        if (initialLatitude != null && initialLongitude != null) {
            const coords = { latitude: Number(initialLatitude), longitude: Number(initialLongitude) };
            setFallbackCoords(coords);
            // only set live coords if user hasn't picked any yet
            setCityCoords((prev) => prev ?? coords);
        }
    }, [initialLatitude, initialLongitude]);

    // responsive months for DateRangePicker
    const [months, setMonths] = useState(1);
    useEffect(() => {
        const mql = window.matchMedia("(min-width: 640px)");
        const handler = () => setMonths(mql.matches ? 2 : 1);
        handler();
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        // Prefer coords from a fresh selection; otherwise fallback to initial coords if the city is unchanged
        const chosen = cityCoords
            ? cityCoords
            : city === (initialCity ?? "") && fallbackCoords
                ? fallbackCoords
                : null;

        const lat = chosen?.latitude ?? chosen?.lat ?? chosen?.y ?? null;
        const lon = chosen?.longitude ?? chosen?.lon ?? chosen?.x ?? null;

        const payload = { city, from: range?.from, to: range?.to, latitude: lat, longitude: lon };
        onSearch ? onSearch(payload) : console.log(payload);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`relative overflow-visible mx-auto w-full max-w-[1100px] grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 rounded-2xl bg-white p-4 sm:p-5 sm:[grid-template-columns:2.2fr_1.4fr_minmax(160px,auto)] items-stretch sm:items-end ${
                variant === "hero" ? "border border-transparent shadow-none" : "border border-gray-200 shadow-xl"
            }`}
        >
            <div className="flex flex-col text-left min-w-0">
                <span className="text-sm text-gray-600 mb-1 leading-none">Lieu</span>
                <PlaceAutocomplete
                    value={city}
                    onChange={(v) => {
                        setCity(v);
                        // user is typing: clear live coords but keep fallback intact
                        setCityCoords(null);
                    }}
                    onSelect={(item) => {
                        setCity(item.label || "");
                        const lat = item.latitude ?? item.lat ?? item.y ?? null;
                        const lon = item.longitude ?? item.lon ?? item.x ?? null;
                        const coords = lat != null && lon != null ? { latitude: Number(lat), longitude: Number(lon) } : null;
                        setCityCoords(coords);
                        // update fallback to the last valid selection too
                        if (coords) setFallbackCoords(coords);
                    }}
                    placeholder="Ville, adresse ou code postal"
                />
            </div>

            <div className="flex flex-col text-left min-w-0">
                <span className="text-sm text-gray-600 mb-1 leading-none">Dates</span>
                <DateRangePicker
                    value={range}
                    onChange={setRange}
                    months={months}
                    minDate={today}
                    popoverSide="bottom"
                    popoverAlign="start"
                />
            </div>

            <div className="flex items-stretch sm:items-end">
                <Button type="submit" variant="brand" className="h-12 w-full sm:w-auto md:min-w-[200px]">
                    Rechercher
                </Button>
            </div>
        </form>
    );
}
