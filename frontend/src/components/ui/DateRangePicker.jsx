// src/components/ui/DateRangePicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalIcon } from "lucide-react";
import { fr } from "date-fns/locale";

function stripTime(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}
function formatRangeLabel(range, placeholder = "Sélectionner une période") {
    const { from, to } = range || {};
    if (!from) return placeholder;
    const opts = { day: "2-digit", month: "short", year: "numeric" };
    const f = from.toLocaleDateString("fr-FR", opts);
    const t = (to ?? from).toLocaleDateString("fr-FR", opts);
    return `${f} → ${t}`;
}

/**
 * DateRangePicker – SANS heure, réutilisable.
 *
 * Props:
 * - value: { from: Date|null, to: Date|null }
 * - onChange: (range) => void
 * - placeholder?: string
 * - minDate?: Date
 * - maxDate?: Date
 * - disabledDays?: array|fn compatible react-day-picker
 * - months?: number (si non fourni: 1 sur mobile, 2 en ≥640px)
 * - side/align/sideOffset/avoidCollisions?: Popover options
 * - buttonClassName?: string, contentClassName?: string
 *
 * - NEW:
 *   - lockToAvailable?: boolean  -> si true, tout est grisé SAUF les "availableDaysYMD"
 *   - availableDaysYMD?: string[] (YYYY-MM-DD) -> jours explicitement disponibles
 */
export default function DateRangePicker({
                                            value,
                                            onChange,
                                            placeholder = "Sélectionner une période",
                                            minDate,
                                            maxDate,
                                            disabledDays = [],
                                            months,
                                            side = "bottom",
                                            align = "start",
                                            sideOffset = 12,
                                            avoidCollisions = false,
                                            buttonClassName = "",
                                            contentClassName = "",
                                            // 👇 nouveaux props
                                            lockToAvailable = false,
                                            availableDaysYMD = [],
                                        }) {
    const [open, setOpen] = useState(false);

    // Responsive nombre de mois (1 mobile / 2 desktop) si months non fourni
    const monthsCount = (() => {
        if (typeof months === "number") return months;
        if (typeof window === "undefined") return 1;
        return window.matchMedia("(min-width: 640px)").matches ? 2 : 1;
    })();
    const [mCount, setMCount] = useState(monthsCount);
    useEffect(() => {
        if (typeof months === "number") return;
        const mql = window.matchMedia("(min-width: 640px)");
        const handler = () => setMCount(mql.matches ? 2 : 1);
        handler();
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, [months]);

    const availSet = useMemo(() => new Set((availableDaysYMD || []).map(String)), [availableDaysYMD]);

    const baseDisabled = useMemo(() => {
        const arr = [{ outside: true }];
        if (minDate) arr.unshift((d) => d < stripTime(minDate));
        if (maxDate) arr.unshift((d) => d > stripTime(maxDate));
        return arr;
    }, [minDate, maxDate]);

    // Si lockToAvailable=true -> on désactive TOUT ce qui n’est PAS dans availableDaysYMD
    const lockPredicate = useMemo(() => {
        if (!lockToAvailable) return null;
        return (d) => !availSet.has(toYMD(stripTime(d)));
    }, [lockToAvailable, availSet]);

    const finalDisabled = useMemo(() => {
        const extra = Array.isArray(disabledDays) ? disabledDays : [disabledDays].filter(Boolean);
        return lockPredicate ? [...baseDisabled, lockPredicate, ...extra] : [...baseDisabled, ...extra];
    }, [baseDisabled, disabledDays, lockPredicate]);

    const label = formatRangeLabel(value || {}, placeholder);

    const today = useMemo(() => stripTime(new Date()), []);
    const muteToday = useMemo(
        () => value?.from && stripTime(value.from) > today,
        [value?.from, today]
    );


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-between h-11 ${!value?.from ? "text-muted-foreground" : ""} ${buttonClassName}`}
                >
                    <span className="truncate">{label}</span>
                    <CalIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                side={side}
                align={align}
                sideOffset={sideOffset}
                avoidCollisions={avoidCollisions}
                className={`z-[400] w-[min(92vw,360px)] sm:w-auto rounded-xl border border-gray-200 bg-white p-3 shadow-2xl ${contentClassName}`}
            >
                <Calendar
                    mode="range"
                    numberOfMonths={typeof months === "number" ? months : mCount}
                    locale={fr}
                    selected={value}
                    onSelect={(r) => {
                        const from = r?.from ? stripTime(r.from) : null;
                        const to = r?.to ? stripTime(r.to) : r?.from ? stripTime(r.from) : null;
                        onChange?.({ from, to });
                    }}
                    defaultMonth={value?.from ?? stripTime(new Date())}
                    disabled={finalDisabled}
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
                        ...(muteToday ? { today: "" } : {}),
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
