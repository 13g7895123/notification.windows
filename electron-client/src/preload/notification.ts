import { contextBridge, ipcRenderer } from 'electron';

const api = {
    close: () => ipcRenderer.send('notification-close'),
    click: (id: string) => ipcRenderer.send('notification-click', id),
    onSetup: (callback: (data: any) => void) => ipcRenderer.on('setup-notification', (_e, data) => callback(data)),
};

contextBridge.exposeInMainWorld('notificationAPI', api);

export type NotificationAPI = typeof api;
