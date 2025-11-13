// src/components/layout/footer.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border">
            <div className="mx-auto w-full max-w-[1200px] px-6 py-12">
                {/* Haut du footer */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Logo + description */}
                    <div>
                        <div className="flex items-center gap-3">
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
                    </div>

                    {/* Découvrir */}
                    <div>
                        <p className="font-semibold text-foreground">Découvrir</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <HashLink
                                    smooth
                                    to="/#how"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Comment ça marche
                                </HashLink>
                            </li>
                            <li>
                                <HashLink
                                    smooth
                                    to="/#popular"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Voitures populaires
                                </HashLink>
                            </li>
                            <li>
                                <HashLink
                                    smooth
                                    to="/#trust"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Confiance et sécurité
                                </HashLink>
                            </li>
                        </ul>
                    </div>

                    {/* Propriétaires */}
                    <div>
                        <p className="font-semibold text-foreground">Propriétaires</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    to="/publish"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Publier une annonce
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Autres liens */}
                    <div>
                        <p className="font-semibold text-foreground">Liens utiles</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    to="/search"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Rechercher
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Se connecter
                                </Link>
                            </li>
                            <li>
                                <HashLink
                                    smooth
                                    to="/#faq"
                                    className="hover:text-foreground transition-colors"
                                >
                                    FAQ
                                </HashLink>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bas du footer */}
                <div className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>© {new Date().getFullYear()} PartiKar — Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
