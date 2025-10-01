# TRAVELER – 旅行予約デモ（JS + PHP）

このリポジトリは、旅行予約サイトの一般的な**UI/UX**（検索フォーム、一覧、並べ替え/絞り込み）をモックデータで再現したデモです。既存サイトのコンテンツや意匠を複製せず、**独自デザイン**と**汎用的な機能構成**にしています。

## すぐ試す
```bash
php -S 127.0.0.1:9000 -t backend
# 別ターミナル
python3 -m http.server 8080 -d public

# 初回のみ: SCSS をビルドして CSS を生成
npm install
npm run dev
```

- `npm run dev` を起動したままにすると、`src/scss/` の変更が自動的に `public/main.css` へ反映されます。
- 単発で反映したい場合は `npm run scss` や `npx sass src/scss/main.scss public/main.css` を実行してください。
