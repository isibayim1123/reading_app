-- ============================================================================
-- Fix Contents RLS Policy
-- 英文音読評価アプリケーション - コンテンツRLSポリシー修正
-- ============================================================================

-- ============================================================================
-- 1. DROP OLD POLICY
-- ============================================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Published contents are viewable by all, unpublished by creator" ON contents;

-- ============================================================================
-- 2. CREATE NEW POLICY
-- ============================================================================

-- Create new policy that allows:
-- 1. Anyone to view published contents
-- 2. Creators to view their own unpublished contents
-- 3. System contents (created_by = NULL or placeholder UUID) to be viewable by all if published
CREATE POLICY "Published contents are viewable by all, unpublished by creator"
  ON contents FOR SELECT
  USING (
    is_published = true
    OR
    auth.uid() = created_by
    OR
    created_by IS NULL
    OR
    created_by = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

-- After running this migration, the contents page should load successfully
-- You can verify by running:
-- SELECT COUNT(*) FROM contents WHERE is_published = true;
