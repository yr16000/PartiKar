import React, { useState } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CarFront, Calendar } from "lucide-react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";

export default function Publish() {
    const [form, setForm] = useState({
        marque: "",
        modele: "",
        immatriculation: "",
        annee: "",
        prixJour: "",
        ville: "",
        imageUrl: "",
    });

    const [erreur, setErreur] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Liste dynamique des années (1900 → année actuelle)
    const currentYear = new Date().getFullYear();
    const annees = Array.from({ length: currentYear - 1899 }, (_, i) => (currentYear - i).toString());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur("");
        setSuccess(false);

        // Vérifications simples côté frontend
        for (const [key, value] of Object.entries(form)) {
            if (!value) {
                return setErreur("Tous les champs sont obligatoires.");
            }
        }
        if (isNaN(Number(form.prixJour)) || form.prixJour <= 0) {
            return setErreur("Le prix par jour doit être un nombre positif.");
        }

        // Simulation locale (aucune requête réseau)
        try {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("🚗 Données soumises :", form);

            setSuccess(true);
            setForm({
                marque: "",
                modele: "",
                immatriculation: "",
                annee: "",
                prixJour: "",
                ville: "",
                imageUrl: "",
            });
        } catch (err) {
            setErreur("Erreur de simulation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />

            <section className="flex-1 flex items-center justify-center py-16 px-4">
                <Card className="w-full max-w-2xl border border-border bg-card shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
                                <CarFront className="h-5 w-5" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Publier une voiture</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                            Renseignez les informations de votre véhicule pour le mettre en location.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Marque & Modèle */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="block mb-2 text-sm font-medium">Marque *</Label>
                                    <Input
                                        name="marque"
                                        required
                                        value={form.marque}
                                        onChange={handleChange}
                                        placeholder="Renault"
                                    />
                                </div>
                                <div>
                                    <Label className="block mb-2 text-sm font-medium">Modèle *</Label>
                                    <Input
                                        name="modele"
                                        required
                                        value={form.modele}
                                        onChange={handleChange}
                                        placeholder="Clio"
                                    />
                                </div>
                            </div>

                            {/* Immatriculation & Année */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="block mb-2 text-sm font-medium">Immatriculation *</Label>
                                    <Input
                                        name="immatriculation"
                                        required
                                        placeholder="AA-123-BB"
                                        value={form.immatriculation}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label className="block mb-2 text-sm font-medium">Année *</Label>

                                    {/* Sélecteur d’année shadcn */}
                                    {/* Sélecteur d’année shadcn (sans recherche, vers le bas) */}
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-11"
                                            >
                                                {form.annee ? (
                                                    form.annee
                                                ) : (
                                                    <span className="text-muted-foreground">Choisir une année</span>
                                                )}
                                                <Calendar className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[280px] p-0"
                                            side="bottom"     // ✅ force l’ouverture vers le bas
                                            align="start"     // ✅ aligne à gauche du bouton
                                        >
                                            <Command>
                                                {/* Supprimé le champ de recherche */}
                                                <CommandList>
                                                    <CommandEmpty>Aucune année trouvée</CommandEmpty>
                                                    <CommandGroup>
                                                        {annees.map((year) => (
                                                            <CommandItem
                                                                key={year}
                                                                onSelect={() => {
                                                                    setForm((prev) => ({ ...prev, annee: year }));
                                                                    setOpen(false);
                                                                }}
                                                            >
                                                                {year}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                </div>
                            </div>

                            {/* Prix et Ville */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="block mb-2 text-sm font-medium">Prix par jour (€) *</Label>
                                    <Input
                                        name="prixJour"
                                        type="number"
                                        required
                                        placeholder="50"
                                        value={form.prixJour}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label className="block mb-2 text-sm font-medium">Ville *</Label>
                                    <Input
                                        name="ville"
                                        required
                                        placeholder="Paris"
                                        value={form.ville}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Image */}
                            <div>
                                <Label className="block mb-2 text-sm font-medium">Lien de l’image *</Label>
                                <Input
                                    name="imageUrl"
                                    required
                                    placeholder="https://exemple.com/ma-voiture.jpg"
                                    value={form.imageUrl}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Messages */}
                            {erreur && <p className="text-destructive text-sm">{erreur}</p>}
                            {success && (
                                <p className="text-green-600 text-sm">✅ Voiture publiée avec succès (simulation)</p>
                            )}

                            {/* Bouton */}
                            <Button type="submit" variant="brand" className="w-full h-11" disabled={loading}>
                                {loading ? "Publication..." : "Publier la voiture"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <Footer />
        </main>
    );
}
