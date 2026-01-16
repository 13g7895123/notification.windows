import { Logger } from '../logger/logger';
import WebSocket from 'ws';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private logger: Logger;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectDelay = 30000;
    private onMessageCallback: (data: any) => void;
    private onStatusChangeCallback: (status: WebSocketStatus) => void;
    private isIntentionallyClosed = false;

    constructor(url: string, logger: Logger, onMessage: (data: any) => void, onStatusChange: (status: WebSocketStatus) => void) {
        this.url = url;
        this.logger = logger;
        this.onMessageCallback = onMessage;
        this.onStatusChangeCallback = onStatusChange;
    }

    connect(): void {
        if (this.ws) {
            this.ws.close();
        }

        this.isIntentionallyClosed = false;
        this.onStatusChangeCallback('connecting');
        this.logger.info(`正在連線到 WebSocket: ${this.url}`);

        try {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                this.logger.info('WebSocket 連線成功');
                this.reconnectAttempts = 0;
                this.onStatusChangeCallback('connected');
                this.startHeartbeat();
            });

            this.ws.on('message', (data) => {
                try {
                    const parsedData = JSON.parse(data.toString());
                    this.onMessageCallback(parsedData);
                } catch (e) {
                    this.logger.error(`解析 WebSocket 訊息失敗: ${e}`);
                }
            });

            this.ws.on('close', () => {
                this.onStatusChangeCallback('disconnected');
                this.stopHeartbeat();
                if (!this.isIntentionallyClosed) {
                    this.logger.warn('WebSocket 連線中斷，準備重連...');
                    this.scheduleReconnect();
                }
            });

            this.ws.on('error', (error) => {
                this.logger.error(`WebSocket 錯誤: ${error.message}`);
                this.onStatusChangeCallback('error');
            });
        } catch (e) {
            this.logger.error(`建立 WebSocket 連線失敗: ${e}`);
            this.onStatusChangeCallback('error');
            this.scheduleReconnect();
        }
    }

    disconnect(): void {
        this.isIntentionallyClosed = true;
        this.stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.terminate(); // 使用 terminate 比 close 更快
            this.ws = null;
        }
        this.onStatusChangeCallback('disconnected');
    }

    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        const delay = Math.min(5000 * this.reconnectAttempts, this.maxReconnectDelay);
        this.logger.info(`${delay / 1000} 秒後嘗試第 ${this.reconnectAttempts} 次重連...`);

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = setTimeout(() => {
            if (!this.isIntentionallyClosed) {
                this.connect();
            }
        }, delay);
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
                this.logger.debug('發送 WebSocket Ping');
            }
        }, 30000); // 30 秒一次心跳
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}
