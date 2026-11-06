import { defineConfig } from "oxfmt";
import { format } from "@dustinedwards/devkit/oxfmt";

export default defineConfig({
  ...format,
  // .astro files need Oxfmt's Astro support, which runs on @astrojs/compiler-rs (a devDependency).
  astro: true,
});
