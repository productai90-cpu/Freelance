import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps every asset reference relative, so the built site works
// under a GitHub Pages subpath (user.github.io/repo/) and from file:// alike.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
