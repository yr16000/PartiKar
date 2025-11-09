import React from "react";
import { Link } from "react-router-dom";
import CarCard from "../cards/CarCard";

// Normalise AnnonceResponse -> props CarCard
function normalizeAnnonce(a) {
    if (!a) return null;
    return {
        id: a.voitureId ?? a.id, // côté backend: getAnnonceById(@PathVariable voitureId)
        marque: a.marque,
        modele: a.modele,
        annee: a.annee,
        imageUrl: a.imageUrl,
        localisation: a.localisation,
        prixParJour: typeof a.prixParJour === "number" ? a.prixParJour : (a.prixParJour?.value ?? a.prixParJour), // au cas BigDecimal serialisé différemment
        // Optionnel si tu ajoutes plus tard : a.moyenneAvis, a.nbAvis
        moyenneAvis: a.moyenneAvis,
        nbAvis: a.nbAvis,
    };
}

function Grid({ items }) {
    if (!items || items.length === 0) {
        return (
            <p className="text-muted-foreground">
                Aucune annonce retournée par l’API.
            </p>
        );
    }
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((c) => (
                <Link
                    key={c.id}
                    to={`/annonces/${c.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                    aria-label={`Voir l'annonce ${c.marque ?? ""} ${c.modele ?? ""}`}
                >
                    <CarCard car={c} />
                </Link>
            ))}
        </div>
    );
}

export default function CarListing({
                                       endpoint = "/api/annonces", // utilise getToutesLesAnnonces()
                                   }) {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState("");

    const load = React.useCallback(async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
            if (!res.ok) {
                throw new Error(`HTTP: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();

            const list = Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data)
                    ? data
                    : [];

            const normalized = list.map(normalizeAnnonce).filter(Boolean);
            setItems(normalized);
        } catch (e) {
            console.error(e);
            setErr(e.message || "Impossible de charger les annonces.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    React.useEffect(() => {
        load();
    }, [load]);

    return (
        <section className="mx-auto max-w-7xl px-4 py-12">
            <header className="mb-6">
                <h2 className="text-2xl font-bold">Toutes les annonces</h2>
            </header>

            {loading ? (
                <p className="text-muted-foreground">Chargement…</p>
            ) : err ? (
                <div className="space-y-2">
                    <p className="text-destructive">Erreur: {err}</p>
                    {err.startsWith("HTTP: 401") && (
                        <p className="text-sm text-muted-foreground">
                            L’endpoint retourne 401. Vérifie que <code>/api/annonces</code> est bien <b>permitAll()</b> dans SecurityConfig
                            et que tu requêtes bien <code>http://localhost:8080/api/annonces</code> depuis ton front.
                        </p>
                    )}
                </div>
            ) : (
                <Grid items={items} />
            )}
        </section>
    );
}
