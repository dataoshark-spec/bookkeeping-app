# 記帳 LEDGER 個人版

陳清文的個人記帳 PWA,以 Traditional Chinese 介面、行動裝置優先設計。

## 部署

直接把這個 repo 開啟 GitHub Pages 即可,無需 build step。

1. **Settings → Pages**
2. **Branch**: `main`(或 `master`)/ **root**
3. 等部署完成後訪問 `https://你的帳號.github.io/repo名/`

## 安裝到手機桌面

- **Android (Chrome)**: 開啟網址 → 右上選單 → 「加到主畫面」/「安裝應用程式」
- **iOS (Safari)**: 開啟網址 → 分享按鈕 → 「加入主畫面」

## 檔案結構

```
├── index.html       # 入口頁,載 React UMD + Babel + ledger.jsx
├── manifest.json    # PWA 設定(名稱、icon、主題色)
├── icon-192.png     # 192×192 icon (Android home screen)
├── icon-512.png     # 512×512 icon (Android splash / iOS)
├── ledger.jsx       # 主程式(React 元件 + 業務邏輯)
└── README.md
```

## 技術說明

- **React 18** (UMD,從 unpkg 載入)
- **Babel standalone** (瀏覽器即時編譯 JSX,免 build step)
- **localStorage** 儲存所有資料
- 無後端、無外部 API、不收集資料

## 注意事項

- 資料只存在當前瀏覽器的 localStorage,清除瀏覽器資料 = 清空帳本
- 建議定期使用 App 內「設定 → 匯出備份檔」匯出 JSON 備份
- 換手機/換瀏覽器時,用「匯入備份檔」還原

## 授權

個人使用,未公開授權。
