import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Erlaubt Zugriff von außerhalb des Containers
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Wichtig für Docker auf Windows/Mac
      interval: 1000, // File-Watching Intervall
    },
  },
})
