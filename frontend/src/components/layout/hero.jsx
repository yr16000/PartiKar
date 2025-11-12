import React from "react";
import SearchBar from "@/components/layout/SearchBar";

export default function Hero({ onSearch }) {
    return (
        <section className="bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-16 md:py-20 text-center">
                <h1 className="text-[clamp(2rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.05] max-w-[980px] mx-auto">
                    <span className="text-gray-900">La location de voitures,</span>{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            entre particuliers
          </span>
                </h1>

                <p className="mt-5 text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                    Louez une voiture près de chez vous. C'est simple, économique et flexible.
                </p>

                <div className="mt-10">
                    <SearchBar onSearch={onSearch} />
                </div>

                <small className="mt-4 block text-gray-500 text-sm">
                    Astuce : essaie “Paris” pour tester
                </small>
            </div>
        </section>
    );
}
