import { BrowserWindow, screen, ipcMain, IpcMainEvent } from 'electron';
import * as path from 'path';

interface NotificationOptions {
    id: string;
    title: string;
    message: string;
    duration?: number;
}

export class NotificationManager {
    private activeNotifications: BrowserWindow[] = [];
    private readonly WINDOW_WIDTH = 350;
    private readonly WINDOW_HEIGHT = 120;
    private readonly MARGIN = 60;
    private readonly MAX_NOTIFICATIONS = 5;

    constructor() {
        this.setupIPC();
    }

    private setupIPC() {
        ipcMain.on('notification-close', (event) => {
            const win = BrowserWindow.fromWebContents(event.sender);
            if (win) {
                this.closeNotification(win);
            }
        });

        ipcMain.on('notification-click', (_event, id) => {
            // 處理通知點擊事件，例如聚焦主視窗
            // console.log('Notification clicked:', id);
        });
    }

    public showNotification(options: NotificationOptions) {
        if (this.activeNotifications.length >= this.MAX_NOTIFICATIONS) {
            const oldestWin = this.activeNotifications.shift();
            oldestWin?.close();
        }

        const win = new BrowserWindow({
            width: this.WINDOW_WIDTH,
            height: this.WINDOW_HEIGHT,
            frame: false,
            transparent: true,
            resizable: false,
            skipTaskbar: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../../preload/notification.js'),
            },
            show: false, // 先隱藏，計算位置後再顯示
        });

        // 載入頁面
        if (process.env.NODE_ENV === 'development') {
            // 開發模式下需要確定 Vite server URL
            win.loadURL('http://localhost:5173/src/renderer/notification/notification.html');
        } else {
            win.loadFile(path.join(__dirname, '../../renderer/notification/notification.html'));
        }

        // 將視窗加入佇列
        this.activeNotifications.push(win);

        // 計算位置
        this.repositionNotifications();

        win.once('ready-to-show', () => {
            win.show();
            // 傳送資料給渲染程序
            win.webContents.send('setup-notification', options);
        });

        win.on('closed', () => {
            // 從佇列中移除
            const index = this.activeNotifications.indexOf(win);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
                this.repositionNotifications(); // 重新排列剩餘通知
            }
        });
    }

    private closeNotification(win: BrowserWindow) {
        win.close();
    }

    private repositionNotifications() {
        const { workArea } = screen.getPrimaryDisplay();
        // 從右下角開始堆疊
        let currentY = workArea.y + workArea.height - this.MARGIN;

        // 反向遍歷 (最新的在最下面)
        [...this.activeNotifications].reverse().forEach((win, index) => {
            const x = workArea.x + workArea.width - this.WINDOW_WIDTH - this.MARGIN;
            const y = currentY - this.WINDOW_HEIGHT;

            try {
                win.setBounds({
                    x: x,
                    y: y,
                    width: this.WINDOW_WIDTH,
                    height: this.WINDOW_HEIGHT
                });
            } catch (e) {
                // 視窗可能已經銷毀
            }

            currentY -= (this.WINDOW_HEIGHT + this.MARGIN);
        });
    }
}
