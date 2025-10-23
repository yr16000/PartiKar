// File: src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Pages principales
import Home from "./pages/Home";
import Login from "./pages/Login";
import Publish from "./pages/Publish";


function ScrollManager() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // attendre que la page (Home) rende la section, puis scroller avec offset
            requestAnimationFrame(() => {
                const el = document.querySelector(hash);
                if (el) {
                    const yOffset = -100; // hauteur navbar sticky
                    const y = el.getBoundingClientRect().top  + yOffset;
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
        <BrowserRouter>
            <ScrollManager />

            <Routes>
                {/* PAGE D’ACCUEIL */}
                <Route path="/" element={<Home />} />

                {/* PAGE LOGIN */}
                <Route path="/login" element={<Login />} />

                {/* PAGE PUBLIER UNE ANNONCE */}
                <Route path="/publish" element={<Publish />} />


            </Routes>
        </BrowserRouter>
    );
}
