# 記帳 LEDGER 個人版

陳清文的個人記帳 PWA,Traditional Chinese 介面、行動裝置優先設計。

## 部署

直接把這個 repo 開啟 GitHub Pages,無需 build step。

1. **Settings → Pages**
2. **Branch**: `main` / **root** → Save
3. 等 1-2 分鐘,訪問 `https://<你的帳號>.github.io/<repo名>/`

## 安裝到手機

### Android Chrome / Edge
- 開啟網頁 → 底部會跳出深綠金色橫幅「安裝至桌面」+ 金色「安裝」按鈕
- 點安裝 → Chrome 跳出原生安裝對話框 → 確認 → 桌面立刻有 icon
- 按 ×(不再顯示)後不會再跳,記在 localStorage

### iOS Safari
- 等 1.5 秒後底部橫幅跳出,提示「點下方分享 → 加入主畫面」
- iOS 不支援自動安裝、必須教學

### 已安裝的人
- 橫幅自動隱藏不打擾

## 離線使用

裝完後即使沒網路也能用,Service Worker 把這些檔案 cache 起來:

- `index.html`、`manifest.json`
- `ledger.jsx`(主程式)
- 三個 icon
- React/ReactDOM/Babel(從 unpkg 抓)

## 升級流程(部署新版時)

1. 編輯 `ledger.jsx`(主程式)
2. **編輯 `sw.js`**,把 `CACHE_VERSION` 字串改成新版號(例如 `'ledger-v533'`)
3. push 到 GitHub
4. 使用者下次打開 PWA → 偵測到新版 → 跳「有新版本可用 [重新載入]」橫幅 → 點下去就更新

⚠️ **如果忘了改 CACHE_VERSION,使用者會繼續看到舊版** — Service Worker 認 `CACHE_VERSION` 來判斷是否要重抓。

## 檔案結構

```
├── index.html       # 入口頁 + 安裝橫幅 + SW 註冊
├── manifest.json    # PWA 設定
├── sw.js            # Service Worker(離線 cache + 版本管理)
├── icon-192.png     # 192×192 (Android)
├── icon-512.png     # 512×512 (Android splash)
├── icon-180.png     # 180×180 (iOS Safari apple-touch-icon)
├── ledger.jsx       # 主程式
└── README.md
```

## 技術說明

- **React 18** (UMD,unpkg)
- **Babel standalone**(瀏覽器即時編譯 JSX,免 build step)
- **Service Worker**(離線可用 + 版本化 cache,Network First fallback to Cache)
- **localStorage** 儲存所有資料

## 注意事項

- 資料只存在當前瀏覽器的 localStorage,清除資料 = 清空帳本
- 建議定期使用 App 內「設定 → 匯出備份檔」匯出 JSON 備份
- 換手機/換瀏覽器時,用「匯入備份檔」還原

## 授權

個人使用,未公開授權。
