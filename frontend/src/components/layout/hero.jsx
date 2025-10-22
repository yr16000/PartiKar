import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalIcon } from "lucide-react";
import { fr } from "date-fns/locale";

export default function Hero({ onSearch }) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [city, setCity] = useState("");
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
        const payload = { city, from: range.from, to: range.to, hour };
        onSearch ? onSearch(payload) : console.log(payload);
    }

    return (
        <section className="bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-16 md:py-20 text-center">
                <h1 className="text-[clamp(2rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.05] max-w-[980px] mx-auto">
                    <span className="text-gray-900">La location de voitures,</span>{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            entre particuliers
          </span>
                </h1>

                <p className="mt-5 text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                    Louez une voiture près de chez vous — simple, économique et flexible.
                </p>

                {/* FORMULAIRE RESPONSIVE */}
                <form
                    onSubmit={handleSubmit}
                    className="
            relative overflow-visible mx-auto mt-10
            w-full max-w-[1100px]
            grid grid-cols-1 gap-3 sm:gap-4 md:gap-5
            rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xl
            sm:[grid-template-columns:1.8fr_2.4fr_1fr_minmax(160px,auto)]
            items-stretch sm:items-end
          "
                >
                    {/* Lieu */}
                    <div className="flex flex-col text-left min-w-0">
                        <span className="text-sm text-gray-600 mb-1 leading-none">Lieu</span>
                        <Input
                            type="text"
                            placeholder="Ville, adresse ou code postal"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="h-12 w-full text-base leading-none border border-gray-300 rounded-lg px-4 shadow-sm
             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                                    disabled={(d) => d < today}
                                    initialFocus
                                    className="[&_button.rdp-day]:rounded-md
                             [&_.rdp-day_selected]:bg-indigo-600 [&_.rdp-day_selected]:text-white
                             [&_.rdp-button:hover]:bg-indigo-600/10"
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
                        <Button
                            type="submit"
                            variant="brand"
                            className="h-12 w-full sm:w-auto md:min-w-[200px]"
                        >
                            Rechercher
                        </Button>
                    </div>
                </form>

                <small className="mt-4 block text-gray-500 text-sm">
                    Astuce : essaie “Paris” pour tester
                </small>
            </div>
        </section>
    );
}
