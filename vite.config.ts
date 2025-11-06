import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

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
        // Force different output name to invalidate cache
        entryFileNames: 'assets/nova-agent-[name]-[hash].js',
        chunkFileNames: 'assets/nova-agent-[name]-[hash].js',
        assetFileNames: 'assets/nova-agent-[name]-[hash].[ext]'
      }
    }
  }
})

