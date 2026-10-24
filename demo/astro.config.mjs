import { satteri } from "@astrojs/markdown-satteri";
import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";
import { satteriCharts } from "enarratio-astro/markdown";
import { enarratioPlugin } from "enarratio-emdash";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  // Charts in Markdown: every ```chart block in a .md page.
  markdown: { processor: satteri({ mdastPlugins: [satteriCharts()] }) },
  integrations: [
    react(),
    emdash({
      database: sqlite({ url: "file:./data.db" }),
      storage: local({ directory: "./uploads", baseUrl: "/_emdash/api/media/file" }),
      plugins: [enarratioPlugin()],
    }),
  ],
  devToolbar: { enabled: false },
});
