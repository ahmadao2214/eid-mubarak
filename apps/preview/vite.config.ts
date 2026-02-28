import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on network (e.g. http://<your-ip>:5173) for phone/WebView
  },
  build: {
    outDir: "dist",
  },
});
