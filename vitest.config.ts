import { config } from "dotenv";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    maxConcurrency: 1,
    fileParallelism: false,
    passWithNoTests: true,
    hookTimeout: 30000,
    testTimeout: 15000,
    globals: true,
    coverage: {
      provider: "v8",
      exclude: ["**/tests/**"],
    },
    env: {
      ...config({ path: "./env.test" }).parsed,
    },
  },
});
