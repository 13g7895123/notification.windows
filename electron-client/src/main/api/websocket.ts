import { Logger } from '../logger/logger';
import WebSocket from 'ws';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketErrorDetails {
    type: 'connection' | 'message' | 'unknown';
    message: string;
    url: string;
    reconnectAttempts: number;
    timestamp: string;
    errorCode?: string;
    errorEvent?: any;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private logger: Logger;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectDelay = 30000;
    private onMessageCallback: (data: any) => void;
    private onStatusChangeCallback: (status: WebSocketStatus, errorDetails?: WebSocketErrorDetails) => void;
    private isIntentionallyClosed = false;

    constructor(url: string, logger: Logger, onMessage: (data: any) => void, onStatusChange: (status: WebSocketStatus, errorDetails?: WebSocketErrorDetails) => void) {
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

            this.ws.on('close', (code, reason) => {
                const errorDetails: WebSocketErrorDetails = {
                    type: 'connection',
                    message: `連線關閉 (Code: ${code}, Reason: ${reason.toString() || '無'})`,
                    url: this.url,
                    reconnectAttempts: this.reconnectAttempts,
                    timestamp: new Date().toISOString(),
                    errorCode: String(code)
                };
                this.onStatusChangeCallback('disconnected', errorDetails);
                this.stopHeartbeat();
                if (!this.isIntentionallyClosed) {
                    this.logger.warn(`WebSocket 連線中斷 (Code: ${code})，準備重連...`);
                    this.scheduleReconnect();
                }
            });

            this.ws.on('error', (error: any) => {
                const errorDetails: WebSocketErrorDetails = {
                    type: 'connection',
                    message: error.message || '未知錯誤',
                    url: this.url,
                    reconnectAttempts: this.reconnectAttempts,
                    timestamp: new Date().toISOString(),
                    errorCode: error.code || error.errno,
                    errorEvent: {
                        name: error.name,
                        message: error.message,
                        code: error.code,
                        errno: error.errno,
                        syscall: error.syscall,
                        address: error.address,
                        port: error.port
                    }
                };
                this.logger.error(`WebSocket 錯誤: ${error.message} (Code: ${error.code || 'N/A'})`);
                this.onStatusChangeCallback('error', errorDetails);
            });
        } catch (e: any) {
            const errorDetails: WebSocketErrorDetails = {
                type: 'connection',
                message: e.message || String(e),
                url: this.url,
                reconnectAttempts: this.reconnectAttempts,
                timestamp: new Date().toISOString(),
                errorEvent: e
            };
            this.logger.error(`建立 WebSocket 連線失敗: ${e.message || e}`);
            this.onStatusChangeCallback('error', errorDetails);
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
