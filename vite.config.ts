import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { version } from './package.json'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Cache audio files on first play, serve from cache thereafter
            urlPattern: /\/audio\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kclip-audio',
              expiration: {
                maxEntries: 100,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'K-Clip',
        short_name: 'K-Clip',
        description: 'Daily K-pop music snippet guessing game',
        start_url: '/K-Clip/',
        scope: '/K-Clip/',
        display: 'standalone',
        background_color: '#111827',
        theme_color: '#111827',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: '/K-Clip/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
