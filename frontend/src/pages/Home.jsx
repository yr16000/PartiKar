// javascript
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import DateRangePicker from "@/components/ui/DateRangePicker"

export default function Home() {
    const sampleCars = [
        { id: 1, title: "Compact électrique", price: "45€/j" },
        { id: 2, title: "SUV confortable", price: "78€/j" },
        { id: 3, title: "Cabriolet sport", price: "120€/j" },
    ]

    const [location, setLocation] = useState("")
    const [passengers, setPassengers] = useState("")
    const [range, setRange] = useState({ start: null, end: null })

    function handleSearch(e) {
        e.preventDefault()
        console.log("Recherche:", { location, passengers, range })
        // TODO: lancer la recherche réelle / navigation vers les résultats
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl font-extrabold mb-3">
                        <span className="text-slate-900">Parti</span>
                        <span className="text-primary">Kar</span>
                    </h1>
                    <p className="text-gray-700 mb-6">
                        Louez des voitures uniques près de chez vous — rapides à réserver, faciles à rendre.
                    </p>

                    <div className="bg-white rounded-xl p-6 shadow-md inline-block w-full">
                        <form className="flex flex-col sm:flex-row gap-3 items-stretch" onSubmit={handleSearch}>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Où ? (ville, adresse)"
                                aria-label="Lieu"
                            />

                            <DateRangePicker
                                value={range}
                                onChange={({ start, end }) => setRange({ start, end })}
                            />

                            <input
                                value={passengers}
                                onChange={(e) => setPassengers(e.target.value)}
                                className="w-28 border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Personnes"
                                aria-label="Passagers"
                            />

                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 shadow" type="submit">
                                Rechercher
                            </Button>
                        </form>
                        <div className="text-sm text-gray-500 mt-3">Réservez en quelques clics — annulation flexible</div>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="w-full h-64 bg-gradient-to-br from-primary/85 to-primary/60 rounded-xl shadow-md flex items-center justify-center text-white">
                        <div className="max-w-xs text-center">
                            <div className="text-2xl font-bold">Roulez autrement</div>
                            <p className="mt-2 opacity-90">Choisissez parmi une sélection vérifiée de véhicules.</p>
                            <div className="mt-4">
                                <Button className="bg-white text-primary rounded-full px-5 py-2">Découvrir</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="max-w-6xl mx-auto px-6 py-8">
                <h2 className="text-2xl font-semibold mb-4">Véhicules populaires</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleCars.map((car) => (
                        <article key={car.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                            <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
                                Photo véhicule
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{car.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">Propriétaire vérifié · 4.8⭐</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-lg font-bold">{car.price}</div>
                                <Button className="bg-primary text-primary-foreground rounded-full px-4 py-2">
                                    Voir
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
