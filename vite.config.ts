import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'TBFC_');
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      proxy: {
        '/api': {
          target: env.TBFC_API_ORIGIN || 'https://turfburnersfc.soccer',
          changeOrigin: true,
          headers: env.TBFC_ADMIN_KEY ? { 'x-club-admin-key': env.TBFC_ADMIN_KEY } : {},
        },
      },
    },
  };
});
