-- ============================================================================
-- Row Level Security (RLS) Policies
-- 英文音読評価アプリケーション - セキュリティポリシー
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Students and teachers can view all profiles (for class roster, etc.)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No deletes allowed (handled by cascade from auth.users)
CREATE POLICY "No direct deletes on profiles"
  ON profiles FOR DELETE
  USING (false);

-- ============================================================================
-- 2. CLASSES TABLE RLS
-- ============================================================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own classes
-- Students can view classes they belong to
CREATE POLICY "Teachers can view their classes, students can view their class"
  ON classes FOR SELECT
  USING (
    auth.uid() = teacher_id
    OR
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE class_id = classes.id
    )
  );

-- Only teachers can create classes
CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'teacher'
    )
  );

-- Only the class teacher can update
CREATE POLICY "Teachers can update their own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Only the class teacher can delete
CREATE POLICY "Teachers can delete their own classes"
  ON classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- ============================================================================
-- 3. CONTENTS TABLE RLS
-- ============================================================================

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Anyone can view published contents
-- Teachers can view their own unpublished contents
CREATE POLICY "Published contents are viewable by all, unpublished by creator"
  ON contents FOR SELECT
  USING (
    is_published = true
    OR
    auth.uid() = created_by
  );

-- Only teachers can create contents
CREATE POLICY "Teachers can create contents"
  ON contents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'teacher'
    )
  );

-- Only the creator can update their contents
CREATE POLICY "Creators can update their own contents"
  ON contents FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Only the creator can delete their contents
CREATE POLICY "Creators can delete their own contents"
  ON contents FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================================================
-- 4. PRACTICE_RECORDS TABLE RLS
-- ============================================================================

ALTER TABLE practice_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own practice records
-- Teachers can view their students' practice records
CREATE POLICY "Users can view their own records, teachers can view students' records"
  ON practice_records FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON p.class_id = c.id
      WHERE p.id = practice_records.user_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Users can only insert their own practice records
CREATE POLICY "Users can insert their own practice records"
  ON practice_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own practice records
CREATE POLICY "Users can update their own practice records"
  ON practice_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own practice records
CREATE POLICY "Users can delete their own practice records"
  ON practice_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. DIFFICULT_WORDS TABLE RLS
-- ============================================================================

ALTER TABLE difficult_words ENABLE ROW LEVEL SECURITY;

-- Users can only view their own difficult words
CREATE POLICY "Users can view their own difficult words"
  ON difficult_words FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own difficult words
CREATE POLICY "Users can insert their own difficult words"
  ON difficult_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own difficult words
CREATE POLICY "Users can update their own difficult words"
  ON difficult_words FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own difficult words
CREATE POLICY "Users can delete their own difficult words"
  ON difficult_words FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. BADGES TABLE RLS
-- ============================================================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges
CREATE POLICY "Everyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- No one can insert/update/delete badges (admin only via service role)
CREATE POLICY "No public insert on badges"
  ON badges FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No public update on badges"
  ON badges FOR UPDATE
  USING (false);

CREATE POLICY "No public delete on badges"
  ON badges FOR DELETE
  USING (false);

-- ============================================================================
-- 7. USER_BADGES TABLE RLS
-- ============================================================================

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- No one can directly insert user_badges (handled by triggers/functions)
CREATE POLICY "No direct insert on user_badges"
  ON user_badges FOR INSERT
  WITH CHECK (false);

-- No updates allowed
CREATE POLICY "No updates on user_badges"
  ON user_badges FOR UPDATE
  USING (false);

-- No deletes allowed
CREATE POLICY "No deletes on user_badges"
  ON user_badges FOR DELETE
  USING (false);

-- ============================================================================
-- 8. MILESTONES TABLE RLS
-- ============================================================================

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Users can view their own milestones
-- Teachers can view their students' milestones
CREATE POLICY "Users can view their own milestones, teachers can view students' milestones"
  ON milestones FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON p.class_id = c.id
      WHERE p.id = milestones.user_id
      AND c.teacher_id = auth.uid()
    )
  );

-- No direct inserts (handled by triggers)
CREATE POLICY "No direct insert on milestones"
  ON milestones FOR INSERT
  WITH CHECK (false);

-- No direct updates (handled by triggers)
CREATE POLICY "No direct update on milestones"
  ON milestones FOR UPDATE
  USING (false);

-- No deletes
CREATE POLICY "No deletes on milestones"
  ON milestones FOR DELETE
  USING (false);

-- ============================================================================
-- 9. FAVORITES TABLE RLS
-- ============================================================================

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can only view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own favorites (though rarely needed)
CREATE POLICY "Users can update their own favorites"
  ON favorites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Storage Policies (will be applied in Supabase dashboard or via API)
-- ============================================================================

-- Note: Storage bucket policies are managed separately in Supabase
--
-- audio-samples bucket (public):
--   - SELECT: public
--   - INSERT: teachers only
--   - UPDATE: creator only
--   - DELETE: creator only
--
-- user-recordings bucket (private):
--   - SELECT: owner only, or teacher of owner's class
--   - INSERT: owner only
--   - UPDATE: owner only
--   - DELETE: owner only
--
-- avatars bucket (public):
--   - SELECT: public
--   - INSERT: owner only
--   - UPDATE: owner only
--   - DELETE: owner only
