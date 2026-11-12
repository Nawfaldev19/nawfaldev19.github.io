/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set by the deploy workflow (YYYY-MM-DD). Shown as REV in the footer title block. */
  readonly VITE_BUILD_DATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
