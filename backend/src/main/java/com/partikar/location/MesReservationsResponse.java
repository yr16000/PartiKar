package com.partikar.location;

import java.util.List;

/**
 * DTO de réponse pour les réservations (en cours et passées).
 */
public class MesReservationsResponse {

    private List<LocationResponse> enCours;
    private List<LocationResponse> passees;

    public MesReservationsResponse() {}

    public List<LocationResponse> getEnCours() {
        return enCours;
    }

    public void setEnCours(List<LocationResponse> enCours) {
        this.enCours = enCours;
    }

    public List<LocationResponse> getPassees() {
        return passees;
    }

    public void setPassees(List<LocationResponse> passees) {
        this.passees = passees;
    }
}

