// src/pages/AnnonceDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "@/components/layout/header.jsx";
import Footer from "@/components/layout/footer.jsx";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Calendar as CalIcon, MapPin, Pencil } from "lucide-react";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BrandAutocomplete from "@/components/ui/BrandAutocomplete";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { BRANDS, MODELES_PAR_MARQUE, CARBURANTS, BOITES } from "@/constants/vehicleData";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

const FALLBACK = "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

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
    const { token } = useAuth();

    const [reserving, setReserving] = useState(false);
    const [reservationError, setReservationError] = useState("");
    const [reservationSuccess, setReservationSuccess] = useState(false);

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

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [unavailable, setUnavailable] = useState(new Set());

    const total = (() => {
        const price = Number(data?.prixParJour ?? 0);
        const days = diffDaysInclusive(range.from, range.to ?? range.from);
        return price * days;
    })();

    const handleReservation = async () => {
        if (!token) {
            setReservationError("Vous devez être connecté pour réserver une voiture");
            navigate("/login", { state: { from: `/annonce/${id}` } });
            return;
        }

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

            await response.json();
            setReservationSuccess(true);

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

    const [isOwner, setIsOwner] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [originalData, setOriginalData] = useState(null);

    const modelesSuggeres = useMemo(() => {
        if (!editForm.marque) return [];
        const normalize = s => (s ? s.normalize('NFD').replace(/[\u0000-\u036f]/g, '').toLowerCase() : '');
        if (MODELES_PAR_MARQUE[editForm.marque]) return MODELES_PAR_MARQUE[editForm.marque];
        const nk = normalize(editForm.marque);
        const key = Object.keys(MODELES_PAR_MARQUE).find(k => normalize(k) === nk);
        return key ? MODELES_PAR_MARQUE[key] : [];
    }, [editForm.marque]);

    // Réinitialiser le modèle SEULEMENT si la marque change (pas pendant la saisie du modèle)
    useEffect(() => {
        if (!editForm.marque) return;
        // Ne rien faire si le modèle est vide (utilisateur en train de taper)
        if (!editForm.modele) return;
        // Vérifier si le modèle actuel est valide pour la marque
        const isValid = modelesSuggeres.some(m => m.toLowerCase() === (editForm.modele || '').toLowerCase());
        // Seulement réinitialiser si le modèle est invalide ET qu'il y a des suggestions disponibles
        if (!isValid && modelesSuggeres.length > 0) {
            // Vérifier si c'est bien un changement de marque (pas juste une saisie en cours)
            const isPartialMatch = modelesSuggeres.some(m =>
                m.toLowerCase().startsWith((editForm.modele || '').toLowerCase())
            );
            // Ne réinitialiser que si ce n'est pas une saisie partielle en cours
            if (!isPartialMatch) {
                setEditForm(p => ({ ...p, modele: '' }));
            }
        }
    }, [editForm.marque]); // Ne se déclenche QUE quand la marque change

    const [editRange, setEditRange] = useState({ from: null, to: null });
    const [currentDispoRange, setCurrentDispoRange] = useState(null);
    const rangeLabel = useMemo(() => editRange.from && editRange.to ? `${editRange.from.toLocaleDateString('fr-FR')} → ${editRange.to.toLocaleDateString('fr-FR')}` : 'Sélectionner une période de disponibilité', [editRange]);

    const currentYear = new Date().getFullYear();
    const annees = useMemo(() => Array.from({ length: currentYear - 1899 }, (_, i) => String(currentYear - i)), [currentYear]);
    const [openYear, setOpenYear] = useState(false);
    const [openCarburant, setOpenCarburant] = useState(false);
    const [openBoite, setOpenBoite] = useState(false);

    function startEdit() {
        if (!data) return;
        setEditForm({
            marque: data.marque || "",
            modele: data.modele || "",
            immatriculation: data.immatriculation || "",
            annee: data.annee ? String(data.annee) : "",
            typeCarburant: data.typeCarburant || "",
            nbPlaces: data.nbPlaces ? String(data.nbPlaces) : "",
            prixParJour: data.prixParJour ? String(data.prixParJour) : "",
            boiteVitesse: data.boiteVitesse || "",
            climatisation: !!data.climatisation,
            localisation: data.localisation || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            kilometrage: data.kilometrage ? String(data.kilometrage) : "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
        });
        setEditRange({ from: null, to: null });
        setEditing(true);
        setSaveError("");
        setSaveSuccess(false);
    }

    function cancelEdit() {
        setEditing(false);
        setSaveError("");
        setSaveSuccess(false);
    }

    function onFieldChange(e) {
        const { name, value, type, checked } = e.target;
        setEditForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }

    async function handleSave() {
        if (!token) {
            setSaveError("Non connecté");
            return;
        }
        setSaving(true);
        setSaveError("");
        setSaveSuccess(false);
        try {
            const payload = {};

            if (editForm.marque) payload.marque = editForm.marque;
            if (editForm.modele) payload.modele = editForm.modele;
            if (editForm.immatriculation) payload.immatriculation = editForm.immatriculation;
            if (editForm.typeCarburant) payload.typeCarburant = editForm.typeCarburant;
            if (editForm.boiteVitesse) payload.boiteVitesse = editForm.boiteVitesse;
            if (editForm.localisation) payload.localisation = editForm.localisation;
            if (editForm.description) payload.description = editForm.description;
            if (editForm.imageUrl) payload.imageUrl = editForm.imageUrl;

            if (editForm.annee) payload.annee = Number(editForm.annee);
            if (editForm.nbPlaces) payload.nbPlaces = Number(editForm.nbPlaces);
            if (editForm.prixParJour) payload.prixParJour = Number(editForm.prixParJour);
            if (editForm.kilometrage !== undefined && editForm.kilometrage !== "") {
                payload.kilometrage = Number(editForm.kilometrage);
            }

            // Coordonnées GPS (doivent être des nombres, pas des strings)
            if (editForm.latitude) {
                const lat = typeof editForm.latitude === 'string' ? parseFloat(editForm.latitude) : editForm.latitude;
                if (!isNaN(lat)) payload.latitude = lat;
            }
            if (editForm.longitude) {
                const lon = typeof editForm.longitude === 'string' ? parseFloat(editForm.longitude) : editForm.longitude;
                if (!isNaN(lon)) payload.longitude = lon;
            }

            payload.climatisation = editForm.climatisation;

            if (editRange.from && editRange.to) {
                payload.dateDebut = editRange.from.toISOString().slice(0, 10);
                payload.dateFin = editRange.to.toISOString().slice(0, 10);
            }

            console.log("Envoi PUT:", payload);

            const res = await fetch(`/api/annonces/id/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            console.log("Réponse PUT status:", res.status);

            if (!res.ok) {
                let msg = `Erreur ${res.status}: ${res.statusText}`;
                try {
                    const j = await res.json();
                    msg = j.message || msg;
                } catch {
                    const txt = await res.text();
                    if (txt) msg = txt;
                }
                throw new Error(msg);
            }

            const updated = await res.json();
            console.log("Annonce mise à jour:", updated);

            const merged = { ...data, ...updated };
            setData(merged);
            setOriginalData(merged);
            setSaveSuccess(true);

            setTimeout(() => {
                setEditing(false);
            }, 1500);
        } catch (e) {
            console.error("Erreur handleSave:", e);
            setSaveError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!token) {
            setSaveError("Non connecté");
            return;
        }
        try {
            const res = await fetch(`/api/annonces/id/${id}?proprietaireId=${data.proprietaireId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok && res.status !== 204) {
                let msg = 'Erreur suppression';
                try {
                    const j = await res.json();
                    msg = j.message || msg;
                } catch { }
                throw new Error(msg);
            }
            navigate('/my-annonces');
        } catch (e) {
            setSaveError(e.message);
        } finally {
            setDeleteConfirm(false);
        }
    }

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setErr("");
                const res = await fetch(`/api/annonces/id/${id}`, { headers: { Accept: "application/json" } });
                if (!res.ok) throw new Error("HTTP " + res.status);
                const a = await res.json();
                if (!alive) return;

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
                    creeLe: a.creeLe,
                    description: a.description,
                    kilometrage: a.kilometrage,
                    proprietaireId: a.proprietaireId,
                };
                setData(norm);
                setOriginalData(norm);

                let isOwnerFlag = false;
                if (token) {
                    try {
                        const meRes = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
                        if (meRes.ok) {
                            const me = await meRes.json();
                            if (me?.id && norm.proprietaireId && me.id === norm.proprietaireId) {
                                setIsOwner(true);
                                isOwnerFlag = true;
                            }
                        }
                    } catch { }
                }

                if (!isOwnerFlag) {
                    // Non-propriétaire : récupérer les disponibilités pour la réservation
                    const tryEndpoints = [
                        `/api/annonces/id/${id}/disponibilites`,
                        `/api/disponibilites/voiture/${norm.id}`,
                        `/api/disponibilites?voitureId=${norm.id}`,
                    ];
                    let days = [];
                    for (const url of tryEndpoints) {
                        try {
                            const r = await fetch(url, { headers: { Accept: "application/json" } });
                            if (r.ok) {
                                const payload = await r.json();
                                days = Array.isArray(payload) ? payload : [];
                                if (days.length || r.ok) break;
                            }
                        } catch { }
                    }
                    if (!alive) return;
                    const blocked = new Set(
                        days.filter(d => {
                            const s = (d.statut || d.status || "").toUpperCase();
                            return s && s !== "DISPONIBLE";
                        }).map(d => String(d.jour || d.date || d.day || ""))
                    );
                    setUnavailable(blocked);
                } else {
                    // Propriétaire : récupérer les dates de disponibilité pour affichage dans le formulaire d'édition
                    try {
                        const dispoRes = await fetch(`/api/disponibilites/voiture/${norm.id}`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${token}`
                            }
                        });
                        console.log("Récupération disponibilités propriétaire status:", dispoRes.status);
                        if (dispoRes.ok) {
                            const dispoData = await dispoRes.json();
                            console.log("Disponibilités reçues:", dispoData);
                            if (Array.isArray(dispoData) && dispoData.length > 0) {
                                const dates = dispoData
                                    .filter(d => {
                                        const statut = (d.statut || d.status || "").toUpperCase();
                                        return statut === "DISPONIBLE";
                                    })
                                    .map(d => {
                                        const dateStr = d.jour || d.date || d.day;
                                        return new Date(dateStr);
                                    })
                                    .filter(d => !isNaN(d.getTime()))
                                    .sort((a, b) => a - b);

                                console.log("Dates disponibles parsées:", dates);

                                if (dates.length > 0) {
                                    const range = {
                                        from: dates[0],
                                        to: dates[dates.length - 1]
                                    };
                                    console.log("Range de disponibilité:", range);
                                    setCurrentDispoRange(range);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Erreur récupération disponibilités:", e);
                    }
                }
            } catch (e) {
                if (!alive) return;
                setErr("Impossible de charger l'annonce.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id, token]);

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
    const published = data.creeLe && new Date(data.creeLe).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "2-digit" });

    return (
        <>
            <Header />
            <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 space-y-8">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                    <img src={data.imageUrl || FALLBACK} alt={title || "Annonce"} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = FALLBACK)} />
                </div>
                <header className="space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{title || `Annonce #${id}`}</h1>
                        {published && <p className="text-sm text-muted-foreground">Publié le {published}</p>}
                        {isOwner && <p className="text-xs text-indigo-600 mt-1">Vous êtes le propriétaire de ce véhicule.</p>}
                    </div>
                    {isOwner && !editing && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={startEdit}><Pencil className="w-4 h-4" /> Modifier</Button>
                            <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>Supprimer</Button>
                        </div>
                    )}
                </header>

                {deleteConfirm && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-xl p-6 w-[95%] max-w-md space-y-4">
                            <h2 className="text-lg font-semibold">Confirmer la suppression</h2>
                            <p className="text-sm">Cette action désactivera l'annonce. Continuer ?</p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Annuler</Button>
                                <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
                            </div>
                        </div>
                    </div>
                )}

                {editing && isOwner && (
                    <div className="border rounded-xl p-6 bg-white space-y-6">
                        <h2 className="text-lg font-semibold">Modifier l'annonce</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2 block text-sm">Marque *</Label>
                                <BrandAutocomplete
                                    value={editForm.marque}
                                    onChange={(v) => setEditForm(f => ({ ...f, marque: v }))}
                                    onSelect={(v) => setEditForm(f => ({ ...f, marque: v }))}
                                    options={BRANDS}
                                    placeholder="Marque"
                                    requireMatch
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm">Modèle *</Label>
                                <BrandAutocomplete
                                    value={editForm.modele}
                                    onChange={(v) => setEditForm(f => ({ ...f, modele: v }))}
                                    onSelect={(v) => setEditForm(f => ({ ...f, modele: v }))}
                                    options={modelesSuggeres}
                                    placeholder={editForm.marque ? "Modèle" : "Choisir une marque"}
                                    requireMatch={modelesSuggeres.length > 0}
                                    disabled={modelesSuggeres.length === 0}
                                />
                                {modelesSuggeres.length === 0 && (
                                    <p className="mt-1 text-xs text-muted-foreground">Sélectionnez d'abord une marque pour voir les modèles.</p>
                                )}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2 block text-sm">Immatriculation *</Label>
                                <Input name="immatriculation" value={editForm.immatriculation} onChange={onFieldChange} placeholder="Immatriculation" />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm">Année *</Label>
                                <Popover open={openYear} onOpenChange={setOpenYear}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between h-11">
                                            {editForm.annee ? editForm.annee : <span className="text-muted-foreground">Choisir une année</span>}
                                            <CalIcon className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[280px] p-0" side="bottom" align="start" avoidCollisions={false}>
                                        <Command>
                                            <CommandInput placeholder="Rechercher une année..." />
                                            <CommandList>
                                                <CommandEmpty>Aucune année</CommandEmpty>
                                                <CommandGroup>
                                                    {annees.map((year) => (
                                                        <CommandItem key={year} onSelect={() => { setEditForm((p) => ({ ...p, annee: year })); setOpenYear(false); }}>
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
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2 block text-sm">Type carburant *</Label>
                                <Popover open={openCarburant} onOpenChange={setOpenCarburant}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between h-11">
                                            {editForm.typeCarburant || <span className="text-muted-foreground">Sélectionner</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-0" side="bottom" align="start">
                                        <Command>
                                            <CommandList>
                                                <CommandEmpty>Aucun résultat</CommandEmpty>
                                                <CommandGroup>
                                                    {CARBURANTS.map((c) => (
                                                        <CommandItem key={c} onSelect={() => { setEditForm((p) => ({ ...p, typeCarburant: c })); setOpenCarburant(false); }}>
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
                                            {editForm.boiteVitesse || <span className="text-muted-foreground">Sélectionner</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-0" side="bottom" align="start">
                                        <Command>
                                            <CommandList>
                                                <CommandEmpty>Aucun résultat</CommandEmpty>
                                                <CommandGroup>
                                                    {BOITES.map((b) => (
                                                        <CommandItem key={b} onSelect={() => { setEditForm((p) => ({ ...p, boiteVitesse: b })); setOpenBoite(false); }}>
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
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label className="mb-2 block text-sm">Prix / jour *</Label>
                                <Input name="prixParJour" value={editForm.prixParJour} onChange={onFieldChange} placeholder="Prix/jour" />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm">Places *</Label>
                                <Input name="nbPlaces" type="number" min={1} max={9} step={1} value={editForm.nbPlaces} onChange={onFieldChange} placeholder="Places" />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm">Kilométrage *</Label>
                                <Input name="kilometrage" type="number" min={0} value={editForm.kilometrage} onChange={onFieldChange} placeholder="Kilométrage" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="clim2" name="climatisation" checked={!!editForm.climatisation} onChange={onFieldChange} />
                            <label htmlFor="clim2" className="text-sm">Climatisation</label>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Lieu *</Label>
                            <PlaceAutocomplete
                                value={editForm.localisation}
                                onChange={(v) => setEditForm(f => ({ ...f, localisation: v }))}
                                onSelect={(place) => setEditForm(f => ({ ...f, localisation: place?.label || "", latitude: place?.latitude || "", longitude: place?.longitude || "" }))}
                                placeholder="Paris"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Image URL *</Label>
                            <Input name="imageUrl" value={editForm.imageUrl} onChange={onFieldChange} placeholder="Image URL" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Période de disponibilité</p>
                            {currentDispoRange && !editRange.from && (
                                <p className="text-xs text-muted-foreground">
                                    Actuellement : {currentDispoRange.from.toLocaleDateString('fr-FR')} → {currentDispoRange.to.toLocaleDateString('fr-FR')}
                                </p>
                            )}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-between w-full">
                                        {rangeLabel}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="bottom" align="start" className="p-2">
                                    <Calendar
                                        mode="range"
                                        numberOfMonths={months}
                                        locale={fr}
                                        selected={editRange}
                                        onSelect={(r) => {
                                            const from = r?.from || null;
                                            const to = r?.to || r?.from || null;
                                            setEditRange({ from, to });
                                        }}
                                        defaultMonth={editRange.from}
                                        disabled={(d) => d < today}
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">
                                Si vous modifiez les dates, elles remplaceront l'ancienne période. Laissez vide pour conserver les dates actuelles.
                            </p>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Description</Label>
                            <Textarea name="description" value={editForm.description} onChange={onFieldChange} placeholder="Description" />
                        </div>
                        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                        {saveSuccess && <p className="text-sm text-green-600">Modifications enregistrées.</p>}
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={cancelEdit} disabled={saving}>Annuler</Button>
                            <Button onClick={handleSave} disabled={saving}>{saving ? "Sauvegarde..." : "Enregistrer"}</Button>
                        </div>
                    </div>
                )}

                {!editing && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className={isOwner ? "lg:col-span-3" : "lg:col-span-2"}>
                            <section className="rounded-xl border bg-white p-5 space-y-5">
                                <h2 className="text-lg font-semibold">Informations complètes</h2>
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <Info label="Marque" value={data.marque} />
                                    <Info label="Modèle" value={data.modele} />
                                    <Info label="Année" value={data.annee} />
                                    <Info label="Couleur" value={data.couleur} />
                                    <Info label="Immatriculation" value={data.immatriculation} />
                                    <Info label="Carburant" value={data.typeCarburant} />
                                    <Info label="Boîte" value={data.boiteVitesse} />
                                    <Info label="Places" value={data.nbPlaces} />
                                    <Info label="Climatisation" value={typeof data.climatisation === "boolean" ? (data.climatisation ? "Oui" : "Non") : null} />
                                    <Info label="Prix / jour" value={typeof data.prixParJour === "number" ? `${data.prixParJour}€` : data.prixParJour} />
                                    <Info label="Localisation" value={data.localisation} />
                                    <Info label="Kilométrage" value={data.kilometrage} />
                                    <Info label="Créée le" value={published} />
                                </div>
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Description</h3>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{data.description || "—"}</p>
                                </div>
                            </section>
                        </div>

                        {!isOwner && (
                            <aside className="lg:col-span-1">
                                <div className="rounded-2xl border bg-white p-5 shadow-sm">
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
                                    <div className="space-y-4">
                                        <div className="flex flex-col text-left min-w-0">
                                            <span className="text-sm text-gray-600 mb-1 leading-none">Votre voyage</span>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base leading-none text-left flex items-center justify-between gap-3 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-0 overflow-hidden"
                                                    >
                                                        <span className="truncate">{formatRangeWithHour(range, hour)}</span>
                                                        <span className="inline-flex w-7 h-7 items-center justify-center rounded bg-gray-100 shrink-0">
                                                            <CalIcon className="w-4 h-4 text-gray-700" />
                                                        </span>
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent side="bottom" align="start" sideOffset={12} avoidCollisions={false} className="z-[400] w-[min(92vw,360px)] sm:w-auto rounded-xl border border-gray-200 bg-white p-3 shadow-2xl">
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
                                                            (d) => unavailable.size > 0 && unavailable.has(toYMD(d)),
                                                            { outside: true },
                                                        ]}
                                                        showOutsideDays={false}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-col text-left min-w-0">
                                            <span className="text-sm text-gray-600 mb-1 leading-none">Heure</span>
                                            <Select value={hour} onValueChange={setHour}>
                                                <SelectTrigger className="!h-12 w-full !text-base border border-gray-300 rounded-lg shadow-sm bg-white flex items-center justify-between box-border !px-4 !py-0 leading-none pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <SelectValue placeholder="10:00" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="bg-white border border-gray-200 shadow-xl rounded-lg z-[401]">
                                                    {hours.map((h) => (
                                                        <SelectItem key={h} value={h} className="cursor-pointer">{h}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="rounded-lg border bg-white px-4 py-3 text-sm">
                                            <div className="text-gray-600 mb-1">Lieu de prise en charge et de retour</div>
                                            <div className="font-medium inline-flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {data.localisation || "—"}
                                            </div>
                                        </div>
                                        {reservationError && (
                                            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">{reservationError}</div>
                                        )}
                                        {reservationSuccess && (
                                            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">✅ Réservation confirmée ! Redirection...</div>
                                        )}
                                        <Button className="w-full h-12" onClick={handleReservation} disabled={reserving || reservationSuccess}>
                                            {reserving ? "Réservation en cours..." : reservationSuccess ? "✓ Réservé" : "Réserver"}
                                        </Button>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex flex-col gap-1 p-3 rounded-lg border bg-white">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm font-medium break-words">{value !== undefined && value !== null && value !== "" ? value : "—"}</span>
        </div>
    );
}

