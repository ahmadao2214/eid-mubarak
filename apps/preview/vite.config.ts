import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on network (e.g. http://<your-ip>:5173) for phone/WebView
  },
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@convex/_generated": path.resolve(
        __dirname,
        "../mobile/convex/_generated",
      ),
    },
  },
});
