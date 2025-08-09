import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'

// Build to dist with deterministic filenames
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        copyFileSync('app/manifest.json', 'dist/manifest.json')
        // Create assets directory and copy index.html that the manifest expects
        mkdirSync('dist/assets', { recursive: true })
        copyFileSync('dist/index.html', 'dist/assets/index.html')
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index: 'index.html'
      },
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'assets/index.js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) return 'assets/index.css'
          return 'assets/[name][extname]'
        },
        chunkFileNames: 'assets/index.js'
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
})


