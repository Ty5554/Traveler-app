# SCSS導入完了

## 📁 ディレクトリ構造

```
src/scss/
├── _variables.scss    # 色、フォント、間隔などの変数
├── _mixins.scss       # 再利用可能なミックスイン
├── _base.scss         # ベーススタイルとリセット
├── _components.scss   # UI コンポーネント（ボタン、カード、モーダルなど）
├── _layout.scss       # レイアウト（ヘッダー、フッター、セクションなど）
├── _media-queries.scss # レスポンシブデザイン
└── main.scss          # メインファイル（すべてをインポート）
```

## 🚀 使用方法

### ビルドコマンド

```bash
# 1回だけコンパイル
npm run build-css

# ファイル変更を監視して自動コンパイル
npm run watch-css

# 圧縮版でコンパイル（本番用）
npm run build-css-compressed
```

## ✨ SCSS の改善点

### 1. **変数による管理**
- 色、フォント、サイズなどを変数で一元管理
- `$brand: #2b7cff;` のように簡潔に記述

### 2. **ミックスインによる再利用**
- `@include flex-center;` でよく使うスタイルを簡単に適用
- `@include button-primary;` でボタンスタイルを統一

### 3. **ネストによる構造化**
- CSS のネストで親子関係を明確に
- 保守性が大幅に向上

### 4. **ファイル分割による整理**
- 機能別にファイルを分割
- 大きなCSSファイルが管理しやすく

### 5. **メディアクエリの簡略化**
- `@include mobile { ... }` で簡単にレスポンシブ対応

## 📝 今後の開発

今後は `src/scss/` 内のファイルを編集してください：

- 色を変更 → `_variables.scss`
- 新しいコンポーネント → `_components.scss`
- レイアウト調整 → `_layout.scss`
- レスポンシブ対応 → `_media-queries.scss`

変更後は `npm run build-css` または `npm run watch-css` でCSSを再生成できます。
