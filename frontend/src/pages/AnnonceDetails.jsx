// src/pages/AnnonceDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "@/components/layout/header.jsx";
import Footer from "@/components/layout/footer.jsx";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalIcon, Pencil, Star, MapPin, User as UserIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BrandAutocomplete from "@/components/ui/BrandAutocomplete";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { BRANDS, MODELES_PAR_MARQUE, CARBURANTS, BOITES } from "@/constants/vehicleData";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

import ReservationPanel from "@/components/layout/ReservationPanel";

const FALLBACK = "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

export default function AnnonceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Nombre de mois affichés dans le calendrier (responsive)
    const [months, setMonths] = useState(1);
    useEffect(() => {
        const mql = window.matchMedia("(min-width: 640px)");
        const handler = () => setMonths(mql.matches ? 2 : 1);
        handler();
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, []);

    // Données annonce
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // Jours indisponibles (YYYY-MM-DD) pour le calendrier de réservation
    const [unavailable, setUnavailable] = useState(new Set());
    const [ownerRating, setOwnerRating] = useState({ average: 0, count: 0 });
    // eslint-disable-next-line no-unused-vars
    const [ownerReviews, setOwnerReviews] = useState([]);

    // Proprio / édition
    const [isOwner, setIsOwner] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [originalData, setOriginalData] = useState(null);

    // Suggestions de modèles en fonction de la marque
    const modelesSuggeres = useMemo(() => {
        if (!editForm.marque) return [];
        const normalize = s => (s ? s.normalize('NFD').replace(/[\u0000-\u036f]/g, '').toLowerCase() : '');
        if (MODELES_PAR_MARQUE[editForm.marque]) return MODELES_PAR_MARQUE[editForm.marque];
        const nk = normalize(editForm.marque);
        const key = Object.keys(MODELES_PAR_MARQUE).find(k => normalize(k) === nk);
        return key ? MODELES_PAR_MARQUE[key] : [];
    }, [editForm.marque]);

    // Réinitialiser le modèle uniquement si la marque change et que le modèle courant n'est plus valide
    useEffect(() => {
        if (!editForm.marque) return;
        if (!editForm.modele) return;
        const isValid = modelesSuggeres.some(m => m.toLowerCase() === (editForm.modele || '').toLowerCase());
        if (!isValid && modelesSuggeres.length > 0) {
            const isPartial = modelesSuggeres.some(m => m.toLowerCase().startsWith((editForm.modele || '').toLowerCase()));
            if (!isPartial) setEditForm(p => ({ ...p, modele: '' }));
        }
    }, [editForm.marque]); // eslint-disable-line react-hooks/exhaustive-deps

    // Dispos côté proprio (vue édition)
    const [editRange, setEditRange] = useState({ from: null, to: null });
    const [currentDispoRange, setCurrentDispoRange] = useState(null);
    const rangeLabel = useMemo(
        () =>
            editRange.from && editRange.to
                ? `${editRange.from.toLocaleDateString('fr-FR')} → ${editRange.to.toLocaleDateString('fr-FR')}`
                : 'Sélectionner une période de disponibilité',
        [editRange]
    );

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

            // Coordonnées GPS
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

            const res = await fetch(`/api/annonces/id/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

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
            const merged = { ...data, ...updated };
            setData(merged);
            setOriginalData(merged);
            setSaveSuccess(true);

            setTimeout(() => setEditing(false), 1500);
        } catch (e) {
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
                } catch {}
                throw new Error(msg);
            }
            navigate('/my-annonces');
        } catch (e) {
            setSaveError(e.message);
        } finally {
            setDeleteConfirm(false);
        }
    }

    // Chargement des données + dispos
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
                    proprietaireNom: a.proprietaireNom,
                    proprietairePrenom: a.proprietairePrenom,
                    statut: a.statut,
                };
                setData(norm);
                setOriginalData(norm);

                // Récupérer les avis du propriétaire
                if (norm.proprietaireId) {
                    try {
                        const avisRes = await fetch(`/api/avis/utilisateur/${norm.proprietaireId}`);
                        if (avisRes.ok) {
                            const avisData = await avisRes.json();
                            if (Array.isArray(avisData) && avisData.length > 0) {
                                setOwnerReviews(avisData);
                                const notes = avisData.map(avis => avis.noteUtilisateur).filter(n => n != null);
                                if (notes.length > 0) {
                                    const sum = notes.reduce((acc, n) => acc + n, 0);
                                    const avg = sum / notes.length;
                                    setOwnerRating({ average: avg, count: notes.length });
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Erreur récupération avis propriétaire:", e);
                    }
                }

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
                    } catch {}
                }

                if (!isOwnerFlag) {
                    // Non-proprio: récupérer indispos pour la réservation
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
                        } catch {}
                    }
                    if (!alive) return;
                    const blocked = new Set(
                        days
                            .filter(d => {
                                const s = (d.statut || d.status || "").toUpperCase();
                                return s && s !== "DISPONIBLE";
                            })
                            .map(d => String(d.jour || d.date || d.day || ""))
                    );
                    setUnavailable(blocked);
                } else {
                    // Proprio: récupérer la plage de dispos actuelle (affichage)
                    try {
                        const dispoRes = await fetch(`/api/disponibilites/voiture/${norm.id}`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${token}`
                            }
                        });
                        if (dispoRes.ok) {
                            const dispoData = await dispoRes.json();
                            if (Array.isArray(dispoData) && dispoData.length > 0) {
                                const dates = dispoData
                                    .filter(d => ((d.statut || d.status || "").toUpperCase() === "DISPONIBLE"))
                                    .map(d => new Date(d.jour || d.date || d.day))
                                    .filter(d => !isNaN(d.getTime()))
                                    .sort((a, b) => a - b);
                                if (dates.length > 0) {
                                    setCurrentDispoRange({ from: dates[0], to: dates[dates.length - 1] });
                                }
                            }
                        }
                    } catch {}
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
                {/* Image principale */}
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                    <img
                        src={data.imageUrl || FALLBACK}
                        alt={title || "Annonce"}
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.src = FALLBACK)}
                    />
                </div>

                {/* En-tête */}
                <header className="space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{title || `Annonce #${id}`}</h1>
                        {published && <p className="text-sm text-muted-foreground">Publié le {published}</p>}
                        {isOwner && <p className="text-xs text-indigo-600 mt-1">Vous êtes le propriétaire de ce véhicule.</p>}
                        {isOwner && data.statut?.toLowerCase() === 'inactive' && (
                            <p className="text-xs text-red-600 mt-1 font-medium">Cette annonce est inactive et ne peut plus être modifiée ou supprimée.</p>
                        )}
                        {isOwner && data.statut?.toLowerCase() === 'completement_reservee' && (
                            <p className="text-xs text-orange-600 mt-1 font-medium">Cette annonce est complètement réservée pour toutes les dates disponibles.</p>
                        )}
                        {isOwner && data.statut?.toLowerCase() === 'expiree' && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">Cette annonce a expiré (toutes les dates sont passées).</p>
                        )}
                    </div>

                    {isOwner && !editing && data.statut?.toLowerCase() !== 'inactive' && data.statut?.toLowerCase() !== 'expiree' && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={startEdit}><Pencil className="w-4 h-4" /> Modifier</Button>
                            <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>Supprimer</Button>
                        </div>
                    )}
                </header>

                {/* Modal suppression */}
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

                {/* Formulaire d'édition (proprio) */}
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
                                                        <CommandItem
                                                            key={year}
                                                            onSelect={() => { setEditForm((p) => ({ ...p, annee: year })); setOpenYear(false); }}
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
                                onSelect={(place) => setEditForm(f => ({
                                    ...f,
                                    localisation: place?.label || "",
                                    latitude: place?.latitude || "",
                                    longitude: place?.longitude || ""
                                }))}
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

                {/* Corps principal : infos + panneau réservation (non proprio) */}
                {!editing && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className={isOwner ? "lg:col-span-3" : "lg:col-span-2"}>
                            {/* Évaluation du propriétaire */}
                            {!isOwner && data.proprietaireNom && (
                                <section className="rounded-xl border bg-white p-5 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback><UserIcon className="w-6 h-6" /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">
                                                {data.proprietairePrenom} {data.proprietaireNom}
                                            </h3>
                                            {ownerRating.count > 0 ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">{ownerRating.average.toFixed(1)}</span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        ({ownerRating.count} avis)
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-indigo-600 mt-1">Nouveau utilisateur</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

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
                                    {isOwner && (
                                        <div className="flex flex-col gap-1 p-3 rounded-lg border bg-white">
                                            <span className="text-xs uppercase tracking-wide text-muted-foreground">Statut</span>
                                            <span
                                                className={`text-sm font-medium ${
                                                    data.statut?.toLowerCase() === 'inactive' ? 'text-red-600' :
                                                        data.statut?.toLowerCase() === 'disponible' ? 'text-green-600' :
                                                            data.statut?.toLowerCase() === 'completement_reservee' ? 'text-orange-600' :
                                                                data.statut?.toLowerCase() === 'expiree' ? 'text-gray-600' :
                                                                    'text-blue-600'
                                                }`}
                                            >
                        {data.statut?.toLowerCase() === 'inactive' ? 'Inactive' :
                            data.statut?.toLowerCase() === 'disponible' ? 'Disponible' :
                                data.statut?.toLowerCase() === 'completement_reservee' ? 'Complètement réservée' :
                                    data.statut?.toLowerCase() === 'expiree' ? 'Expirée' :
                                        data.statut || '—'}
                      </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-md font-semibold mb-2">Description</h3>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{data.description || "—"}</p>
                                </div>
                            </section>
                        </div>

                        {/* Panneau réservation (uniquement non-proprio) */}
                        {!isOwner && (
                            <aside className="lg:col-span-1">
                                <ReservationPanel
                                    voitureId={Number(id)}
                                    prixParJour={data.prixParJour}
                                    localisation={data.localisation}
                                    unavailable={unavailable}
                                    token={token}
                                    disabled={
                                        (data.statut?.toLowerCase?.() === "inactive") ||
                                        (data.statut?.toLowerCase?.() === "expiree")
                                    }
                                    onSuccess={() => {
                                        setTimeout(() => {
                                            navigate("/demandes-reservation", { state: { tab: "mes-demandes" } });
                                        }, 1000);
                                    }}
                                />
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
