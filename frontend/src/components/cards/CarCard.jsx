import React from "react";
import { Card, CardTitle, CardContent } from "../ui/card";

const FALLBACK =
    "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

export default function CarCard({ car }) {
    const title = `${car?.marque ?? ""} ${car?.modele ?? ""}`.trim() || "Voiture";
    const subtitle = car?.annee ? String(car.annee) : "";
    const imageUrl = car?.imageUrl || FALLBACK;
    const price = car?.prixParJour ? `${car.prixParJour}€ / jour` : "";

    const rating = car?.moyenneAvis;
    const reviewCount = car?.nbAvis;

    const hasRating =
        typeof rating === "number" && Number.isFinite(rating) && rating > 0;
    const hasReviews =
        typeof reviewCount === "number" &&
        Number.isFinite(reviewCount) &&
        reviewCount > 0;

    return (
        <Card className="overflow-hidden hover:shadow-lg transition rounded-2xl p-0 cursor-pointer">
            {/* IMAGE (plus grande) */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted rounded-b-none">
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = FALLBACK)}
                    loading="lazy"
                />
            </div>

            <CardContent className="pt-3 pb-4 space-y-2">
                {/* TITRE */}
                <CardTitle className="text-lg font-semibold leading-tight truncate">
                    {title} {subtitle && ` ${subtitle}`}
                </CardTitle>

                {/* ⚡ NOUVELLE ANNONCE ou AVIS — maintenant juste en dessous du titre */}
                {hasRating && hasReviews ? (
                    <p className="text-sm font-medium">
                        ⭐ {rating.toFixed(1)}{" "}
                        <span className="text-muted-foreground">({reviewCount} voyages)</span>
                    </p>
                ) : (
                    <p className="text-sm font-medium text-indigo-600">Nouvelle annonce</p>
                )}

                {/* Localisation */}
                {car?.localisation && (
                    <p className="text-sm text-muted-foreground truncate">
                        📍 {car.localisation}
                    </p>
                )}

                {/* Prix */}
                {price && (
                    <p className="text-base font-semibold mt-1">
                        {price}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
