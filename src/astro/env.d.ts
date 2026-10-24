// The type checker does not read .astro files; Astro's own compiler checks them when a site builds.
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";

  const component: AstroComponentFactory;
  export default component;
}
