import React from "react";
import { Car, Menu, X, LogIn, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-[300] bg-background/90 backdrop-blur border-b border-border">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3 relative">
                {/* Menu burger mobile à gauche  */}
                <div className="md:hidden absolute left-4">
                    <MobileMenu />
                </div>

                {/* Brand  */}
                <a
                    href="/"
                    className="flex items-center justify-center gap-1 min-w-0 shrink-0 mx-auto md:mx-0 translate-x-[18px]"
                >
          <span className="inline-grid place-items-center h-11 w-11 md:h-10 md:w-10 rounded-lg bg-primary/10">
            <Car className="h-6 w-6 md:h-5 md:w-5 text-primary" />
          </span>
                    <span className="text-2xl md:text-2xl font-extrabold tracking-tight text-foreground truncate">
            Parti
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Kar
            </span>
          </span>
                </a>

                {/*  Nav desktop  */}
                <nav className="hidden md:flex items-center gap-8 text-sm min-w-0">
                    <a
                        href="/#how"
                        className="text-muted-foreground hover:text-foreground transition whitespace-nowrap"
                    >
                        Comment ça marche
                    </a>
                    <a
                        href="/#popular"
                        className="text-muted-foreground hover:text-foreground transition whitespace-nowrap"
                    >
                        Voitures
                    </a>
                    <a
                        href="/#trust"
                        className="text-muted-foreground hover:text-foreground transition whitespace-nowrap"
                    >
                        Confiance
                    </a>
                </nav>

                {/*  Actions desktop  */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {/* Publier une voiture */}
                    <Button asChild variant="outline" className="h-10 px-5">
                        <a href="/publish" className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            <span>Publier une voiture</span>
                        </a>
                    </Button>

                    {/* Se connecter (bouton principal) */}
                    <Button asChild variant="brand" className="h-10 px-5">
                        <a href="/login" className="flex items-center gap-2">
                            <LogIn className="h-4 w-4" />
                            <span>Se connecter</span>
                        </a>
                    </Button>
                </div>

                {/* Placeholder droite pour centrer visuellement */}
                <div className="md:hidden w-10" />
            </div>
        </header>
    );
}

/* == Menu latéral mobile (Sheet à gauche) == */
function MobileMenu() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-10 px-3">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="w-[88vw] sm:w-[360px] p-0 border-r border-border"
            >
                <SheetHeader className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
              <span className="inline-grid place-items-center h-9 w-9 rounded-lg bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </span>
                            <span className="font-extrabold text-lg">
                Parti
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Kar
                </span>
              </span>
                        </SheetTitle>
                        <SheetClose asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Fermer</span>
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                {/*  Liens de navigation  */}
                <nav className="p-4">
                    <ul className="grid gap-1">
                        <li>
                            <SheetClose asChild>
                                <a
                                    href="/#how"
                                    className="block rounded-md px-3 py-2 text-foreground/90 hover:bg-muted"
                                >
                                    Comment ça marche
                                </a>
                            </SheetClose>
                        </li>
                        <li>
                            <SheetClose asChild>
                                <a
                                    href="/#popular"
                                    className="block rounded-md px-3 py-2 text-foreground/90 hover:bg-muted"
                                >
                                    Voitures
                                </a>
                            </SheetClose>
                        </li>
                        <li>
                            <SheetClose asChild>
                                <a
                                    href="/#trust"
                                    className="block rounded-md px-3 py-2 text-foreground/90 hover:bg-muted"
                                >
                                    Confiance
                                </a>
                            </SheetClose>
                        </li>
                    </ul>

                    {/*  Actions  */}
                    <div className="mt-4 grid gap-2">
                        {/* Publier une voiture */}
                        <SheetClose asChild>
                            <Button asChild variant="outline" className="h-11">
                                <a
                                    href="/publish"
                                    className="flex items-center justify-center gap-2"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                    <span>Publier une voiture</span>
                                </a>
                            </Button>
                        </SheetClose>

                        {/* Se connecter (bouton principal) */}
                        <SheetClose asChild>
                            <Button asChild variant="brand" className="h-11">
                                <a href="/login" className="flex items-center justify-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    <span>Se connecter</span>
                                </a>
                            </Button>
                        </SheetClose>
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
