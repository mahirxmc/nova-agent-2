import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const buildTimestamp = Date.now()
const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [
    react(), 
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // AGGRESSIVE cache busting with timestamp
        entryFileNames: `assets/nova-agent-[name]-${buildTimestamp}.[hash].js`,
        chunkFileNames: `assets/nova-agent-[name]-${buildTimestamp}.[hash].js`,
        assetFileNames: `assets/nova-agent-[name]-${buildTimestamp}.[hash].[ext]`
      }
    }
  }
})

