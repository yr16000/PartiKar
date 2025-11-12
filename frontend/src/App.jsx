import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages principales
import Home from "./pages/Home";
import Login from "./pages/Login";
import Publish from "./pages/Publish";
import Profile from "./pages/Profile";
import AnnonceDetails from "./pages/AnnonceDetails";
import Search from "./pages/Search";
import MyAnnonces from "./pages/MyAnnonces";
import DemandesReservation from "./pages/DemandesReservation";
import MesReservations from "./pages/MesReservations";


function ScrollManager() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // attendre que la page (Home) rende la section, puis scroller avec offset
            requestAnimationFrame(() => {
                const el = document.querySelector(hash);
                if (el) {
                    const yOffset = -100; // hauteur navbar sticky
                    const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                }
            });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    return null;
}


export default function App() {
    return (
        <>
            <ScrollManager />

            <Routes>
                {/* PAGE D'ACCUEIL */}
                <Route path="/" element={<Home />} />

                {/* PAGE LOGIN */}
                <Route path="/login" element={<Login />} />

                {/* PAGE PUBLIER UNE ANNONCE */}
                <Route path="/publish" element={<Publish />} />

                {/* PAGE PROFIL UTILISATEUR */}
                <Route path="/profile" element={<Profile />} />

                <Route path="/annonces/:id" element={<AnnonceDetails />} />

                <Route path="/search" element={<Search />} />

                <Route path="/my-annonces" element={<MyAnnonces />} />

                <Route path="/demandes-reservation" element={<DemandesReservation />} />
                <Route path="/mes-reservations" element={<MesReservations />} />


            </Routes>
        </>
    );
}
