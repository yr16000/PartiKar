import React from "react"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border">
            <div className="mx-auto w-full max-w-[1200px] px-6 py-12">
                {/* Haut du footer */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Logo + description */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
                                <Car className="h-4 w-4" />
                            </div>
                            <span className="text-xl font-bold text-foreground">
                Parti
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Kar
                </span>
              </span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                            Location de voitures entre particuliers, simple, sûre et flexible
                            partout en France.
                        </p>
                        <div className="mt-4">
                            <Button asChild variant="brand">
                                <a href="/register">Commencer</a>
                            </Button>
                        </div>
                    </div>

                    {/* Découvrir */}
                    <div>
                        <p className="font-semibold text-foreground">Découvrir</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#how" className="hover:text-foreground transition-colors">
                                    Comment ça marche
                                </a>
                            </li>
                            <li>
                                <a href="#popular" className="hover:text-foreground transition-colors">
                                    Voitures populaires
                                </a>
                            </li>
                            <li>
                                <a href="#trust" className="hover:text-foreground transition-colors">
                                    Confiance & sécurité
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Propriétaires */}
                    <div>
                        <p className="font-semibold text-foreground">Propriétaires</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Publier une annonce
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Tarification & paiements
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Assurance & assistance
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* À propos */}
                    <div>
                        <p className="font-semibold text-foreground">À propos</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Notre mission
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Presse
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bas du footer */}
                <div className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>© {new Date().getFullYear()} PartiKar — Tous droits réservés.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-foreground transition-colors">
                            CGU
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Confidentialité
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
