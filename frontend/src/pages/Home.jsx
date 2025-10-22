import React from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import Faq from "../components/layout/faq";
import Hero from "../components/layout/hero";


// shadcn/ui
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

// icônes
import {
    MapPin,
    Calendar as CalIcon,
    Car,
    Shield,
    Users,
    Star,
    CheckCircle,
    Crown,
} from "lucide-react";

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Hero />


            {/* COMMENT ÇA MARCHE */}
            <section id="how" className="py-16 md:py-24">
                <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        {/* Étapes */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-semibold text-center lg:text-left">
                                Comment ça marche
                            </h2>
                            <p className="text-muted-foreground mt-3 max-w-2xl text-lg text-center lg:text-left">
                                En trois étapes simples, tu réserves ton prochain trajet.
                            </p>

                            <div className="mt-10 grid gap-6">
                                {[
                                    {
                                        icon: <MapPin className="w-5 h-5" />,
                                        title: "1. Cherche",
                                        text: "Entre ton lieu et tes dates pour découvrir les véhicules autour de toi.",
                                    },
                                    {
                                        icon: <CalIcon className="w-5 h-5" />,
                                        title: "2. Réserve",
                                        text: "Paie en ligne en toute sécurité et reçois une confirmation instantanée.",
                                    },
                                    {
                                        icon: <Car className="w-5 h-5" />,
                                        title: "3. Roule",
                                        text: "Récupère la voiture à l’heure choisie et profite d’un trajet sereinement.",
                                    },
                                ].map((step, i) => (
                                    <Card
                                        key={i}
                                        className="border border-border bg-card shadow-sm hover:shadow-md transition"
                                    >
                                        <CardHeader className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                                                {step.icon}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold leading-tight">
                                                    {step.title}
                                                </CardTitle>
                                                <p className="text-muted-foreground text-sm mt-1">{step.text}</p>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </div>


                        {/* Image */}
                        {/* Image */}
                        <div className="relative mt-0 lg:mt-14 xl:mt-16">
                            <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                                <img
                                    src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1920&auto=format&fit=crop"
                                    alt="Location de voiture — expérience fluide"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>



                    </div>
                </div>
            </section>

            {/* CONFIANCE & SÉCURITÉ */}
            <section id="trust" className="py-20 bg-card border-t border-border">
                <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
                    <h2 className="text-3xl md:text-4xl font-semibold text-center">
                        Confiance & sécurité
                    </h2>
                    <p className="text-muted-foreground text-center mt-2 max-w-2xl mx-auto">
                        Chaque location est encadrée par une assurance complète, un support 24/7 et
                        des membres vérifiés.
                    </p>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: <Shield className="w-5 h-5" />,
                                title: "Assurance complète",
                                text: "Chaque trajet est couvert du départ au retour.",
                            },
                            {
                                icon: <Users className="w-5 h-5" />,
                                title: "Utilisateurs vérifiés",
                                text: "Tous les membres de la plateforme sont validés.",
                            },
                            {
                                icon: <Star className="w-5 h-5" />,
                                title: "Avis authentiques",
                                text: "Des retours réels pour t’aider à choisir sereinement.",
                            },
                            {
                                icon: <CheckCircle className="w-5 h-5" />,
                                title: "Annulation flexible",
                                text: "Des conditions simples et claires pour plus de liberté.",
                            },
                        ].map((item, i) => (
                            <Card
                                key={i}
                                className="rounded-2xl border border-border bg-gradient-to-b from-white to-secondary p-6 hover:shadow-lg transition"
                            >
                                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
                                    {item.icon}
                                </div>
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA HOST (Propriétaires) */}
            <section className="py-16 md:py-24 border-t border-border bg-card/50">
                <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
                    <Card className="bg-card shadow-brand-md">
                        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                                    <Crown className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                    Deviens hôte et fais rouler tes revenus
                                </h3>
                                <p className="text-muted-foreground mt-2">
                                    Publie ta voiture en quelques minutes et loue-la en toute sécurité aux conducteurs proches de chez toi.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Button variant="brand" className="h-11 px-6">
                                    Publier une voiture
                                </Button>
                                <Button variant="outline" className="h-11 px-6">
                                    En savoir plus
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
            <Faq />

            <Footer />
        </main>
    );
}
