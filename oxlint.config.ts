import { macLintConfig } from "@monashcoding/lint";
import { defineConfig } from "oxlint";

export default defineConfig(
  macLintConfig({
    ignorePatterns: ["packages/lint/src/anti-slop/**"],
    rules: {
      // The analytics package is the one place that wraps these.
      "no-restricted-imports": "off",
    },
  }),
);
