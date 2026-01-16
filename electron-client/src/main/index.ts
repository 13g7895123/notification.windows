import { app, BrowserWindow, ipcMain, Notification, Menu, Tray, nativeImage, shell } from 'electron';
import * as path from 'path';
import { ConfigManager } from './config/config';
import { ApiClient } from './api/client';
import { Logger } from './logger/logger';
import { NotificationManager } from './notification/manager';
import { WebSocketClient, WebSocketStatus } from './api/websocket';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isMonitoring = false;
let monitoringInterval: NodeJS.Timeout | null = null;
let wsClient: WebSocketClient | null = null;
let wsConnected = false;

const configManager = new ConfigManager();
const logger = new Logger();
const notificationManager = new NotificationManager();

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        frame: false, // 自定義外框
        transparent: true, // 支援圓角透明背景
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path.join(__dirname, '../../assets/icon.png'),
        title: '通知監控程式',
    });

    // 開發模式載入 Vite dev server，生產模式載入打包後的 HTML
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 關閉視窗時最小化到系統匣
    mainWindow.on('close', (event) => {
        if (isMonitoring) {
            event.preventDefault();
            mainWindow?.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray(): void {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '顯示視窗',
            click: () => mainWindow?.show(),
        },
        {
            label: '開始監控',
            click: () => startMonitoring(),
        },
        {
            label: '停止監控',
            click: () => stopMonitoring(),
        },
        { type: 'separator' },
        {
            label: '退出',
            click: () => {
                isMonitoring = false;
                app.quit();
            },
        },
    ]);

    tray.setToolTip('通知監控程式');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow?.show();
    });
}

async function checkNotifications(): Promise<void> {
    const config = configManager.getConfig();
    const apiClient = new ApiClient(config.domain, config.apiKey, logger);

    try {
        const notifications = await apiClient.getUnnotifiedNotifications();

        for (const notification of notifications) {
            // 顯示系統通知
            // 顯示自定義通知
            notificationManager.showNotification({
                id: notification.id,
                title: notification.title,
                message: notification.message,
                duration: 5000
            });

            // 更新狀態為已送達
            await apiClient.updateNotificationStatus(notification.id, 'delivered');

            logger.info(`已通知: ${notification.title} - ${notification.message}`);

            // 傳送到渲染程序更新 UI
            mainWindow?.webContents.send('notification-received', notification);
        }

        if (notifications.length > 0) {
            logger.info(`發現 ${notifications.length} 個未通知的記錄`);
        }
    } catch (error) {
        logger.error(`檢查通知失敗: ${error}`);
        // 傳送詳細錯誤資訊到 renderer
        const errorDetails = (error as any)?.details || null;
        mainWindow?.webContents.send('api-error', {
            message: String(error),
            details: errorDetails,
        });
    }
}

function handleWebSocketMessage(data: any): void {
    if (data.type === 'new_notification' && data.data) {
        const notification = data.data;
        logger.info(`WebSocket 收到新通知: ${notification.title}`);

        // 顯示通知
        notificationManager.showNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            duration: 5000
        });

        // 更新狀態為已送達
        const config = configManager.getConfig();
        const apiClient = new ApiClient(config.domain, config.apiKey, logger);
        apiClient.updateNotificationStatus(notification.id, 'delivered').catch(err => {
            logger.error(`更新通知狀態失敗: ${err}`);
        });

        // 傳送到渲染程序更新 UI
        mainWindow?.webContents.send('notification-received', notification);
    } else if (data.type === 'pong') {
        logger.debug('收到 WebSocket Pong');
    }
}

function handleWebSocketStatusChange(status: WebSocketStatus): void {
    logger.info(`WebSocket 狀態變更: ${status}`);
    wsConnected = (status === 'connected');

    // 傳送狀態同步到 renderer
    mainWindow?.webContents.send('websocket-status', status);

    // 如果連線成功，確保輪詢關閉
    if (wsConnected && isMonitoring) {
        if (monitoringInterval) {
            logger.info('WebSocket 已連線，停止間隔輪詢');
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
    } else if (!wsConnected && isMonitoring && !monitoringInterval) {
        // 如果 WebSocket 斷線且正在監控中，重啟輪詢作為備援
        const config = configManager.getConfig();
        logger.info(`WebSocket 斷線，重啟間隔輪詢 (${config.interval} 秒)`);
        monitoringInterval = setInterval(() => {
            checkNotifications();
        }, config.interval * 1000);
    }
}

function startMonitoring(): void {
    if (isMonitoring) return;

    const config = configManager.getConfig();
    isMonitoring = true;

    // 套用 debug 模式設定
    logger.setDebugMode(config.debug);

    logger.info(`監控已啟動`);

    // 啟動 WebSocket (如果啟用)
    if (config.websocketEnabled) {
        if (wsClient) {
            wsClient.disconnect();
        }
        wsClient = new WebSocketClient(
            config.websocketUrl,
            logger,
            handleWebSocketMessage,
            handleWebSocketStatusChange
        );
        wsClient.connect();
    }

    // 立即檢查一次 (補足斷線期間可能漏掉的)
    checkNotifications();

    // 如果沒啟用 WebSocket 或連線未完成，先啟動輪詢
    if (!config.websocketEnabled || !wsConnected) {
        logger.info(`啟動間隔輪詢 - 間隔: ${config.interval} 秒`);
        monitoringInterval = setInterval(() => {
            checkNotifications();
        }, config.interval * 1000);
    }

    mainWindow?.webContents.send('monitoring-status', true);
}

function stopMonitoring(): void {
    if (!isMonitoring) return;

    isMonitoring = false;

    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }

    if (wsClient) {
        wsClient.disconnect();
        wsClient = null;
    }

    wsConnected = false;
    logger.info('監控已停止');
    mainWindow?.webContents.send('monitoring-status', false);
    mainWindow?.webContents.send('websocket-status', 'disconnected');
}

// IPC 事件處理
ipcMain.handle('get-config', () => {
    return configManager.getConfig();
});

ipcMain.handle('save-config', (_event, config) => {
    configManager.saveConfig(config);
    // 同步更新 logger 的 debug 模式
    if (config.debug !== undefined) {
        logger.setDebugMode(config.debug);
    }
    return true;
});

ipcMain.handle('start-monitoring', () => {
    startMonitoring();
    return true;
});

ipcMain.handle('stop-monitoring', () => {
    stopMonitoring();
    return true;
});

ipcMain.handle('get-monitoring-status', () => {
    return isMonitoring;
});

ipcMain.handle('window-minimize', () => mainWindow?.minimize());

ipcMain.handle('window-close', () => mainWindow?.close());

ipcMain.handle('test-api', async () => {
    const config = configManager.getConfig();
    const apiClient = new ApiClient(config.domain, config.apiKey, logger);

    try {
        await apiClient.testConnection();
        return { success: true, message: 'API 連線成功' };
    } catch (error) {
        return { success: false, message: String(error) };
    }
});

ipcMain.handle('test-notification', () => {
    notificationManager.showNotification({
        id: 'test-' + Date.now(),
        title: '測試通知',
        message: '這是一則測試通知訊息，用於確認自定義視窗功能是否正常運作。',
        duration: 5000
    });
    return true;
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// 應用程式生命週期
app.whenReady().then(() => {
    logger.info('=== 應用程式啟動 ===');
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (!isMonitoring) {
            app.quit();
        }
    }
});

app.on('before-quit', () => {
    logger.info('=== 應用程式關閉 ===');
    stopMonitoring();
});
