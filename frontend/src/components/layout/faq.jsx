import React from "react";

export default function Faq() {
    const faqs = [
        {
            q: "Comment fonctionne la location sur PartiKar ?",
            a: "C’est simple : vous recherchez une voiture disponible près de chez vous, choisissez vos dates, puis réservez directement sur la plateforme. Le propriétaire valide la réservation, et vous pouvez récupérer la voiture le jour convenu.",
        },
        {
            q: "Comment fonctionne l’assurance ?",
            a: "Chaque location est couverte par notre partenaire d’assurance pendant toute la durée du trajet. En cas d’incident, une assistance 24h/24 et 7j/7 est disponible pour vous accompagner.",
        },
        {
            q: "Puis-je annuler ma réservation ?",
            a: "Oui. Vous pouvez annuler à tout moment depuis votre espace personnel. Les conditions (gratuites ou payantes) dépendent du délai restant avant le début de la location et sont toujours indiquées avant la confirmation.",
        },
        {
            q: "Comment sont vérifiés les profils ?",
            a: "Chaque utilisateur doit fournir une pièce d’identité et un permis de conduire valide. Ces documents sont contrôlés manuellement ou via des systèmes d’authentification automatisés pour garantir la fiabilité des membres.",
        },
        {
            q: "Que faire en cas de panne ou d’accident ?",
            a: "Contactez immédiatement notre service d’assistance via l’application ou par téléphone. Nous vous guiderons pas à pas et, si nécessaire, un dépannage ou un véhicule de remplacement vous sera proposé.",
        },
        {
            q: "Comment publier ma voiture ?",
            a: "Depuis la page “Publier une voiture”, remplissez le formulaire avec les informations du véhicule, quelques photos et vos disponibilités. En quelques minutes, votre voiture sera visible pour les locataires près de chez vous.",
        },
    ];

    return (
        <section id="faq" className="py-16 md:py-24 border-t border-border bg-card/30">
            <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
                    Questions fréquentes
                </h2>
                <p className="text-muted-foreground text-center mt-2 mb-10">
                    Tout ce qu’il faut savoir pour louer ou partager une voiture en toute
                    confiance sur PartiKar.
                </p>

                <div className="grid gap-4">
                    {faqs.map((item, i) => (
                        <details
                            key={i}
                            className="group rounded-xl border border-border bg-card px-5 py-4 transition hover:shadow-md open:shadow-brand-sm"
                        >
                            <summary className="cursor-pointer flex items-center justify-between font-medium select-none text-left">
                                {item.q}
                                {/* Icône : + par défaut, – quand ouvert */}
                                <span className="text-primary font-bold text-lg transition-transform group-open:rotate-0">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">–</span>
                </span>
                            </summary>
                            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                                {item.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
