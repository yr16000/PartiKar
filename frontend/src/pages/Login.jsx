import React, { useMemo, useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";

export default function Login() {
    const [mode, setMode] = useState("login");
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const title = useMemo(
        () => (mode === "login" ? "Connexion" : "Créer un compte"),
        [mode]
    );

    function handleBirthdateChange(e) {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
        let formatted = digits;
        if (digits.length >= 3 && digits.length <= 4) {
            formatted = digits.slice(0, 2) + "/" + digits.slice(2);
        } else if (digits.length >= 5) {
            formatted =
                digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
        }
        setDateNaissance(formatted);
    }

    function isValidBirthdate(jjmmaaaa) {
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(jjmmaaaa);
        if (!m) return false;
        const [_, jj, mm, yyyy] = m.map(Number);
        if (mm < 1 || mm > 12) return false;
        const currentYear = new Date().getFullYear();
        if (yyyy < 1900 || yyyy > currentYear) return false;
        const isLeap = (yyyy % 4 === 0 && yyyy % 100 !== 0) || yyyy % 400 === 0;
        const daysInMonth = [
            31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
        ];
        if (jj < 1 || jj > daysInMonth[mm - 1]) return false;
        const d = new Date(yyyy, mm - 1, jj);
        return d <= new Date();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const endpoint =
                mode === "login" ? "/api/auth/login" : "/api/auth/register";

            let payload;
            if (mode === "login") {
                if (!email || !password)
                    throw new Error("Merci de remplir tous les champs.");
                payload = { email: email.trim().toLowerCase(), password };
            } else {
                if (!nom || !prenom || !dateNaissance || !email || !password)
                    throw new Error("Merci de remplir tous les champs.");
                if (!isValidBirthdate(dateNaissance))
                    throw new Error("Date de naissance invalide (JJ/MM/AAAA).");

                const [jj, mm, aaaa] = dateNaissance.split("/");
                payload = {
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                    dateDeNaissance: `${aaaa}-${mm}-${jj}`,
                    email: email.trim().toLowerCase(),
                    password,
                };
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let message = "Une erreur est survenue.";
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            // ✅ On lit le body et on stocke le token JWT
            const data = await res.json().catch(() => ({}));
            if (data && data.token) {
                localStorage.setItem("token", data.token);
            }

            // ✅ Redirection vers /profile pour login ET inscription
            window.location.href = "/profile";
        } catch (e) {
            setErr(e.message || "Erreur réseau");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />

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
                                : "Rejoignez PartiKar en quelques secondes."}
                        </p>

                        <div className="mt-4 grid grid-cols-2 rounded-lg border border-border overflow-hidden">
                            <Button
                                type="button"
                                variant={mode === "login" ? "brand" : "ghost"}
                                className="rounded-none h-10"
                                onClick={() => setMode("login")}
                                disabled={loading}
                            >
                                Connexion
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "register" ? "brand" : "ghost"}
                                className="rounded-none h-10"
                                onClick={() => setMode("register")}
                                disabled={loading}
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
                                                value={nom}
                                                onChange={(e) => setNom(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-1 block text-sm">Prénom</Label>
                                            <Input
                                                type="text"
                                                placeholder="Jean"
                                                value={prenom}
                                                onChange={(e) => setPrenom(e.target.value)}
                                                required
                                                disabled={loading}
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
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <Label className="mb-1 block text-sm">Email</Label>
                                <Input
                                    type="email"
                                    placeholder="exemple@mail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <Label className="mb-1 block text-sm">Mot de passe</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Doit contenir au moins 8 caractères.
                                </p>
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
