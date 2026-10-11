import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import process from 'node:process' // explicit: ESLint here only knows browser globals

// MOCK_AUTH=1 swaps the real auth service for tools/mock_auth.py (any
// username/password logs in). Local dev only; the build never reads this.
const AUTH_API = process.env.MOCK_AUTH
  ? 'http://127.0.0.1:8007'
  : 'https://resourcehubapi.encryptionconsulting.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // KB content lives in ../knowledge-base, outside the Vite root.
    fs: { allow: ['..'] },
    // `npm run dev` only (ignored by `npm run build`): mirror the production
    // nginx split (deploy/nginx-support-portal-ssl.conf) so login and cases
    // work on localhost. Auth is the shared EC service; cases are local Flask.
    proxy: {
      '/api/v1/auth': { target: AUTH_API, changeOrigin: true },
      '/api/v1/user': { target: AUTH_API, changeOrigin: true },
      '/api/v1/support': 'http://127.0.0.1:8006',
      '/api/v1/healthz': 'http://127.0.0.1:8006',
    },
  },
})
