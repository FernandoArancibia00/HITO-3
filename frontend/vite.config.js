import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto 5173 (el 3000 queda para el backend). host: true permite usarlo dentro de Docker.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
