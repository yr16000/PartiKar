import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, User } from 'lucide-react';

/**
 * Composant pour afficher les avis d'un propriétaire
 * Affiche 5 avis à la fois avec pagination
 */
export default function OwnerReviews({ reviews = [], ownerName = "Propriétaire" }) {
    const [visibleCount, setVisibleCount] = useState(5);

    if (!reviews || reviews.length === 0) {
        return null;
    }

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = visibleCount < reviews.length;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (note) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= note
                                ? 'fill-primary text-primary'
                                : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getInitials = (prenom, nom) => {
        const p = (prenom || '').trim();
        const n = (nom || '').trim();
        if (!p && !n) return 'U';
        return `${p.charAt(0)}${n.charAt(0)}`.toUpperCase();
    };

    return (
        <section className="rounded-xl border bg-white p-6 space-y-6">
            <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                    Avis sur {ownerName}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                    {reviews.length} {reviews.length > 1 ? 'avis' : 'avis'}
                </div>
            </div>

            <div className="space-y-4">
                {visibleReviews.map((review, index) => (
                    <Card key={review.id || index} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border-2 border-primary/10">
                                        <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                                            {getInitials(review.auteurPrenom, review.auteurNom)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {review.auteurPrenom && review.auteurNom
                                                ? `${review.auteurPrenom} ${review.auteurNom}`
                                                : review.auteurPrenom || review.auteurNom || 'Utilisateur'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(review.creeLe)}
                                        </p>
                                    </div>
                                </div>
                                {renderStars(review.noteUtilisateur || 0)}
                            </div>
                        </CardHeader>

                        {review.commentaire && (
                            <CardContent className="pt-0">
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {review.commentaire}
                                </p>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="w-full sm:w-auto"
                    >
                        Afficher plus d'avis ({reviews.length - visibleCount} restant{reviews.length - visibleCount > 1 ? 's' : ''})
                    </Button>
                </div>
            )}
        </section>
    );
}

