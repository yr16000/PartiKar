import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/header.jsx";
import Footer from "../components/layout/footer.jsx";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    IdCard,
    Calendar,
    CreditCard,
    Car,
    LogOut,
    ShieldCheck,
    Pencil,
} from "lucide-react";

const redirectToLogin = () => window.location.replace("/login?next=/profile");

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🔒 garde d’accès
    useEffect(() => {
        if (!localStorage.getItem("token")) redirectToLogin();
    }, []);

    // initiales pour l’avatar
    const initials = useMemo(() => {
        const p = (user?.prenom || "").trim();
        const n = (user?.nom || "").trim();
        if (!p && !n) return "";
        return `${(p[0] || "").toUpperCase()}${(n[0] || "").toUpperCase()}`;
    }, [user]);

    // chargement profil
    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem("token");
            if (!token) return; // déjà redirigé

            try {
                const res = await fetch("/api/users/me", {
                    credentials: "include",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401) {
                    localStorage.removeItem("token");
                    redirectToLogin();
                    return;
                }
                if (!res.ok) {
                    redirectToLogin();
                    return;
                }

                const data = await res.json();
                setUser(data);
            } catch {
                redirectToLogin();
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        fetch("/api/auth/logout", { method: "POST", credentials: "include" }).finally(
            () => window.location.replace("/login")
        );
    }

    // état de chargement (sans Skeleton)
    if (loading) {
        return (
            <main className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <section className="flex-1 py-10 px-4">
                    <div className="mx-auto w-full max-w-5xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Chargement du profil…</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Merci de patienter, nous récupérons vos informations.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
                <Footer />
            </main>
        );
    }

    // sécurité : si pas d’utilisateur (edge), on redirige
    if (!user) {
        typeof window !== "undefined" && redirectToLogin();
        return null;
    }

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />

            <section className="flex-1 py-10 px-4">
                <div className="mx-auto w-full max-w-5xl space-y-8">
                    {/* --- HERO --- */}
                    <Card className="border border-border bg-card shadow-brand-md">
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-1 ring-border">
                                    <AvatarImage src={user?.avatarUrl || ""} alt="Avatar" />
                                    <AvatarFallback className="bg-muted">
                                        {initials || <UserIcon className="h-6 w-6 text-muted-foreground" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                        {fullName(user)}
                                    </h1>
                                    <div className="mt-2 flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            <span>Compte PartiKar</span>
                                        </div>
                                        <span className="hidden sm:inline">•</span>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>{user?.numeroPermis ? "Conducteur vérifié" : "Non vérifié"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" className="gap-2" onClick={() => alert("À venir : édition du profil")}>
                                        <Pencil className="h-4 w-4" />
                                        Modifier
                                    </Button>
                                    <Button variant="destructive" className="gap-2" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4" />
                                        Se déconnecter
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- CONTENU --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Infos perso */}
                        <Card className="lg:col-span-2">
                            <SectionHeader title="Informations personnelles" />
                            <CardContent>
                                <InfoGrid
                                    items={[
                                        { icon: <UserIcon className="h-4 w-4" />, label: "Nom", value: user?.nom },
                                        { icon: <UserIcon className="h-4 w-4" />, label: "Prénom", value: user?.prenom },
                                        { icon: <Mail className="h-4 w-4" />, label: "Email", value: user?.email },
                                        { icon: <Calendar className="h-4 w-4" />, label: "Date de naissance", value: formatDate(user?.dateDeNaissance) },
                                        { icon: <Phone className="h-4 w-4" />, label: "Téléphone", value: user?.telephone },
                                        { icon: <MapPin className="h-4 w-4" />, label: "Adresse", value: user?.adresse },
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        {/* Compte */}
                        <Card>
                            <SectionHeader title="Compte" />
                            <CardContent className="space-y-4">
                                <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Crédits" value={formatCredits(user?.credits)} />
                                <Separator />
                                <Button variant="secondary" className="w-full" onClick={() => alert("Historique à venir")}>
                                    Voir l’historique
                                </Button>
                                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                                    Se déconnecter
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Permis & conduite */}
                        <Card className="lg:col-span-3">
                            <SectionHeader title="Permis & conduite" />
                            <CardContent>
                                <InfoGrid
                                    cols="sm:grid-cols-3"
                                    items={[
                                        { icon: <IdCard className="h-4 w-4" />, label: "Numéro de permis", value: user?.numeroPermis },
                                        { icon: <Calendar className="h-4 w-4" />, label: "Expiration du permis", value: formatDate(user?.expirationPermis) },
                                        { icon: <Car className="h-4 w-4" />, label: "Statut conducteur", value: user?.numeroPermis ? "Vérifié" : "Non vérifié" },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

/*  sous-composants  */

function SectionHeader({ title, right }) {
    return (
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                {right}
            </div>
        </CardHeader>
    );
}

function InfoGrid({ items = [], cols = "sm:grid-cols-2" }) {
    return (
        <div className={`grid grid-cols-1 ${cols} gap-4`}>
            {items.map((it, i) => (
                <InfoRow key={i} icon={it.icon} label={it.label} value={it.value} />
            ))}
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="font-medium leading-tight">{value || "—"}</p>
            </div>
        </div>
    );
}

/*  helpers  */

function fullName(u) {
    if (!u) return "—";
    const p = u.prenom || "";
    const n = u.nom || "";
    const s = `${p} ${n}`.trim();
    return s || "—";
}

function formatDate(isoLike) {
    if (!isoLike) return "—";
    try {
        const d = new Date(isoLike);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("fr-FR");
    } catch {
        return "—";
    }
}

function formatCredits(c) {
    if (c == null) return "0 €";
    const n = Number(c);
    if (Number.isNaN(n)) return String(c);
    return `${n.toLocaleString("fr-FR")} €`;
}
