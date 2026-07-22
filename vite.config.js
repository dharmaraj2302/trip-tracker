import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: change '/travel-tracker/' to '/<your-repo-name>/' before deploying to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/trip-tracker/',
})
