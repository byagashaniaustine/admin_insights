/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FINANCIAL_SECRET: string;
  readonly VITE_FINANCIAL_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
