import React, { useState } from "react";

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
            <header className="container nav">
                <div className="logo">
                    Parti<span className="accent">Kar</span>
                </div>

                <nav className="links">
                    <a href="#how">Comment ça marche</a>
                    <a href="#popular">Voitures</a>
                    <a href="#trust">Confiance</a>
                </nav>

                <div className="actions">
                    <button className="btn-secondary">Connexion</button>
                    <button className="btn-primary">Inscription</button>
                </div>
            </header>

            {/* HERO */}
            <section className="hero">
                <div className="hero-inner">
                    <h1>Location de voitures entre particuliers</h1>
                    <p className="muted">
                        Rapide, simple et sécurisé. Trouve une voiture près de chez toi.
                    </p>

                    <form className="search" onSubmit={onSearch}>
                        <input
                            placeholder="Ville (ex : Paris)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                        <button type="submit">Rechercher</button>
                    </form>

                    <small className="hint">Astuce : essaye “Paris” pour tester</small>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="section">
                <h2>Comment ça marche</h2>
                <div className="cards">
                    <div className="card">
                        <h3>1. Cherche</h3>
                        <p>Entre une ville et des dates.</p>
                    </div>
                    <div className="card">
                        <h3>2. Réserve</h3>
                        <p>Paiement en ligne sécurisé.</p>
                    </div>
                    <div className="card">
                        <h3>3. Roule</h3>
                        <p>Récupère le véhicule et pars serein.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                © {new Date().getFullYear()} PartiKar — Tous droits réservés.
            </footer>
        </>
    );
}
