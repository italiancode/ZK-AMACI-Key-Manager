import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from '@crxjs/vite-plugin'

// Node 14 & 16
import manifest from './manifest.json'
// Node >=17
// import manifest from './manifest.json' assert { type: 'json' } 

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    modulePreload: false,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
  },
});