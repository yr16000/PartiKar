import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Calendar as CalIcon, Share2, Mail, Phone, ArrowLeft, ShoppingCart } from "lucide-react";

/**
 * Cette page consomme ton endpoint existant:
 *  - GET /api/annonces/:id  -> renvoie AnnonceResponse
 * Elle gère en plus un sélecteur de dates (sans heures) et tente une vérif de dispo
 * sur /api/disponibilites/voiture/:id?de=YYYY-MM-DD&a=YYYY-MM-DD si présent (sinon affichage “info indisponible”).
 */

const FALLBACK =
    "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

function formatYMD(d) {
    if (!(d instanceof Date)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function AnnonceDetails() {
    const { id } = useParams(); // correspond à voitureId côté backend
    const navigate = useNavigate();

    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState("");

    // Sélecteur de dates (sans heures)
    const today = React.useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    }, []);
    const [start, setStart] = React.useState(today);
    const [end, setEnd] = React.useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(0,0,0,0);
        return d;
    });

    const [checking, setChecking] = React.useState(false);
    const [dispoMsg, setDispoMsg] = React.useState("");

    React.useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                // Ton contrôleur: GET /api/annonces/{voitureId}
                const res = await fetch(`/api/annonces/${id}`, {
                    headers: { Accept: "application/json" },
                });
                if (!res.ok) throw new Error("HTTP " + res.status);
                const ann = await res.json();

                if (!alive) return;

                // ann est un AnnonceResponse (voir classe fournie)
                setData({
                    id: ann.voitureId,
                    marque: ann.marque,
                    modele: ann.modele,
                    annee: ann.annee,
                    imageUrl: ann.imageUrl || FALLBACK,
                    localisation: ann.localisation,
                    prixParJour: ann.prixParJour, // BigDecimal
                    couleur: ann.couleur,
                    carburant: ann.typeCarburant,
                    nbPlaces: ann.nbPlaces,
                    boiteVitesse: ann.boiteVitesse, // String (déjà .name() côté DTO)
                    climatisation: ann.climatisation,
                    immatriculation: ann.immatriculation,
                    latitude: ann.latitude,
                    longitude: ann.longitude,
                    description: ann.description,
                    statut: ann.statut,
                    proprietaire: {
                        id: ann.proprietaireId,
                        nom: ann.proprietaireNom,
                        prenom: ann.proprietairePrenom,
                    },
                    creeLe: ann.creeLe,
                    nbJoursDisponibles: ann.nbJoursDisponibles,
                });
            } catch (e) {
                if (!alive) return;
                setErr("Impossible de charger l’annonce.");
                setData(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id]);

    async function verifierDispo() {
        if (!data) return;
        setChecking(true);
        setDispoMsg("");
        try {
            const de = formatYMD(start);
            const a = formatYMD(end);
            // On essaie un endpoint logique si présent côté backend :
            // /api/disponibilites/voiture/:id?de=YYYY-MM-DD&a=YYYY-MM-DD
            const res = await fetch(`/api/disponibilites/voiture/${data.id}?de=${de}&a=${a}`, {
                headers: { Accept: "application/json" },
            });

            if (res.ok) {
                const j = await res.json();
                // Convention: { disponible: true/false, message?: string }
                const ok = typeof j?.disponible === "boolean" ? j.disponible : false;
                setDispoMsg(
                    ok
                        ? "✅ Le véhicule est disponible sur ces dates."
                        : (j?.message || "❌ Le véhicule n’est pas disponible sur ces dates.")
                );
            } else {
                // Pas d’endpoint chez toi : fallback info
                setDispoMsg("ℹ️ Vérification détaillée indisponible. Essayez de réserver pour confirmer.");
            }
        } catch (_e) {
            setDispoMsg("ℹ️ Impossible de vérifier la disponibilité actuellement.");
        } finally {
            setChecking(false);
        }
    }

    function onPartager() {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: document.title, url }).catch(() => {});
        } else {
            navigator.clipboard?.writeText(url);
            // Hint à l’utilisateur :
            alert("Lien copié dans le presse-papiers ✅");
        }
    }

    function onContacter() {
        // Tu pourras remplacer par un vrai canal (messagerie interne, etc.)
        const nom = data?.proprietaire?.nom ?? "";
        const prenom = data?.proprietaire?.prenom ?? "";
        const sujet = encodeURIComponent(`Intérêt pour votre véhicule ${data?.marque ?? ""} ${data?.modele ?? ""}`);
        const corps = encodeURIComponent(
            `Bonjour ${prenom} ${nom},\n\nJe suis intéressé par votre véhicule. Est-il disponible du ${formatYMD(start)} au ${formatYMD(end)} ?\n\nCordialement,`
        );
        window.location.href = `mailto:?subject=${sujet}&body=${corps}`;
    }

    function onReserver() {
        // À brancher plus tard: redirection vers ton flow de réservation
        alert("Flow de réservation à brancher (sélection des dates, paiement, confirmation).");
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10">
                <p className="text-muted-foreground">Chargement de l’annonce…</p>
            </div>
        );
    }

    if (err || !data) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
                <p className="text-destructive">{err || "Annonce introuvable."}</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
            </div>
        );
    }

    const title = `${data.marque ?? ""} ${data.modele ?? ""}`.trim() || `Annonce #${id}`;
    const meta = [
        data.annee ? `Année ${data.annee}` : null,
        data.localisation ? `📍 ${data.localisation}` : null,
    ].filter(Boolean).join(" • ");

    const prixFmt =
        typeof data.prixParJour === "number"
            ? data.prixParJour
            : (data.prixParJour?.toString ? Number(data.prixParJour.toString()) : undefined);

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Button variant="outline" onClick={onPartager}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                </Button>
            </div>

            <header>
                <h1 className="text-2xl font-bold mb-1">{title}</h1>
                {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
            </header>

            {/* Image principale */}
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                <img
                    src={data.imageUrl || FALLBACK}
                    alt={title}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = FALLBACK)}
                />
            </div>

            {/* Prix + actions principales */}
            <Card className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        {Number.isFinite(prixFmt) && (
                            <p className="text-lg font-semibold">
                                {prixFmt.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                    maximumFractionDigits: 0,
                                })}{" "}
                                / jour
                            </p>
                        )}
                        {data?.statut && (
                            <p className="text-sm text-muted-foreground">Statut : {data.statut}</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={onReserver}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Réserver
                        </Button>
                        <Button variant="outline" onClick={onContacter}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contacter le propriétaire
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Sélecteur de dates + vérif disponibilités */}
            <Card className="p-4 space-y-3">
                <h2 className="font-semibold">Vérifier les disponibilités</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <DateField
                        label="Début"
                        date={start}
                        onChange={setStart}
                    />
                    <DateField
                        label="Fin"
                        date={end}
                        onChange={setEnd}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={verifierDispo} disabled={checking}>
                        <CalIcon className="mr-2 h-4 w-4" />
                        {checking ? "Vérification…" : "Vérifier la disponibilité"}
                    </Button>
                    {dispoMsg && <span className="text-sm">{dispoMsg}</span>}
                </div>
                {typeof data.nbJoursDisponibles === "number" && (
                    <p className="text-xs text-muted-foreground">
                        Info annonce : {data.nbJoursDisponibles} jour(s) disponibles (donnée indicative).
                    </p>
                )}
            </Card>

            {/* Caractéristiques / Specs */}
            <Card className="p-4">
                <h2 className="font-semibold mb-3">Caractéristiques</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Spec label="Boîte" value={data.boiteVitesse} />
                    <Spec label="Climatisation" value={data.climatisation ? "Oui" : "Non"} />
                    <Spec label="Places" value={data.nbPlaces} />
                    <Spec label="Carburant" value={data.carburant} />
                    <Spec label="Couleur" value={data.couleur} />
                    <Spec label="Immatriculation" value={data.immatriculation} />
                    {data.latitude && data.longitude && (
                        <Spec
                            label="Coordonnées"
                            value={`${data.latitude}, ${data.longitude}`}
                        />
                    )}
                </div>
            </Card>

            {/* Propriétaire */}
            <Card className="p-4">
                <h2 className="font-semibold mb-2">Propriétaire</h2>
                <p className="text-sm">
                    {data?.proprietaire?.prenom} {data?.proprietaire?.nom} (ID {data?.proprietaire?.id})
                </p>
                <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={onContacter}>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer un message
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "tel:"}>
                        <Phone className="mr-2 h-4 w-4" />
                        Appeler
                    </Button>
                </div>
            </Card>

            {/* Description */}
            {data.description && (
                <Card className="p-4">
                    <h2 className="font-semibold mb-2">Description</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {data.description}
                    </p>
                </Card>
            )}
        </div>
    );
}

/* ============== Petits composants utilitaires ============== */

function Spec({ label, value }) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{String(value)}</span>
        </div>
    );
}

function DateField({ label, date, onChange }) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start w-full">
                        <CalIcon className="mr-2 h-4 w-4" />
                        {date ? date.toLocaleDateString("fr-FR") : "Choisir une date"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                            if (d) {
                                d.setHours(0,0,0,0);
                                onChange(d);
                                setOpen(false);
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
