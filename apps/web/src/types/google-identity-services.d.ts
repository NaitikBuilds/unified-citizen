// Minimal typings for the Google Identity Services client library
// (loaded via <script> in index.html, no npm package needed).
export interface GoogleCredentialResponse {
  /** JWT ID token (signed by Google) */
  credential: string;
  select_by?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  scope?: string;
  expires_in?: number;
  error?: string;
}

export interface GoogleTokenClient {
  requestAccessToken(): void;
}

export interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: { type?: string; message?: string }) => void;
  prompt?: string;
}

export interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

export {};
