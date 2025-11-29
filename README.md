# Reading App - 英文音読評価アプリケーション

小学生、中学生、高校生を対象とした英文音読練習アプリケーション。学習者が英文を音読し、その発音を自動評価してフィードバックを提供します。

## 📚 プロジェクト概要

- **ターゲットユーザー**: 学習者（小中高生）、先生
- **主な機能**: 英文音読、発音評価、学習履歴管理、統計ダッシュボード
- **技術スタック**: React 18, TypeScript, Vite, Material-UI, Supabase

## 🎯 実装済み機能

### ✅ 学習者向け機能
- **ユーザー認証**: 新規登録、ログイン、ログアウト
- **コンテンツ閲覧**: 11件のサンプル英文コンテンツ
- **フィルタリング**: 難易度、カテゴリ、キーワード検索
- **音読練習**:
  - マイク録音（MediaRecorder API）
  - リアルタイム音声認識（Web Speech API）
  - 発音評価（単語ごとの正確性スコア）
  - 4段階グレード評価（A/B/C/D）
  - 詳細フィードバック（良かった点・改善点）
- **学習履歴**:
  - 練習記録の自動保存
  - 履歴一覧表示
  - 期間・グレード別フィルタリング
  - 詳細モーダル表示
- **ダッシュボード統計**:
  - 総練習回数、平均スコア、最高スコア
  - 今週の練習回数、連続学習日数
  - グレード別集計
  - 最近の練習記録プレビュー

### 🗄️ バックエンド
- **データベース**: 9テーブルの完全なスキーマ
- **セキュリティ**: Row Level Security (RLS) ポリシー
- **自動化**: トリガーとストアド関数

## 🚀 クイックスタート

### 前提条件

- Node.js 18.x 以上
- pnpm (推奨) または npm
- Supabaseアカウント（無料プランでOK）

### 1. リポジトリのクローン

```bash
git clone <your-repository-url>
cd reading_app
```

### 2. 依存関係のインストール

```bash
pnpm install
# または
npm install
```

### 3. Supabaseのセットアップ

**📖 詳細は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) を参照**

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQL Editorで以下のマイグレーションを**順番に**実行:
   - `supabase/migrations/00_initial_schema.sql`
   - `supabase/migrations/01_rls_policies.sql`
   - `supabase/migrations/02_functions_triggers.sql`
   - `supabase/migrations/03_seed_data.sql`
3. ストレージバケットを作成:
   - `audio-samples` (public)
   - `user-recordings` (private)
   - `avatars` (public)

### 4. 環境変数の設定

`.env.example`を`.env`にコピー:

```bash
cp .env.example .env
```

`.env`ファイルを編集（SupabaseダッシュボードのSettings → APIから取得）:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...（長い文字列）
```

### 5. 開発サーバーの起動

```bash
pnpm dev
# または
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 🌐 Vercelへのデプロイ（本番環境）

**📖 詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照**

### クイックデプロイ手順

1. GitHubにコードをプッシュ
2. [Vercel](https://vercel.com/)にログイン（GitHubアカウント推奨）
3. 「New Project」→ リポジトリをインポート
4. 環境変数を設定:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 「Deploy」をクリック

デプロイ後、生成されたURLでアプリが動作します。

## 📁 プロジェクト構造

```
reading_app/
├── src/
│   ├── components/         # Reactコンポーネント
│   │   ├── Layout.tsx      # 共通レイアウト
│   │   ├── Navbar.tsx      # ナビゲーションバー
│   │   ├── ContentCard.tsx # コンテンツカード
│   │   ├── ContentFilters.tsx # フィルターUI
│   │   └── PracticeRecordCard.tsx # 練習記録カード
│   ├── pages/              # ページコンポーネント
│   │   ├── LoginPage.tsx   # ログイン
│   │   ├── SignupPage.tsx  # 新規登録
│   │   ├── DashboardPage.tsx # ダッシュボード（統計）
│   │   ├── ContentsPage.tsx  # コンテンツ一覧
│   │   ├── PracticePage.tsx  # 音読練習
│   │   └── HistoryPage.tsx   # 学習履歴
│   ├── hooks/              # カスタムフック
│   │   ├── useAuth.ts      # 認証
│   │   ├── useContents.ts  # コンテンツ取得
│   │   ├── usePracticeRecords.ts # 練習記録
│   │   ├── useUserStats.ts # ユーザー統計
│   │   ├── useAudioRecorder.ts # 音声録音
│   │   └── useSpeechRecognition.ts # 音声認識
│   ├── utils/
│   │   └── evaluatePronunciation.ts # 発音評価ロジック
│   ├── lib/                # ライブラリ設定
│   │   ├── supabase.ts     # Supabaseクライアント
│   │   └── queryClient.ts  # React Query設定
│   ├── store/              # Zustand状態管理
│   │   └── authStore.ts    # 認証状態
│   ├── types/              # TypeScript型定義
│   │   └── database.ts     # DBスキーマ型
│   └── App.tsx             # メインアプリ
├── supabase/
│   └── migrations/         # データベースマイグレーション
├── REQUIREMENTS.md         # 要件定義書
├── TECH_SELECTION.md       # 技術選定書
├── DATABASE_DESIGN.md      # データベース設計書
├── SUPABASE_SETUP.md       # Supabaseセットアップガイド
├── DEPLOYMENT.md           # デプロイガイド
└── package.json
```

## 🛠️ 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 (http://localhost:5173) |
| `pnpm build` | 本番ビルド |
| `pnpm preview` | ビルドのプレビュー |
| `pnpm lint` | ESLintでコードチェック |
| `pnpm lint:fix` | ESLintで自動修正 |
| `pnpm format` | Prettierでコード整形 |
| `pnpm type-check` | TypeScriptの型チェック |

## 🎨 技術スタック

### フロントエンド
- **React 18** - UIフレームワーク
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Material-UI (MUI)** - UIコンポーネントライブラリ
- **React Router v6** - ルーティング
- **Zustand** - クライアント状態管理
- **React Query (TanStack Query)** - サーバー状態管理
- **React Hook Form + Zod** - フォーム管理・バリデーション
- **date-fns** - 日付操作

### バックエンド
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL - データベース
  - Auth - 認証（メール/パスワード）
  - Storage - ファイルストレージ
  - Row Level Security - データセキュリティ

### 音声処理
- **MediaRecorder API** - 音声録音
- **Web Speech API** - 音声認識（MVP版）
- **Levenshtein Distance** - 単語類似度計算

## 📖 ドキュメント

- [要件定義書 (REQUIREMENTS.md)](./REQUIREMENTS.md) - プロジェクトの詳細な要件
- [技術選定書 (TECH_SELECTION.md)](./TECH_SELECTION.md) - 技術スタックの選定理由
- [データベース設計書 (DATABASE_DESIGN.md)](./DATABASE_DESIGN.md) - データベーススキーマ詳細
- [Supabaseセットアップ (SUPABASE_SETUP.md)](./SUPABASE_SETUP.md) - データベースマイグレーション手順
- [デプロイガイド (DEPLOYMENT.md)](./DEPLOYMENT.md) - Vercelへのデプロイ手順

## 🚧 開発ロードマップ

### ✅ フェーズ1: MVP（完了）
- [x] プロジェクトセットアップ
- [x] データベース設計・マイグレーション
- [x] ユーザー認証機能（登録・ログイン）
- [x] コンテンツ閲覧・フィルタリング
- [x] 音読練習機能（録音・音声認識・評価）
- [x] 学習履歴の記録・表示
- [x] ダッシュボード統計

### 🔄 フェーズ2: コア機能拡張（未実装）
- [ ] 先生アカウント・クラス管理
- [ ] コンテンツ作成・編集機能
- [ ] 高精度音声認識API導入 (Speechace)
- [ ] フィードバック機能の充実

### 📅 フェーズ3: ゲーミフィケーション（未実装）
- [ ] バッジシステムの有効化
- [ ] マイルストーンの有効化
- [ ] お気に入り機能

### 🌟 フェーズ4: 追加機能（未実装）
- [ ] ランキング
- [ ] 通知機能
- [ ] レポート機能の強化
- [ ] UI/UXの改善

## 🎯 使い方

### 1. 新規ユーザー登録

1. トップページで「新規登録」をクリック
2. 名前、メールアドレス、パスワードを入力
3. ユーザータイプ（生徒/先生）と学年を選択
4. 「登録」をクリック

### 2. コンテンツを選ぶ

1. ダッシュボードまたはナビゲーションバーの「コンテンツ」をクリック
2. 難易度やカテゴリでフィルタリング
3. 興味のあるコンテンツをクリック

### 3. 音読練習

1. 「録音開始」ボタンをクリック
2. 英文を音読
3. 「録音停止」ボタンをクリック
4. 数秒後、評価結果が表示される

### 4. 学習履歴を確認

1. ナビゲーションバーの「学習履歴」をクリック
2. 過去の練習記録を確認
3. 記録をクリックして詳細を表示

## ⚠️ ブラウザ対応

### 推奨ブラウザ
- **Google Chrome** (最新版) - 完全対応
- **Microsoft Edge** (最新版) - 完全対応
- **Safari** (macOS/iOS) - 音声認識対応

### 非対応ブラウザ
- Firefox - Web Speech API非対応のため音声認識不可

## 🔧 トラブルシューティング

### マイクが動作しない

- ブラウザのマイク許可を確認
- HTTPSでアクセスしているか確認（localhost除く）
- デバイスのマイクが正常に動作するか確認

### 音声認識が動作しない

- Chrome、Edge、Safariを使用しているか確認
- インターネット接続を確認（Web Speech APIはオンライン必須）
- ページを再読み込みして再試行

### ログインできない

- メールアドレスとパスワードを確認
- Supabaseプロジェクトが正しく設定されているか確認
- ブラウザのコンソールでエラーを確認

## 🤝 コントリビューション

このプロジェクトは現在開発中です。

## 📝 ライセンス

Private Project

## 📞 サポート

質問や問題がある場合は、Issueを作成してください。

---

**作成日**: 2025-11-29
**最終更新**: 2025-11-29
**バージョン**: 1.0.0 (MVP)
