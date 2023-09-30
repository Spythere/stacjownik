/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_APP_API_DEV: string;
  readonly VITE_APP_WS_DEV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
