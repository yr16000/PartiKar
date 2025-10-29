import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Il utilise le bon alias '@/context/AuthContext' (qui a corrigé ton bug)
import { AuthProvider } from "@/context/AuthContext.jsx";
// Il importe le BrowserRouter (essentiel)
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* L'ordre est parfait : le Routeur d'abord */}
        <BrowserRouter>
            {/* L'état global (Auth) ensuite */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);