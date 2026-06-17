/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAS_WEB_APP_URL: string
  readonly VITE_GAS_SECRET: string
  readonly VITE_ADMIN_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
