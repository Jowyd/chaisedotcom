import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/", "migrations/"],
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
});
