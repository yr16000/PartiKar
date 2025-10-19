import { useState } from "react";

export default function Home() {
    const [city, setCity] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const onSearch = (e) => {
        e.preventDefault();
        console.log("Recherche :", { city, from, to });
    };

    return (
        <>
            {/* HEADER */}
            <header className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white">
                <div className="text-2xl font-bold">
                    Parti<span className="text-accent">Kar</span>
                </div>
                <nav className="hidden md:flex gap-6">
                    <a href="#how" className="nav-link">Comment ça marche</a>
                    <a href="#popular" className="nav-link">Voitures</a>
                    <a href="#trust" className="nav-link">Confiance</a>
                </nav>
                <div className="flex gap-3">
                    <button className="btn-outline">Connexion</button>
                    <button className="btn-primary">Inscription</button>
                </div>
            </header>

            {/* HERO */}
            <section className="text-center bg-gradient-to-b from-gray-50 to-white py-16">
                <div className="container-pk">
                    <h1 className="text-4xl font-bold">Location de voitures entre particuliers</h1>
                    <p className="text-gray-600 mt-2">
                        Rapide, simple et sécurisé. Trouve une voiture près de chez toi.
                    </p>

                    <form
                        className="grid grid-cols-1 sm:grid-cols-4 gap-2 max-w-2xl mx-auto mt-6"
                        onSubmit={onSearch}
                    >
                        <input
                            className="h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Ville (ex : Paris)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            className="h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                        <input
                            className="h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                        <button className="h-11 rounded-lg bg-accent text-white font-semibold hover:bg-[#4338ca]">
                            Rechercher
                        </button>
                    </form>

                    <small className="block text-gray-500 mt-2">
                        Astuce : essaye “Paris” pour tester
                    </small>
                </div>
            </section>

            {/* COMMENT ÇA MARCHE */}
            <section id="how" className="py-14 text-center">
                <div className="container-pk">
                    <h2 className="text-2xl font-semibold">Comment ça marche</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6">
                        <div className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
                            <h3 className="font-semibold text-accent mb-1">1. Cherche</h3>
                            <p className="text-gray-600">Entre une ville et des dates.</p>
                        </div>
                        <div className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
                            <h3 className="font-semibold text-accent mb-1">2. Réserve</h3>
                            <p className="text-gray-600">Paiement en ligne sécurisé.</p>
                        </div>
                        <div className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
                            <h3 className="font-semibold text-accent mb-1">3. Roule</h3>
                            <p className="text-gray-600">Récupère le véhicule et pars serein.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="text-center text-gray-500 border-t border-gray-200 py-6">
                © {new Date().getFullYear()} PartiKar — Tous droits réservés.
            </footer>
        </>
    );
}
