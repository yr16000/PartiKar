// src/components/reservations/ReservationPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DateRangePicker from "@/components/ui/DateRangePicker";

/* Utils */
function stripTime(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}
function diffDaysInclusive(from, to) {
    if (!from || !to) return 0;
    const ms = 24 * 60 * 60 * 1000;
    const a = stripTime(from);
    const b = stripTime(to);
    return Math.max(1, Math.round((b - a) / ms) + 1);
}

export default function ReservationPanel({
                                             voitureId,
                                             prixParJour,
                                             localisation,
                                             unavailable = new Set(), // Set de "YYYY-MM-DD" indisponibles
                                             token,
                                             onSuccess,
                                             disabled = false,
                                         }) {
    const navigate = useNavigate();

    const today = useMemo(() => stripTime(new Date()), []);
    const [range, setRange] = useState({ from: null, to: null });
    const [reserving, setReserving] = useState(false);
    const [reservationError, setReservationError] = useState("");
    const [reservationSuccess, setReservationSuccess] = useState(false);
    const [hour] = useState("10:00");

    // État pour les disponibilités récupérées du backend
    const [disponibilites, setDisponibilites] = useState([]);
    const [loadingDispos, setLoadingDispos] = useState(true);

    // Récupérer les disponibilités depuis le backend
    useEffect(() => {
        async function fetchDisponibilites() {
            try {
                setLoadingDispos(true);
                const res = await fetch(`/api/annonces/id/${voitureId}/disponibilites`);
                if (!res.ok) {
                    throw new Error("Erreur lors de la récupération des disponibilités");
                }
                const data = await res.json();
                setDisponibilites(data);
            } catch (error) {
                console.error("Erreur:", error);
                setReservationError("Impossible de charger les disponibilités");
            } finally {
                setLoadingDispos(false);
            }
        }

        if (voitureId) {
            fetchDisponibilites();
        }
    }, [voitureId]);

    // Calculer les jours disponibles (statut DISPONIBLE uniquement)
    const availableDaysYMD = useMemo(() => {
        return disponibilites
            .filter(dispo => dispo.statut === "DISPONIBLE")
            .map(dispo => dispo.jour); // Le backend retourne déjà au format YYYY-MM-DD
    }, [disponibilites]);

    const hasValidRange = !!range?.from && !!(range?.to ?? range?.from);
    const nights = diffDaysInclusive(range?.from, range?.to ?? range?.from);
    const daily = Number.isFinite(Number(prixParJour)) ? Number(prixParJour) : null;
    const total = daily && hasValidRange ? daily * nights : null;

    async function reserve() {
        try {
            if (!token) {
                setReservationError("Vous devez être connecté pour réserver une voiture.");
                navigate("/login", { state: { from: `/annonces/${voitureId}` } });
                return;
            }
            if (!hasValidRange) {
                setReservationError("Veuillez sélectionner une période valide.");
                return;
            }

            setReservationError("");
            setReservationSuccess(false);
            setReserving(true);

            const payload = {
                voitureId: Number(voitureId),
                dateDebut: toYMD(range.from),
                dateFin: toYMD(range.to ?? range.from),
                heureDebut: hour,
                heureFin: hour,
            };

            const res = await fetch("/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                let msg = "Erreur lors de la réservation";
                try {
                    const j = await res.json();
                    msg = j?.message || msg;
                } catch {}
                throw new Error(msg);
            }

            setReservationSuccess(true);
            onSuccess?.();
        } catch (e) {
            setReservationError(e.message || "Une erreur est survenue lors de la réservation.");
        } finally {
            setReserving(false);
        }
    }

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
                <div className="text-2xl font-extrabold">
                    {Number.isFinite(total)
                        ? total.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
                        : "—"}
                </div>
                <div className="text-sm text-muted-foreground">
                    {hasValidRange ? `${nights} jour(s)` : "Sélectionnez vos dates"}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm text-gray-600 mb-1 leading-none">Votre voyage</span>

                    {loadingDispos ? (
                        <div className="h-11 flex items-center justify-center border rounded-lg bg-gray-50 text-sm text-gray-500">
                            Chargement des disponibilités...
                        </div>
                    ) : (
                        <DateRangePicker
                            value={range}
                            onChange={(r) => {
                                const from = r?.from ? stripTime(r.from) : null;
                                const to = r?.to ? stripTime(r.to) : r?.from ? stripTime(r.from) : null;
                                setRange({ from, to });
                                setReservationError("");
                            }}
                            placeholder="Sélectionner une période"
                            minDate={today}
                            // Activer le mode "lock to available"
                            lockToAvailable={true}
                            availableDaysYMD={availableDaysYMD}
                        />
                    )}
                </div>

                <div className="rounded-lg border bg-white px-4 py-3 text-sm">
                    <div className="text-gray-600 mb-1">Lieu de prise en charge et de retour</div>
                    <div className="font-medium inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {localisation || "—"}
                    </div>
                </div>

                {reservationError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                        {reservationError}
                    </div>
                )}
                {reservationSuccess && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                        Réservation confirmée !
                    </div>
                )}

                <Button
                    className="w-full h-12"
                    onClick={reserve}
                    disabled={disabled || reserving || reservationSuccess || !hasValidRange || loadingDispos}
                >
                    {reserving ? "Réservation en cours..." : reservationSuccess ? "✓ Réservé" : "Réserver"}
                </Button>
            </div>
        </div>
    );
}