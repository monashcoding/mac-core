import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "anti-slop": "src/anti-slop/index.ts",
    "anti-slop-effect": "src/anti-slop/effect/index.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  platform: "node",
});
