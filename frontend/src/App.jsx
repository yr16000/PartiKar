// File: src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages principales
import Home from "./pages/Home";
import Login from "./pages/Login";
import Publish from "./pages/Publish";

// (Optionnel) Import de tes composants UI de test
import { Button } from "@/components/ui/button";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* PAGE D’ACCUEIL */}
                <Route path="/" element={<Home />} />

                {/* PAGE LOGIN */}
                <Route path="/login" element={<Login />} />

                {/* PAGE PUBLIER UNE ANNONCE */}
                <Route path="/publish" element={<Publish />} />

                {/* EXEMPLE TEMPORAIRE: démo du thème */}
                <Route
                    path="/theme-demo"
                    element={
                        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center gap-6">
                            <h1 className="text-5xl font-extrabold">
                                <span className="text-slate-900">Parti</span>
                                <span className="text-primary">Kar</span>
                            </h1>

                            <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow w-80">
                                Couleur <b>bg-primary</b> (depuis @theme)
                            </div>

                            <div className="flex gap-4">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-3 shadow">
                                    CTA thème
                                </Button>
                                <Button className="border-2 border-primary text-primary rounded-full px-6 py-3 hover:bg-primary hover:text-white transition">
                                    Outline
                                </Button>
                            </div>
                        </main>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
