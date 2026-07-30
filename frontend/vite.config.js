import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router')) return 'vendor';
            if (id.includes('bootstrap') || id.includes('framer-motion') || id.includes('lucide-react')) return 'ui';
            if (id.includes('recharts')) return 'charts';
            return 'deps';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    pool: 'threads',
    isolate: false,
  }
})
