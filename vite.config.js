// vite.config.js
export default {
    root: './', // Changed from 'public' to serve from project root
    publicDir: 'public', // Specify public assets directory
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    },
    server: {
      port: 3000,
      open: true
    }
  }