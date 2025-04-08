import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Switched to standard React plugin to avoid Bus error with SWC compiler
import { tempo } from "tempo-devtools/dist/vite";

// Standard React plugin doesn't need the SWC-specific conditional plugins
// @ts-ignore
const isTempo = process.env.TEMPO === "true";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [react(), tempo()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  },
});
