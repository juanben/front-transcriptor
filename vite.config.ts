import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    host: true, // o '0.0.0.0' para escuchar conexiones externas
    allowedHosts: [
      'escribia.epn.edu.ec',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      clientPort: 5173,
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest', // Usaremos tu lÃ³gica de sw.js
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
        description: "Una aplicaciÃ³n Progressive Web App para grabar, reproducir y descargar notas de voz",
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
