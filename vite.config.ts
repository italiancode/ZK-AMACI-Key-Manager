import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { crx } from "@crxjs/vite-plugin";
// import manifest from "./manifest.json" assert { type: "json" };

export default defineConfig({
  plugins: [react(), ],
  build: {
    modulePreload: false,
    target: "esnext",
    rollupOptions: {
      input: {
        main: "index.html",
        background: "src/background.ts",
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  publicDir: "public",
  optimizeDeps: {
    include: ["firebase/auth", "firebase/app"],
  },
  define: {
    "process.env": process.env,
    __VUE_PROD_DEVTOOLS__: false,
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
