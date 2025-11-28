# Supabaseセットアップガイド

このガイドでは、Reading Appで使用するSupabaseプロジェクトのセットアップ手順を説明します。

## 📋 目次

1. [Supabaseアカウント作成](#1-supabaseアカウント作成)
2. [新規プロジェクト作成](#2-新規プロジェクト作成)
3. [データベースマイグレーション実行](#3-データベースマイグレーション実行)
4. [ストレージバケット作成](#4-ストレージバケット作成)
5. [環境変数の設定](#5-環境変数の設定)
6. [動作確認](#6-動作確認)

---

## 1. Supabaseアカウント作成

1. [Supabase公式サイト](https://supabase.com/)にアクセス
2. 右上の「Start your project」をクリック
3. GitHubアカウントでサインイン（推奨）
   - または、メールアドレスで登録

## 2. 新規プロジェクト作成

### 2.1 プロジェクトの作成

1. ダッシュボードで「New Project」をクリック
2. 以下の情報を入力：
   - **Name**: `reading-app` (任意の名前)
   - **Database Password**: 強力なパスワードを生成・保存
   - **Region**: `Northeast Asia (Tokyo)` (日本向けの場合)
   - **Pricing Plan**: `Free` (開発・テスト用)

3. 「Create new project」をクリック
4. プロジェクトの準備完了まで数分待つ

### 2.2 プロジェクト情報の確認

プロジェクトが作成されたら、以下の情報を確認・コピーします：

1. 左サイドバーの「Settings」→「API」を開く
2. 以下をコピーしてメモ：
   - **Project URL** (例: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (長い文字列)

## 3. データベースマイグレーション実行

### 3.1 SQL Editorを開く

1. 左サイドバーの「SQL Editor」をクリック
2. 「+ New query」をクリック

### 3.2 マイグレーションの実行

プロジェクト内の`supabase/migrations/`にある4つのSQLファイルを**順番に**実行します。

#### ステップ1: 初期スキーマ

1. `supabase/migrations/00_initial_schema.sql`の内容をコピー
2. SQL Editorに貼り付け
3. 右下の「Run」ボタンをクリック
4. 「Success. No rows returned」と表示されればOK

#### ステップ2: RLSポリシー

1. `supabase/migrations/01_rls_policies.sql`の内容をコピー
2. SQL Editorに貼り付け（新しいクエリ）
3. 「Run」をクリック

#### ステップ3: 関数とトリガー

1. `supabase/migrations/02_functions_triggers.sql`の内容をコピー
2. SQL Editorに貼り付け（新しいクエリ）
3. 「Run」をクリック

#### ステップ4: 初期データ

1. `supabase/migrations/03_seed_data.sql`の内容をコピー
2. SQL Editorに貼り付け（新しいクエリ）
3. 「Run」をクリック

### 3.3 動作確認

1. 左サイドバーの「Table Editor」をクリック
2. 以下のテーブルが作成されていることを確認：
   - profiles
   - classes
   - contents
   - practice_records
   - difficult_words
   - badges
   - user_badges
   - milestones
   - favorites

3. `badges`テーブルを開いて、17個のバッジが登録されていることを確認
4. `contents`テーブルを開いて、サンプルコンテンツが登録されていることを確認

## 4. ストレージバケット作成

音声ファイルやアバター画像を保存するためのバケットを作成します。

### 4.1 バケットの作成

1. 左サイドバーの「Storage」をクリック
2. 「Create a new bucket」をクリック

#### バケット1: audio-samples（お手本音声）

1. **Name**: `audio-samples`
2. **Public bucket**: ✅ チェックを入れる
3. 「Create bucket」をクリック

#### バケット2: user-recordings（ユーザー録音）

1. 「Create a new bucket」をクリック
2. **Name**: `user-recordings`
3. **Public bucket**: ❌ チェックを外す（プライベート）
4. 「Create bucket」をクリック

#### バケット3: avatars（プロフィール画像）

1. 「Create a new bucket」をクリック
2. **Name**: `avatars`
3. **Public bucket**: ✅ チェックを入れる
4. 「Create bucket」をクリック

### 4.2 ストレージポリシーの設定

各バケットに適切なアクセスポリシーを設定します。

#### audio-samples のポリシー

1. `audio-samples`バケットを選択
2. 「Policies」タブをクリック
3. 「New Policy」→「For full customization」を選択
4. 以下のポリシーを追加：

**SELECT Policy（誰でも読み取り可能）:**
```sql
Policy name: Public can view audio samples
Allowed operation: SELECT
Target roles: public

USING expression:
bucket_id = 'audio-samples'
```

**INSERT Policy（先生のみアップロード）:**
```sql
Policy name: Teachers can upload audio samples
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'audio-samples'
AND auth.uid() IN (
  SELECT id FROM profiles WHERE user_type = 'teacher'
)
```

#### user-recordings のポリシー

1. `user-recordings`バケットを選択
2. 「Policies」タブをクリック
3. 以下のポリシーを追加：

**SELECT Policy（本人のみ）:**
```sql
Policy name: Users can view own recordings
Allowed operation: SELECT
Target roles: authenticated

USING expression:
bucket_id = 'user-recordings'
AND (storage.foldername(name))[1] = auth.uid()::text
```

**INSERT Policy（本人のみ）:**
```sql
Policy name: Users can upload own recordings
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'user-recordings'
AND (storage.foldername(name))[1] = auth.uid()::text
```

#### avatars のポリシー

1. `avatars`バケットを選択
2. 「Policies」タブをクリック
3. 以下のポリシーを追加：

**SELECT Policy（誰でも読み取り可能）:**
```sql
Policy name: Public can view avatars
Allowed operation: SELECT
Target roles: public

USING expression:
bucket_id = 'avatars'
```

**INSERT/UPDATE Policy（本人のみ）:**
```sql
Policy name: Users can upload own avatar
Allowed operation: INSERT, UPDATE
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'avatars'
AND name = auth.uid()::text || '.jpg'
```

## 5. 環境変数の設定

### 5.1 .envファイルの作成

プロジェクトのルートディレクトリで：

```bash
cp .env.example .env
```

### 5.2 Supabase認証情報の設定

`.env`ファイルを開いて、先ほどコピーした情報を貼り付けます：

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（長い文字列）
```

## 6. 動作確認

### 6.1 アプリケーションの起動

```bash
# 依存関係のインストール（初回のみ）
pnpm install

# 開発サーバーの起動
pnpm dev
```

ブラウザで http://localhost:3000 を開きます。

### 6.2 Supabase接続テスト

SQL Editorで以下のクエリを実行して、データが取得できることを確認：

```sql
-- バッジの一覧を取得
SELECT * FROM badges ORDER BY display_order;

-- コンテンツの一覧を取得
SELECT id, title, difficulty_level, category FROM contents WHERE is_published = true;
```

## 🎉 セットアップ完了！

これでSupabaseのセットアップが完了しました。次は認証機能の実装に進みましょう。

---

## トラブルシューティング

### エラー: "relation already exists"

既にテーブルが存在している場合のエラーです。

**解決方法**:
1. Table Editorで既存のテーブルを削除
2. または、SQL Editorで以下を実行：
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
3. マイグレーションを再実行

### エラー: "permission denied"

RLSポリシーの問題です。

**解決方法**:
1. SQL Editorで以下を実行してRLSの状態を確認：
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

2. 必要に応じて`01_rls_policies.sql`を再実行

### マイグレーションが途中で失敗する

**解決方法**:
1. エラーメッセージをよく読む
2. 該当する箇所を修正
3. 失敗した箇所から再実行

### ストレージポリシーが適用されない

**解決方法**:
1. Storageの「Configuration」タブを確認
2. RLSが有効になっているか確認
3. ポリシーの構文エラーをチェック

---

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Auth ガイド](https://supabase.com/docs/guides/auth)
- [Supabase Storage ガイド](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 次のステップ

- [ ] 認証機能の実装
- [ ] ログイン/サインアップページの作成
- [ ] ダッシュボードの実装
- [ ] コンテンツ一覧の実装
