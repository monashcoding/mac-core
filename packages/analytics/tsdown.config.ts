import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    client: "src/client.ts",
    react: "src/react.ts",
    server: "src/server.ts",
    ingest: "src/ingest.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  platform: "neutral",
});
