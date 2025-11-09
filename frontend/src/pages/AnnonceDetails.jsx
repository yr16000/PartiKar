// src/pages/AnnonceDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Calendar as CalIcon, MapPin } from "lucide-react";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";

const FALLBACK =
    "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

function diffDaysInclusive(from, to) {
    const ms = 24 * 60 * 60 * 1000;
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    const raw = Math.round((end - start) / ms) + 1;
    return Math.max(1, raw);
}

export default function AnnonceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    // États pour la réservation
    const [reserving, setReserving] = useState(false);
    const [reservationError, setReservationError] = useState("");
    const [reservationSuccess, setReservationSuccess] = useState(false);

    // ---- DATEPICKER (même logique que Hero) ----
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const [months, setMonths] = useState(1);
    useEffect(() => {
        const mql = window.matchMedia("(min-width: 640px)");
        const handler = () => setMonths(mql.matches ? 2 : 1);
        handler();
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, []);

    const [range, setRange] = useState({ from: today, to: today });
    const [hour, setHour] = useState("10:00");
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

    const formatRangeWithHour = (r, h) => {
        if (!r?.from) return "Sélectionner les dates";
        const opt = { day: "2-digit", month: "short" };
        const f = r.from.toLocaleDateString("fr-FR", opt);
        const t = (r.to ?? r.from).toLocaleDateString("fr-FR", opt);
        return `${f} ${h} → ${t} ${h}`;
    };

    // ---- DATA ----
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // jours indisponibles (grisés)
    const [unavailable, setUnavailable] = useState(new Set());

    // prix total
    const total = (() => {
        const price = Number(data?.prixParJour ?? 0);
        const days = diffDaysInclusive(range.from, range.to ?? range.from);
        return price * days;
    })();

    // Fonction pour gérer la réservation
    const handleReservation = async () => {
        // Vérifier si l'utilisateur est connecté (on vérifie le token)
        if (!token) {
            setReservationError("Vous devez être connecté pour réserver une voiture");
            navigate("/login", { state: { from: `/annonce/${id}` } });
            return;
        }

        // Réinitialiser les messages
        setReservationError("");
        setReservationSuccess(false);
        setReserving(true);

        try {
            const payload = {
                voitureId: Number(id),
                dateDebut: toYMD(range.from),
                dateFin: toYMD(range.to ?? range.from),
                heureDebut: hour,
                heureFin: hour,
            };

            const response = await fetch("http://localhost:8080/api/locations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Erreur lors de la réservation");
            }

            const locationData = await response.json();

            // Succès !
            setReservationSuccess(true);

            // Rediriger vers une page de confirmation après 2 secondes
            setTimeout(() => {
                navigate("/profile", { state: { tab: "reservations" } });
            }, 2000);

        } catch (error) {
            console.error("Erreur réservation:", error);
            setReservationError(error.message || "Une erreur est survenue lors de la réservation");
        } finally {
            setReserving(false);
        }
    };

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");
                // 1) annonce
                const res = await fetch(`/api/annonces/${id}`, { headers: { Accept: "application/json" } });
                if (!res.ok) throw new Error("HTTP " + res.status);
                const a = await res.json();
                if (!alive) return;

                // normalisation minimale depuis AnnonceResponse (backend fourni)
                const norm = {
                    id: a.voitureId ?? a.id ?? Number(id),
                    marque: a.marque,
                    modele: a.modele,
                    annee: a.annee,
                    imageUrl: a.imageUrl || FALLBACK,
                    localisation: a.localisation,
                    prixParJour: a.prixParJour,
                    boiteVitesse: a.boiteVitesse,
                    typeCarburant: a.typeCarburant,
                    nbPlaces: a.nbPlaces,
                    climatisation: a.climatisation,
                    couleur: a.couleur,
                    immatriculation: a.immatriculation,
                    creeLe: a.creeLe, // LocalDateTime
                    description: a.description,
                };
                setData(norm);

                // 2) disponibilités (si endpoint dispo). On tente plusieurs chemins courants, on garde le premier OK
                const tryEndpoints = [
                    `/api/annonces/${id}/disponibilites`,
                    `/api/disponibilites/voiture/${norm.id}`,
                    `/api/disponibilites?voitureId=${norm.id}`,
                ];
                let days = [];
                for (const url of tryEndpoints) {
                    try {
                        const r = await fetch(url, { headers: { Accept: "application/json" } });
                        if (r.ok) {
                            const payload = await r.json();
                            // on s'attend à une liste de {jour: "YYYY-MM-DD", statut: "DISPONIBLE|INDISPONIBLE|RESERVE"}
                            days = Array.isArray(payload) ? payload : [];
                            if (days.length || r.ok) break;
                        }
                    } catch {
                        /* ignore */
                    }
                }
                if (!alive) return;

                const blocked = new Set(
                    days
                        .filter((d) => {
                            const s = (d.statut || d.status || "").toUpperCase();
                            return s && s !== "DISPONIBLE";
                        })
                        .map((d) => String(d.jour || d.date || d.day || "")),
                );
                setUnavailable(blocked);
            } catch (e) {
                if (!alive) return;
                setErr("Impossible de charger l’annonce.");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <p className="text-muted-foreground">Chargement…</p>
                </div>
                <Footer />
            </>
        );
    }

    if (err || !data) {
        return (
            <>
                <Header />
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <p className="text-destructive">{err || "Annonce introuvable."}</p>
                </div>
                <Footer />
            </>
        );
    }

    const title = `${data.marque ?? ""} ${data.modele ?? ""} ${data.annee ?? ""}`.trim();
    const published =
        data.creeLe &&
        new Date(data.creeLe).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });

    return (
        <>
            <Header />

            <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 space-y-8">
                {/* IMAGE */}
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                    <img
                        src={data.imageUrl || FALLBACK}
                        alt={title || "Annonce"}
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.src = FALLBACK)}
                    />
                </div>

                {/* TITRE (en dessous de l'image, comme demandé) */}
                <header className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{title || `Annonce #${id}`}</h1>
                    {published && (
                        <p className="text-sm text-muted-foreground">Publié le {published}</p>
                    )}
                </header>

                {/* CONTENU EN 2 COLONNES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Colonne gauche : Caractéristiques + Description */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Caractéristiques */}
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="text-lg font-semibold mb-4">Caractéristiques</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Item label="Nombre de places" value={data.nbPlaces ?? "—"} />
                                <Item label="Carburant" value={data.typeCarburant ?? "—"} />
                                <Item label="Transmission" value={data.boiteVitesse ?? "—"} />
                                <Item
                                    label="Climatisation"
                                    value={typeof data.climatisation === "boolean" ? (data.climatisation ? "Oui" : "Non") : "—"}
                                />
                                <Item label="Couleur" value={data.couleur ?? "—"} />
                                <Item label="Immatriculation" value={data.immatriculation ?? "—"} />
                                <Item
                                    label="Prix / jour"
                                    value={
                                        typeof data.prixParJour === "number"
                                            ? data.prixParJour.toLocaleString("fr-FR", {
                                                style: "currency",
                                                currency: "EUR",
                                                maximumFractionDigits: 0,
                                            })
                                            : "—"
                                    }
                                />
                                <Item label="Lieu" value={data.localisation ? <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{data.localisation}</span> : "—"} />
                            </div>
                        </section>

                        {/* Description */}
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="text-lg font-semibold mb-3">Description :</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {data.description || "—"}
                            </p>
                        </section>
                    </div>

                    {/* Colonne droite : Réservation */}
                    <aside className="lg:col-span-1">
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            {/* Total */}
                            <div className="mb-4">
                                <div className="text-2xl font-extrabold">
                                    {Number.isFinite(total)
                                        ? total.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
                                        : "—"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {diffDaysInclusive(range.from, range.to ?? range.from)} jour(s)
                                </div>
                            </div>

                            {/* Dates (même UI que le Hero) */}
                            <div className="space-y-4">
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="text-sm text-gray-600 mb-1 leading-none">Votre voyage</span>
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
                                                    // grise les jours indisponibles s'ils existent
                                                    (d) => unavailable.size > 0 && unavailable.has(toYMD(d)),
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
                          [&_.rdp-day_range_start]:bg-transparent [&_.rdp-day_range_end]:bg-transparent
                          [&_.rdp-day_range_start]:shadow-none [&_.rdp-day_range_end]:shadow-none
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

                                {/* Heure (unique, appliquée aux 2 dates) */}
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

                                {/* Lieu */}
                                <div className="rounded-lg border bg-white px-4 py-3 text-sm">
                                    <div className="text-gray-600 mb-1">Lieu de prise en charge et de retour</div>
                                    <div className="font-medium inline-flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {data.localisation || "—"}
                                    </div>
                                </div>

                                {/* Messages de feedback */}
                                {reservationError && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                                        {reservationError}
                                    </div>
                                )}

                                {reservationSuccess && (
                                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                                        ✅ Réservation confirmée ! Redirection...
                                    </div>
                                )}

                                {/* CTA */}
                                <Button
                                    className="w-full h-12"
                                    onClick={handleReservation}
                                    disabled={reserving || reservationSuccess}
                                >
                                    {reserving ? "Réservation en cours..." : reservationSuccess ? "✓ Réservé" : "Réserver"}
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </>
    );
}

function Item({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
