import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['html2canvas', 'jspdf', 'pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-generation': ['html2canvas', 'jspdf'],
          'pdf-processing': ['pdfjs-dist'],
          'landing-vendor': ['react-icons', 'framer-motion'],
          'landing-components': [
            './src/pages/landing/components/MeetTheTeam',
            './src/pages/landing/components/WhatParentsSay',
            './src/pages/landing/components/FrequentlyAskedQuestions'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
