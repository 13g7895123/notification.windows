# Go 通知監控客戶端

這是用 Go 語言開發的 Windows 通知監控程式，使用 Fyne 框架建立 GUI 介面。

## 功能特點

- ✅ **GUI 視窗介面**：使用 Fyne 框架建立的友善圖形介面
- ✅ **自動輪詢**：可設定間隔時間（預設 5 秒）自動查詢 API
- ✅ **Windows 原生通知**：使用 Windows 10/11 原生通知系統
- ✅ **專案篩選**：可指定要監控的專案名稱
- ✅ **自動更新狀態**：顯示通知後自動更新 API 狀態為已通知
- ✅ **通知歷史**：在視窗中顯示通知歷史記錄
- ✅ **設定管理**：可在 GUI 中編輯並儲存設定
- ✅ **完整日誌系統**：自動記錄所有操作到日誌檔案

## 系統需求

- Windows 10 或更新版本
- Docker（僅用於編譯，執行時不需要）

## 編譯方式

### 方法一：使用 Docker 編譯（推薦）

```bash
./build-docker.sh
```

編譯完成後，執行檔會放在 `dist/` 目錄下。

### 方法二：在 Windows 上直接編譯

```cmd
build.bat
```

## 設定檔

參考 `config.json.example` 建立 `config.json`：

```json
{
  "domain": "http://localhost:9204",
  "project": "free_youtube",
  "interval": 5
}
```

## 專案結構

```
go-client/
├── main.go                     # 主程式入口
├── config.json.example         # 設定檔範例
├── internal/
│   ├── api/client.go          # API 客戶端
│   ├── config/config.go       # 設定檔管理
│   ├── gui/window.go          # GUI 介面
│   ├── logger/logger.go       # 日誌系統
│   └── notification/notifier.go # Windows 通知
├── Dockerfile                  # Docker 編譯環境
├── build-docker.sh             # Docker 編譯腳本
└── build.bat                   # Windows 編譯腳本
```

## API 規格

詳細 API 規格請參考 [../shared/api/API_NOTIFICATIONS.md](../shared/api/API_NOTIFICATIONS.md)
