import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { transformWithOxc } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'treat-js-files-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/\/(app|components)\/.*\.js$/)) return null;
        return transformWithOxc(code, id, {
          lang: 'jsx',
          jsx: {
            runtime: 'automatic',
          },
        });
      },
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**/*.js', 'app/**/*.jsx', 'components/**/*.js', 'components/**/*.jsx', 'lib/**/*.js'],
      exclude: ['**/*.test.*', '**/*.spec.*', 'app/layout.js']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});




