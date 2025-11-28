# データベース設計書

## 概要
英文音読評価アプリケーションのデータベース設計詳細。PostgreSQL（Supabase）を使用。

**作成日**: 2025-11-28
**バージョン**: 1.0
**DBMS**: PostgreSQL 15+ (Supabase)

---

## 目次
1. [ER図](#1-er図)
2. [テーブル定義](#2-テーブル定義)
3. [リレーションシップ](#3-リレーションシップ)
4. [インデックス設計](#4-インデックス設計)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [ストレージバケット](#6-ストレージバケット)

---

## 1. ER図

```
┌─────────────────┐
│  auth.users     │ (Supabase Auth)
│  (built-in)     │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐         ┌──────────────┐
│   profiles      │◄────────┤   classes    │
│                 │  N:1    │              │
└────────┬────────┘         └──────┬───────┘
         │                          │
         │ 1:N                      │ 1:N (teacher)
         │                          │
┌────────▼────────┐         ┌──────▼───────┐
│   favorites     │         │   contents   │
└─────────────────┘         └──────┬───────┘
         │                          │
         │ N:1                      │ 1:N
         │                          │
         └──────────┬───────────────┘
                    │
         ┌──────────▼──────────┐
         │ practice_records    │
         └──────────┬──────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         │ N:1                 │ N:N
         │                     │
┌────────▼────────┐   ┌────────▼────────┐
│difficult_words  │   │  user_badges    │
└─────────────────┘   └────────┬────────┘
                               │ N:1
                      ┌────────▼────────┐
                      │     badges      │
                      └─────────────────┘

┌─────────────────┐
│   milestones    │ (1:1 with profiles)
└─────────────────┘
```

---

## 2. テーブル定義

### 2.1 profiles（プロフィール）

ユーザーの詳細情報。Supabase AuthのUsersテーブルを拡張。

```sql
CREATE TABLE profiles (
  -- Primary Key
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- User Type
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher')),

  -- Student Specific
  grade TEXT, -- '小学1年', '中学2年', '高校3年' など
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_class_id ON profiles(class_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Comments
COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN profiles.user_type IS '生徒 or 先生';
COMMENT ON COLUMN profiles.grade IS '学年（生徒の場合）';
COMMENT ON COLUMN profiles.class_id IS '所属クラス（生徒の場合）';
```

### 2.2 classes（クラス）

先生が管理するクラス情報。

```sql
CREATE TABLE classes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Class Info
  name TEXT NOT NULL, -- 'A組', '2年3組', 'Advanced Class' など
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_is_active ON classes(is_active);

-- Comments
COMMENT ON TABLE classes IS '先生が管理するクラス';
COMMENT ON COLUMN classes.teacher_id IS '担当教師のID';
COMMENT ON COLUMN classes.is_active IS 'アクティブなクラスかどうか';
```

### 2.3 contents（英文コンテンツ）

練習用の英文テキストとメタデータ。

```sql
CREATE TABLE contents (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  text TEXT NOT NULL, -- 英文テキスト
  translation TEXT, -- 日本語訳（オプション）

  -- Classification
  difficulty_level TEXT NOT NULL CHECK (
    difficulty_level IN ('elementary', 'junior_high', 'high_school', 'advanced')
  ),
  category TEXT NOT NULL, -- 'daily', 'exam', 'eiken', 'toeic', 'story', 'science' など
  tags TEXT[], -- ['英検2級', '大学入試', '物語'] など

  -- Media
  audio_url TEXT, -- お手本音声のURL（Supabase Storage）

  -- Metadata
  word_count INTEGER,
  estimated_duration INTEGER, -- 推定読み上げ時間（秒）

  -- Visibility
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contents_difficulty_level ON contents(difficulty_level);
CREATE INDEX idx_contents_category ON contents(category);
CREATE INDEX idx_contents_is_published ON contents(is_published);
CREATE INDEX idx_contents_created_by ON contents(created_by);
CREATE INDEX idx_contents_tags ON contents USING GIN(tags);

-- Full-text search index
CREATE INDEX idx_contents_text_search ON contents USING GIN(
  to_tsvector('english', title || ' ' || text)
);

-- Comments
COMMENT ON TABLE contents IS '練習用英文コンテンツ';
COMMENT ON COLUMN contents.difficulty_level IS '難易度レベル';
COMMENT ON COLUMN contents.category IS 'カテゴリー（日常会話、試験対策など）';
COMMENT ON COLUMN contents.tags IS '検索用タグ';
COMMENT ON COLUMN contents.audio_url IS 'お手本音声ファイルのURL';
COMMENT ON COLUMN contents.is_published IS '公開されているか';
```

### 2.4 practice_records（練習記録）

ユーザーの音読練習履歴と評価結果。

```sql
CREATE TABLE practice_records (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,

  -- Recording
  audio_recording_url TEXT, -- ユーザーの録音音声URL（Supabase Storage）
  duration INTEGER, -- 録音時間（秒）

  -- Transcription & Analysis
  transcription TEXT, -- 音声認識結果のテキスト
  word_accuracy JSONB, -- 単語ごとの正誤データ
  /*
  例:
  {
    "words": [
      {"word": "Hello", "score": 95, "correct": true},
      {"word": "world", "score": 82, "correct": true},
      {"word": "beautiful", "score": 45, "correct": false, "error_type": "pronunciation"}
    ]
  }
  */

  -- Scores
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D')),

  -- Feedback
  feedback JSONB,
  /*
  例:
  {
    "positive": ["Great job on 'Hello'!", "素晴らしい発音です"],
    "improvements": [
      {
        "word": "beautiful",
        "suggestion": "Try pronouncing it as 'byoo-tuh-ful'",
        "ipa": "/ˈbjuːtɪfʊl/"
      }
    ],
    "overall": "Keep practicing! You're doing great!"
  }
  */

  -- Metadata
  attempt_number INTEGER NOT NULL DEFAULT 1, -- 同じコンテンツの何回目の練習か
  practice_mode TEXT DEFAULT 'normal', -- 'normal', 'exam', 'review'

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_practice_records_user_id ON practice_records(user_id);
CREATE INDEX idx_practice_records_content_id ON practice_records(content_id);
CREATE INDEX idx_practice_records_created_at ON practice_records(created_at DESC);
CREATE INDEX idx_practice_records_grade ON practice_records(grade);
CREATE INDEX idx_practice_records_user_content ON practice_records(user_id, content_id);

-- Comments
COMMENT ON TABLE practice_records IS 'ユーザーの音読練習記録';
COMMENT ON COLUMN practice_records.word_accuracy IS '単語ごとの正誤データ（JSON）';
COMMENT ON COLUMN practice_records.accuracy_score IS '正確性スコア（0-100）';
COMMENT ON COLUMN practice_records.grade IS '評価グレード（A/B/C/D）';
COMMENT ON COLUMN practice_records.feedback IS 'フィードバック内容（JSON）';
COMMENT ON COLUMN practice_records.attempt_number IS '同一コンテンツの試行回数';
```

### 2.5 difficult_words（苦手単語）

ユーザーが苦手な単語の記録。

```sql
CREATE TABLE difficult_words (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Word Info
  word TEXT NOT NULL,
  ipa TEXT, -- IPA発音記号
  error_count INTEGER NOT NULL DEFAULT 1,
  last_practiced_at TIMESTAMPTZ,

  -- Source
  first_seen_in_content_id UUID REFERENCES contents(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, word)
);

-- Indexes
CREATE INDEX idx_difficult_words_user_id ON difficult_words(user_id);
CREATE INDEX idx_difficult_words_error_count ON difficult_words(error_count DESC);

-- Comments
COMMENT ON TABLE difficult_words IS 'ユーザーごとの苦手単語リスト';
COMMENT ON COLUMN difficult_words.error_count IS '間違えた回数';
```

### 2.6 badges（バッジマスター）

獲得可能なバッジの定義。

```sql
CREATE TABLE badges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Badge Info
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,

  -- Classification
  badge_type TEXT NOT NULL CHECK (
    badge_type IN ('streak', 'achievement', 'skill', 'milestone')
  ),

  -- Condition
  condition JSONB NOT NULL,
  /*
  例:
  {
    "type": "streak",
    "days": 7
  }
  または
  {
    "type": "practice_count",
    "count": 50
  }
  または
  {
    "type": "perfect_score",
    "grade": "A",
    "consecutive": 3
  }
  */

  -- Display Order
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_badges_badge_type ON badges(badge_type);
CREATE INDEX idx_badges_display_order ON badges(display_order);

-- Comments
COMMENT ON TABLE badges IS '獲得可能なバッジのマスターデータ';
COMMENT ON COLUMN badges.badge_type IS 'バッジの種類（連続記録、達成、スキル、マイルストーン）';
COMMENT ON COLUMN badges.condition IS 'バッジ獲得条件（JSON）';
```

### 2.7 user_badges（ユーザーバッジ）

ユーザーが獲得したバッジ。

```sql
CREATE TABLE user_badges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  -- Metadata
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Comments
COMMENT ON TABLE user_badges IS 'ユーザーが獲得したバッジ';
```

### 2.8 milestones（マイルストーン）

ユーザーの学習マイルストーン（レベル、総合統計）。

```sql
CREATE TABLE milestones (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations (1:1 with profiles)
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Level
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,

  -- Statistics
  total_practice_count INTEGER NOT NULL DEFAULT 0,
  total_study_time INTEGER NOT NULL DEFAULT 0, -- 秒数
  total_words_practiced INTEGER NOT NULL DEFAULT 0,

  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0, -- 現在の連続日数
  longest_streak INTEGER NOT NULL DEFAULT 0, -- 最長連続日数
  last_practice_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_level ON milestones(level DESC);
CREATE INDEX idx_milestones_experience_points ON milestones(experience_points DESC);

-- Comments
COMMENT ON TABLE milestones IS 'ユーザーのマイルストーンと統計情報';
COMMENT ON COLUMN milestones.level IS 'ユーザーレベル';
COMMENT ON COLUMN milestones.experience_points IS '経験値ポイント';
COMMENT ON COLUMN milestones.current_streak IS '現在の連続練習日数';
```

### 2.9 favorites（お気に入り）

ユーザーのお気に入りコンテンツ。

```sql
CREATE TABLE favorites (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, content_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_content_id ON favorites(content_id);

-- Comments
COMMENT ON TABLE favorites IS 'ユーザーのお気に入りコンテンツ';
```

---

## 3. リレーションシップ

### 3.1 主要なリレーション

| 親テーブル | 子テーブル | リレーション | 説明 |
|-----------|-----------|------------|------|
| auth.users | profiles | 1:1 | ユーザー基本情報 |
| profiles | classes | 1:N | 先生が複数のクラスを管理 |
| classes | profiles | 1:N | クラスに複数の生徒が所属 |
| profiles | contents | 1:N | ユーザーが複数のコンテンツを作成 |
| profiles | practice_records | 1:N | ユーザーの練習記録 |
| contents | practice_records | 1:N | コンテンツの練習記録 |
| profiles | favorites | 1:N | ユーザーのお気に入り |
| contents | favorites | 1:N | コンテンツのお気に入り登録数 |
| profiles | difficult_words | 1:N | ユーザーの苦手単語 |
| badges | user_badges | 1:N | バッジの獲得記録 |
| profiles | user_badges | 1:N | ユーザーが獲得したバッジ |
| profiles | milestones | 1:1 | ユーザーのマイルストーン |

### 3.2 CASCADE設定

- **ON DELETE CASCADE**: 親が削除されたら子も削除
  - profiles → practice_records, favorites, difficult_words, user_badges
  - contents → practice_records
  - classes → profiles (class_id SET NULL)

- **ON DELETE SET NULL**: 親が削除されても子は残す
  - contents → difficult_words (first_seen_in_content_id)

---

## 4. インデックス設計

### 4.1 パフォーマンス最適化のためのインデックス

| テーブル | カラム | タイプ | 目的 |
|---------|--------|--------|------|
| profiles | email | B-tree | ログイン高速化 |
| profiles | user_type | B-tree | ユーザー種別フィルタ |
| practice_records | (user_id, content_id) | 複合 | 特定コンテンツの履歴取得 |
| practice_records | created_at | B-tree DESC | 最新履歴の取得 |
| contents | tags | GIN | タグ検索 |
| contents | text (Full-text) | GIN | 全文検索 |
| difficult_words | (user_id, word) | 複合UNIQUE | 重複防止 |

### 4.2 検索パフォーマンス

想定クエリに対するインデックス：

```sql
-- 1. ユーザーの最新練習履歴取得
-- idx_practice_records_user_id, idx_practice_records_created_at を使用
SELECT * FROM practice_records
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10;

-- 2. タグによるコンテンツ検索
-- idx_contents_tags を使用
SELECT * FROM contents
WHERE tags @> ARRAY['英検2級']
AND is_published = true;

-- 3. 全文検索
-- idx_contents_text_search を使用
SELECT * FROM contents
WHERE to_tsvector('english', title || ' ' || text) @@ to_tsquery('education');
```

---

## 5. Row Level Security (RLS)

Supabaseのセキュリティ機能。ユーザーは自分のデータのみアクセス可能。

### 5.1 RLSポリシー概要

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| profiles | 全員（自分の詳細のみ） | 認証時自動 | 本人のみ | 不可 |
| classes | 先生と所属生徒 | 先生のみ | 担当先生のみ | 担当先生のみ |
| contents | 公開済みは全員 | 先生のみ | 作成者のみ | 作成者のみ |
| practice_records | 本人と担当先生 | 本人のみ | 本人のみ | 本人のみ |
| favorites | 本人のみ | 本人のみ | 本人のみ | 本人のみ |
| difficult_words | 本人のみ | 本人のみ | 本人のみ | 本人のみ |
| badges | 全員 | 管理者のみ | 管理者のみ | 管理者のみ |
| user_badges | 本人のみ | システム | 不可 | 不可 |
| milestones | 本人と担当先生 | システム | システム | 不可 |

### 5.2 詳細ポリシー（実装は後述のSQLファイルに記載）

**基本方針**:
1. 生徒は自分のデータのみアクセス可能
2. 先生は自分のクラスの生徒データを閲覧可能
3. 公開コンテンツは全員が閲覧可能
4. 個人統計は本人のみ編集可能

---

## 6. ストレージバケット

Supabase Storageで管理するファイル。

### 6.1 バケット構成

| バケット名 | 用途 | 公開設定 | RLS |
|-----------|------|---------|-----|
| `audio-samples` | お手本音声 | 公開 | なし |
| `user-recordings` | ユーザー録音 | 非公開 | あり（本人のみ） |
| `avatars` | アバター画像 | 公開 | なし |

### 6.2 ファイルパス規則

```
audio-samples/
  ├── contents/{content_id}.mp3
  └── contents/{content_id}_slow.mp3  (スロー版、オプション)

user-recordings/
  └── {user_id}/
      └── {practice_record_id}.webm

avatars/
  └── {user_id}.jpg
```

---

## 7. データ型選択の理由

| データ型 | 使用箇所 | 理由 |
|---------|---------|------|
| UUID | 主キー | セキュリティ、分散システム対応 |
| TIMESTAMPTZ | タイムスタンプ | タイムゾーン対応 |
| JSONB | 動的データ | 柔軟性、インデックス対応 |
| TEXT[] | タグ | PostgreSQLのArray型、GINインデックス |
| INTEGER | スコア、カウント | 数値計算に最適 |
| TEXT | 文字列 | 可変長、制限なし |

---

## 8. サンプルデータ

### 8.1 初期データ（バッジマスター）

```sql
-- バッジの初期データ
INSERT INTO badges (name, description, badge_type, condition, display_order) VALUES
('初めての一歩', '初めての練習を完了', 'achievement', '{"type": "practice_count", "count": 1}', 1),
('3日連続', '3日連続で練習', 'streak', '{"type": "streak", "days": 3}', 2),
('1週間連続', '7日連続で練習', 'streak', '{"type": "streak", "days": 7}', 3),
('1ヶ月連続', '30日連続で練習', 'streak', '{"type": "streak", "days": 30}', 4),
('練習マスター', '100回練習達成', 'achievement', '{"type": "practice_count", "count": 100}', 10),
('完璧主義者', 'A評価を3回連続獲得', 'skill', '{"type": "perfect_score", "grade": "A", "consecutive": 3}', 20),
('発音マスター', '難しい単語を完璧に発音', 'skill', '{"type": "difficult_word_mastered", "count": 10}', 21);
```

---

## 9. 今後の拡張

### 9.1 フェーズ2以降の追加テーブル候補

- **assignments** (課題): 先生が生徒に課題を配信
- **notifications** (通知): システム通知、先生からのメッセージ
- **leaderboards** (ランキング): クラス内ランキング
- **word_dictionary** (単語辞書): 単語の発音、意味、例文

### 9.2 パフォーマンス監視

- スロークエリログの監視
- インデックス使用率の確認
- テーブルサイズの監視

---

**作成日**: 2025-11-28
**次回レビュー**: プロトタイプ実装後
