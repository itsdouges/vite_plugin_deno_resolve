export type MediaType =
  | 'JavaScript'
  | 'Mjs'
  | 'Cjs'
  | 'JSX'
  | 'TypeScript'
  | 'Mts'
  | 'Cts'
  | 'Dts'
  | 'Dmts'
  | 'Dcts'
  | 'TSX'
  | 'Json'
  | 'Wasm'
  | 'TsBuildInfo'
  | 'SourceMap'
  | 'Unknown';

export interface NPMModule {
  kind: 'npm';
  specifier: string;
  npmPackage: string;
  local: string;
  emit: string;
}

export interface ESModule {
  kind: 'esm';
  specifier: string;
  local: string;
  emit: string;
  map: string | null;
  size: number;
  mediaType: MediaType;
  dependencies?: {
    specifier: string;
    code: {
      specifier: string;
      span: {
        start: { line: number; character: number };
        end: { line: number; character: number };
      };
    };
  }[];
}

export type Module = ESModule | NPMModule;

export interface ModuleInfo {
  roots: string[];
  modules: Module[];
  redirects: Record<string, string>;
  npmPackages: Record<
    string,
    { name: string; version: string; dependencies: string[] }
  >;
}

export interface PluginConfig {
  cacheCache: CacheCache;
  infoCache: InfoCache;
  moduleCache: ModuleCache;
  tempDirectory: string;
}

export type CacheCache = Map<string, true>;

export type InfoCache = Map<string, ModuleInfo>;

export type ModuleCache = Map<string, Module>;
