import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

// Build to dist with deterministic filenames
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        copyFileSync('app/manifest.json', 'dist/manifest.json')
      }
    }
  ],
  build: {
    outDir: 'dist/assets',
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


