/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Set to "true" to use in-memory mock services instead of the real backend
   * API. Central mock/API switch (see src/config.ts and src/api/registry.ts).
   */
  readonly VITE_USE_MOCK_API?: string

  /** Base URL of the backend API. Defaults to http://localhost:5000/api/v1 */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
