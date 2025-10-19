import { useState } from "react";
import DateRangePicker from "../components/DateRangePicker";

export default function Home() {
    const [city, setCity] = useState("");
    const [dates, setDates] = useState({
        from: undefined,
        to: undefined,
        fromTime: "10:00",
        toTime: "10:00",
    });

    function onSearch(e) {
        e.preventDefault();
        console.log("Recherche :", { city, ...dates });
    }

    return (
        <main className="min-h-screen bg-white text-gray-900">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
                <div className="mx-auto w-[min(1440px,94vw)] px-6 flex h-20 items-center justify-between">
                    <a className="text-3xl font-extrabold tracking-tight">
                        Parti<span className="text-accent">Kar</span>
                    </a>

                    <nav className="hidden lg:flex items-center gap-12 text-lg">
                        <a href="#how" className="nav-link">Comment ça marche</a>
                        <a href="#popular" className="nav-link">Voitures</a>
                        <a href="#trust" className="nav-link">Confiance</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="btn-outline h-11 px-5 text-base">Connexion</button>
                        <button className="btn-primary h-11 px-6 text-base">Inscription</button>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="bg-gradient-to-b from-gray-50 to-white">
                <div className="mx-auto w-[min(1200px,92vw)] px-6 py-24 lg:py-28 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-[980px] mx-auto">
                        Loue une voiture entre particuliers, partout en France
                    </h1>
                    <p className="mt-5 text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
                        Trouve le véhicule parfait près de toi, avec des prix abordables et une réservation instantanée.
                    </p>

                    {/* FORM */}
                    <form
                        onSubmit={onSearch}
                        className="mx-auto mt-12 grid w-[min(1100px,96vw)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_3fr_1.2fr] xl:grid-cols-[2fr_4fr_1fr] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
                    >
                        <label className="flex flex-col gap-1 text-left">
                            <span className="text-sm text-gray-600">Lieu</span>
                            <input
                                className="h-12 rounded-lg border border-gray-300 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Ville, aéroport, adresse…"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </label>

                        <div className="sm:col-span-1">
                            <span className="sr-only">Dates</span>
                            <DateRangePicker value={dates} onChange={setDates} />
                        </div>

                        <div className="flex items-end">
                            <button className="h-12 w-full rounded-lg bg-accent text-white text-lg font-semibold hover:bg-[#4338ca] transition">
                                Rechercher
                            </button>
                        </div>
                    </form>

                    <small className="mt-4 block text-gray-500 text-sm">
                        Astuce : essaie “Paris” pour tester
                    </small>
                </div>
            </section>

            {/* COMMENT ÇA MARCHE */}
            <section id="how" className="py-28">
                <div className="mx-auto w-[min(1200px,92vw)] px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-semibold">Comment ça marche</h2>
                    <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-lg">
                        En trois étapes simples, tu réserves ton prochain trajet.
                    </p>

                    <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
                        <div className="p-8 border rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition">
                            <h3 className="font-semibold text-accent text-xl mb-2">1. Cherche</h3>
                            <p className="text-gray-600">Saisis un lieu et des dates, découvre les véhicules disponibles autour de toi.</p>
                        </div>
                        <div className="p-8 border rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition">
                            <h3 className="font-semibold text-accent text-xl mb-2">2. Réserve</h3>
                            <p className="text-gray-600">Paie en ligne en toute sécurité, reçois ta confirmation immédiate.</p>
                        </div>
                        <div className="p-8 border rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition">
                            <h3 className="font-semibold text-accent text-xl mb-2">3. Roule</h3>
                            <p className="text-gray-600">Récupère la voiture à l’heure choisie et profite de ton trajet sereinement.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-gray-200">
                <div className="mx-auto w-[min(1200px,92vw)] px-6 py-10 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} PartiKar — Tous droits réservés.
                </div>
            </footer>
        </main>
    );
}
