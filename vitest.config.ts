import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    alias: {
      "server-only": path.resolve(__dirname, "src/test/server-only-shim.ts"),
    },
  },
});
