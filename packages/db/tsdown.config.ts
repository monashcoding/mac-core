import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    crypto: "src/crypto.ts",
    list: "src/list.ts",
    provision: "src/provision.ts",
    cli: "src/cli.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  platform: "node",
  fixedExtension: false,
});
