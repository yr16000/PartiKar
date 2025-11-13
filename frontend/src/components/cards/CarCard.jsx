import React from "react";
import { Card, CardTitle, CardContent } from "../ui/card";
import { MapPin, Star } from "lucide-react";

const FALLBACK =
    "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop";

export default function CarCard({ car }) {
    const title = `${car?.marque ?? ""} ${car?.modele ?? ""}`.trim() || "Voiture";
    const subtitle = car?.annee ? String(car.annee) : "";
    const imageUrl = car?.imageUrl || FALLBACK;
    const price = car?.prixParJour ? `${car.prixParJour}€ / jour` : "";

    // Note du propriétaire (les données viennent du backend avec le préfixe "proprietaire")
    const ownerRating = car?.proprietaireMoyenneAvis;
    const ownerReviewCount = car?.proprietaireNbAvis;

    const hasRating =
        typeof ownerRating === "number" && Number.isFinite(ownerRating) && ownerRating > 0;
    const hasReviews =
        typeof ownerReviewCount === "number" &&
        Number.isFinite(ownerReviewCount) &&
        ownerReviewCount > 0;

    // Masquer complètement l'annonce si elle est entièrement réservée (plus de dates disponibles)
    // Cela s'applique UNIQUEMENT sur la page d'accueil (pas dans "Mes annonces")
    const isFullyBooked = car?.nbJoursDisponibles === 0;

    if (isFullyBooked) {
        return null; // Ne pas afficher l'annonce sur l'accueil
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 rounded-2xl p-0 cursor-pointer border-border/50 hover:border-primary/30">
            {/* IMAGE (plus grande) */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted rounded-b-none relative">
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => (e.currentTarget.src = FALLBACK)}
                    loading="lazy"
                />
            </div>

            <CardContent className="pt-4 pb-4 px-4 space-y-2.5">
                {/* TITRE */}
                <CardTitle className="text-lg font-semibold leading-tight truncate">
                    {title} {subtitle && <span className="text-muted-foreground font-normal">{subtitle}</span>}
                </CardTitle>

                {/* AVIS DU PROPRIÉTAIRE */}
                {hasRating && hasReviews ? (
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            {ownerRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            ({ownerReviewCount} avis)
                        </span>
                    </div>
                ) : (
                    <p className="text-sm font-medium text-primary">Nouveau propriétaire</p>
                )}

                {/* Localisation */}
                {car?.localisation && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <p className="text-sm truncate">
                            {car.localisation}
                        </p>
                    </div>
                )}

                {/* Prix */}
                {price && (
                    <div className="pt-1 border-t border-border/50">
                        <p className="text-lg font-bold text-foreground">
                            {price}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
