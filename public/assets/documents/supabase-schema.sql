-- =====================================================================
-- DRUM MASTER ACADEMY (DMA) - SCHEMA DE BASE DE DONNEES SUPABASE
-- A exécuter dans l'éditeur SQL de votre projet Supabase (SQL Editor)
-- =====================================================================

-- 1. CREATION DE LA TABLE DES PROFILS ETUDIANTS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    level TEXT DEFAULT 'beginner',
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    equipment TEXT DEFAULT 'acoustic',
    weekly_goal INTEGER DEFAULT 120,
    enrolled_courses TEXT[] DEFAULT ARRAY[]::TEXT[],
    course_progress JSONB DEFAULT '{}'::JSONB,
    photo_url TEXT DEFAULT NULL,
    setup_completed BOOLEAN DEFAULT FALSE,
    setup_postponed BOOLEAN DEFAULT FALSE,
    bio TEXT DEFAULT NULL,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active la sécurité au niveau des lignes (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. DEFINITION DES POLITIQUES DE SECURITE (RLS POLICIES)
-- Permet aux utilisateurs connectés de lire leur propre profil uniquement
CREATE POLICY "Les élèves peuvent lire leur propre profil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Permet aux utilisateurs connectés de mettre à jour leur propre profil uniquement
CREATE POLICY "Les élèves peuvent modifier leur propre profil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Permet aux utilisateurs connectés d'insérer leur propre profil uniquement (sécurité additionnelle)
CREATE POLICY "Les élèves peuvent insérer leur propre profil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. DECLENCHEUR (TRIGGER) POUR CREER AUTOMATIQUEMENT LE PROFIL APRES L'INSCRIPTION
-- Cette fonction s'exécute automatiquement à chaque fois qu'un utilisateur crée son compte (signUp)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        name, 
        email, 
        enrolled_courses, 
        course_progress, 
        level, 
        interests, 
        setup_completed, 
        setup_postponed, 
        join_date
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Batteur DMA'),
        new.email,
        ARRAY[]::text[],
        '{}'::jsonb,
        'beginner',
        ARRAY[]::text[],
        FALSE,
        FALSE,
        NOW()
    );
    RETURN new;
END;
$$;

-- Lie la fonction trigger à la table d'authentification interne de Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. FONCTION SECURISEE POUR LA SUPPRESSION DE COMPTE CLIENT (RPC)
-- Supabase restreint la suppression directe d'utilisateurs depuis le SDK client par sécurité.
-- Cette fonction permet à un utilisateur connecté de supprimer son propre compte en toute sécurité.
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- S'assure que l'utilisateur qui fait l'appel est bien celui qui est supprimé
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Non autorisé. Vous devez être connecté pour supprimer votre compte.';
    END IF;

    -- Supprime l'utilisateur de la table interne auth.users (ce qui cascade sur public.profiles)
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
