import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'TBFC_');
  const target = env.TBFC_API_ORIGIN || 'https://turfburnersfc.soccer';
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyRequest, request) => {
              // Browsers can reject the production Secure, __Host- cookie on
              // http://127.0.0.1. Translate only the local proxy cookie.
              const cookies = request.headers.cookie?.replace(
                /(^|;\s*)tbfc-admin-local=/g,
                '$1__Host-tbfc-admin=',
              );
              if (cookies) proxyRequest.setHeader('cookie', cookies);
              const origin = request.headers.origin;
              if (!origin) return;
              try {
                // The API accepts same-origin writes. A localhost request remains
                // same-origin after Vite forwards it to the production host.
                if (new URL(origin).host === request.headers.host) {
                  proxyRequest.setHeader('origin', new URL(target).origin);
                }
              } catch { /* Ignore malformed Origin headers. */ }
            });
            proxy.on('proxyRes', (proxyResponse) => {
              const setCookies = proxyResponse.headers['set-cookie'];
              if (!setCookies) return;
              proxyResponse.headers['set-cookie'] = setCookies.map((cookie) =>
                cookie.startsWith('__Host-tbfc-admin=')
                  ? cookie
                    .replace(/^__Host-tbfc-admin=/, 'tbfc-admin-local=')
                    .replace(/; Secure(?=;|$)/i, '')
                  : cookie,
              );
            });
          },
        },
      },
    },
  };
});
