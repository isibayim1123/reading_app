-- ============================================================================
-- Initial Schema Migration
-- 英文音読評価アプリケーション - データベーススキーマ
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher')),
  grade TEXT,
  class_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_class_id ON profiles(class_id);
CREATE INDEX idx_profiles_email ON profiles(email);

COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN profiles.user_type IS '生徒 or 先生';
COMMENT ON COLUMN profiles.grade IS '学年（生徒の場合）';
COMMENT ON COLUMN profiles.class_id IS '所属クラス（生徒の場合）';

-- ============================================================================
-- 2. CLASSES TABLE
-- ============================================================================

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_is_active ON classes(is_active);

COMMENT ON TABLE classes IS '先生が管理するクラス';
COMMENT ON COLUMN classes.teacher_id IS '担当教師のID';
COMMENT ON COLUMN classes.is_active IS 'アクティブなクラスかどうか';

-- Add foreign key from profiles to classes (circular reference)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_class_id
  FOREIGN KEY (class_id)
  REFERENCES classes(id)
  ON DELETE SET NULL;

-- ============================================================================
-- 3. CONTENTS TABLE
-- ============================================================================

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  translation TEXT,
  difficulty_level TEXT NOT NULL CHECK (
    difficulty_level IN ('elementary', 'junior_high', 'high_school', 'advanced')
  ),
  category TEXT NOT NULL,
  tags TEXT[],
  audio_url TEXT,
  word_count INTEGER,
  estimated_duration INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contents_difficulty_level ON contents(difficulty_level);
CREATE INDEX idx_contents_category ON contents(category);
CREATE INDEX idx_contents_is_published ON contents(is_published);
CREATE INDEX idx_contents_created_by ON contents(created_by);
CREATE INDEX idx_contents_tags ON contents USING GIN(tags);
CREATE INDEX idx_contents_text_search ON contents USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(text, ''))
);

COMMENT ON TABLE contents IS '練習用英文コンテンツ';
COMMENT ON COLUMN contents.difficulty_level IS '難易度レベル';
COMMENT ON COLUMN contents.category IS 'カテゴリー（日常会話、試験対策など）';
COMMENT ON COLUMN contents.tags IS '検索用タグ';
COMMENT ON COLUMN contents.audio_url IS 'お手本音声ファイルのURL';
COMMENT ON COLUMN contents.is_published IS '公開されているか';

-- ============================================================================
-- 4. PRACTICE_RECORDS TABLE
-- ============================================================================

CREATE TABLE practice_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  audio_recording_url TEXT,
  duration INTEGER,
  transcription TEXT,
  word_accuracy JSONB,
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D')),
  feedback JSONB,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  practice_mode TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_practice_records_user_id ON practice_records(user_id);
CREATE INDEX idx_practice_records_content_id ON practice_records(content_id);
CREATE INDEX idx_practice_records_created_at ON practice_records(created_at DESC);
CREATE INDEX idx_practice_records_grade ON practice_records(grade);
CREATE INDEX idx_practice_records_user_content ON practice_records(user_id, content_id);

COMMENT ON TABLE practice_records IS 'ユーザーの音読練習記録';
COMMENT ON COLUMN practice_records.word_accuracy IS '単語ごとの正誤データ（JSON）';
COMMENT ON COLUMN practice_records.accuracy_score IS '正確性スコア（0-100）';
COMMENT ON COLUMN practice_records.grade IS '評価グレード（A/B/C/D）';
COMMENT ON COLUMN practice_records.feedback IS 'フィードバック内容（JSON）';
COMMENT ON COLUMN practice_records.attempt_number IS '同一コンテンツの試行回数';

-- ============================================================================
-- 5. DIFFICULT_WORDS TABLE
-- ============================================================================

CREATE TABLE difficult_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  ipa TEXT,
  error_count INTEGER NOT NULL DEFAULT 1,
  last_practiced_at TIMESTAMPTZ,
  first_seen_in_content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, word)
);

CREATE INDEX idx_difficult_words_user_id ON difficult_words(user_id);
CREATE INDEX idx_difficult_words_error_count ON difficult_words(error_count DESC);

COMMENT ON TABLE difficult_words IS 'ユーザーごとの苦手単語リスト';
COMMENT ON COLUMN difficult_words.error_count IS '間違えた回数';

-- ============================================================================
-- 6. BADGES TABLE
-- ============================================================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  badge_type TEXT NOT NULL CHECK (
    badge_type IN ('streak', 'achievement', 'skill', 'milestone')
  ),
  condition JSONB NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_badges_badge_type ON badges(badge_type);
CREATE INDEX idx_badges_display_order ON badges(display_order);

COMMENT ON TABLE badges IS '獲得可能なバッジのマスターデータ';
COMMENT ON COLUMN badges.badge_type IS 'バッジの種類（連続記録、達成、スキル、マイルストーン）';
COMMENT ON COLUMN badges.condition IS 'バッジ獲得条件（JSON）';

-- ============================================================================
-- 7. USER_BADGES TABLE
-- ============================================================================

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

COMMENT ON TABLE user_badges IS 'ユーザーが獲得したバッジ';

-- ============================================================================
-- 8. MILESTONES TABLE
-- ============================================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  total_practice_count INTEGER NOT NULL DEFAULT 0,
  total_study_time INTEGER NOT NULL DEFAULT 0,
  total_words_practiced INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_level ON milestones(level DESC);
CREATE INDEX idx_milestones_experience_points ON milestones(experience_points DESC);

COMMENT ON TABLE milestones IS 'ユーザーのマイルストーンと統計情報';
COMMENT ON COLUMN milestones.level IS 'ユーザーレベル';
COMMENT ON COLUMN milestones.experience_points IS '経験値ポイント';
COMMENT ON COLUMN milestones.current_streak IS '現在の連続練習日数';

-- ============================================================================
-- 9. FAVORITES TABLE
-- ============================================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_content_id ON favorites(content_id);

COMMENT ON TABLE favorites IS 'ユーザーのお気に入りコンテンツ';
