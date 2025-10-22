import React from "react";

export default function Faq() {
    const faqs = [
        {
            q: "Comment fonctionne l’assurance ?",
            a: "Chaque location est couverte pendant toute la durée du trajet, avec assistance disponible 24/7.",
        },
        {
            q: "Puis-je annuler ma réservation ?",
            a: "Oui. Les conditions d’annulation sont claires et affichées avant la confirmation.",
        },
        {
            q: "Comment sont vérifiés les profils ?",
            a: "Nous vérifions l’identité, le permis et les informations essentielles pour garantir la sécurité.",
        },
    ];

    return (
        <section id="faq" className="py-16 md:py-24 border-t border-border">
            <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
                    Questions fréquentes
                </h2>
                <div className="mt-8 grid gap-4">
                    {faqs.map((item, i) => (
                        <details
                            key={i}
                            className="group rounded-xl border border-border bg-card px-5 py-4 transition hover:shadow-sm"
                        >
                            <summary className="cursor-pointer flex items-center justify-between font-medium select-none">
                                {item.q}
                                <span className="text-primary transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-muted-foreground text-sm">{item.a}</p>
                        </details>
                    ))}
                </div>
                {/* Si tu veux la version shadcn: `npx shadcn@latest add accordion` puis remplacer par <Accordion> */}
            </div>
        </section>
    );
}