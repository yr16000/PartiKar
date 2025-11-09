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
// Autocomplete pour la marque (liste locale)
import BrandAutocomplete from "@/components/ui/BrandAutocomplete";

// Ajout : récupérer le token depuis le contexte
import { useAuth } from "../context/AuthContext.jsx";


// Liste prédéfinie des marques (exemples). Tu peux ajouter/enrichir cette liste
const BRANDS = [
    "Abarth", "Acura", "Alfa Romeo", "Aston Martin", "Audi",
    "Bentley", "BMW", "Bugatti", "Buick", "BYD",
    "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Cupra",
    "Dacia", "Daewoo", "Daihatsu", "Dodge", "DS",
    "Ferrari", "Fiat", "Fisker", "Ford", "Genesis",
    "GMC", "Honda", "Hummer", "Hyundai",
    "Infiniti", "Isuzu", "Jaguar", "Jeep",
    "Kia", "Koenigsegg", "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lincoln", "Lotus", "Lucid",
    "Maserati", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi",
    "Nissan", "Opel", "Pagani", "Peugeot", "Polestar", "Porsche",
    "Ram", "Renault", "Rivian", "Rolls-Royce", "Rover",
    "Saab", "Seat", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki",
    "Tesla", "Toyota",
    "Volkswagen", "Volvo",
    "Aixam", "Ligier", "Microcar"
];

// Modèles populaires par marque (suggestions dynamiques)
const MODELES_PAR_MARQUE = {
    "Renault": ["Clio", "Megane", "Captur", "Twingo", "Kadjar", "Scenic", "Zoe", "Arkana", "Austral", "Espace", "Talisman", "Koleos"],
    "Peugeot": ["208", "308", "2008", "3008", "5008", "Partner", "Rifter", "508", "Expert", "Traveller", "e-208", "e-2008"],
    "Citroen": ["C3", "C4", "C5", "Berlingo", "SpaceTourer", "Ami", "C3 Aircross", "C5 Aircross", "C5 X", "ë-C4"],
    "Toyota": ["Yaris", "Corolla", "RAV4", "Aygo", "C-HR", "Camry", "Prius", "Highlander", "Land Cruiser", "Hilux", "Proace", "bZ4X"],
    "Volkswagen": ["Golf", "Polo", "Tiguan", "Passat", "T-Roc", "ID.3", "ID.4", "ID.5", "Arteon", "Touareg", "T-Cross", "Taigo", "Caddy", "Multivan"],
    "BMW": ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "Série 7", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "i3", "i4", "iX", "iX3", "Z4"],
    "Mercedes-Benz": ["Classe A", "Classe B", "Classe C", "Classe E", "Classe S", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "EQA", "EQB", "EQC", "EQE", "EQS"],
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron", "TT"],
    "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mustang", "Mustang Mach-E", "Ranger", "Transit", "Tourneo", "Explorer", "Mondeo"],
    "Opel": ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Combo", "Vivaro", "Zafira"],
    "Fiat": ["500", "Panda", "Tipo", "500X", "500L", "Ducato", "Doblo", "500e"],
    "Nissan": ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Ariya", "Townstar", "Navara", "GT-R"],
    "Honda": ["Jazz", "Civic", "HR-V", "CR-V", "e", "ZR-V"],
    "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-60", "MX-5", "MX-30"],
    "Hyundai": ["i10", "i20", "i30", "Bayon", "Kona", "Tucson", "Santa Fe", "Ioniq 5", "Ioniq 6", "Staria"],
    "Kia": ["Picanto", "Rio", "Stonic", "XCeed", "Ceed", "Niro", "Sportage", "Sorento", "EV6", "EV9"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Dacia": ["Sandero", "Duster", "Jogger", "Spring", "Logan"],
    "Seat": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
    "Skoda": ["Fabia", "Scala", "Octavia", "Kamiq", "Karoq", "Kodiaq", "Enyaq"],
    "Mini": ["Cooper", "Countryman", "Clubman", "Electric"],
    "Volvo": ["XC40", "XC60", "XC90", "V60", "V90", "S60", "S90", "C40", "EX30", "EX90"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar"],
    "Jeep": ["Renegade", "Compass", "Wrangler", "Grand Cherokee", "Avenger"],
    "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
    "DS": ["DS 3", "DS 4", "DS 7", "DS 9"],
    "Porsche": ["911", "718 Cayman", "718 Boxster", "Panamera", "Cayenne", "Macan", "Taycan"],
    "Jaguar": ["E-Pace", "F-Pace", "I-Pace", "F-Type"],
    "Lexus": ["CT", "IS", "ES", "UX", "NX", "RX", "LC"],
    "Subaru": ["Impreza", "XV", "Forester", "Outback", "Solterra"],
    "Suzuki": ["Ignis", "Swift", "Vitara", "S-Cross", "Jimny", "Across"],
    "Mitsubishi": ["Space Star", "ASX", "Eclipse Cross", "Outlander"],
    "Dodge": ["Challenger", "Charger", "Durango", "Ram 1500"],
    "Chevrolet": ["Spark", "Camaro", "Corvette", "Silverado"],
    "Cadillac": ["XT4", "XT5", "XT6", "Escalade", "Lyriq"],
    "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
    "Polestar": ["Polestar 2", "Polestar 3", "Polestar 4"],
    "Cupra": ["Formentor", "Leon", "Ateca", "Born", "Tavascan"],
    "MG": ["MG3", "MG4", "MG5", "ZS", "Marvel R", "HS"],
    "Smart": ["fortwo", "forfour", "#1", "#3"],
    "BYD": ["Atto 3", "Han", "Tang", "Seal", "Dolphin"],
    "Aston Martin": ["Vantage", "DB11", "DB12", "DBX"],
    "Ferrari": ["Roma", "Portofino", "F8", "SF90", "296", "812", "Purosangue"],
    "Lamborghini": ["Huracán", "Urus", "Revuelto"],
    "Maserati": ["Ghibli", "Quattroporte", "Levante", "MC20", "Grecale"],
    "Bentley": ["Continental", "Flying Spur", "Bentayga"],
    "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Wraith", "Dawn", "Spectre"],
    "McLaren": ["GT", "Artura", "720S", "765LT"],
    "Lotus": ["Eletre", "Emira", "Evija"],
    "Bugatti": ["Chiron", "Bolide", "Mistral"],
    "Koenigsegg": ["Gemera", "Jesko", "CC850"],
    "Pagani": ["Huayra", "Utopia"],
    "Rivian": ["R1T", "R1S"],
    "Lucid": ["Air", "Gravity"],
    "Fisker": ["Ocean"],
    "SsangYong": ["Tivoli", "Korando", "Rexton"],
    "Lancia": ["Ypsilon"],
    "Aixam": ["City", "Crossline", "Coupé"],
    "Ligier": ["JS50", "JS60", "Pulse"],
    "Microcar": ["M.Go", "Dué"],
    "Acura": ["Integra", "TLX", "MDX", "RDX"],
    "Buick": ["Encore", "Envision", "Enclave"],
    "GMC": ["Sierra", "Yukon", "Terrain", "Acadia"],
    "Hummer": ["EV"],
    "Infiniti": ["Q50", "Q60", "QX50", "QX55", "QX60"],
    "Lincoln": ["Corsair", "Nautilus", "Aviator", "Navigator"],
    "Ram": ["1500", "2500", "3500"],
    "Chrysler": ["Pacifica", "300"],
    "Maybach": ["S-Class", "GLS"],
};

const CARBURANTS = ["Electrique", "Diesel", "Essence", "Hybride"];
const BOITES = ["Manuelle", "Automatique"];

export default function Publish() {
    const { token } = useAuth();

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

    // Suggestions de modèles selon la marque sélectionnée
    const modelesSuggeres = useMemo(() => {
        if (!form.marque) return [];
        const normalize = (s) => (s ? s.normalize?.('NFD').replace(/[ -\u036f]/g, '').toLowerCase() : '');
        // utilise la clé exacte si possible
        if (MODELES_PAR_MARQUE[form.marque]) return MODELES_PAR_MARQUE[form.marque];
        // recherche insensible à la casse et aux accents
        const nk = normalize(form.marque);
        const lowerKey = Object.keys(MODELES_PAR_MARQUE).find(k => normalize(k) === nk);
        return lowerKey ? MODELES_PAR_MARQUE[lowerKey] : [];
    }, [form.marque]);

    // Si la marque change et que le modèle courant n'est pas dans les suggestions, on le réinitialise
    useEffect(() => {
        if (!form.marque) return;
        if (!form.modele) return;
        const isValid = modelesSuggeres.some(m => m.toLowerCase() === (form.modele || '').toLowerCase());
        if (!isValid) {
            setForm(p => ({ ...p, modele: '' }));
        }
    }, [form.marque, modelesSuggeres]);

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
    const [openCarburant, setOpenCarburant] = useState(false);
    const [openBoite, setOpenBoite] = useState(false);
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
        // Vérification stricte de la marque : doit être dans la liste prédéfinie
        const brandsLower = BRANDS.map((b) => b.toLowerCase());
        if (!brandsLower.includes((form.marque || '').toLowerCase())) {
            return "La marque doit être choisie dans la liste prédéfinie.";
        }
        if (isNaN(Number(form.prixJour)) || Number(form.prixJour) <= 0) {
            return "Le prix par jour doit être un nombre positif.";
        }
        //borne 1–9 pour le nombre de places
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
            // Envoyer les champs directement comme le DTO backend
            marque: form.marque,
            modele: form.modele,
            immatriculation: form.immatriculation,
            annee: form.annee ? Number(form.annee) : null,
            couleur: form.couleur || null,
            typeCarburant: form.typeCarburant,
            nbPlaces: form.nbPlaces ? Number(form.nbPlaces) : null,
            description: form.description || null,
            imageUrl: form.imageUrl,
            prixParJour: form.prixJour ? Number(form.prixJour) : null,
            boiteVitesse: form.boiteVitesse,
            climatisation: !!form.climatisation,
            localisation: form.ville,
            latitude: form.latitude,
            longitude: form.longitude,
            // On envoie la plage de dates : backend créera une Disponibilite par jour
            dateDebut: dateRange.from ? dateRange.from.toISOString().slice(0, 10) : null,
            dateFin: dateRange.to ? dateRange.to.toISOString().slice(0, 10) : null,
        };

        try {
            setLoading(true);
            const headers = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            // Log utile pour debug
            console.debug('Création annonce - payload:', payload);

            const res = await fetch("/api/annonces", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                const msg = "401 - Vous devez être connecté(e) pour publier une annonce.";
                console.error(msg);
                setErreur(msg);
                return;
            }
            if (res.status === 403) {
                const msg = "403 - Accès refusé : vous n'êtes pas autorisé(e) à effectuer cette action.";
                console.error(msg);
                setErreur(msg);
                return;
            }

            if (!res.ok) {
                console.error('Création annonce - réponse:', res);
                let errText;
                try {
                    const data = await res.json();
                    errText = data?.message || data?.error || JSON.stringify(data);
                } catch (jsonErr) {
                    try {
                        errText = await res.text();
                    } catch (tErr) {
                        errText = null;
                    }
                }
                const fullMsg = `${res.status} ${res.statusText} - ${errText || 'Erreur serveur'}`;
                console.error('Création annonce - body erreur:', errText);
                setErreur(fullMsg);
                return;
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
                                    <BrandAutocomplete
                                        value={form.marque}
                                        onChange={(v) => setForm((p) => ({ ...p, marque: v }))}
                                        onSelect={(v) => setForm((p) => ({ ...p, marque: v }))}
                                        options={BRANDS}
                                        placeholder="Marque"
                                        requireMatch={true}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm">Modèle *</Label>
                                    <BrandAutocomplete
                                        value={form.modele}
                                        onChange={(v) => setForm((p) => ({ ...p, modele: v }))}
                                        onSelect={(v) => setForm((p) => ({ ...p, modele: v }))}
                                        options={modelesSuggeres}
                                        placeholder={form.marque ? "Choisir un modèle" : "Sélectionnez d'abord une marque"}
                                        requireMatch={modelesSuggeres.length > 0}
                                        disabled={modelesSuggeres.length === 0}
                                    />
                                    {modelesSuggeres.length === 0 && (
                                        <p className="mt-1 text-xs text-muted-foreground">Sélectionnez d'abord une marque pour voir les modèles.</p>
                                    )}
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
                                    <Popover open={openCarburant} onOpenChange={setOpenCarburant}>
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
                                                            <CommandItem key={c} onSelect={() => { setForm((p) => ({ ...p, typeCarburant: c })); setOpenCarburant(false); }}>
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
                                    <Popover open={openBoite} onOpenChange={setOpenBoite}>
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
                                                            <CommandItem key={b} onSelect={() => { setForm((p) => ({ ...p, boiteVitesse: b })); setOpenBoite(false); }}>
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
                            {success && <p className="text-green-600 text-sm">Annonce publiée avec succès</p>}

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
