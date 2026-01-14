import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    root: 'client', // Set root to client folder
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    server: {
        host: true,
        port: 3000,
        proxy: {
            '/api': 'http://localhost:5000',
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true
            }
        }
    }
})
