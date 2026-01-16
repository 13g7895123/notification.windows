# Changelog

所有重要的變更都會記錄在這個檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [Unreleased]

### Added
- 準備中的新功能

---

## [1.1.0] - 2026-01-17

### Added
- 🚀 **WebSocket 即時通知支援**：大幅降低延遲並節省伺服器資源。
- **自動切換機制**：當 WebSocket 連線成功時自動停止定期輪詢 (Polling)。
- **備援機制**：若 WebSocket 斷連，系統將自動恢復輪詢模式以確保通知不漏接。
- **狀態顯示**：GUI 頂部新增 WebSocket 即時連線狀態標籤。
- **設定擴展**：支援手動設定 WebSocket URL 與開關。

### Changed
- 更新底層通訊架構以支援非同步雙向通訊。
- 優化了監控流程的啟動與停止邏輯。

---

## [1.0.0] - 2025-12-30

### Added
- 🎉 首次發布
- 支援 Windows、macOS、Linux 跨平台
- 系統通知功能
- API 監控功能
- 自定義通知視窗
- 系統匣最小化支援
- 現代化 UI 設計

### Features
- 自動輪詢 API 檢查新通知
- 可設定輪詢間隔
- API Key 認證支援
- 通知狀態自動更新
- 精美的自定義通知彈窗

---

## 版本說明

- **Major (主版本)**: 不相容的 API 變更
- **Minor (次版本)**: 新增向下相容的功能
- **Patch (修補版本)**: 向下相容的 bug 修復

[Unreleased]: https://github.com/YOUR_USERNAME/notification_windows/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/YOUR_USERNAME/notification_windows/releases/tag/v1.0.0
