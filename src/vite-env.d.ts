/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_API_MODE: 'production' | 'mocking' | 'development';
  readonly VITE_API_VEHICLES_MODE: 'production' | 'mocking' | 'development';
  readonly VITE_API_ACTIVE_DATA_MODE: 'production' | 'mocking' | 'development';
  readonly VITE_UPDATE_TEST: 'test' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
