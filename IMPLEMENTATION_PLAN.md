---
description: 多語言通知監控程式 - 實作計劃
---

# 多語言通知監控程式 - 實作計劃

## 專案概述

本專案是一個跨平台的通知監控系統，支援多種客戶端實作。目前包含：
- **Go 客戶端**：使用 Go + Fyne，專為 Windows 優化 ✅ 已完成
- **Electron 客戶端**：使用 TypeScript + Electron，支援跨平台 🚧 開發中

---

## 專案架構

```
notification_app/
├── shared/                      # 共用資源
│   ├── api/                     # API 規格文件
│   ├── config/                  # 設定檔 Schema
│   └── docs/                    # 共用文件
│
├── go-client/                   # Go 版本客戶端 ✅
│   └── ...
│
└── electron-client/             # Electron 版本客戶端 🚧
    └── ...
```

---

## Electron 客戶端開發計劃

### 階段 1：基礎建設 ✅ 已完成

- [x] 建立專案結構
- [x] 設定 TypeScript 編譯環境
- [x] 設定 Vite 開發環境
- [x] 建立 Electron 主程序入口
- [x] 建立預載腳本（IPC 安全通訊）
- [x] 建立渲染程序（UI）

### 階段 2：核心模組開發 ✅ 已完成

- [x] API 客戶端模組 (`src/main/api/client.ts`)
  - [x] 查詢未通知記錄
  - [x] 更新通知狀態
  - [x] 連線測試
  
- [x] 設定管理模組 (`src/main/config/config.ts`)
  - [x] 使用 electron-store 持久化
  - [x] Schema 驗證

- [x] 日誌系統模組 (`src/main/logger/logger.ts`)
  - [x] 多級別日誌（DEBUG/INFO/WARN/ERROR/SUCCESS）
  - [x] 檔案寫入
  - [x] 控制台輸出

### 階段 3：UI 開發 ✅ 已完成

- [x] 主頁面 HTML 結構
- [x] 現代化深色主題 CSS
- [x] 前端 TypeScript 邏輯
  - [x] 設定表單互動
  - [x] 監控控制按鈕
  - [x] 通知歷史列表
  - [x] 狀態指示器

### 階段 4：功能整合 ⏳ 待進行

- [ ] 安裝依賴並測試編譯
- [ ] 系統匣功能測試
- [ ] 系統通知功能測試
- [ ] 跨平台測試（Windows/macOS/Linux）

### 階段 5：打包發布 ⏳ 待進行

- [ ] 準備應用程式圖示
  - [ ] icon.ico（Windows）
  - [ ] icon.icns（macOS）
  - [ ] icon.png（Linux）
- [ ] 測試 Windows 打包
- [ ] 測試 macOS 打包
- [ ] 測試 Linux 打包
- [ ] 建立發布 CI/CD

---

## 開發指南

### 環境需求

- Node.js 18+
- npm 或 yarn

### 開發流程

1. **安裝依賴**
   ```bash
   cd electron-client
   npm install
   ```

2. **開發模式**
   ```bash
   # 終端機 1：編譯並監聽變更
   npm run dev
   
   # 終端機 2：啟動 Electron
   npm start
   ```

3. **測試打包**
   ```bash
   npm run package
   ```

### 目錄說明

| 目錄 | 說明 |
|------|------|
| `src/main/` | Electron 主程序（Node.js 環境） |
| `src/preload/` | 預載腳本（橋接主程序與渲染程序） |
| `src/renderer/` | 渲染程序（瀏覽器環境，UI 相關） |
| `dist/` | 編譯輸出 |
| `release/` | 打包輸出 |
| `assets/` | 應用程式資源（圖示等） |

---

## API 規格

所有客戶端使用相同的 API 規格，詳見 `shared/api/API_NOTIFICATIONS.md`

### 主要端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/notifications?status=0&project={project}` | GET | 查詢未通知記錄 |
| `/api/notifications/{id}/status` | PATCH | 更新通知狀態 |

---

## 設定檔格式

所有客戶端使用相同的設定檔格式，詳見 `shared/config/schema.json`

```json
{
  "domain": "http://localhost:9204",
  "project": "free_youtube",
  "interval": 5,
  "debug": false
}
```

---

## 待辦事項

### 高優先級

1. 安裝依賴並驗證 Electron 專案可正常編譯
2. 測試系統通知功能
3. 準備應用程式圖示

### 中優先級

4. 優化 UI 動畫效果
5. 增加多語言支援（i18n）
6. 增加自動更新功能

### 低優先級

7. 增加主題切換功能
8. 增加通知音效選項
9. 增加快捷鍵支援

---

## 參考資源

- [Electron 官方文件](https://www.electronjs.org/docs)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [electron-builder](https://www.electron.build/)
- [Vite](https://vitejs.dev/)
