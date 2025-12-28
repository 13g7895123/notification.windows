import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src/renderer'),
    base: './',
    build: {
        outDir: resolve(__dirname, 'dist/renderer'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/renderer/index.html'),
                notification: resolve(__dirname, 'src/renderer/notification/notification.html'),
            },
        },
    },
    server: {
        port: 5173,
    },
});
