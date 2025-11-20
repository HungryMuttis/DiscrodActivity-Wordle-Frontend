import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/DiscrodActivity-Wordle-Frontend',
    envDir: '/',
    server: {
        hmr: {
            clientPort: 443,
        }
    },
});
