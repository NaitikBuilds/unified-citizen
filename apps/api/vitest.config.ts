import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only run source tests. Compiled build output (dist/) contains stale
    // copies of tests and must never be executed.
    include: ["src/**/*.test.ts"],
    environment: "node",
    env: {
      NODE_ENV: "test",
      // Required at import time by jwt.service.ts and prisma.service.ts when
      // the full app is imported in integration tests. No DB connection is
      // opened unless a test actually queries the database.
      JWT_SECRET: "test-jwt-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret",
      DATABASE_URL:
        "postgresql://postgres:postgres@localhost:5432/unified_citizen_test",
    },
  },
});
