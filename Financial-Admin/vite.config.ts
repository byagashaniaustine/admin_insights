import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5175,
      proxy: {
        '/financial-api': {
          target: env.FINANCIAL_BASE_URL || 'https://financial-literacy-bot.caprover.bsa.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/financial-api/, ''),
        },
      },
    },
  };
});
