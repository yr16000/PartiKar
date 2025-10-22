// File: src/pages/Login.jsx
import React, { useMemo, useState } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";

export default function Login() {
    // "login" | "register"
    const [mode, setMode] = useState("login");

    // Champs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Champ supplémentaire pour l’inscription
    const [fullName, setFullName] = useState("");

    // UI
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const title = useMemo(
        () => (mode === "login" ? "Connexion" : "Créer un compte"),
        [mode]
    );

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const endpoint =
                mode === "login" ? "/api/auth/login" : "/api/auth/register";

            const payload =
                mode === "login"
                    ? { email, password }
                    : { fullName, email, password };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // envoie/reçoit les cookies HttpOnly (JWT côté serveur)
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // Essaie de lire un message d’erreur lisible
                let message = "Une erreur est survenue. Réessaie.";
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                } catch (_) {}
                throw new Error(message);
            }

            // Succès : redirige (ajuste la route selon ton app : /profile, /, etc.)
            window.location.href = mode === "login" ? "/profile" : "/publish";
        } catch (e) {
            setErr(e.message || "Erreur réseau");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />

            {/* SECTION FORM */}
            <section className="flex-1 flex items-center justify-center py-16 px-4">
                <Card className="w-full max-w-md border border-border bg-card shadow-brand-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
                                <Car className="h-5 w-5" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                            {mode === "login"
                                ? "Heureux de vous revoir."
                                : "Rejoignez PartiKar et commencez en quelques secondes."}
                        </p>

                        {/* Segmented control (pas de Tabs dans ton UI actuel) */}
                        <div className="mt-4 grid grid-cols-2 rounded-lg border border-border overflow-hidden">
                            <Button
                                type="button"
                                variant={mode === "login" ? "brand" : "ghost"}
                                className="rounded-none h-10"
                                onClick={() => setMode("login")}
                            >
                                Connexion
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "register" ? "brand" : "ghost"}
                                className="rounded-none h-10"
                                onClick={() => setMode("register")}
                            >
                                Inscription
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === "register" && (
                                <div>
                                    <Label className="mb-1 block text-sm">Nom complet</Label>
                                    <Input
                                        type="text"
                                        placeholder="Jean Dupont"
                                        autoComplete="name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <Label className="mb-1 block text-sm">Email</Label>
                                <Input
                                    type="email"
                                    placeholder="exemple@mail.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="mb-1 block text-sm">Mot de passe</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {err && (
                                <p className="text-destructive text-sm">{err}</p>
                            )}

                            <Button
                                type="submit"
                                variant="brand"
                                className="w-full h-11"
                                disabled={loading}
                            >
                                {loading
                                    ? (mode === "login" ? "Connexion..." : "Création...")
                                    : (mode === "login" ? "Se connecter" : "Créer un compte")}
                            </Button>

                            {mode === "login" && (
                                <div className="text-right">
                                    <a href="/reset-password" className="text-primary text-sm hover:underline">
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </section>

            <Footer />
        </main>
    );
}
