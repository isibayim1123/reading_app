# デプロイガイド - Vercel

このガイドでは、Reading AppをVercelにデプロイする手順を説明します。

## 📋 前提条件

- ✅ Supabaseプロジェクトがセットアップ済み（[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)参照）
- ✅ GitHubリポジトリにコードがプッシュ済み
- ✅ Supabase URL と anon key を取得済み

---

## 🚀 Vercelへのデプロイ手順

### 1. Vercelアカウントの作成

1. [Vercel公式サイト](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. **GitHubアカウントでサインアップ**（推奨）

### 2. 新規プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリの一覧から`reading_app`を選択
3. 「Import」をクリック

### 3. プロジェクト設定

#### 3.1 Framework Preset
- **Framework Preset**: `Vite` が自動検出されます
- そのままでOK

#### 3.2 Root Directory
- **Root Directory**: `.` (デフォルト)
- そのままでOK

#### 3.3 Build Settings
以下が自動設定されます：
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

変更不要です。

#### 3.4 Environment Variables（重要！）

「Environment Variables」セクションで以下を追加：

| Key | Value | 説明 |
|-----|-------|------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | SupabaseプロジェクトURL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase anon public key |

**取得方法**:
1. [Supabase Dashboard](https://app.supabase.com/)を開く
2. プロジェクトを選択
3. 左サイドバー「Settings」→「API」
4. **Project URL** と **anon public** をコピー

### 4. デプロイ実行

1. 「Deploy」ボタンをクリック
2. デプロイが開始されます（通常1〜3分）
3. 「Congratulations!」画面が表示されたら完了

### 5. デプロイされたアプリの確認

1. Vercelが生成したURLをクリック（例: `https://reading-app-xxxx.vercel.app`）
2. アプリが正常に表示されることを確認
3. サインアップ機能をテスト

---

## 🔧 デプロイ後の設定

### カスタムドメインの設定（オプション）

独自ドメインを使いたい場合：

1. Vercelプロジェクトの「Settings」→「Domains」
2. カスタムドメインを入力
3. DNS設定の指示に従う

### 環境変数の更新

環境変数を変更する場合：

1. Vercelプロジェクトの「Settings」→「Environment Variables」
2. 変更したい変数を編集
3. 「Save」をクリック
4. **再デプロイが必要**: 「Deployments」→最新のデプロイ→「Redeploy」

---

## 🔄 継続的デプロイ（CD）

GitHubリポジトリとVercelが連携されているため、**自動デプロイ**が有効です：

### 本番環境への自動デプロイ
- **mainブランチ**にプッシュ → 自動的に本番環境にデプロイ

### プレビュー環境の自動生成
- **その他のブランチ**にプッシュ → プレビューURLが自動生成
- プルリクエストごとに専用のプレビュー環境が作成される

---

## ✅ デプロイ確認チェックリスト

デプロイ後、以下を確認してください：

- [ ] アプリのURLにアクセスできる
- [ ] ログインページが表示される
- [ ] 新規ユーザー登録ができる
- [ ] ログイン後、ダッシュボードが表示される
- [ ] コンテンツ一覧が表示される（11件のサンプルコンテンツ）
- [ ] 練習ページで音声認識が動作する（Chromeで確認）
- [ ] 練習記録が保存される
- [ ] 学習履歴ページで過去の記録が表示される

---

## 🐛 トラブルシューティング

### エラー: "Supabase URL is not defined"

**原因**: 環境変数が設定されていない

**解決方法**:
1. Vercel「Settings」→「Environment Variables」
2. `VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`を追加
3. 再デプロイ

### エラー: Build失敗

**原因**: ビルド時のTypeScriptエラー

**解決方法**:
1. ローカルで`npm run build`を実行
2. エラーを修正
3. GitHubにプッシュして再デプロイ

### エラー: "Failed to fetch"

**原因**: SupabaseのURLまたはAPIキーが間違っている

**解決方法**:
1. Supabase Dashboardで正しい値を確認
2. Vercelの環境変数を更新
3. 再デプロイ

### 音声認識が動かない

**原因**: HTTPSでないと音声認識APIは動作しません

**解決方法**:
- Vercelは自動的にHTTPSで配信されるため、通常は問題なし
- カスタムドメインを使用している場合、SSL証明書が正しく設定されているか確認

### コンテンツが表示されない

**原因**: Supabaseのシードデータが投入されていない

**解決方法**:
1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)の手順3.2を確認
2. `03_seed_data.sql`を実行
3. Supabase Table Editorで`contents`テーブルを確認

---

## 📊 デプロイ後の監視

### Vercel Analytics（オプション）

アクセス解析を有効化：

1. Vercelプロジェクトの「Analytics」タブ
2. 「Enable Analytics」をクリック
3. ページビュー、ユーザー数などを確認可能

### Supabase Logs

データベースのログ確認：

1. Supabase Dashboard → 左サイドバー「Logs」
2. 「API」「Database」「Auth」のログを確認
3. エラーやパフォーマンスの問題を監視

---

## 🔐 セキュリティ設定（推奨）

### Supabase RLSポリシーの確認

Row Level Securityが有効になっているか確認：

```sql
-- SQL Editorで実行
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

すべてのテーブルで`rowsecurity = true`になっていることを確認。

### CORS設定

Supabaseは自動的にCORSを設定しますが、念のため確認：

1. Supabase Dashboard → Settings → API
2. 「CORS allowed origins」セクション
3. Vercelのドメインが許可されているか確認

---

## 📈 パフォーマンス最適化（推奨）

### Vercel Edge Functions（将来的に）

低レイテンシーが必要な場合、Edge Functionsを検討。

### Supabase Connection Pooling

多数のユーザーが接続する場合：

1. Supabase Dashboard → Settings → Database
2. 「Connection Pooling」を有効化
3. Pooler URLを環境変数に設定

---

## 🎉 デプロイ完了！

おめでとうございます！Reading Appが本番環境で稼働しています。

### 次のステップ

- [ ] 実際に使ってフィードバックを収集
- [ ] 追加機能の開発（バッジ、マイルストーンなど）
- [ ] 先生向け機能の実装
- [ ] Speechace APIへの移行（本格運用時）

---

## 📞 サポート

- **Vercel公式ドキュメント**: https://vercel.com/docs
- **Supabase公式ドキュメント**: https://supabase.com/docs
- **このプロジェクトのIssue**: GitHubリポジトリのIssuesタブ
