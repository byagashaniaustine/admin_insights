import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/kulwa-api': {
          target: env.KULWA_BASE_URL || 'https://whatsappbot.bsa.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/kulwa-api/, ''),
        },
      },
    },
  };
});
