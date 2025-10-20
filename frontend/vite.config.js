import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
    // cible par défaut (dev local)
    const defaultBackend = "http://localhost:8080";
    // permet d’overrider en Docker/CI: VITE_BACKEND_URL=http://backend:8080
    const backend = process.env.VITE_BACKEND_URL || defaultBackend;

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: { "@": path.resolve(process.cwd(), "./src") },
        },
        server: {
            host: true,       // nécessaire en Docker pour exposer sur le réseau
            port: 5173,
            proxy: {
                "/api": {
                    target: backend,
                    changeOrigin: true,
                },
            },
        },
    };
});
