import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: false, // Disable source maps completely in production
      minify: 'esbuild', // Minify code to make it harder to read
    },
    plugins: [
      react({
        babel: {
          plugins: [
            // Only add locator in development
            ...(mode === 'development' ? ['react-dev-locator'] : []),
          ],
        },
      }),
      traeBadgePlugin({
        variant: 'dark',
        position: 'bottom-right',
        prodOnly: true,
        clickable: true,
        clickUrl: 'https://www.trae.ai/solo?showJoin=1',
        autoTheme: true,
        autoThemeTarget: '#root'
      }), 
      tsconfigPaths()
    ],
  }
})
