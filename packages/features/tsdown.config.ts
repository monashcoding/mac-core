import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    posthog: "src/posthog.ts",
    react: "src/react.ts",
    sync: "src/sync.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  platform: "neutral",
});
