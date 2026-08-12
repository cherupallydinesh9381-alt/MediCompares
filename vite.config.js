import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "sonner": path.resolve(__dirname, "./src/components/ui/Toast.jsx"),
      "react-hot-toast": path.resolve(__dirname, "./src/components/ui/Toast.jsx"),
    },
  },
  base: "/",
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    port: 5173,
  },
});
