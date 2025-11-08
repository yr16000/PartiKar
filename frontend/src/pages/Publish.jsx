// src/pages/Publish.jsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/layout/header.jsx";
import Footer from "../components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CarFront, Calendar as CalendarIcon } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

// ⬇️ Auto-complétion comme dans l’exemple
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

const CARBURANTS = ["ELECTRIQUE", "DIESEL", "ESSENCE", "HYBRIDE"];
const BOITES = ["MANUELLE", "AUTOMATIQUE"];

export default function Publish() {
    const [form, setForm] = useState({
        marque: "",
        modele: "",
        immatriculation: "",
        annee: "",
        prixJour: "",
        ville: "",            // gardé pour compat back (localisation)
        latitude: null,       // stock local si besoin
        longitude: null,      // stock local si besoin
        imageUrl: "",
        typeCarburant: "",
        boiteVitesse: "",
        nbPlaces: "",
        climatisation: false,
        couleur: "",
        description: "",
    });

    // --- helpers ---
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlaceSelect = (place) => {
        // place: { label, city, postcode, country, latitude, longitude, providerId }
        setForm((prev) => ({
            ...prev,
            ville: place?.label || "",
            latitude: place?.latitude ?? null,
            longitude: place?.longitude ?? null,
        }));
    };

    // --- DateRange comme Hero (sans heures) ---
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

    const [rangeOpen, setRangeOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ from: null, to: null });

    const dateRangeLabel = useMemo(() => {
        if (dateRange?.from && dateRange?.to) {
            return `${format(dateRange.from, "dd MMM yyyy", { locale: fr })} → ${format(
                dateRange.to,
                "dd MMM yyyy",
                { locale: fr }
            )}`;
        }
        return "Sélectionner une période";
    }, [dateRange]);

    // --- Popover année ---
    const [openYear, setOpenYear] = useState(false);
    const currentYear = new Date().getFullYear();
    const annees = useMemo(
        () => Array.from({ length: currentYear - 1899 }, (_, i) => (currentYear - i).toString()),
        [currentYear]
    );

    const [erreur, setErreur] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const required = [
            "marque",
            "modele",
            "immatriculation",
            "annee",
            "prixJour",
            "ville",
            "imageUrl",
            "typeCarburant",
            "boiteVitesse",
            "nbPlaces",
        ];
        for (const k of required) {
            if (!form[k]) return `Le champ "${k}" est obligatoire.`;
        }
        if (isNaN(Number(form.prixJour)) || Number(form.prixJour) <= 0) {
            return "Le prix par jour doit être un nombre positif.";
        }
        // ⬇️ borne 1–9 pour le nombre de places
        const places = Number(form.nbPlaces);
        if (!Number.isFinite(places) || places < 1 || places > 9) {
            return "Le nombre de places doit être un entier entre 1 et 9.";
        }
        if (!CARBURANTS.includes(form.typeCarburant)) {
            return "Type de carburant invalide.";
        }
        if (!BOITES.includes(form.boiteVitesse)) {
            return "Boîte de vitesses invalide.";
        }
        if (!dateRange?.from || !dateRange?.to) {
            return "Sélectionne une période de disponibilité.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur("");
        setSuccess(false);

        const error = validate();
        if (error) return setErreur(error);

        const payload = {
            voiture: {
                marque: form.marque,
                modele: form.modele,
                immatriculation: form.immatriculation,
                annee: Number(form.annee),
                couleur: form.couleur || null,
                typeCarburant: form.typeCarburant,
                nbPlaces: Number(form.nbPlaces),
                description: form.description || null,
                imageUrl: form.imageUrl,
                prixParJour: Number(form.prixJour),
                boiteVitesse: form.boiteVitesse,
                climatisation: !!form.climatisation,
                localisation: form.ville, // on continue d'envoyer uniquement la string côté back
                // latitude/longitude conservés localement (non envoyés, comme avant)
            },
            disponibilite: {
                dateDebut: dateRange.from.toISOString().slice(0, 10),
                dateFin: dateRange.to.toISOString().slice(0, 10),
            },
        };

        try {
            setLoading(true);
            const res = await fetch("/api/annonces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erreur serveur");
            }

            setSuccess(true);
            setForm({
                marque: "",
                modele: "",
                immatriculation: "",
                annee: "",
                prixJour: "",
                ville: "",
                latitude: null,
                longitude: null,
                imageUrl: "",
                typeCarburant: "",
                boiteVitesse: "",
                nbPlaces: "",
                climatisation: false,
                couleur: "",
                description: "",
            });
            setDateRange({ from: null, to: null });
        } catch (err) {
            setErreur(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />

            <section className="flex-1 flex items-center justify-center py-16 px-4">
                <Card className="w-full max-w-3xl border border-border bg-card shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
                                <CarFront className="h-5 w-5" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Publier une voiture</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                            Renseigne les informations du véhicule pour le mettre en location.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Marque / Modèle */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block text-sm">Marque *</Label>
                                    <Input name="marque" value={form.marque} onChange={onChange} placeholder="Renault" required />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm">Modèle *</Label>
                                    <Input name="modele" value={form.modele} onChange={onChange} placeholder="Clio" required />
                                </div>
                            </div>

                            {/* Immatriculation / Année */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block text-sm">Immatriculation *</Label>
                                    <Input
                                        name="immatriculation"
                                        value={form.immatriculation}
                                        onChange={onChange}
                                        placeholder="AA-123-BB"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm">Année *</Label>
                                    <Popover open={openYear} onOpenChange={setOpenYear}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between h-11">
                                                {form.annee ? form.annee : <span className="text-muted-foreground">Choisir une année</span>}
                                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[280px] p-0" side="bottom" align="start" avoidCollisions={false}>
                                            <Command>
                                                <CommandInput placeholder="Rechercher une année..." />
                                                <CommandList>
                                                    <CommandEmpty>Aucune année</CommandEmpty>
                                                    <CommandGroup>
                                                        {annees.map((year) => (
                                                            <CommandItem
                                                                key={year}
                                                                onSelect={() => {
                                                                    setForm((p) => ({ ...p, annee: year }));
                                                                    setOpenYear(false);
                                                                }}
                                                            >
                                                                {year}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Carburant / Boîte */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block text-sm">Type carburant *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between h-11">
                                                {form.typeCarburant || <span className="text-muted-foreground">Sélectionner</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[260px] p-0" side="bottom" align="start">
                                            <Command>
                                                <CommandList>
                                                    <CommandEmpty>Aucun résultat</CommandEmpty>
                                                    <CommandGroup>
                                                        {CARBURANTS.map((c) => (
                                                            <CommandItem key={c} onSelect={() => setForm((p) => ({ ...p, typeCarburant: c }))}>
                                                                {c}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm">Boîte de vitesses *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between h-11">
                                                {form.boiteVitesse || <span className="text-muted-foreground">Sélectionner</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[260px] p-0" side="bottom" align="start">
                                            <Command>
                                                <CommandList>
                                                    <CommandEmpty>Aucun résultat</CommandEmpty>
                                                    <CommandGroup>
                                                        {BOITES.map((b) => (
                                                            <CommandItem key={b} onSelect={() => setForm((p) => ({ ...p, boiteVitesse: b }))}>
                                                                {b}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Places / Clim */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block text-sm">Nombre de places *</Label>
                                    <Input
                                        name="nbPlaces"
                                        type="number"
                                        min={1}
                                        max={9}
                                        step={1}
                                        value={form.nbPlaces}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm">Climatisation</Label>
                                    <Select
                                        value={form.climatisation ? "OUI" : "NON"}
                                        onValueChange={(v) => setForm((p) => ({ ...p, climatisation: v === "OUI" }))}
                                    >
                                        <SelectTrigger className="h-11 w-full justify-between">
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent side="bottom" align="start">
                                            <SelectItem value="OUI">Oui</SelectItem>
                                            <SelectItem value="NON">Non</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Couleur / Lieu (autocomplete) */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block text-sm">Couleur (optionnel)</Label>
                                    <Input name="couleur" value={form.couleur} onChange={onChange} placeholder="Noir" />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm">Lieu *</Label>
                                    <PlaceAutocomplete
                                        value={form.ville}
                                        onChange={(v) => setForm((prev) => ({ ...prev, ville: v }))}
                                        onSelect={handlePlaceSelect}
                                        placeholder="Paris"
                                    />
                                </div>
                            </div>

                            {/* Image */}
                            <div>
                                <Label className="mb-2 block text-sm">Lien de l’image *</Label>
                                <Input
                                    name="imageUrl"
                                    value={form.imageUrl}
                                    onChange={onChange}
                                    placeholder="https://exemple.com/voiture.jpg"
                                    required
                                />
                            </div>

                            {/* Prix + Disponibilité */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block text-sm">Prix par jour (€) *</Label>
                                    <Input
                                        name="prixJour"
                                        type="number"
                                        min={1}
                                        value={form.prixJour}
                                        onChange={onChange}
                                        placeholder="50"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm">Disponibilité *</Label>
                                    <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn("w-full justify-between h-11", !dateRange?.from && "text-muted-foreground")}
                                            >
                                                {dateRangeLabel}
                                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
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
                                                selected={dateRange}
                                                onSelect={(r) => {
                                                    const from = r?.from ?? today;
                                                    const to = r?.to ?? r?.from ?? from;
                                                    setDateRange({ from, to });
                                                }}
                                                defaultMonth={dateRange?.from ?? today}
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
                            </div>

                            {/* Description */}
                            <div>
                                <Label className="mb-2 block text-sm">Description (optionnel)</Label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={onChange}
                                    className="min-h-[110px] w-full rounded-md border bg-background p-3 text-sm"
                                    placeholder="Infos utiles, état, équipements..."
                                />
                            </div>

                            {/* Messages */}
                            {erreur && <p className="text-destructive text-sm">{erreur}</p>}
                            {success && <p className="text-green-600 text-sm">✅ Annonce publiée avec succès</p>}

                            {/* Bouton */}
                            <Button type="submit" variant="brand" className="w-full h-11" disabled={loading}>
                                {loading ? "Publication..." : "Publier"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <Footer />
        </main>
    );
}
