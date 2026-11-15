import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    next: "src/next.ts",
    express: "src/express.ts",
    client: "src/client.ts",
    react: "src/react.ts",
    testing: "src/testing.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  platform: "neutral",
});
