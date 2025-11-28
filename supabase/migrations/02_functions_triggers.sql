-- ============================================================================
-- Functions and Triggers
-- 英文音読評価アプリケーション - 関数とトリガー
-- ============================================================================

-- ============================================================================
-- 1. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_difficult_words_updated_at
  BEFORE UPDATE ON difficult_words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. AUTO-CREATE MILESTONE ON PROFILE CREATION
-- ============================================================================

-- Function to create milestone when a new profile is created
CREATE OR REPLACE FUNCTION create_milestone_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO milestones (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_milestone_for_new_user();

-- ============================================================================
-- 3. UPDATE MILESTONE ON PRACTICE RECORD CREATION
-- ============================================================================

-- Function to update milestone statistics when practice record is created
CREATE OR REPLACE FUNCTION update_milestone_on_practice()
RETURNS TRIGGER AS $$
DECLARE
  word_count INTEGER;
  practice_date DATE;
  last_date DATE;
  new_streak INTEGER;
BEGIN
  -- Get word count from the content
  SELECT contents.word_count INTO word_count
  FROM contents
  WHERE contents.id = NEW.content_id;

  -- Get current practice date
  practice_date := NEW.created_at::DATE;

  -- Get the milestone record
  SELECT last_practice_date INTO last_date
  FROM milestones
  WHERE user_id = NEW.user_id;

  -- Calculate streak
  IF last_date IS NULL THEN
    new_streak := 1;
  ELSIF practice_date = last_date THEN
    -- Same day, keep current streak
    SELECT current_streak INTO new_streak
    FROM milestones
    WHERE user_id = NEW.user_id;
  ELSIF practice_date = last_date + INTERVAL '1 day' THEN
    -- Consecutive day
    SELECT current_streak + 1 INTO new_streak
    FROM milestones
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken
    new_streak := 1;
  END IF;

  -- Update milestone
  UPDATE milestones
  SET
    total_practice_count = total_practice_count + 1,
    total_study_time = total_study_time + COALESCE(NEW.duration, 0),
    total_words_practiced = total_words_practiced + COALESCE(word_count, 0),
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak),
    last_practice_date = practice_date,
    experience_points = experience_points + CASE
      WHEN NEW.grade = 'A' THEN 100
      WHEN NEW.grade = 'B' THEN 75
      WHEN NEW.grade = 'C' THEN 50
      WHEN NEW.grade = 'D' THEN 25
      ELSE 10
    END,
    level = 1 + (experience_points + CASE
      WHEN NEW.grade = 'A' THEN 100
      WHEN NEW.grade = 'B' THEN 75
      WHEN NEW.grade = 'C' THEN 50
      WHEN NEW.grade = 'D' THEN 25
      ELSE 10
    END) / 1000  -- Level up every 1000 XP
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_practice_record_created
  AFTER INSERT ON practice_records
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_on_practice();

-- ============================================================================
-- 4. UPDATE ATTEMPT NUMBER ON PRACTICE RECORD
-- ============================================================================

-- Function to set attempt_number based on previous practices of same content
CREATE OR REPLACE FUNCTION set_attempt_number()
RETURNS TRIGGER AS $$
DECLARE
  prev_attempts INTEGER;
BEGIN
  -- Count previous attempts for this user-content combination
  SELECT COUNT(*) INTO prev_attempts
  FROM practice_records
  WHERE user_id = NEW.user_id
    AND content_id = NEW.content_id;

  -- Set attempt number (previous + 1)
  NEW.attempt_number := prev_attempts + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_practice_attempt_number
  BEFORE INSERT ON practice_records
  FOR EACH ROW
  EXECUTE FUNCTION set_attempt_number();

-- ============================================================================
-- 5. TRACK DIFFICULT WORDS FROM PRACTICE RECORDS
-- ============================================================================

-- Function to extract and store difficult words from practice records
CREATE OR REPLACE FUNCTION track_difficult_words()
RETURNS TRIGGER AS $$
DECLARE
  word_data JSONB;
  word_text TEXT;
BEGIN
  -- Only process if word_accuracy exists
  IF NEW.word_accuracy IS NOT NULL AND jsonb_typeof(NEW.word_accuracy) = 'object' THEN
    -- Loop through each word in the accuracy data
    FOR word_data IN
      SELECT * FROM jsonb_array_elements(NEW.word_accuracy -> 'words')
    LOOP
      -- Only track incorrect words
      IF (word_data ->> 'correct')::BOOLEAN = false THEN
        word_text := word_data ->> 'word';

        -- Insert or update difficult word
        INSERT INTO difficult_words (
          user_id,
          word,
          error_count,
          last_practiced_at,
          first_seen_in_content_id
        )
        VALUES (
          NEW.user_id,
          word_text,
          1,
          NEW.created_at,
          NEW.content_id
        )
        ON CONFLICT (user_id, word)
        DO UPDATE SET
          error_count = difficult_words.error_count + 1,
          last_practiced_at = NEW.created_at;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_practice_track_difficult_words
  AFTER INSERT ON practice_records
  FOR EACH ROW
  EXECUTE FUNCTION track_difficult_words();

-- ============================================================================
-- 6. AUTO-AWARD BADGES
-- ============================================================================

-- Function to check and award badges after practice
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge RECORD;
  should_award BOOLEAN;
  condition_type TEXT;
  m RECORD;
  consecutive_a_count INTEGER;
BEGIN
  -- Get user's milestone
  SELECT * INTO m FROM milestones WHERE user_id = NEW.user_id;

  -- Loop through all badges
  FOR badge IN SELECT * FROM badges LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges
      WHERE user_id = NEW.user_id AND badge_id = badge.id
    ) THEN
      should_award := false;
      condition_type := badge.condition ->> 'type';

      -- Check different badge conditions
      CASE condition_type
        WHEN 'practice_count' THEN
          IF m.total_practice_count >= (badge.condition ->> 'count')::INTEGER THEN
            should_award := true;
          END IF;

        WHEN 'streak' THEN
          IF m.current_streak >= (badge.condition ->> 'days')::INTEGER THEN
            should_award := true;
          END IF;

        WHEN 'perfect_score' THEN
          -- Check for consecutive A grades
          SELECT COUNT(*) INTO consecutive_a_count
          FROM (
            SELECT grade
            FROM practice_records
            WHERE user_id = NEW.user_id
            ORDER BY created_at DESC
            LIMIT (badge.condition ->> 'consecutive')::INTEGER
          ) recent
          WHERE grade = 'A';

          IF consecutive_a_count >= (badge.condition ->> 'consecutive')::INTEGER THEN
            should_award := true;
          END IF;

        -- Add more condition types as needed
        ELSE
          -- Unknown condition type, skip
          CONTINUE;
      END CASE;

      -- Award badge if condition met
      IF should_award THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge.id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_practice_check_badges
  AFTER INSERT ON practice_records
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

-- ============================================================================
-- 7. HANDLE NEW USER SIGNUP (from Supabase Auth)
-- ============================================================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 8. UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user's practice statistics
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS TABLE (
  total_practices BIGINT,
  average_score NUMERIC,
  grade_a_count BIGINT,
  grade_b_count BIGINT,
  grade_c_count BIGINT,
  grade_d_count BIGINT,
  favorite_category TEXT,
  total_study_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_practices,
    ROUND(AVG(accuracy_score), 2) as average_score,
    COUNT(*) FILTER (WHERE grade = 'A')::BIGINT as grade_a_count,
    COUNT(*) FILTER (WHERE grade = 'B')::BIGINT as grade_b_count,
    COUNT(*) FILTER (WHERE grade = 'C')::BIGINT as grade_c_count,
    COUNT(*) FILTER (WHERE grade = 'D')::BIGINT as grade_d_count,
    (
      SELECT c.category
      FROM practice_records pr
      JOIN contents c ON pr.content_id = c.id
      WHERE pr.user_id = p_user_id
      GROUP BY c.category
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as favorite_category,
    (
      SELECT total_study_time / 60
      FROM milestones
      WHERE user_id = p_user_id
    ) as total_study_minutes
  FROM practice_records
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get class statistics (for teachers)
CREATE OR REPLACE FUNCTION get_class_statistics(p_class_id UUID)
RETURNS TABLE (
  student_count BIGINT,
  total_practices BIGINT,
  average_score NUMERIC,
  most_active_student_id UUID,
  most_active_student_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM profiles WHERE class_id = p_class_id) as student_count,
    COUNT(pr.*)::BIGINT as total_practices,
    ROUND(AVG(pr.accuracy_score), 2) as average_score,
    (
      SELECT pr2.user_id
      FROM practice_records pr2
      JOIN profiles p2 ON pr2.user_id = p2.id
      WHERE p2.class_id = p_class_id
      GROUP BY pr2.user_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_active_student_id,
    (
      SELECT p3.full_name
      FROM practice_records pr3
      JOIN profiles p3 ON pr3.user_id = p3.id
      WHERE p3.class_id = p_class_id
      GROUP BY pr3.user_id, p3.full_name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_active_student_name
  FROM practice_records pr
  JOIN profiles p ON pr.user_id = p.id
  WHERE p.class_id = p_class_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
