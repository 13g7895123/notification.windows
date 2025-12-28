# 多語言通知監控程式

這是一個跨平台的通知監控系統，支援多種客戶端實作，可以定期查詢通知 API 並在作業系統上顯示通知。

## 專案架構

```
notification_app/
├── shared/                      # 共用資源
│   ├── api/                     # API 規格文件
│   ├── config/                  # 設定檔 Schema
│   └── docs/                    # 共用文件
│
├── go-client/                   # Go 版本客戶端
│   └── ...                      # Windows 專用，使用 Fyne GUI
│
└── electron-client/             # Electron 版本客戶端
    └── ...                      # 跨平台，使用 Web 技術
```

## 客戶端版本

| 版本 | 語言/框架 | 支援平台 | 狀態 |
|------|-----------|----------|------|
| [Go Client](./go-client/) | Go + Fyne | Windows | ✅ 穩定 |
| [Electron Client](./electron-client/) | TypeScript + Electron | Windows / macOS / Linux | 🚧 開發中 |

## 功能特點

- 🔔 **系統通知**：使用作業系統原生通知系統
- 🔄 **自動輪詢**：可設定間隔時間自動查詢 API
- 🎯 **專案篩選**：可指定要監控的專案名稱
- 📝 **日誌記錄**：完整的日誌系統，方便問題排查
- ⚙️ **GUI 設定**：友善的圖形介面設定

## 設定檔格式

所有客戶端都使用相同的設定檔格式，請參考 [設定 Schema](./shared/config/schema.json)：

```json
{
  "domain": "http://localhost:9204",
  "project": "free_youtube",
  "interval": 5,
  "debug": false
}
```

### 設定說明

| 欄位 | 類型 | 說明 |
|------|------|------|
| `domain` | string | API 伺服器網域（必填） |
| `project` | string | 要監控的專案名稱，留空則監控所有專案 |
| `interval` | number | 查詢間隔時間（秒），預設 5 |
| `debug` | boolean | 是否啟用 Debug 模式 |

## API 規格

詳細 API 規格請參考 [API 文件](./shared/api/API_NOTIFICATIONS.md)

## 授權

本專案採用 MIT 授權條款。
