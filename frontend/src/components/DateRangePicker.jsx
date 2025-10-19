import { useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format, differenceInCalendarDays, isAfter } from "date-fns";
import "react-day-picker/dist/style.css"; // v8

export default function DateRangePicker({
                                            value,
                                            onChange,
                                            minDate = new Date(),
                                            className = "",
                                        }) {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState(value || { from: undefined, to: undefined });
    const [fromTime, setFromTime] = useState("10:00");
    const [toTime, setToTime] = useState("10:00");
    const popRef = useRef(null);

    const label = useMemo(() => {
        const f = range?.from ? format(range.from, "dd MMM yyyy", { locale: fr }) : "Dates";
        const t = range?.to ? format(range.to, "dd MMM yyyy", { locale: fr }) : "";
        return range?.from && range?.to ? `${f} → ${t}` : f;
    }, [range]);

    const nights =
        range?.from && range?.to
            ? Math.max(0, differenceInCalendarDays(range.to, range.from))
            : 0;

    // fermer au clic extérieur
    useMemo(() => {
        function onDocClick(e) {
            if (!open) return;
            if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    function handleSave() {
        if (!range?.from || !range?.to || isAfter(range.from, range.to)) return;
        onChange?.({ ...range, fromTime, toTime });
        setOpen(false);
    }

    function handleClear() {
        setRange({ from: undefined, to: undefined });
        onChange?.({ from: undefined, to: undefined, fromTime: undefined, toTime: undefined });
    }

    return (
        <div className={`relative ${className}`} ref={popRef}>
            {/* Barre compacte — HAUTEUR 56px, alignée avec input/bouton */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-300 bg-white pl-5 pr-3 h-14 hover:shadow-sm transition"
            >
                <div className="text-left flex-1 leading-tight">
                    <div className="text-xs text-gray-500">Départ • Jusqu’au</div>
                    <div className="text-base font-medium text-gray-900">{label}</div>
                </div>
                <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-accent text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
            </button>

            {open && (
                <div className="absolute left-0 mt-3 w-[900px] max-w-[96vw] rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    {/* Flèches perso (on pilote celles de DayPicker) */}
                    <div className="flex items-center justify-between px-5 pt-4">
                        <button
                            className="h-10 w-10 rounded-full hover:bg-gray-100 grid place-items-center"
                            onClick={() =>
                                document.querySelector(".rdp-nav_button[aria-label='Go to previous month']")?.click()
                            }
                            aria-label="Mois précédent"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                        <button
                            className="h-10 w-10 rounded-full hover:bg-gray-100 grid place-items-center"
                            onClick={() =>
                                document.querySelector(".rdp-nav_button[aria-label='Go to next month']")?.click()
                            }
                            aria-label="Mois suivant"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendrier double mois XL */}
                    <div className="px-4 pt-1">
                        <DayPicker
                            numberOfMonths={2}
                            locale={fr}
                            mode="range"
                            selected={range}
                            onSelect={setRange}
                            disabled={{ before: minDate }}
                            pagedNavigation
                            fixedWeeks
                            weekStartsOn={1}
                            showOutsideDays
                            className="rdp-tailwind p-2"
                            classNames={{
                                caption_label: "text-lg font-semibold text-gray-900",
                                day: "h-10 w-10 rounded-full text-sm hover:bg-indigo-50 focus:outline-none aria-selected:bg-accent aria-selected:text-white",
                                day_range_start: "bg-accent text-white hover:bg-accent",
                                day_range_end: "bg-accent text-white hover:bg-accent",
                                day_selected: "bg-accent text-white",
                                day_today: "ring-2 ring-indigo-400",
                                day_outside: "text-gray-300",
                                day_disabled: "text-gray-300 opacity-60",
                                head: "text-gray-500",
                                nav_button: "rdp-nav_button hidden",
                                month: "p-3",
                                months: "flex gap-10",
                                table: "mx-auto",
                                weekday: "text-xs font-medium text-gray-500",
                                week: "space-x-1",
                            }}
                            styles={{
                                caption: { display: "flex", justifyContent: "center", paddingBottom: 8 },
                            }}
                        />
                    </div>

                    {/* Heures + pastille */}
                    <div className="flex flex-wrap items-center gap-5 px-6 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-16">Départ</span>
                            <select
                                className="h-11 rounded-lg border border-gray-300 px-3 text-sm"
                                value={fromTime}
                                onChange={(e) => setFromTime(e.target.value)}
                            >
                                {timeSlots().map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-16">Jusqu’au</span>
                            <select
                                className="h-11 rounded-lg border border-gray-300 px-3 text-sm"
                                value={toTime}
                                onChange={(e) => setToTime(e.target.value)}
                            >
                                {timeSlots().map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-gray-500">Nuits</span>
                            <span className="h-9 w-9 rounded-full border border-indigo-400 text-indigo-600 grid place-items-center text-sm font-semibold">
                {nights}
              </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between px-6 py-5">
                        <button
                            onClick={handleClear}
                            className="h-11 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Effacer
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="h-11 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="h-11 px-5 rounded-lg bg-accent text-white font-semibold hover:bg-[#4338ca] transition"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function timeSlots(start = 7, end = 22) {
    const out = [];
    for (let h = start; h <= end; h++) {
        for (const m of [0, 30]) {
            const hh = String(h).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            out.push(`${hh}:${mm}`);
        }
    }
    return out;
}
