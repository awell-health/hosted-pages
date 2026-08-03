import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['{src,pages,lib,test}/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
  },
})
