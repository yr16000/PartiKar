// src/components/layout/SearchBar.jsx
import React, { useMemo, useState, useEffect } from "react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/ui/DateRangePicker";

export default function SearchBar({ onSearch, variant = "plain", initialCity, initialFrom, initialTo }) {
    const today = useMemo(() => {
        const d = new Date(); d.setHours(0,0,0,0); return d;
    }, []);

    const [city, setCity] = useState(initialCity ?? "");
    const [cityCoords, setCityCoords] = useState(null);
    const [range, setRange] = useState({
        from: initialFrom ? new Date(initialFrom) : today,
        to:   initialTo   ? new Date(initialTo)   : today,
    });

    // ⬇️ quand les props initiales changent (arrivée depuis /home avec des query params)
    useEffect(() => {
        setCity(initialCity ?? "");
    }, [initialCity]);

    useEffect(() => {
        const from = initialFrom ? new Date(initialFrom) : today;
        const to   = initialTo   ? new Date(initialTo)   : today;
        from.setHours(0,0,0,0); to.setHours(0,0,0,0);
        setRange({ from, to });
    }, [initialFrom, initialTo, today]);

    // responsive months for DateRangePicker (inchangé)
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
        const payload = { city, from: range?.from, to: range?.to, coords: cityCoords };
        onSearch ? onSearch(payload) : console.log(payload);
    }

    const base =
        "relative overflow-visible mx-auto w-full max-w-[1100px] grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 rounded-2xl bg-white p-4 sm:p-5 sm:[grid-template-columns:2.2fr_1.4fr_minmax(160px,auto)] items-stretch sm:items-end";
    const skin = variant === "hero" ? "border border-transparent shadow-none"
        : "border border-gray-200 shadow-xl";

    return (
        <form onSubmit={handleSubmit} className={`${base} ${skin}`}>
            <div className="flex flex-col text-left min-w-0">
                <span className="text-sm text-gray-600 mb-1 leading-none">Lieu</span>
                <PlaceAutocomplete
                    value={city}
                    onChange={(v) => { setCity(v); setCityCoords(null); }}
                    onSelect={(item) => {
                        setCity(item.label || "");
                        setCityCoords({ latitude: item.latitude, longitude: item.longitude });
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
