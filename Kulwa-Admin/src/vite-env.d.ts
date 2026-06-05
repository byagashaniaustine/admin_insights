/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KULWA_API_KEY: string;
  readonly VITE_KULWA_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
