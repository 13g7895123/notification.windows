# Electron 通知監控客戶端

這是用 Electron + TypeScript 開發的跨平台通知監控程式。

## 功能特點

- ✅ **跨平台支援**：支援 Windows、macOS 和 Linux
- ✅ **現代化 UI**：使用 Web 技術建立的美觀介面
- ✅ **系統匣支援**：可最小化到系統匣背景執行
- ✅ **系統通知**：使用作業系統原生通知系統
- ✅ **自動輪詢**：可設定間隔時間自動查詢 API
- ✅ **專案篩選**：可指定要監控的專案名稱
- ✅ **設定持久化**：使用 electron-store 儲存設定
- ✅ **完整日誌系統**：自動記錄所有操作到日誌檔案

## 系統需求

- Node.js 18+
- npm 或 yarn

## 開發

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

然後在另一個終端機執行：

```bash
npm start
```

### 打包

```bash
# 打包當前平台
npm run package

# 打包 Windows
npm run package:win

# 打包 macOS
npm run package:mac

# 打包 Linux
npm run package:linux
```

打包後的檔案會放在 `release/` 目錄下。

## 專案結構

```
electron-client/
├── src/
│   ├── main/                    # Electron 主程序
│   │   ├── index.ts             # 主程序入口
│   │   ├── api/client.ts        # API 客戶端
│   │   ├── config/config.ts     # 設定管理
│   │   └── logger/logger.ts     # 日誌系統
│   ├── preload/                 # 預載腳本
│   │   └── preload.ts           # 暴露安全 API 給渲染程序
│   └── renderer/                # 渲染程序（UI）
│       ├── index.html           # 主頁面
│       ├── styles/main.css      # 樣式
│       └── scripts/app.ts       # UI 邏輯
├── assets/                      # 應用程式資源（圖示等）
├── dist/                        # 編譯輸出
├── release/                     # 打包輸出
├── package.json
├── tsconfig.json               # 渲染程序 TypeScript 設定
├── tsconfig.main.json          # 主程序 TypeScript 設定
├── tsconfig.preload.json       # 預載腳本 TypeScript 設定
├── vite.config.ts              # Vite 設定
└── electron-builder.json       # 打包設定
```

## API 規格

詳細 API 規格請參考 [../shared/api/API_NOTIFICATIONS.md](../shared/api/API_NOTIFICATIONS.md)
