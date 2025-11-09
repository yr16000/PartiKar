import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. On crée le "contexte"
const AuthContext = createContext();

// 2. On crée le "Fournisseur" (Provider)
// C'est lui qui va contenir toute la logique
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // L'utilisateur connecté
    const [token, setToken] = useState(localStorage.getItem('token')); // Le token JWT
    const [loading, setLoading] = useState(false); // État de chargement

    // Effet pour configurer axios avec le token
    useEffect(() => {
        if (token) {
            // On stocke le token pour les futures visites
            localStorage.setItem('token', token);
            // On configure axios pour envoyer le token à CHAQUE requête
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Si pas de token, on supprime tout
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    }, [token]); // Se relance uniquement quand le token change

    // --- C'est ICI que le lien se fait ---

    // Fonction pour s'inscrire
    const register = async (userData) => {
        // userData est un objet : { nom, prenom, email, dateDeNaissance, password }

        // On appelle le backend !
        // (On utilise /api/auth/register car ton vite.config.js gère le proxy)
        const response = await axios.post('/api/auth/register', userData);

        // On met à jour le token dans notre état
        setToken(response.data.token);

        // (Tu pourrais aussi setter l'utilisateur si le backend le renvoie)
        // setUser(response.data.user);
    };

    // Fonction pour se connecter
    const login = async (credentials) => {
        // credentials est un objet : { email, password }

        const response = await axios.post('/api/auth/login', credentials);
        setToken(response.data.token);

        // (Tu pourrais aussi setter l'utilisateur ici)
        // setUser(response.data.user);
    };

    // Fonction pour se déconnecter
    const logout = () => {
        setUser(null);
        setToken(null); // Le useEffect va s'occuper de nettoyer le localStorage
    };

    // On "expose" nos fonctions et nos états au reste de l'app
    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. On crée un "Hook" personnalisé pour utiliser ce contexte facilement
export const useAuth = () => {
    return useContext(AuthContext);
};