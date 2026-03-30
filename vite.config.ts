import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    hmr: {
      clientPort: 5173,
    }
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest', // Usaremos tu lógica de sw.js
      srcDir: 'src',
      filename: 'sw.ts', 
      registerType: 'autoUpdate',
      injectManifest: {
        swDest: 'dist/sw.js',
      },
      manifest: {
        id: "TrancriptorPWAJSBC",
        name: "Grabador de Voz PWA",
        short_name: "Grabador Voz",
        description: "Una aplicación Progressive Web App para grabar, reproducir y descargar notas de voz",
        theme_color: "#667eea",
        background_color: "#667eea",
        display: "standalone",
        orientation: "portrait-primary",
        icons: [
          {
            src: "iconPWA192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "iconPWA512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "iconPWA512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "Grabar Voz",
            short_name: "Grabar",
            url: "/?mode=record",
            icons: [{ src: "iconPWA192.png", sizes: "192x192" }]
          }
        ]
      }
    })
  ]
});