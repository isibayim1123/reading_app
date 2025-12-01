-- ============================================================================
-- Fix Auth Trigger Issue
-- 英文音読評価アプリケーション - Auth Trigger修正
-- ============================================================================

-- ============================================================================
-- 1. CHECK PROFILES TABLE SCHEMA (for debugging)
-- ============================================================================

-- Verify profiles table exists and check its schema
-- Run this first to confirm the table structure
-- SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'profiles';
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'profiles';

-- ============================================================================
-- 2. DISABLE PROBLEMATIC AUTH TRIGGER
-- ============================================================================

-- Drop the trigger that's causing "Database error saving new user"
-- We now create profiles manually in the application code (useAuth.ts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Optionally, drop the function as well (not required, but clean)
DROP FUNCTION IF EXISTS handle_new_user();

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

-- After running this migration, user registration should work
-- The profile will be created manually by the application code after signup succeeds

-- Note: The manual profile creation is handled in:
-- src/hooks/useAuth.ts -> signUp() function
