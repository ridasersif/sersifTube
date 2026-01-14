import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, path.join(process.cwd(), 'client'), '')
    const target = env.VITE_API_URL

    return {
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
                '/api': target,
                '/socket.io': {
                    target: target,
                    ws: true
                }
            }
        }
    }
})
