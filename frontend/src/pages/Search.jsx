// src/pages/Search.jsx
import React, { useMemo, useState } from "react";
import Header from "../components/layout/header.jsx";
import Hero from "../components/layout/hero";
import Footer from "../components/layout/footer";

// UI (shadcn/ui) — mêmes imports que Home (chemins relatifs)
import { Button } from "../components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";

// Icône
import { ChevronDown } from "lucide-react";

// Données véhicules — aligné sur Publish pour éviter les indéfinis
import { BRANDS, MODELES_PAR_MARQUE, CARBURANTS, BOITES, NB_PLACES } from "@/constants/vehicleData";

// Utils
function getYearRange(startAt = 1980) {
    const current = new Date().getFullYear();
    const years = [];
    for (let y = current; y >= startAt; y--) years.push(y);
    return years;
}
function getModelesByMarque(marque) {
    if (!marque) return [];
    if (MODELES_PAR_MARQUE && MODELES_PAR_MARQUE[marque]) return MODELES_PAR_MARQUE[marque];
    const strip = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const norm = (s) => strip(s).toLowerCase();
    const key = Object.keys(MODELES_PAR_MARQUE || {}).find((k) => norm(k) === norm(marque));
    return key ? MODELES_PAR_MARQUE[key] : [];
}

// Chip générique
const Chip = ({ children, active }) => (
    <div
        className={`h-9 inline-flex items-center rounded-full border px-3 sm:px-4 text-sm whitespace-nowrap shadow-sm ${
            active ? "bg-foreground text-background" : "bg-background text-foreground"
        }`}
    >
        {children}
        <ChevronDown className={`ml-1 h-4 w-4 ${active ? "opacity-90" : "opacity-60"}`} />
    </div>
);

// ---- Filtres (tous avec Popover en dessous) ----
function PrixChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [min, setMin] = useState(value?.min || "");
    const [max, setMax] = useState(value?.max || "");
    const isActive = !!(min || max);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Prix</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Min (€)</Label>
                                <Input type="number" inputMode="numeric" placeholder="30" value={min} onChange={(e)=>setMin(e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">Max (€)</Label>
                                <Input type="number" inputMode="numeric" placeholder="120" value={max} onChange={(e)=>setMax(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMin(""); setMax(""); onChange?.({min:"", max:""}); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.({min, max}); setOpen(false); }}>Afficher</Button>
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Marque</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <Label className="text-xs">Marque</Label>
                            <Select value={marque} onValueChange={(v)=> setMarque(v)}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Toutes" /></SelectTrigger>
                                <SelectContent side="bottom" align="start">
                                    <SelectItem value="">Toutes</SelectItem>
                                    {(BRANDS || []).map((b)=>(<SelectItem key={b} value={b}>{b}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMarque(""); onChange?.(""); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(marque); setOpen(false); }}>Afficher</Button>
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className={`focus:outline-none ${disabled ? "opacity-60 cursor-not-allowed" : ""}`} disabled={disabled}>
                    <Chip active={isActive}>Modèle</Chip>
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <Label className="text-xs">Modèle</Label>
                            <Select value={modele} onValueChange={setModele} disabled={disabled}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder={marque ? ((modeles||[]).length ? "Tous" : "(aucun)") : "Choisir une marque"} />
                                </SelectTrigger>
                                <SelectContent side="bottom" align="start">
                                    <SelectItem value="">Tous</SelectItem>
                                    {(modeles || []).map((m)=>(<SelectItem key={m} value={m}>{m}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setModele(""); onChange?.(""); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(modele); setOpen(false); }}>Afficher</Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

function AnneesChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const years = useMemo(()=>getYearRange(1995), []);
    const [min, setMin] = useState(value?.min || "");
    const [max, setMax] = useState(value?.max || "");
    const isActive = !!(min || max);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Années</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[300px] p-0">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Min</Label>
                                <Select value={min} onValueChange={setMin}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Min" /></SelectTrigger>
                                    <SelectContent side="bottom" align="start">
                                        <SelectItem value="">Min</SelectItem>
                                        {(years || []).map((y)=>(<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Max</Label>
                                <Select value={max} onValueChange={setMax}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Max" /></SelectTrigger>
                                    <SelectContent side="bottom" align="start">
                                        <SelectItem value="">Max</SelectItem>
                                        {(years || []).map((y)=>(<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={()=>{ setMin(""); setMax(""); onChange?.({min:"", max:""}); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.({min, max}); setOpen(false); }}>Afficher</Button>
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Transmission</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[280px] p-0">
                <Card>
                    <CardContent className="p-3 space-y-2">
                        {(BOITES || []).map((b)=>(
                            <label key={b} className="flex items-center gap-2 text-sm">
                                <Checkbox checked={sel.has(b)} onCheckedChange={()=>toggle(b)} />{b}
                            </label>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" size="sm" onClick={()=>{ setSel(new Set()); onChange?.([]); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(Array.from(sel)); setOpen(false); }}>Afficher</Button>
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Carburant</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[280px] p-0">
                <Card>
                    <CardContent className="p-3 space-y-2">
                        {(CARBURANTS || []).map((c)=>(
                            <label key={c} className="flex items-center gap-2 text-sm">
                                <Checkbox checked={sel.has(c)} onCheckedChange={()=>toggle(c)} />{c}
                            </label>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" size="sm" onClick={()=>{ setSel(new Set()); onChange?.([]); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(Array.from(sel)); setOpen(false); }}>Afficher</Button>
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Sièges</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[280px] p-0">
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
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(Array.from(sel)); setOpen(false); }}>Afficher</Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

// Tri
const TRI_LABELS = {
    DATE_PUBLICATION_DESC: "Plus récentes",
    DATE_PUBLICATION_ASC: "Plus anciennes",
    PRIX_ASC: "Prix ↑",
    PRIX_DESC: "Prix ↓",
    NB_AVIS_DESC: "Avis ↓",
    NB_AVIS_ASC: "Avis ↑",
};
function TriChip({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [tri, setTri] = useState(value || "DATE_PUBLICATION_DESC");
    const isActive = tri !== "DATE_PUBLICATION_DESC";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="focus:outline-none"><Chip active={isActive}>Trier</Chip></button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="w-[240px] p-0">
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
                            <Button variant="outline" size="sm" onClick={()=>{ setTri("DATE_PUBLICATION_DESC"); onChange?.("DATE_PUBLICATION_DESC"); }}>Réinitialiser</Button>
                            <Button variant="brand" size="sm" onClick={()=>{ onChange?.(tri); setOpen(false); }}>Afficher</Button>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

// ---- Page ----
export default function Search() {
    const [filters, setFilters] = useState({
        prix: { min: "", max: "" },
        marque: "",
        modele: "",
        annees: { min: "", max: "" },
        boites: [],
        carburants: [],
        places: [],
        tri: "DATE_PUBLICATION_DESC",
    });

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Header />
            <Hero />

            {/* Barre de filtres fine */}
            <section className="container mx-auto px-4 md:px-6 mt-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <PrixChip value={filters.prix} onChange={(v)=>setFilters((s)=>({ ...s, prix: v }))} />
                    <MarqueChip value={filters.marque} onChange={(v)=>setFilters((s)=>({ ...s, marque: v, modele: "" }))} />
                    <ModeleChip marque={filters.marque} value={filters.modele} onChange={(v)=>setFilters((s)=>({ ...s, modele: v }))} />
                    <AnneesChip value={filters.annees} onChange={(v)=>setFilters((s)=>({ ...s, annees: v }))} />
                    <TransmissionChip value={filters.boites} onChange={(v)=>setFilters((s)=>({ ...s, boites: v }))} />
                    <CarburantChip value={filters.carburants} onChange={(v)=>setFilters((s)=>({ ...s, carburants: v }))} />
                    <PlacesChip value={filters.places} onChange={(v)=>setFilters((s)=>({ ...s, places: v }))} />
                    <TriChip value={filters.tri} onChange={(v)=>setFilters((s)=>({ ...s, tri: v }))} />
                </div>
            </section>

            <Footer />
        </main>
    );
}
