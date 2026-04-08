import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    {
      name: "remove-use-dynamic-url",
      closeBundle() {
        const manifestPath = path.resolve(__dirname, "dist/manifest.json");
        if (fs.existsSync(manifestPath)) {
          const content = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          if (content.web_accessible_resources) {
            content.web_accessible_resources.forEach((resource: any) => {
              delete resource.use_dynamic_url;
            });
            fs.writeFileSync(manifestPath, JSON.stringify(content, null, 2));
          }
        }
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
