-- Minimal RLS fix - only add missing policies
-- Run each section separately if needed

-- =====================================================
-- PROFILES - Allow authenticated users to SELECT their profile
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile"
        ON profiles FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
        RAISE NOTICE '✅ Created profile SELECT policy';
    ELSE
        RAISE NOTICE '⏭️ Profile SELECT policy already exists';
    END IF;
END $$;

-- =====================================================
-- CLIENTS - Allow INSERT for new signups
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clients' 
        AND policyname = 'Clients can insert own profile'
    ) THEN
        CREATE POLICY "Clients can insert own profile"
        ON clients FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✅ Created clients INSERT policy';
    ELSE
        RAISE NOTICE '⏭️ Clients INSERT policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clients' 
        AND policyname = 'Clients can read own profile'
    ) THEN
        CREATE POLICY "Clients can read own profile"
        ON clients FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
        RAISE NOTICE '✅ Created clients SELECT policy';
    ELSE
        RAISE NOTICE '⏭️ Clients SELECT policy already exists';
    END IF;
END $$;

-- =====================================================
-- LAWYERS - Allow INSERT for new signups
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lawyers' 
        AND policyname = 'Lawyers can insert own profile'
    ) THEN
        CREATE POLICY "Lawyers can insert own profile"
        ON lawyers FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✅ Created lawyers INSERT policy';
    ELSE
        RAISE NOTICE '⏭️ Lawyers INSERT policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lawyers' 
        AND policyname = 'Lawyers can read own profile'
    ) THEN
        CREATE POLICY "Lawyers can read own profile"
        ON lawyers FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
        RAISE NOTICE '✅ Created lawyers SELECT policy';
    ELSE
        RAISE NOTICE '⏭️ Lawyers SELECT policy already exists';
    END IF;
END $$;

-- =====================================================
-- BANKS - Allow INSERT for new signups
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banks' 
        AND policyname = 'Banks can insert own profile'
    ) THEN
        CREATE POLICY "Banks can insert own profile"
        ON banks FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✅ Created banks INSERT policy';
    ELSE
        RAISE NOTICE '⏭️ Banks INSERT policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banks' 
        AND policyname = 'Banks can read own profile'
    ) THEN
        CREATE POLICY "Banks can read own profile"
        ON banks FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
        RAISE NOTICE '✅ Created banks SELECT policy';
    ELSE
        RAISE NOTICE '⏭️ Banks SELECT policy already exists';
    END IF;
END $$;

-- =====================================================
-- DONE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policy check complete!';
END $$;
