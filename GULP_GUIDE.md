# Gulp.js 自動化ガイド

## 🎯 導入完了

Gulp.jsによる自動化システムが導入されました！SCSS コンパイル、CSS最適化、ライブリロードなどが自動化されています。

## 📋 利用可能なタスク

### 開発用コマンド

```bash
# 開発サーバー起動 + SCSS監視 + ライブリロード
npm run dev

# ファイル監視のみ（サーバー起動なし）
npm run watch

# SCSS を一度だけコンパイル
npm run scss
```

### 本番用コマンド

```bash
# 本番用ビルド（通常版 + 圧縮版CSS生成）
npm run build

# ファイルクリーンアップ
npm run clean
```

### サーバー関連

```bash
# ローカルサーバー起動（ポート3000）
npm run serve
```

## ⚡ 主な機能

### 1. **SCSS 自動コンパイル**
- `src/scss/main.scss` → `public/styles.css`
- ソースマップ生成（開発用）
- エラー時も処理継続

### 2. **ライブリロード**
- HTML/CSS/JSファイル変更時に自動ブラウザリフレッシュ
- ポート3000でローカルサーバー起動
- SCSS変更時は即座にCSSインジェクション

### 3. **本番用最適化**
- CSS圧縮（`styles.min.css`生成）
- 通常版と圧縮版の両方出力
- 不要ファイルのクリーンアップ

### 4. **ファイル監視**
- SCSS ファイル変更を自動検出
- HTML/JS ファイル変更でブラウザリロード

## 🚀 推奨ワークフロー

### 開発時
```bash
# 開発開始
npm run dev
```
- ブラウザが自動的に開きます（localhost:3000）
- SCSSファイルを編集すると即座にブラウザに反映
- HTML/JSファイルを編集するとページがリロード

### 本番リリース前
```bash
# 本番用ビルド
npm run build
```
- `public/styles.css` - 通常版CSS
- `public/styles.min.css` - 圧縮版CSS（本番用）

## 📁 ファイル構造

```
gulpfile.js           # Gulp設定ファイル
src/scss/            # SCSS ソースファイル
  ├── main.scss      # メインファイル
  ├── _variables.scss
  ├── _mixins.scss
  └── ...
public/              # 出力先
  ├── styles.css     # コンパイル済みCSS
  ├── styles.min.css # 圧縮版CSS
  └── styles.css.map # ソースマップ（開発用）
```

## 🔧 カスタマイズ

`gulpfile.js` を編集することで以下をカスタマイズ可能：

- **ポート番号**: `port: 3000` 部分を変更
- **監視ファイル**: `paths` オブジェクトのパスを変更
- **CSS圧縮レベル**: `cleanCSS({ level: 2 })` を調整
- **出力形式**: `outputStyle` を変更

## 🛠️ トラブルシューティング

### ポートが使用中の場合
```bash
# 別のポートを使用（gulpfile.js で設定変更）
port: 3001
```

### SCSS エラーの場合
- コンパイルエラーはターミナルに表示されます
- エラーがあってもGulpは停止しません
- 修正後、自動的に再コンパイルされます

### ブラウザが開かない場合
```bash
# 手動でアクセス
open http://localhost:3000
```

## 📈 次のステップ

今後の拡張案：
- 画像最適化タスクの追加
- JavaScript バンドリング
- CSS Autoprefixer の再導入
- TypeScript サポート

Gulp.jsによる自動化で開発効率が大幅に向上します！🎉
