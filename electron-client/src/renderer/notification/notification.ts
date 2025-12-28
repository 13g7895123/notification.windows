// 定義 window 介面
declare global {
    interface Window {
        notificationAPI: {
            close: () => void;
            click: (id: string) => void;
            onSetup: (callback: (data: NotificationData) => void) => void;
        };
    }
}

interface NotificationData {
    id: string;
    title: string;
    message: string;
    duration?: number;
}

const elements = {
    container: document.getElementById('container') as HTMLDivElement,
    title: document.getElementById('title') as HTMLElement,
    message: document.getElementById('message') as HTMLElement,
    closeBtn: document.getElementById('close-btn') as HTMLButtonElement,
    progress: document.getElementById('progress') as HTMLDivElement,
};

// 監聽來自主程序的通知資料
window.notificationAPI.onSetup((data: NotificationData) => {
    elements.title.textContent = data.title;
    elements.message.textContent = data.message;

    // 設定動畫時間
    const duration = data.duration || 5000;
    elements.progress.style.animationDuration = `${duration}ms`;

    // 點擊通知本體
    elements.container.addEventListener('click', (e) => {
        // 如果點擊的不是關閉按鈕
        if ((e.target as HTMLElement).id !== 'close-btn') {
            window.notificationAPI.click(data.id);
        }
    });

    // 自動關閉計時器
    setTimeout(() => {
        closeNotification();
    }, duration);
});

elements.closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeNotification();
});

function closeNotification() {
    elements.container.style.animation = 'slideIn 0.3s reverse forwards';
    // 等待動畫結束後通知主程序關閉視窗
    setTimeout(() => {
        window.notificationAPI.close();
    }, 300);
}
