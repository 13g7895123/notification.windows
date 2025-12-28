import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export class Logger {
    private logDir: string;
    private debugMode: boolean = false;

    constructor() {
        this.logDir = path.join(app.getPath('userData'), 'logs');
        this.ensureLogDir();
    }

    private ensureLogDir(): void {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private getLogFilePath(): string {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `app_${date}.log`);
    }

    private formatMessage(level: LogLevel, message: string): string {
        const now = new Date();
        const timestamp = now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        return `[${timestamp}] [${level}] ${message}`;
    }

    private writeLog(level: LogLevel, message: string): void {
        const formattedMessage = this.formatMessage(level, message);

        // 寫入檔案
        try {
            fs.appendFileSync(this.getLogFilePath(), formattedMessage + '\n');
        } catch (error) {
            console.error('Failed to write log:', error);
        }

        // 同時輸出到控制台
        switch (level) {
            case 'ERROR':
                console.error(formattedMessage);
                break;
            case 'WARN':
                console.warn(formattedMessage);
                break;
            case 'DEBUG':
                console.debug(formattedMessage);
                break;
            default:
                console.log(formattedMessage);
        }
    }

    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
        this.info(`Debug 模式: ${enabled}`);
    }

    debug(message: string): void {
        if (this.debugMode) {
            this.writeLog('DEBUG', message);
        }
    }

    info(message: string): void {
        this.writeLog('INFO', message);
    }

    warn(message: string): void {
        this.writeLog('WARN', message);
    }

    error(message: string): void {
        this.writeLog('ERROR', message);
    }

    success(message: string): void {
        this.writeLog('SUCCESS', message);
    }
}
