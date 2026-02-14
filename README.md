# Tab Disambiguator

Tab Disambiguator は、Obsidian の**ファイルタブ**に親フォルダ名ラベルを追加し、同名ファイルを見分けやすくするコミュニティプラグインです。

## 現在の仕様

- 対象はファイルタブのみ（`FileView`）。設定画面や検索などの非ファイルタブは対象外
- タブ内の**ファイル名の右隣**に、1つ上の親フォルダ名を表示
- Vault 直下のファイル（親フォルダなし）にはラベルを表示しない
- ラベルは省略表示対応（`max-width: 14ch`、超過時は `...`）
- プラグイン停止時に追加したラベルをすべて除去

## 見た目（`styles.css`）

- クラス名: `.otd-tab-parent-folder`
- 薄い文字色（`--text-faint`）の小さめバッジ表示
- 角丸のピル形、境界線・背景付き
- 長い親フォルダ名は1行で省略表示

## 更新タイミング

次のイベントでタブ表示を再評価します。

- `layout-change`
- `file-open`
- `active-leaf-change`
- `css-change`
- `window-open`
- Vault の `rename` / `create` / `delete`

## 対応環境

- Obsidian `0.15.0` 以上
- デスクトップ版のみ（`isDesktopOnly: true`）

## 開発

```bash
npm install
npm run dev
```

## 品質チェック

```bash
npm run lint
npm run build
```

## 手動インストール

1. `npm run build` を実行
2. 以下 3 ファイルを Vault 内の `.obsidian/plugins/obsidian-tab-disambiguator/` に配置
3. Obsidian の **Settings → Community plugins** で有効化

対象ファイル:

- `main.js`
- `manifest.json`
- `styles.css`
