# Supabase Database Migrations

このディレクトリには、英文音読評価アプリケーションのSupabaseデータベーススキーマとマイグレーションファイルが含まれています。

## マイグレーションファイル

| ファイル | 内容 |
|---------|------|
| `00_initial_schema.sql` | テーブル作成、インデックス定義 |
| `01_rls_policies.sql` | Row Level Security (RLS) ポリシー |
| `02_functions_triggers.sql` | 関数、トリガー、自動処理 |
| `03_seed_data.sql` | 初期データ（バッジ、サンプルコンテンツ） |

## セットアップ方法

### 方法1: Supabase CLIを使用（推奨）

1. **Supabase CLIのインストール**
```bash
npm install -g supabase
```

2. **Supabaseプロジェクトの初期化**
```bash
supabase init
```

3. **ローカル開発環境の起動**
```bash
supabase start
```

4. **マイグレーションの適用**
```bash
supabase db reset  # 初回のみ
# または
supabase db push   # 既存のDBに適用
```

5. **本番環境へのデプロイ**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 方法2: Supabase Dashboard（Web UI）を使用

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左サイドバーから **SQL Editor** を開く
4. 以下の順序でマイグレーションファイルを実行：
   - `00_initial_schema.sql`
   - `01_rls_policies.sql`
   - `02_functions_triggers.sql`
   - `03_seed_data.sql`

### 方法3: psqlコマンドを使用

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/00_initial_schema.sql \
  -f supabase/migrations/01_rls_policies.sql \
  -f supabase/migrations/02_functions_triggers.sql \
  -f supabase/migrations/03_seed_data.sql
```

## 重要な注意事項

### 1. 初期データのcreated_by フィールド

`03_seed_data.sql`のサンプルコンテンツは、`created_by`フィールドにプレースホルダーUUID（`00000000-0000-0000-0000-000000000000`）を使用しています。

**本番環境では以下の手順が必要です：**

1. 管理者（先生）アカウントを作成
2. サンプルコンテンツの`created_by`を更新

```sql
-- 例: 管理者UUIDで更新
UPDATE contents
SET created_by = 'your-admin-teacher-uuid'
WHERE created_by = '00000000-0000-0000-0000-000000000000';
```

または、サンプルデータを削除して、独自のコンテンツを作成してください。

### 2. ストレージバケットの作成

マイグレーションとは別に、Supabaseダッシュボードでストレージバケットを作成する必要があります：

#### バケット作成手順

1. Supabase Dashboard → **Storage**
2. 以下の3つのバケットを作成：

| バケット名 | 公開設定 | 説明 |
|-----------|---------|------|
| `audio-samples` | Public | お手本音声ファイル |
| `user-recordings` | Private | ユーザーの録音ファイル |
| `avatars` | Public | プロフィール画像 |

#### バケットポリシーの設定

**audio-samples（お手本音声）:**
```sql
-- SELECT: 誰でも読み取り可能
CREATE POLICY "Public can view audio samples"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-samples');

-- INSERT: 先生のみアップロード可能
CREATE POLICY "Teachers can upload audio samples"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-samples'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE user_type = 'teacher'
  )
);
```

**user-recordings（ユーザー録音）:**
```sql
-- SELECT: 本人のみ、または担当の先生
CREATE POLICY "Users can view own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT: 本人のみ
CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**avatars（プロフィール画像）:**
```sql
-- SELECT: 誰でも読み取り可能
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- INSERT/UPDATE: 本人のみ
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND name = auth.uid()::text || '.jpg'
);
```

## データベーススキーマ概要

### テーブル一覧

1. **profiles** - ユーザープロフィール
2. **classes** - クラス管理
3. **contents** - 英文コンテンツ
4. **practice_records** - 練習記録
5. **difficult_words** - 苦手単語リスト
6. **badges** - バッジマスター
7. **user_badges** - ユーザー獲得バッジ
8. **milestones** - マイルストーン（レベル、統計）
9. **favorites** - お気に入りコンテンツ

### 主要な機能

- **自動トリガー**:
  - プロフィール作成時にマイルストーンを自動作成
  - 練習記録作成時に統計を自動更新
  - バッジの自動付与
  - 苦手単語の自動抽出

- **Row Level Security**:
  - 生徒は自分のデータのみアクセス可能
  - 先生は担当クラスの生徒データを閲覧可能

- **便利な関数**:
  - `get_user_statistics(user_id)` - ユーザー統計取得
  - `get_class_statistics(class_id)` - クラス統計取得

## 開発時の便利なクエリ

### 全テーブルの確認
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### RLSポリシーの確認
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### トリガーの確認
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### 関数の確認
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

## トラブルシューティング

### エラー: "relation already exists"
既にテーブルが存在する場合。データベースをリセットするか、`DROP TABLE IF EXISTS`を使用。

```bash
supabase db reset  # ローカル環境
```

### エラー: "permission denied for table"
RLSポリシーが正しく設定されていない可能性。ポリシーを再確認してください。

### バッジが自動付与されない
トリガーが正しく動作しているか確認：
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%badge%';
```

## 次のステップ

データベースセットアップ後：
1. フロントエンド環境構築（React + Vite + TypeScript）
2. Supabase クライアント設定
3. 認証フローの実装
4. UI コンポーネントの開発

## リソース

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
