// src/pages/Search.jsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import Header from "../components/layout/header.jsx";
import SearchBar from "../components/layout/SearchBar";
import Footer from "../components/layout/footer";

import { Button } from "../components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { ChevronDown, ArrowUpDown } from "lucide-react";

import BrandAutocomplete from "@/components/ui/BrandAutocomplete";
import CarCard from "@/components/cards/CarCard.jsx";
import { BRANDS, MODELES_PAR_MARQUE, CARBURANTS, BOITES, NB_PLACES } from "@/constants/vehicleData.jsx";
import { Link, useSearchParams } from "react-router-dom";

/* ---------------- Utils ---------------- */
function normalizeAccents(s) {
    return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function getModelesByMarque(marque) {
    if (!marque) return [];
    if (MODELES_PAR_MARQUE && MODELES_PAR_MARQUE[marque]) return MODELES_PAR_MARQUE[marque];
    const key = Object.keys(MODELES_PAR_MARQUE || {}).find((k) => normalizeAccents(k) === normalizeAccents(marque));
    return key ? MODELES_PAR_MARQUE[key] : [];
}
function stripTime(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function toLocalDate(d) {
    if (!d) return null;
    const x = stripTime(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const TRI_LABELS = {
    DATE_PUBLICATION_DESC: "Plus récentes",
    DATE_PUBLICATION_ASC: "Plus anciennes",
    PRIX_ASC: "Prix ↑",
    PRIX_DESC: "Prix ↓",
    NB_AVIS_DESC: "Avis ↓",
    NB_AVIS_ASC: "Avis ↑",
};

/* ---------------- Chip ---------------- */
const Chip = ({ children, active, className = "" }) => (
    <div
        className={`h-9 inline-flex items-center rounded-full border px-3 sm:px-4 text-sm whitespace-nowrap shadow-sm ${
            active ? "bg-foreground text-background" : "bg-background text-foreground"
        } ${className}`}
    >
        {children}
        <ChevronDown className={`ml-1 h-4 w-4 ${active ? "opacity-90" : "opacity-60"}`} />
    </div>
);

/* ---------------- Filtres (Popover) ---------------- */
function PrixChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [min, setMin] = useState(value?.min || "");
    const [max, setMax] = useState(value?.max || "");
    const isActive = !!(min || max);

    useEffect(() => {
        setMin(value?.min || "");
        setMax(value?.max || "");
    }, [value?.min, value?.max]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Prix</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Min (€)</Label>
                                <Input type="number" inputMode="numeric" value={min} onChange={(e)=>setMin(e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">Max (€)</Label>
                                <Input type="number" inputMode="numeric" value={max} onChange={(e)=>setMax(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMin(""); setMax(""); onChange?.({min:"", max:""}); }}>
                                Réinitialiser
                            </Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.({min, max}); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function MarqueChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [marque, setMarque] = useState(value || "");
    const isActive = !!marque;

    useEffect(() => setMarque(value || ""), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Marque</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[360px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <Label className="text-xs">Marque</Label>
                            <BrandAutocomplete
                                value={marque}
                                onChange={(v)=> setMarque(v)}
                                onSelect={(v)=> setMarque(v)}
                                options={BRANDS}
                                placeholder="Marque"
                                requireMatch={true}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMarque(""); onChange?.(""); }}>
                                Réinitialiser
                            </Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(marque); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function ModeleChip({ marque, value, onChange }) {
    const [open, setOpen] = useState(false);
    const modeles = useMemo(()=>getModelesByMarque(marque), [marque]);
    const [modele, setModele] = useState(value || "");
    const isActive = !!modele;
    const disabled = !marque || (modeles || []).length === 0;

    useEffect(() => setModele(value || ""), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className={`focus:outline-none ${disabled ? "opacity-60 cursor-not-allowed" : ""}`} disabled={disabled}>
                    <Chip active={isActive}>Modèle</Chip>
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[360px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <Label className="text-xs">Modèle</Label>
                            <BrandAutocomplete
                                value={modele}
                                onChange={(v)=> setModele(v)}
                                onSelect={(v)=> setModele(v)}
                                options={modeles}
                                placeholder={marque ? (modeles.length ? "Choisir un modèle" : "(aucun modèle)") : "Sélectionnez d'abord une marque"}
                                requireMatch={modeles.length > 0}
                                disabled={disabled}
                            />
                            {!disabled && modeles.length === 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">Aucun modèle pour cette marque.</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setModele(""); onChange?.(""); }}>
                                Réinitialiser
                            </Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(modele); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function AnneesChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const [min, setMin] = useState(value?.min || "");
    const [max, setMax] = useState(value?.max || "");
    const isActive = !!(min || max);

    useEffect(() => {
        setMin(value?.min || "");
        setMax(value?.max || "");
    }, [value?.min, value?.max]);

    const clampYearMin = () => {
        if (min === "") return;
        const n = Math.max(1900, Math.min(currentYear, parseInt(min, 10) || 1900));
        setMin(String(n));
    };
    const clampYearMax = () => {
        if (max === "") return;
        const n = Math.max(1900, Math.min(currentYear, parseInt(max, 10) || currentYear));
        setMax(String(n));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Années</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Min</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={1900}
                                    max={currentYear}
                                    value={min}
                                    onChange={(e)=>setMin(e.target.value)}
                                    onBlur={clampYearMin}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Max</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={1900}
                                    max={currentYear}
                                    value={max}
                                    onChange={(e)=>setMax(e.target.value)}
                                    onBlur={clampYearMax}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMin(""); setMax(""); onChange?.({min:"", max:""}); }}>
                                Réinitialiser
                            </Button>
                            <Button
                                variant="brand" size="sm"
                                onClick={()=>{
                                    const nMin = min === "" ? "" : String(Math.max(1900, Math.min(currentYear, parseInt(min, 10) || 1900)));
                                    const nMax = max === "" ? "" : String(Math.max(1900, Math.min(currentYear, parseInt(max, 10) || currentYear)));
                                    onChange?.({ min: nMin, max: nMax });
                                    setOpen(false);
                                }}
                            >
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

/* === Kilométrage : UI seulement pour l’instant (non envoyé au back) === */
function KilometrageChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [min, setMin] = useState(value?.min || "");
    const [max, setMax] = useState(value?.max || "");
    const isActive = !!(min || max);

    useEffect(() => {
        setMin(value?.min || "");
        setMax(value?.max || "");
    }, [value?.min, value?.max]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none">
                    <Chip active={isActive}>Kilométrage</Chip>
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Min (km)</Label>
                                <Input type="number" inputMode="numeric" min={0} value={min} onChange={(e)=>setMin(e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">Max (km)</Label>
                                <Input type="number" inputMode="numeric" min={0} value={max} onChange={(e)=>setMax(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMin(""); setMax(""); onChange?.({ min:"", max:"" }); }}>
                                Réinitialiser
                            </Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.({ min, max }); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function TransmissionChip({ value = [], onChange }) {
    const [open, setOpen] = useState(false);
    const [sel, setSel] = useState(new Set(value));
    const isActive = sel.size > 0;
    const toggle = (v)=>{ const n = new Set(sel); n.has(v) ? n.delete(v) : n.add(v); setSel(n); };

    useEffect(() => setSel(new Set(value || [])), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Transmission</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[280px] p-0">
                <Card>
                    <CardContent className="p-3 space-y-2">
                        {(BOITES || []).map((b)=>(
                            <label key={b} className="flex items-center gap-2 text-sm">
                                <Checkbox checked={sel.has(b)} onCheckedChange={()=>toggle(b)} />{b}
                            </label>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" size="sm" onClick={()=>{ setSel(new Set()); onChange?.([]); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(Array.from(sel)); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function CarburantChip({ value = [], onChange }) {
    const [open, setOpen] = useState(false);
    const [sel, setSel] = useState(new Set(value));
    const isActive = sel.size > 0;
    const toggle = (v)=>{ const n = new Set(sel); n.has(v) ? n.delete(v) : n.add(v); setSel(n); };

    useEffect(() => setSel(new Set(value || [])), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Carburant</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[280px] p-0">
                <Card>
                    <CardContent className="p-3 space-y-2">
                        {(CARBURANTS || []).map((c)=>(
                            <label key={c} className="flex items-center gap-2 text-sm">
                                <Checkbox checked={sel.has(c)} onCheckedChange={()=>toggle(c)} />{c}
                            </label>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" size="sm" onClick={()=>{ setSel(new Set()); onChange?.([]); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(Array.from(sel)); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function PlacesChip({ value = [], onChange }) {
    const [open, setOpen] = useState(false);
    const [sel, setSel] = useState(new Set(value));
    const isActive = sel.size > 0;
    const toggle = (v)=>{ const n = new Set(sel); n.has(v) ? n.delete(v) : n.add(v); setSel(n); };

    useEffect(() => setSel(new Set(value || [])), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Sièges</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[280px] p-0">
                <Card>
                    <CardContent className="p-3 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            {(NB_PLACES || []).map((p)=>(
                                <label key={p} className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={sel.has(String(p))} onCheckedChange={()=>toggle(String(p))} />{p}
                                </label>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" size="sm" onClick={()=>{ setSel(new Set()); onChange?.([]); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(Array.from(sel)); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

/* ----------- Tri ----------- */
function TriChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [tri, setTri] = useState(value || "DATE_PUBLICATION_DESC");
    const isActive = tri !== "DATE_PUBLICATION_DESC";

    useEffect(() => setTri(value || "DATE_PUBLICATION_DESC"), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none">
                    <Chip active={isActive} className="border-primary text-primary">
            <span className="inline-flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Trier
            </span>
                    </Chip>
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-[240px] p-0">
                <Card>
                    <CardContent className="p-3 space-y-3">
                        <Select value={tri} onValueChange={setTri}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Trier" /></SelectTrigger>
                            <SelectContent side="bottom" align="start">
                                {Object.entries(TRI_LABELS).map(([val, label]) => (
                                    <SelectItem key={val} value={val}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setTri("DATE_PUBLICATION_DESC"); onChange?.("DATE_PUBLICATION_DESC"); }}>
                                Réinitialiser
                            </Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(tri); setOpen(false); }}>
                                Appliquer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

/* ---------------- Page ---------------- */
export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Contexte venant de l’URL / SearchBar (coords + dates + city)
    const [ctx, setCtx] = useState({
        latitude: null,
        longitude: null,
        dateDebut: null, // "YYYY-MM-DD"
        dateFin: null,   // "YYYY-MM-DD"
        city: "",
    });

    // Filtres
    const [filters, setFilters] = useState({
        prix: { min: "", max: "" },
        marque: "",
        modele: "",
        annees: { min: "", max: "" },
        kilometrage: { min: "", max: "" }, // non envoyé au back (pour l’instant)
        boites: [],
        carburants: [],
        places: [],
        tri: "DATE_PUBLICATION_DESC",
    });

    // Résultats
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [annonces, setAnnonces] = useState([]);

    // Normalise pour CarCard (comme MyAnnonces)
    const normalizeAnnonce = (a) => {
        if (!a) return null;
        return {
            ...a,
            id: a.voitureId || a.id,
            prixParJour:
                typeof a.prixParJour === "number" ? a.prixParJour : a.prixParJour?.value ?? a.prixParJour,
        };
    };

    // Lecture initiale des query params (si on vient de Home)
    useEffect(() => {
        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");
        const from = searchParams.get("from");
        const to   = searchParams.get("to");
        const city = searchParams.get("city");

        setCtx({
            latitude: lat ? Number(lat) : null,
            longitude: lon ? Number(lon) : null,
            dateDebut: from || null,
            dateFin:   to   || null,
            city: city || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handler SearchBar (mise à jour URL + contexte)
    const handleSearchBar = useCallback(({ latitude, longitude, from, to, city }) => {
        const next = new URLSearchParams(searchParams);
        if (latitude != null) next.set("lat", String(latitude)); else next.delete("lat");
        if (longitude != null) next.set("lon", String(longitude)); else next.delete("lon");
        if (from) next.set("from", toLocalDate(from)); else next.delete("from");
        if (to)   next.set("to",   toLocalDate(to));   else next.delete("to");
        if (city != null) next.set("city", city); else next.delete("city");

        setSearchParams(next);

        setCtx({
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            dateDebut: from ? toLocalDate(from) : null,
            dateFin:   to   ? toLocalDate(to)   : null,
            city: city || "",
        });
    }, [searchParams, setSearchParams]);

    // Construit le body aligné avec SearchAnnonceRequest (sans kilometrage)
    const buildRequestBody = () => {
        const typeCarburant = filters.carburants?.[0] || null;   // UI multi -> 1 valeur envoyée
        const boiteVitesse  = filters.boites?.[0] || null;       // idem
        const nbPlaces      = filters.places?.[0] ? Number(filters.places[0]) : null;

        const prixMin  = filters.prix?.min   ? Number(filters.prix.min)   : null;
        const prixMax  = filters.prix?.max   ? Number(filters.prix.max)   : null;
        const anneeMin = filters.annees?.min ? Number(filters.annees.min) : null;
        const anneeMax = filters.annees?.max ? Number(filters.annees.max) : null;

        return {
            latitude: ctx.latitude,
            longitude: ctx.longitude,
            rayonKm: 10, // par défaut côté front (peut être paramétrable + tard)
            dateDebut: ctx.dateDebut, // "YYYY-MM-DD"
            dateFin:   ctx.dateFin,   // "YYYY-MM-DD"
            marque: filters.marque || null,
            modele: filters.modele || null,
            typeCarburant,
            boiteVitesse,
            nbPlaces,
            prixMin,
            prixMax,
            anneeMin,
            anneeMax,
            triOption: filters.tri || "DATE_PUBLICATION_DESC",
        };
    };

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            setErreur(null);
            const body = buildRequestBody();

            const res = await fetch("/api/annonces/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erreur lors de la recherche");
            }
            const data = await res.json();
            const normalized = Array.isArray(data) ? data.map(normalizeAnnonce) : [];
            setAnnonces(normalized);
        } catch (e) {
            setErreur(e.message);
        } finally {
            setLoading(false);
        }
    }, [filters, ctx]);

    // Recherche auto si on arrive avec lieu/dates
    useEffect(() => {
        if (ctx.dateDebut || ctx.dateFin || (ctx.latitude != null && ctx.longitude != null)) {
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx.dateDebut, ctx.dateFin, ctx.latitude, ctx.longitude]);

    const resetAll = () => {
        setFilters({
            prix: { min: "", max: "" },
            marque: "",
            modele: "",
            annees: { min: "", max: "" },
            kilometrage: { min: "", max: "" },
            boites: [],
            carburants: [],
            places: [],
            tri: "DATE_PUBLICATION_DESC",
        });
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Header />

            {/* SearchBar : pré-remplie avec les query params */}
            <div className="mt-0 [&>form]:bg-transparent [&>form]:border-0 [&>form]:shadow-none">
                <SearchBar
                    variant="plain"
                    onSearch={handleSearchBar}
                    initialCity={ctx.city || ""}
                    initialFrom={ctx.dateDebut || undefined}
                    initialTo={ctx.dateFin || undefined}
                />
            </div>

            {/* Separator */}
            <div className="container mx-auto px-4 md:px-6 mt-0">
                <div className="h-px bg-border" />
            </div>

            {/* Filtres */}
            <section className="container mx-auto px-4 md:px-6 mt-3">
                <div className="flex flex-wrap justify-center items-center gap-2 overflow-x-auto pb-1
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                    <PrixChip value={filters.prix} onChange={(v)=>setFilters((s)=>({ ...s, prix: v }))} />
                    <MarqueChip value={filters.marque} onChange={(v)=>setFilters((s)=>({ ...s, marque: v, modele: "" }))} />
                    <ModeleChip marque={filters.marque} value={filters.modele} onChange={(v)=>setFilters((s)=>({ ...s, modele: v }))} />
                    <AnneesChip value={filters.annees} onChange={(v)=>setFilters((s)=>({ ...s, annees: v }))} />
                    <KilometrageChip value={filters.kilometrage} onChange={(v)=>setFilters(s=>({ ...s, kilometrage: v }))} />
                    <TransmissionChip value={filters.boites} onChange={(v)=>setFilters((s)=>({ ...s, boites: v }))} />
                    <CarburantChip value={filters.carburants} onChange={(v)=>setFilters((s)=>({ ...s, carburants: v }))} />
                    <PlacesChip value={filters.places} onChange={(v)=>setFilters((s)=>({ ...s, places: v }))} />
                    <TriChip value={filters.tri} onChange={(v)=>setFilters((s)=>({ ...s, tri: v }))} />
                </div>

                {/* Actions globales */}
                <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" onClick={resetAll}>Réinitialiser tout</Button>
                    <Button variant="brand" onClick={fetchResults}>Appliquer les filtres</Button>
                </div>
            </section>

            {/* Separator */}
            <div className="container mx-auto px-4 md:px-6 mt-3">
                <div className="h-px bg-border" />
            </div>

            {/* Résultats */}
            <section className="container mx-auto px-4 md:px-6 my-8">
                {loading && <p className="text-sm animate-pulse">Recherche en cours…</p>}
                {erreur && !loading && <p className="text-sm text-destructive">{erreur}</p>}

                {!loading && !erreur && annonces.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-8 text-center space-y-4">
                        <h2 className="text-lg font-semibold">Aucun résultat</h2>
                        <p className="text-sm text-muted-foreground">Ajuste tes filtres et réessaie.</p>
                    </div>
                )}

                {!loading && !erreur && annonces.length > 0 && (
                    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {annonces.map(a => (
                            <Link key={a.id} to={`/annonces/${a.id}`} className="block">
                                <CarCard car={a} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}
