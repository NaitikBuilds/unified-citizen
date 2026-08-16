import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      JWT_SECRET: "test_jwt_secret_key_123",
      JWT_REFRESH_SECRET: "test_jwt_refresh_secret_key_123",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/unified_citizen?schema=public",
    },
  },
});