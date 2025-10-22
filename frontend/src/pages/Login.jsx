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

    // Champs communs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Champs inscription
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [dateNaissance, setDateNaissance] = useState(""); // JJ/MM/AAAA

    // UI
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const title = useMemo(
        () => (mode === "login" ? "Connexion" : "Créer un compte"),
        [mode]
    );

    // Auto-format JJ/MM/AAAA + filtrage des caractères non numériques
    function handleBirthdateChange(e) {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 8); // max 8 chiffres
        let formatted = digits;
        if (digits.length >= 3 && digits.length <= 4) {
            formatted = digits.slice(0, 2) + "/" + digits.slice(2);
        } else if (digits.length >= 5) {
            formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
        }
        setDateNaissance(formatted);
    }

    // Vérifie format + date réelle (calendrier, bissextile, etc.)
    function isValidBirthdate(jjmmaaaa) {
        // Format strict
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(jjmmaaaa);
        if (!m) return false;
        const jj = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const yyyy = parseInt(m[3], 10);

        // Bornes basiques
        if (mm < 1 || mm > 12) return false;
        if (yyyy < 1900 || yyyy > new Date().getFullYear()) return false;

        // Nombre de jours par mois (bissextile géré)
        const isLeap = (yyyy % 4 === 0 && yyyy % 100 !== 0) || yyyy % 400 === 0;
        const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (jj < 1 || jj > daysInMonth[mm - 1]) return false;

        // Optionnel: empêcher dates futures
        const d = new Date(yyyy, mm - 1, jj);
        const today = new Date();
        if (d > today) return false;

        return true;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

            if (mode === "register") {
                // Vérifs frontend de base
                if (!nom || !prenom || !dateNaissance || !email || !password) {
                    throw new Error("Merci de remplir tous les champs obligatoires.");
                }
                if (!isValidBirthdate(dateNaissance)) {
                    throw new Error("La date de naissance est invalide (utilise JJ/MM/AAAA).");
                }
            }

            const payload =
                mode === "login"
                    ? { email, password }
                    : { nom, prenom, dateNaissance, email, password };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // cookies HttpOnly (JWT côté serveur)
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let message = "Une erreur est survenue. Réessaie.";
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                } catch {}
                throw new Error(message);
            }

            // Succès : redirection (à adapter)
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

                        {/* Segmented control */}
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
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="mb-1 block text-sm">Nom</Label>
                                            <Input
                                                type="text"
                                                placeholder="Dupont"
                                                autoComplete="family-name"
                                                value={nom}
                                                onChange={(e) => setNom(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-1 block text-sm">Prénom</Label>
                                            <Input
                                                type="text"
                                                placeholder="Jean"
                                                autoComplete="given-name"
                                                value={prenom}
                                                onChange={(e) => setPrenom(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-1 block text-sm">
                                            Date de naissance
                                        </Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="JJ/MM/AAAA"
                                            value={dateNaissance}
                                            onChange={handleBirthdateChange}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <Label className="mb-1 block text-sm">Email</Label>
                                <Input
                                    type="email"
                                    placeholder="exemple@mail.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
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
                                    required
                                />
                            </div>

                            {err && <p className="text-destructive text-sm">{err}</p>}

                            <Button
                                type="submit"
                                variant="brand"
                                className="w-full h-11"
                                disabled={loading}
                            >
                                {loading
                                    ? mode === "login"
                                        ? "Connexion..."
                                        : "Création..."
                                    : mode === "login"
                                        ? "Se connecter"
                                        : "Créer un compte"}
                            </Button>

                            {mode === "login" && (
                                <div className="text-right">
                                    <a
                                        href="/reset-password"
                                        className="text-primary text-sm hover:underline"
                                    >
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
