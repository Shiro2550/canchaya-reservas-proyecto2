import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Las pruebas de integración comparten la base canchaya_test: se ejecutan en serie.
    fileParallelism: false,
    globalSetup: ["tests/setup/global-setup.ts"],
    setupFiles: ["tests/setup/env.ts"],
    testTimeout: 15_000,
    hookTimeout: 60_000,
  },
});
