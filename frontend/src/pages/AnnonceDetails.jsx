// src/pages/AnnonceDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "@/components/layout/header.jsx";
import Footer from "@/components/layout/footer.jsx";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Calendar as CalIcon, MapPin, Pencil, X, Save } from "lucide-react";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CARBURANTS, BOITES } from "@/constants/vehicleData";

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
    const { token } = useAuth();

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

    // État pour le mode propriétaire
    const [isOwner, setIsOwner] = useState(false);
    const [ownerLoaded, setOwnerLoaded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [editForm, setEditForm] = useState({});
    const [originalData, setOriginalData] = useState(null);

    function startEdit() {
        if (!data) return;
        setEditForm({
            marque: data.marque || "",
            modele: data.modele || "",
            annee: data.annee || "",
            couleur: data.couleur || "",
            immatriculation: data.immatriculation || "",
            typeCarburant: data.typeCarburant || "",
            nbPlaces: data.nbPlaces || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            prixParJour: data.prixParJour || "",
            boiteVitesse: data.boiteVitesse || "",
            climatisation: typeof data.climatisation === "boolean" ? data.climatisation : false,
            localisation: data.localisation || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            kilometrage: data.kilometrage || "",
        });
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
            // Construire payload diff: seulement les champs modifiés et non vides
            const payload = {};
            Object.keys(editForm).forEach(k => {
                const newVal = editForm[k];
                const oldVal = originalData?.[k];
                // normaliser nombres
                if (["annee", "nbPlaces", "kilometrage"].includes(k)) {
                    if (newVal === "" || newVal === null) return; // ignorer vide
                    const num = Number(newVal);
                    if (!Number.isFinite(num)) return; // ignorer invalide
                    if (oldVal !== num) payload[k] = num; else return;
                } else if (k === "prixParJour") {
                    if (newVal === "" || newVal === null) return;
                    const num = Number(newVal);
                    if (!Number.isFinite(num)) return;
                    if (Number(oldVal) !== num) payload[k] = num; else return;
                } else if (k === "climatisation") {
                    if (oldVal !== newVal) payload[k] = newVal;
                } else {
                    if (newVal !== oldVal && newVal !== "") payload[k] = newVal;
                }
            });

            if (Object.keys(payload).length === 0) {
                setSaveError("Aucun changement");
                setSaving(false);
                return;
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
                let msg = "Erreur sauvegarde";
                try { const j = await res.json(); msg = j.message || msg; } catch {}
                throw new Error(msg);
            }
            const updated = await res.json();
            // Mettre à jour data + originalData
            const merged = {
                ...data,
                ...updated,
                marque: updated.marque,
                modele: updated.modele,
                annee: updated.annee,
                couleur: updated.couleur,
                immatriculation: updated.immatriculation,
                typeCarburant: updated.typeCarburant,
                nbPlaces: updated.nbPlaces,
                description: updated.description,
                imageUrl: updated.imageUrl,
                prixParJour: updated.prixParJour,
                boiteVitesse: updated.boiteVitesse,
                climatisation: updated.climatisation,
                localisation: updated.localisation,
                latitude: updated.latitude,
                longitude: updated.longitude,
                kilometrage: updated.kilometrage,
            };
            setData(merged);
            setOriginalData(merged);
            setSaveSuccess(true);
            setEditing(false);
        } catch (e) {
            setSaveError(e.message);
        } finally {
            setSaving(false);
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

                // Déterminer si propriétaire (fetch /api/users/me si token)
                if (token) {
                    try {
                        const meRes = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
                        if (meRes.ok) {
                            const me = await meRes.json();
                            if (me?.id && norm.proprietaireId && me.id === norm.proprietaireId) {
                                setIsOwner(true);
                            }
                        }
                    } catch {}
                }
                setOwnerLoaded(true);

                // On n'a plus besoin des disponibilités si propriétaire (pas de réservation)
                if (!isOwner) {
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
                        days.filter(d => {
                            const s = (d.statut || d.status || "").toUpperCase();
                            return s && s !== "DISPONIBLE";
                        }).map(d => String(d.jour || d.date || d.day || ""))
                    );
                    setUnavailable(blocked);
                }
            } catch (e) {
                if (!alive) return;
                setErr("Impossible de charger l’annonce.");
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
                        <Button variant="outline" className="flex items-center gap-2" onClick={startEdit}>
                            <Pencil className="w-4 h-4" /> Modifier l'annonce
                        </Button>
                    )}
                </header>

                {editing && isOwner && (
                    <div className="border rounded-xl p-6 bg-white space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Modifier l'annonce</h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
                                    <X className="w-4 h-4" /> Annuler
                                </Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Enregistrer"}
                                </Button>
                            </div>
                        </div>
                        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                        {saveSuccess && <p className="text-sm text-green-600">Modifications enregistrées.</p>}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input name="marque" value={editForm.marque} onChange={onFieldChange} placeholder="Marque" />
                            <Input name="modele" value={editForm.modele} onChange={onFieldChange} placeholder="Modèle" />
                            <Input name="annee" value={editForm.annee} onChange={onFieldChange} placeholder="Année" />
                            <Input name="couleur" value={editForm.couleur} onChange={onFieldChange} placeholder="Couleur" />
                            <Input name="immatriculation" value={editForm.immatriculation} onChange={onFieldChange} placeholder="Immatriculation" />
                            <Select value={editForm.typeCarburant} onValueChange={(v)=>setEditForm(f=>({...f,typeCarburant:v}))}>
                                <SelectTrigger><SelectValue placeholder="Carburant" /></SelectTrigger>
                                <SelectContent>{CARBURANTS.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input name="nbPlaces" value={editForm.nbPlaces} onChange={onFieldChange} placeholder="Places" />
                            <Input name="kilometrage" value={editForm.kilometrage} onChange={onFieldChange} placeholder="Kilométrage" />
                            <Input name="prixParJour" value={editForm.prixParJour} onChange={onFieldChange} placeholder="Prix par jour (€)" />
                            <Select value={editForm.boiteVitesse} onValueChange={(v)=>setEditForm(f=>({...f,boiteVitesse:v}))}>
                                <SelectTrigger><SelectValue placeholder="Boîte" /></SelectTrigger>
                                <SelectContent>{BOITES.map(b=> <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="clim" name="climatisation" checked={!!editForm.climatisation} onChange={onFieldChange} />
                                <label htmlFor="clim" className="text-sm">Climatisation</label>
                            </div>
                            <Input name="imageUrl" value={editForm.imageUrl} onChange={onFieldChange} placeholder="Image URL" />
                            <Input name="localisation" value={editForm.localisation} onChange={onFieldChange} placeholder="Localisation" />
                            <Input name="latitude" value={editForm.latitude} onChange={onFieldChange} placeholder="Latitude" />
                            <Input name="longitude" value={editForm.longitude} onChange={onFieldChange} placeholder="Longitude" />
                            <Textarea name="description" value={editForm.description} onChange={onFieldChange} placeholder="Description" className="md:col-span-2" />
                        </div>
                    </div>
                )}

                {/* SECTION INFOS DETAILLEES */}
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
                                <Info label="Latitude" value={data.latitude} />
                                <Info label="Longitude" value={data.longitude} />
                                <Info label="Kilométrage" value={data.kilometrage} />
                                <Info label="Statut" value={data.statut} />
                                <Info label="Créée le" value={published} />
                            </div>
                            <div>
                                <h3 className="text-md font-semibold mb-2">Description</h3>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{data.description || "—"}</p>
                            </div>
                        </section>
                    </div>

                    {/* Panneau réservation visible seulement si NON propriétaire */}
                    {!isOwner && (
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
                                {/* Dates */}
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
                                    {/* Heure */}
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
