-- ============================================================================
-- Seed Data
-- 英文音読評価アプリケーション - 初期データ
-- ============================================================================

-- ============================================================================
-- 1. BADGES MASTER DATA
-- ============================================================================

-- Achievement Badges (練習回数ベース)
INSERT INTO badges (name, description, badge_type, condition, icon_url, display_order) VALUES
('初めての一歩', '初めての練習を完了しました！', 'achievement', '{"type": "practice_count", "count": 1}', null, 1),
('練習好き', '10回の練習を達成！', 'achievement', '{"type": "practice_count", "count": 10}', null, 2),
('練習マスター', '50回の練習を達成！', 'achievement', '{"type": "practice_count", "count": 50}', null, 3),
('練習の達人', '100回の練習を達成！', 'achievement', '{"type": "practice_count", "count": 100}', null, 4),
('レジェンド', '500回の練習を達成！驚異的です！', 'achievement', '{"type": "practice_count", "count": 500}', null, 5);

-- Streak Badges (連続日数ベース)
INSERT INTO badges (name, description, badge_type, condition, icon_url, display_order) VALUES
('3日連続', '3日連続で練習しました！', 'streak', '{"type": "streak", "days": 3}', null, 10),
('1週間連続', '7日連続で練習！素晴らしい継続力です！', 'streak', '{"type": "streak", "days": 7}', null, 11),
('2週間連続', '14日連続で練習！習慣化できています！', 'streak', '{"type": "streak", "days": 14}', null, 12),
('1ヶ月連続', '30日連続で練習！驚異的な継続力！', 'streak', '{"type": "streak", "days": 30}', null, 13),
('100日連続', '100日連続で練習！あなたは真の継続者です！', 'streak', '{"type": "streak", "days": 100}', null, 14);

-- Skill Badges (スキルベース)
INSERT INTO badges (name, description, badge_type, condition, icon_url, display_order) VALUES
('完璧主義者', 'A評価を3回連続で獲得！', 'skill', '{"type": "perfect_score", "grade": "A", "consecutive": 3}', null, 20),
('パーフェクター', 'A評価を10回連続で獲得！完璧です！', 'skill', '{"type": "perfect_score", "grade": "A", "consecutive": 10}', null, 21),
('発音マスター', '苦手な単語を10個克服しました！', 'skill', '{"type": "difficult_word_mastered", "count": 10}', null, 22);

-- Milestone Badges (マイルストーン)
INSERT INTO badges (name, description, badge_type, condition, icon_url, display_order) VALUES
('ブロンズリーダー', 'レベル5に到達！', 'milestone', '{"type": "level", "level": 5}', null, 30),
('シルバーリーダー', 'レベル10に到達！', 'milestone', '{"type": "level", "level": 10}', null, 31),
('ゴールドリーダー', 'レベル20に到達！', 'milestone', '{"type": "level", "level": 20}', null, 32),
('プラチナリーダー', 'レベル50に到達！トップクラスです！', 'milestone', '{"type": "level", "level": 50}', null, 33);

-- ============================================================================
-- 2. SAMPLE CONTENTS (デモ用サンプルコンテンツ)
-- ============================================================================

-- Note: created_by will need to be a valid teacher UUID in production
-- For now, we'll use a placeholder that should be updated

-- Elementary Level
INSERT INTO contents (title, text, translation, difficulty_level, category, tags, is_published, created_by, word_count, estimated_duration) VALUES
('Hello, World!', 'Hello! My name is Tom. I am seven years old. I like cats.', 'こんにちは！私の名前はトムです。7歳です。猫が好きです。', 'elementary', 'daily', ARRAY['挨拶', '自己紹介', '初級'], true, '00000000-0000-0000-0000-000000000000', 14, 8),
('My Family', 'I have a mother, a father, and a sister. We are a happy family.', '私にはお母さん、お父さん、妹がいます。私たちは幸せな家族です。', 'elementary', 'daily', ARRAY['家族', '日常会話', '初級'], true, '00000000-0000-0000-0000-000000000000', 14, 8),
('What I Like', 'I like apples. I like dogs. I like to play soccer.', '私はリンゴが好きです。犬が好きです。サッカーをするのが好きです。', 'elementary', 'daily', ARRAY['好み', '趣味', '初級'], true, '00000000-0000-0000-0000-000000000000', 12, 7);

-- Junior High Level
INSERT INTO contents (title, text, translation, difficulty_level, category, tags, is_published, created_by, word_count, estimated_duration) VALUES
('My Daily Routine', 'I wake up at seven o''clock every morning. After breakfast, I go to school by bus. I study English, math, and science. I come home at four o''clock.', '私は毎朝7時に起きます。朝食後、バスで学校に行きます。英語、数学、理科を勉強します。4時に帰宅します。', 'junior_high', 'daily', ARRAY['日常生活', '学校', '中級'], true, '00000000-0000-0000-0000-000000000000', 32, 18),
('Environmental Protection', 'We need to protect our environment. We should reduce plastic waste and recycle more. Everyone can make a difference.', '私たちは環境を守る必要があります。プラスチックごみを減らし、もっとリサイクルすべきです。誰もが変化をもたらせます。', 'junior_high', 'science', ARRAY['環境', '社会問題', '中級'], true, '00000000-0000-0000-0000-000000000000', 22, 13),
('The Importance of Reading', 'Reading books is very important. It helps us learn new things and improve our vocabulary. Reading also develops our imagination.', '本を読むことはとても重要です。新しいことを学び、語彙を増やすのに役立ちます。読書は想像力も育てます。', 'junior_high', 'daily', ARRAY['読書', '学習', '中級'], true, '00000000-0000-0000-0000-000000000000', 24, 14);

-- High School Level
INSERT INTO contents (title, text, translation, difficulty_level, category, tags, is_published, created_by, word_count, estimated_duration) VALUES
('Technology and Society', 'Technological advancement has dramatically changed our lives. While it brings convenience and efficiency, we must also consider its impact on employment and privacy. Finding the right balance is crucial for sustainable development.', 'テクノロジーの進歩は私たちの生活を劇的に変えました。便利さと効率性をもたらす一方で、雇用やプライバシーへの影響も考慮しなければなりません。持続可能な発展には適切なバランスを見つけることが重要です。', 'high_school', 'science', ARRAY['テクノロジー', '社会', '上級'], true, '00000000-0000-0000-0000-000000000000', 38, 22),
('The Power of Education', 'Education is the foundation of personal growth and social progress. It empowers individuals to think critically, solve problems creatively, and contribute meaningfully to society. Investing in education is investing in our future.', '教育は個人の成長と社会の進歩の基盤です。批判的に考え、創造的に問題を解決し、社会に有意義に貢献する力を個人に与えます。教育への投資は私たちの未来への投資です。', 'high_school', 'daily', ARRAY['教育', '社会', '上級'], true, '00000000-0000-0000-0000-000000000000', 42, 24);

-- Exam Preparation (英検・入試対策)
INSERT INTO contents (title, text, translation, difficulty_level, category, tags, is_published, created_by, word_count, estimated_duration) VALUES
('英検3級 対策: 自己紹介', 'My name is Yuki. I am a junior high school student. In my free time, I enjoy playing tennis and reading mystery novels. My dream is to become a teacher in the future.', '私の名前はユキです。中学生です。自由時間には、テニスをしたりミステリー小説を読んだりするのを楽しんでいます。将来の夢は先生になることです。', 'junior_high', 'eiken', ARRAY['英検3級', '自己紹介', '試験対策'], true, '00000000-0000-0000-0000-000000000000', 34, 18),
('英検準2級 対策: 意見表明', 'I believe that learning foreign languages is essential in today''s globalized world. It enables us to communicate with people from different cultures and broadens our perspectives. Moreover, it opens up more career opportunities.', '今日のグローバル化した世界では、外国語を学ぶことが不可欠だと思います。それによって異なる文化の人々とコミュニケーションを取ることができ、視野が広がります。さらに、より多くのキャリアの機会も開かれます。', 'high_school', 'eiken', ARRAY['英検準2級', '意見', '試験対策'], true, '00000000-0000-0000-0000-000000000000', 40, 23),
('大学入試 長文対策', 'Climate change is one of the most pressing issues facing humanity today. Rising global temperatures are causing glaciers to melt, sea levels to rise, and extreme weather events to become more frequent. Scientists warn that without immediate action to reduce greenhouse gas emissions, the consequences could be catastrophic for future generations.', '気候変動は今日人類が直面している最も差し迫った問題の一つです。地球の気温上昇により、氷河が溶け、海面が上昇し、異常気象がより頻繁になっています。科学者たちは、温室効果ガスの排出を減らすための即座の行動がなければ、将来の世代にとって壊滅的な結果になる可能性があると警告しています。', 'high_school', 'exam', ARRAY['大学入試', '長文', '環境問題'], true, '00000000-0000-0000-0000-000000000000', 62, 35);

-- ============================================================================
-- 3. NOTES
-- ============================================================================

-- Note: The created_by field uses a placeholder UUID (all zeros)
-- In production, you should:
-- 1. Create a system/admin teacher account first
-- 2. Update these records with the actual teacher UUID
-- OR
-- 3. Use a database migration to set up a dedicated "System" teacher account

-- To update created_by field after creating a teacher account:
-- UPDATE contents SET created_by = 'your-teacher-uuid-here' WHERE created_by = '00000000-0000-0000-0000-000000000000';

-- ============================================================================
-- 4. HELPFUL QUERIES FOR TESTING
-- ============================================================================

-- Uncomment these to use during development/testing:

-- -- View all badges
-- SELECT * FROM badges ORDER BY display_order;
--
-- -- View all contents by difficulty
-- SELECT title, difficulty_level, category, word_count FROM contents ORDER BY difficulty_level, title;
--
-- -- Count contents by category
-- SELECT category, COUNT(*) as count FROM contents GROUP BY category ORDER BY count DESC;
--
-- -- Count contents by difficulty
-- SELECT difficulty_level, COUNT(*) as count FROM contents GROUP BY difficulty_level ORDER BY difficulty_level;
