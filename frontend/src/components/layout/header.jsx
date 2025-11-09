import React, { useEffect, useState } from "react";
import { Menu, X, LogIn, PlusCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import {
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from "@/components/ui/sheet";

//  shadcn dropdown & avatar
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
    // Anti-flash: on lit le token dès l'init (pas après le premier render)
    const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem("token"));
    const [user, setUser] = useState({ prenom: "", nom: "", avatarUrl: "" });

    // Optionnel: récupérer le profil si token présent (léger, silencieux)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { setIsAuth(false); setUser({ prenom: "", nom: "", avatarUrl: "" }); return; }

        // petite requête pour avoir le nom/initiales si dispo
        fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
            .then(r => (r.status === 401 ? null : r))
            .then(async (r) => {
                if (!r) { localStorage.removeItem("token"); setIsAuth(false); return; }
                if (!r.ok) return; // évite de casser le header
                const data = await r.json();
                setUser({
                    prenom: data?.prenom || "",
                    nom: data?.nom || "",
                    avatarUrl: data?.avatarUrl || "",
                });
                setIsAuth(true);
            })
            .catch(() => {});
    }, []);

    // Réagir aux changements de connexion (autres onglets / après login/logout)
    useEffect(() => {
        const onStorage = (e) => { if (e.key === "token") setIsAuth(!!e.newValue); };
        const onAuthChanged = () => setIsAuth(!!localStorage.getItem("token"));
        window.addEventListener("storage", onStorage);
        window.addEventListener("auth:changed", onAuthChanged);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("auth:changed", onAuthChanged);
        };
    }, []);

    const initials = makeInitials(user.prenom, user.nom);

    function handleLogout() {
        localStorage.removeItem("token");
        fetch("/api/auth/logout", { method: "POST", credentials: "include" }).finally(() => {
            setIsAuth(false);
            setUser({ prenom: "", nom: "", avatarUrl: "" });
            // notifier le reste de l'app si besoin
            window.dispatchEvent(new Event("auth:changed"));
        });
    }

    return (
        <header className="sticky top-0 z-[300] bg-background/90 backdrop-blur border-b border-border">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3 relative">

                {/* Burger mobile à gauche */}
                <div className="md:hidden absolute left-4 top-1/2 -translate-y-1/2">
                    <MobileMenu />
                </div>

                {/* Brand */}
                <a
                    href="/"
                    className="absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0 flex items-center justify-center gap-1 min-w-0 shrink-0"
                    aria-label="PartiKar - Accueil"
                >
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground truncate">
            Parti<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Kar</span>
          </span>
                </a>

                {/* Nav desktop */}
                <nav className="hidden md:flex items-center gap-8 text-[13px] md:text-[14px] min-w-0 font-medium">
                    <HashLink smooth to="/#how" className="text-muted-foreground hover:text-foreground transition whitespace-nowrap">Comment ça marche</HashLink>
                    <a href="/#popular" className="text-muted-foreground hover:text-foreground transition whitespace-nowrap">Voitures</a>
                    <a href="/#trust" className="text-muted-foreground hover:text-foreground transition whitespace-nowrap">Confiance</a>
                </nav>

                {/* Actions droite (desktop + mobile) */}
                <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                    <Button asChild variant="outline" className="h-10 px-5 hidden md:flex">
                        <a href={isAuth ? "/publish" : "/login"} className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            <span>Publier une voiture</span>
                        </a>
                    </Button>

                    {/* Condition : si connecté → avatar; sinon → bouton login */}
                    {isAuth ? (
                        <UserDropdown
                            initials={initials}
                            avatarUrl={user.avatarUrl}
                            fullName={(user.prenom || "") + (user.nom ? ` ${user.nom}` : "")}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <Button asChild variant="brand" className="h-10 px-5">
                            <Link to="/login" className="flex items-center gap-2">
                                <LogIn className="h-4 w-4" />
                                <span>Se connecter</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

/* Dropdown avatar (z-index élevé pour passer devant le header) */
function UserDropdown({ initials, avatarUrl, fullName, onLogout }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* mobile & desktop: avatar à droite */}
                <button className="relative inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-border focus:outline-none">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl || ""} alt="Avatar" />
                        {/* Brand color inside */}
                        <AvatarFallback className="bg-primary text-white font-semibold">
                            {initials || <User className="h-4 w-4 opacity-90" />}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            {/* z super élevé pour éviter le header/backdrop */}
            <DropdownMenuContent
                align="end"
                className="z-[9999] w-56 sm:w-64 border-border"
            >
                {fullName?.trim() ? <DropdownMenuLabel>{fullName}</DropdownMenuLabel> : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile">Profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/publish">Publier une voiture</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* Menu latéral mobile existant */
function MobileMenu() {
    // Lire l'état d'authentification depuis localStorage
    const isAuth = !!localStorage.getItem("token");

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-10 px-3">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[88vw] sm:w-[360px] p-0 border-r border-border">
                <SheetHeader className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="font-extrabold text-2xl">
                            Parti<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Kar</span>
                        </SheetTitle>
                        <SheetClose asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Fermer</span>
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                <nav className="p-4">
                    <ul className="grid gap-1">
                        <li><SheetClose asChild><a href="/#how" className="block rounded-md px-3 py-2 text-foreground/90 hover:bg-muted">Comment ça marche</a></SheetClose></li>
                        <li><SheetClose asChild><a href="/#popular" className="block rounded-md px-3 py-2 text-foreground/90 hover:bg-muted">Voitures</a></SheetClose></li>
                        <li><SheetClose asChild><HashLink smooth to="/#trust" className="block rounded-md px-3 py-2 text-foreground/90 hover:bg-muted">Confiance</HashLink></SheetClose></li>
                    </ul>
                    <div className="mt-4 grid gap-2">
                        <SheetClose asChild>
                            <Button asChild variant="outline" className="h-11">
                                <Link to={isAuth ? "/publish" : "/login"} className="flex items-center justify-center gap-2">
                                    <PlusCircle className="h-5 w-5" />
                                    <span>Publier une voiture</span>
                                </Link>
                            </Button>
                        </SheetClose>
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

/* utils */
function makeInitials(p, n) {
    const a = (p || "").trim();
    const b = (n || "").trim();
    const i1 = a ? a[0].toUpperCase() : "";
    const i2 = b ? b[0].toUpperCase() : "";
    const res = (i1 + i2) || "";
    return res || "•";
}