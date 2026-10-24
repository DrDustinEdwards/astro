/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Astro's Vite config, so tests can import .astro components and render them in Astro's container.
export default getViteConfig({ test: { include: ["packages/*/test/**/*.test.ts"] } });
