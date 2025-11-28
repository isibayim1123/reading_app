# Reading App - 英文音読評価アプリケーション

小学生、中学生、高校生を対象とした英文音読練習アプリケーション。学習者が英文を音読し、その発音を自動評価してフィードバックを提供します。

## 📚 プロジェクト概要

- **ターゲットユーザー**: 学習者（小中高生）、先生
- **主な機能**: 英文音読、発音評価、学習履歴管理、ゲーミフィケーション
- **技術スタック**: React 18, TypeScript, Vite, Material-UI, Supabase

## 🚀 クイックスタート

### 必要な環境

- Node.js 18.x 以上
- pnpm (推奨) または npm

### インストール

1. **依存関係のインストール**

```bash
pnpm install
# または
npm install
```

2. **環境変数の設定**

`.env.example`を`.env`にコピーして、Supabaseの情報を設定:

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **開発サーバーの起動**

```bash
pnpm dev
# または
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 📁 プロジェクト構造

```
reading_app/
├── src/
│   ├── components/      # Reactコンポーネント
│   ├── pages/          # ページコンポーネント
│   ├── lib/            # ライブラリ設定 (Supabase, React Query)
│   ├── hooks/          # カスタムフック
│   ├── store/          # Zustand状態管理
│   ├── types/          # TypeScript型定義
│   ├── utils/          # ユーティリティ関数
│   ├── styles/         # スタイル関連
│   ├── App.tsx         # メインアプリコンポーネント
│   └── main.tsx        # エントリーポイント
├── supabase/
│   ├── migrations/     # データベースマイグレーション
│   └── README.md       # Supabaseセットアップガイド
├── public/             # 静的ファイル
├── REQUIREMENTS.md     # 要件定義書
├── TECH_SELECTION.md   # 技術選定書
├── DATABASE_DESIGN.md  # データベース設計書
└── package.json
```

## 🛠️ 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 (http://localhost:3000) |
| `pnpm build` | 本番ビルド |
| `pnpm preview` | ビルドのプレビュー |
| `pnpm lint` | ESLintでコードチェック |
| `pnpm lint:fix` | ESLintで自動修正 |
| `pnpm format` | Prettierでコード整形 |
| `pnpm type-check` | TypeScriptの型チェック |

## 🗄️ データベースセットアップ

Supabaseのセットアップ手順は [`supabase/README.md`](./supabase/README.md) を参照してください。

### クイックセットアップ

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQL Editorで以下のマイグレーションを順番に実行:
   - `supabase/migrations/00_initial_schema.sql`
   - `supabase/migrations/01_rls_policies.sql`
   - `supabase/migrations/02_functions_triggers.sql`
   - `supabase/migrations/03_seed_data.sql`
3. ストレージバケットを作成:
   - `audio-samples` (public)
   - `user-recordings` (private)
   - `avatars` (public)

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

### バックエンド
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL - データベース
  - Auth - 認証
  - Storage - ファイルストレージ
  - Row Level Security - セキュリティ

### 音声認識 (予定)
- **Speechace API** (本番環境)
- **Web Speech API** (MVP検証)

## 📖 ドキュメント

- [要件定義書](./REQUIREMENTS.md) - プロジェクトの詳細な要件
- [技術選定書](./TECH_SELECTION.md) - 技術スタックの選定理由
- [データベース設計書](./DATABASE_DESIGN.md) - データベーススキーマ詳細
- [Supabaseセットアップ](./supabase/README.md) - データベースマイグレーション

## 🚧 開発ロードマップ

### フェーズ1: MVP (最小実用製品)
- [x] プロジェクトセットアップ
- [x] データベース設計
- [ ] ユーザー認証機能
- [ ] 基本的な音読練習機能
- [ ] 簡易的な発音評価（Web Speech API）
- [ ] 学習履歴の記録

### フェーズ2: コア機能拡張
- [ ] 先生アカウント・クラス管理
- [ ] 高精度音声認識API導入 (Speechace)
- [ ] フィードバック機能の充実
- [ ] コンテンツ管理機能

### フェーズ3: ゲーミフィケーション
- [ ] バッジシステム
- [ ] マイルストーン
- [ ] ダッシュボードの充実

### フェーズ4: 追加機能
- [ ] ランキング
- [ ] 通知機能
- [ ] レポート機能の強化
- [ ] UI/UXの改善

## 🤝 コントリビューション

このプロジェクトは現在開発中です。

## 📝 ライセンス

Private Project

## 📞 サポート

質問や問題がある場合は、Issueを作成してください。

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
