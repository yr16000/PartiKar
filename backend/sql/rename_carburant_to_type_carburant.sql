-- Script: rename_carburant_to_type_carburant.sql
-- Usage: psql -U <user> -d <database> -h <host> -f rename_carburant_to_type_carburant.sql
-- Ce script :
-- 1) Renomme la colonne `carburant` en `type_carburant` si elle existe
-- 2) Si besoin, agrandit image_url et localisation pour éviter des erreurs de longueur

BEGIN;

-- 1) Renommer la colonne 'carburant' -> 'type_carburant' si elle existe et si 'type_carburant' n'existe pas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'voitures' AND column_name = 'carburant'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'voitures' AND column_name = 'type_carburant'
    ) THEN
        ALTER TABLE public.voitures RENAME COLUMN carburant TO type_carburant;
    END IF;
END$$;

-- 2) S'assurer que image_url et localisation ont une taille suffisante
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'voitures' AND column_name = 'image_url'
    ) THEN
        -- Passe image_url à varchar(1000) si elle est plus courte
        BEGIN
            ALTER TABLE public.voitures ALTER COLUMN image_url TYPE varchar(1000);
        EXCEPTION WHEN undefined_column THEN
            -- ignore
            NULL;
        END;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'voitures' AND column_name = 'localisation'
    ) THEN
        BEGIN
            ALTER TABLE public.voitures ALTER COLUMN localisation TYPE varchar(10000);
        EXCEPTION WHEN undefined_column THEN
            NULL;
        END;
    END IF;
END$$;

COMMIT;

-- Fin du script

