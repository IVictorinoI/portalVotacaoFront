import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: { entries: ['index.html'] },
  server: {
    watch: {
      ignored: ['**/.migration-verification/**', '**/migration-tests/**'],
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
  },
});
