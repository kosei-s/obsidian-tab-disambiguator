# Tab Disambiguator

Tab Disambiguator は、Obsidian のファイルタブ左側に親フォルダ名を表示し、同名ファイルを見分けやすくするコミュニティプラグインです。

## 機能

- ファイルに紐づくタブのみ、タブタイトル左側に「1つ上の親フォルダ名」を表示
- Vault 直下のファイル（親フォルダなし）はフォルダ名を表示しない
- 非ファイルタブ（設定、検索など）には表示しない
- 親フォルダ名は薄字・小さめ表示で、幅 `12ch` を超える場合は `...` で省略
- 既存のファイル名表示テキストは変更しない

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
