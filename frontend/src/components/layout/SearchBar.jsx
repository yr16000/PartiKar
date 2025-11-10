// src/components/layout/SearchBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalIcon } from "lucide-react";
import { fr } from "date-fns/locale";

export default function SearchBar({ onSearch, variant = "plain" }) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [city, setCity] = useState("");
    const [cityCoords, setCityCoords] = useState(null);
    const [range, setRange] = useState({ from: today, to: today });
    const [hour, setHour] = useState("10:00");
    const [months, setMonths] = useState(1);

    useEffect(() => {
        const mql = window.matchMedia("(min-width: 640px)");
        const handler = () => setMonths(mql.matches ? 2 : 1);
        handler();
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, []);

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

    const formatRangeWithHour = (r, h) => {
        if (!r?.from) return "Sélectionner les dates";
        const opt = { day: "2-digit", month: "short" };
        const f = r.from.toLocaleDateString("fr-FR", opt);
        const t = (r.to ?? r.from).toLocaleDateString("fr-FR", opt);
        return `${f} ${h} → ${t} ${h}`;
    };

    function handleSubmit(e) {
        e.preventDefault();
        const payload = { city, from: range.from, to: range.to, hour, coords: cityCoords };
        onSearch ? onSearch(payload) : console.log(payload);
    }

    // Skins
    const base =
        "relative overflow-visible mx-auto w-full max-w-[1100px] grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 rounded-2xl bg-white p-4 sm:p-5 sm:[grid-template-columns:1.8fr_2.4fr_1fr_minmax(160px,auto)] items-stretch sm:items-end";
    const skin =
        variant === "hero"
            ? "border border-transparent shadow-none" // Laisse le wrapper dégradé du Hero gérer le style
            : "border border-gray-200 shadow-xl";     // Style neutre ailleurs (Search page)

    return (
        <form onSubmit={handleSubmit} className={`${base} ${skin}`}>
            {/* Lieu */}
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

            {/* Dates */}
            <div className="flex flex-col text-left min-w-0">
                <span className="text-sm text-gray-600 mb-1 leading-none">Dates</span>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base leading-none text-left
                         flex items-center justify-between gap-3 bg-white shadow-sm
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         min-w-0 overflow-hidden"
                        >
                            <span className="truncate">{formatRangeWithHour(range, hour)}</span>
                            <span className="inline-flex w-7 h-7 items-center justify-center rounded bg-gray-100 shrink-0">
                <CalIcon className="w-4 h-4 text-gray-700" />
              </span>
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        side="bottom"
                        align="start"
                        sideOffset={12}
                        avoidCollisions={false}
                        className="z-[400] w-[min(92vw,360px)] sm:w-auto rounded-xl border border-gray-200 bg-white p-3 shadow-2xl"
                    >
                        <Calendar
                            mode="range"
                            numberOfMonths={months}
                            locale={fr}
                            selected={range}
                            onSelect={(r) => {
                                const from = r?.from ?? today;
                                const to = r?.to ?? r?.from ?? from;
                                setRange({ from, to });
                            }}
                            defaultMonth={range?.from}
                            disabled={[
                                (d) => d < today,
                                { outside: true },
                            ]}
                            showOutsideDays={false}
                            initialFocus
                            className="
                w-full
                [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full
                [&_button.rdp-day]:rounded-md
                [&_.rdp-day_selected]:bg-indigo-600 [&_.rdp-day_selected]:text-white
                [&_.rdp-day_range_middle]:bg-indigo-600/10
                [&_.rdp-day_range_start]:bg-transparent
                [&_.rdp-day_range_end]:bg-transparent
                [&_.rdp-day_range_start]:shadow-none
                [&_.rdp-day_range_end]:shadow-none
                [&_.rdp-button:hover]:bg-indigo-600/10
              "
                            classNames={{
                                range_start: "rounded-md bg-transparent",
                                range_end: "rounded-md bg-transparent",
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Heure */}
            <div className="flex flex-col text-left min-w-0">
                <span className="text-sm text-gray-600 mb-1 leading-none">Heure</span>
                <Select value={hour} onValueChange={setHour}>
                    <SelectTrigger
                        className="!h-12 w-full !text-base border border-gray-300 rounded-lg shadow-sm
                       bg-white flex items-center justify-between box-border
                       !px-4 !py-0 leading-none pr-10
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       [&>*]:leading-none [&>*]:my-0"
                    >
                        <SelectValue placeholder="10:00" />
                    </SelectTrigger>
                    <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={8}
                        avoidCollisions={false}
                        className="bg-white border border-gray-200 shadow-xl rounded-lg z-[401]"
                    >
                        {hours.map((h) => (
                            <SelectItem key={h} value={h} className="cursor-pointer">
                                {h}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* CTA */}
            <div className="flex items-stretch sm:items-end">
                <Button type="submit" variant="brand" className="h-12 w-full sm:w-auto md:min-w-[200px]">
                    Rechercher
                </Button>
            </div>
        </form>
    );
}
