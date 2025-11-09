// src/components/layout/CarListing.jsx
import React from "react";
import { Link } from "react-router-dom";
import CarCard from "../cards/CarCard";

const CACHE_KEY = "annonces_cache_v1";

// Normalise AnnonceResponse -> props CarCard
function normalizeAnnonce(a) {
    if (!a) return null;
    return {
        id: a.voitureId ?? a.id,
        marque: a.marque,
        modele: a.modele,
        annee: a.annee,
        imageUrl: a.imageUrl,
        localisation: a.localisation,
        prixParJour:
            typeof a.prixParJour === "number"
                ? a.prixParJour
                : a.prixParJour?.value ?? a.prixParJour,
        moyenneAvis: a.moyenneAvis,
        nbAvis: a.nbAvis,
    };
}

function Grid({ items }) {
    if (!items || items.length === 0) {
        return <p className="text-muted-foreground">Pas d’annonces disponibles.</p>;
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

export default function CarListing({ endpoint = "/api/annonces" }) {
    const [items, setItems] = React.useState([]);
    const [status, setStatus] = React.useState("loading"); // loading | ready | empty | failed

    // 1) Hydrate depuis le cache pour une impression immédiate si dispo
    React.useEffect(() => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed);
                    setStatus("ready");
                }
            }
        } catch {}
    }, []);

    const loadWithRetry = React.useCallback(async () => {
        const ctrl = new AbortController();
        const backoffs = [400, 800, 1600, 2500, 3500]; // ms
        let lastError = null;

        const fetchOnce = async () => {
            const res = await fetch(endpoint, {
                headers: { Accept: "application/json" },
                signal: ctrl.signal,
                credentials: "omit", // endpoint est public
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            const raw = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
            const normalized = raw.map(normalizeAnnonce).filter(Boolean);
            return normalized;
        };

        // Si on avait rien au cache, on reste en "loading" pendant les retries.
        if (items.length === 0) setStatus("loading");

        for (let i = 0; i < backoffs.length; i++) {
            try {
                const normalized = await fetchOnce();
                if (normalized.length > 0) {
                    setItems(normalized);
                    setStatus("ready");
                    try {
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
                    } catch {}
                } else {
                    setItems([]);
                    setStatus("empty");
                }
                return () => ctrl.abort();
            } catch (e) {
                lastError = e;
                // si c’est le dernier essai, on sort
                if (i === backoffs.length - 1) break;
                await new Promise((r) => setTimeout(r, backoffs[i]));
            }
        }

        // Tous les essais ont échoué : si on avait du cache, on reste en "ready".
        if (items.length > 0) {
            console.warn("API indisponible, j’affiche le cache. Dernière erreur:", lastError?.message);
            setStatus("ready");
        } else {
            console.error("Impossible de charger les annonces:", lastError?.message);
            // On montre “Pas d’annonces disponibles” en cas d’erreur durable pour ne pas laisser un écran vide
            setStatus("empty");
        }
        return () => ctrl.abort();
    }, [endpoint, items.length]);

    // 2) Charger avec retry au montage
    React.useEffect(() => {
        let alive = true;
        (async () => {
            if (!alive) return;
            await loadWithRetry();
        })();
        return () => {
            alive = false;
        };
    }, [loadWithRetry]);

    return (
        <section className="mx-auto max-w-7xl px-4 py-12">
            <header className="mb-6">
                <h2 className="text-2xl font-bold">Toutes les annonces</h2>
            </header>

            {status === "loading" ? (
                <p className="text-muted-foreground">Chargement…</p>
            ) : status === "ready" ? (
                <Grid items={items} />
            ) : (
                // empty ou failed => même UX demandée
                <Grid items={[]} />
            )}
        </section>
    );
}
