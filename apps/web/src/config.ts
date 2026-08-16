/**
 * Centralized frontend configuration. All environment reads happen here so
 * components and services never touch `import.meta.env` directly.
 */
export const config = {
  /** Backend API base URL (source of truth: apps/api/src/app.ts mounts /api/v1). */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',

  /**
   * Mock/API switch. `true` → mock services; `false` → real backend API.
   * The switch is applied once in src/api/registry.ts.
   *
   * Defaults to mock (`true`) so the frontend runs standalone for independent
   * development; set VITE_USE_MOCK_API=false to hit the real backend.
   */
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',

  /** Request timeout for the API client, in milliseconds. */
  apiTimeoutMs: 15_000,
} as const
