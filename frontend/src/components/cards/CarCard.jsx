import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const FALLBACK =
    "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

/**
 * Props attendues (côté CarListing normalisé depuis AnnonceResponse):
 * {
 *   id, marque, modele, annee, imageUrl,
 *   moyenneAvis?, nbAvis?, localisation?
 * }
 */
export default function CarCard({ car }) {
    const title = `${car?.marque ?? ""} ${car?.modele ?? ""}`.trim() || "Voiture";
    const subtitle = car?.annee ? String(car.annee) : "";
    const imageUrl = car?.imageUrl || FALLBACK;

    const rating = car?.moyenneAvis;
    const reviewCount = car?.nbAvis;

    const hasRating =
        typeof rating === "number" && Number.isFinite(rating) && rating > 0;
    const hasReviews =
        typeof reviewCount === "number" &&
        Number.isFinite(reviewCount) &&
        reviewCount > 0;

    return (
        <Card className="overflow-hidden p-0 hover:shadow-md transition">
            {/* IMAGE */}
            <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = FALLBACK)}
                    loading="lazy"
                />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg font-semibold truncate">
                    {title}
                </CardTitle>
                {subtitle && (
                    <div className="text-sm text-muted-foreground">{subtitle}</div>
                )}
            </CardHeader>

            <CardContent className="pb-5 space-y-1">
                {/* Ligne AVIS / NOUVELLE ANNONCE — au-dessus de la localisation */}
                {hasRating && hasReviews ? (
                    <p className="text-sm">⭐ {rating.toFixed(1)} <span className="text-muted-foreground">({reviewCount} avis)</span></p>
                ) : (
                    <p className="text-sm">Nouvelle annonce</p>
                )}

                {/* Localisation */}
                {car?.localisation && (
                    <p className="text-sm text-muted-foreground truncate">
                        📍 {car.localisation}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
