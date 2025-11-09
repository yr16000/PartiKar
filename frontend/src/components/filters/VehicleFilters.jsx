// src/components/filters/VehicleFilters.jsx
// Composant de filtres pour la recherche de véhicules
// Exemple d'utilisation des constantes centralisées

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BrandAutocomplete from "@/components/ui/BrandAutocomplete";

// Import des constantes centralisées
import { 
    BRANDS, 
    CARBURANTS, 
    BOITES, 
    COULEURS,
    NB_PLACES,
    getYearRange,
    getModelesByMarque 
} from "@/constants/vehicleData";

export default function VehicleFilters({ onFilterChange }) {
    const [filters, setFilters] = useState({
        marque: "",
        modele: "",
        carburant: "",
        boiteVitesse: "",
        couleur: "",
        nbPlaces: "",
        anneeMin: "",
        anneeMax: "",
        prixMin: "",
        prixMax: "",
    });

    // Générer la plage d'années (1980 à année actuelle + 1)
    const annees = getYearRange(1980);

    // Obtenir les modèles disponibles pour la marque sélectionnée
    const modelesDisponibles = filters.marque ? getModelesByMarque(filters.marque) : [];

    const handleChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        
        // Si la marque change, réinitialiser le modèle
        if (name === "marque" && filters.marque !== value) {
            newFilters.modele = "";
        }
        
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleReset = () => {
        const emptyFilters = {
            marque: "",
            modele: "",
            carburant: "",
            boiteVitesse: "",
            couleur: "",
            nbPlaces: "",
            anneeMin: "",
            anneeMax: "",
            prixMin: "",
            prixMax: "",
        };
        setFilters(emptyFilters);
        onFilterChange?.(emptyFilters);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Filtres de recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Marque */}
                <div>
                    <Label htmlFor="marque">Marque</Label>
                    <BrandAutocomplete
                        value={filters.marque}
                        onChange={(v) => handleChange("marque", v)}
                        onSelect={(v) => handleChange("marque", v)}
                        options={BRANDS}
                        placeholder="Sélectionner une marque"
                    />
                </div>

                {/* Modèle */}
                {filters.marque && modelesDisponibles.length > 0 && (
                    <div>
                        <Label htmlFor="modele">Modèle</Label>
                        <Select
                            value={filters.modele}
                            onValueChange={(v) => handleChange("modele", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un modèle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Tous les modèles</SelectItem>
                                {modelesDisponibles.map((modele) => (
                                    <SelectItem key={modele} value={modele}>
                                        {modele}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Carburant */}
                <div>
                    <Label htmlFor="carburant">Type de carburant</Label>
                    <Select
                        value={filters.carburant}
                        onValueChange={(v) => handleChange("carburant", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un carburant" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tous</SelectItem>
                            {CARBURANTS.map((carburant) => (
                                <SelectItem key={carburant} value={carburant}>
                                    {carburant}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Boîte de vitesse */}
                <div>
                    <Label htmlFor="boiteVitesse">Boîte de vitesse</Label>
                    <Select
                        value={filters.boiteVitesse}
                        onValueChange={(v) => handleChange("boiteVitesse", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une boîte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Toutes</SelectItem>
                            {BOITES.map((boite) => (
                                <SelectItem key={boite} value={boite}>
                                    {boite}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Couleur */}
                <div>
                    <Label htmlFor="couleur">Couleur</Label>
                    <Select
                        value={filters.couleur}
                        onValueChange={(v) => handleChange("couleur", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une couleur" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Toutes</SelectItem>
                            {COULEURS.map((couleur) => (
                                <SelectItem key={couleur} value={couleur}>
                                    {couleur}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Nombre de places */}
                <div>
                    <Label htmlFor="nbPlaces">Nombre de places</Label>
                    <Select
                        value={filters.nbPlaces}
                        onValueChange={(v) => handleChange("nbPlaces", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tous</SelectItem>
                            {NB_PLACES.map((nb) => (
                                <SelectItem key={nb} value={nb.toString()}>
                                    {nb} places
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Année */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="anneeMin">Année min</Label>
                        <Select
                            value={filters.anneeMin}
                            onValueChange={(v) => handleChange("anneeMin", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Min</SelectItem>
                                {annees.map((annee) => (
                                    <SelectItem key={annee} value={annee.toString()}>
                                        {annee}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="anneeMax">Année max</Label>
                        <Select
                            value={filters.anneeMax}
                            onValueChange={(v) => handleChange("anneeMax", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Max" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Max</SelectItem>
                                {annees.map((annee) => (
                                    <SelectItem key={annee} value={annee.toString()}>
                                        {annee}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Prix */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="prixMin">Prix min (€/jour)</Label>
                        <Input
                            id="prixMin"
                            type="number"
                            placeholder="Min"
                            value={filters.prixMin}
                            onChange={(e) => handleChange("prixMin", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="prixMax">Prix max (€/jour)</Label>
                        <Input
                            id="prixMax"
                            type="number"
                            placeholder="Max"
                            value={filters.prixMax}
                            onChange={(e) => handleChange("prixMax", e.target.value)}
                        />
                    </div>
                </div>

                {/* Bouton de réinitialisation */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                >
                    Réinitialiser les filtres
                </Button>
            </CardContent>
        </Card>
    );
}

