import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], server:{proxy:{'/api':{target:'http://127.0.0.1:8787',changeOrigin:false}}},build:{manifest:true,rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules/@supabase/'))return 'supabase';if(/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(id.replaceAll('\\','/')))return 'motion';}}}} });
