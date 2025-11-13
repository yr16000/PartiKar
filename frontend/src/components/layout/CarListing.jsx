// src/components/layout/CarListing.jsx
import React from "react";
import { Link } from "react-router-dom";
import CarCard from "../cards/CarCard";

// Normalisation
const normalize = (a) =>
    a && ({
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
        proprietaireMoyenneAvis: a.proprietaireMoyenneAvis,
        proprietaireNbAvis: a.proprietaireNbAvis,
        nbJoursDisponibles: a.nbJoursDisponibles,
    });

const Grid = ({ items }) =>
    items?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((c) => (
                <Link
                    key={c.id}
                    to={`/annonces/${c.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                >
                    <CarCard car={c} />
                </Link>
            ))}
        </div>
    ) : (
        <p className="text-muted-foreground">Pas d’annonces disponibles.</p>
    );

const Skeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className="aspect-[16/9] w-full rounded-xl bg-muted mb-3" />
                <div className="h-4 w-2/3 rounded bg-muted mb-2" />
                <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
        ))}
    </div>
);

export default function CarListing({ endpoint = "/api/annonces", limit }) {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const ctrl = new AbortController();

        (async () => {
            try {
                const res = await fetch(endpoint, {
                    headers: { Accept: "application/json" },
                    signal: ctrl.signal,
                });
                const data = await res.json();
                const raw = Array.isArray(data?.content)
                    ? data.content
                    : Array.isArray(data)
                        ? data
                        : [];
                let normalized = raw.map(normalize).filter(Boolean);

                if (limit) normalized = normalized.slice(0, limit);
                setItems(normalized);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();

        return () => ctrl.abort();
    }, [endpoint, limit]);

    return (
        <section className="mx-auto max-w-7xl px-4 py-12">


            {loading ? <Skeleton /> : <Grid items={items} />}
        </section>
    );
}
