import { defineConfig } from "oxlint";
import { base, node } from "@dustinedwards/devkit/oxlint";

export default defineConfig({
  extends: [base],
  rules: {
    // off in devkit 0.24.0
    "typescript/no-non-null-assertion": "off",
  },
  // devkit's ignore patterns (Oxlint does not carry ignorePatterns through extends).
  ignorePatterns: ["build/", "dist/", ".react-router/", ".wrangler/", "worker-configuration.d.ts", "**/*.gen.ts"],
  overrides: [{ files: ["scripts/**", "bin/**", "test/**"], ...node }],
});
