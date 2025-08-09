import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build to app/assets with deterministic filenames
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'app/assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index: 'index.html'
      },
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'index.js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) return 'index.css'
          return 'assets/[name][extname]'
        },
        chunkFileNames: 'index.js'
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
})


