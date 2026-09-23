import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

// GitHub Pages serves this repo at https://antonlapshin.github.io/dragon-riders-of-berk/
// so the production build needs the repo name as its base. Local dev keeps '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/dragon-riders-of-berk/' : '/',
  resolve: {
    // The `showcase` gallery library (see vendor/VENDOR.md) isn't published to
    // npm yet, so its vendored source is aliased here under its package name.
    alias: {
      showcase: path.resolve(__dirname, 'vendor/showcase-src/index.ts'),
    },
  },
})
