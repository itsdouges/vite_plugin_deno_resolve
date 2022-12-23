export type MediaType =
  | 'Cjs'
  | 'Cts'
  | 'Dcts'
  | 'Dmts'
  | 'Dts'
  | 'JavaScript'
  | 'Json'
  | 'JSX'
  | 'Mjs'
  | 'Mts'
  | 'SourceMap'
  | 'TsBuildInfo'
  | 'TSX'
  | 'TypeScript'
  | 'Unknown'
  | 'Wasm';

export interface NPMModule {
  emit: string | null;
  kind: 'npm';
  local: string;
  npmPackage: string;
  specifier: string;
}

export interface ESModule {
  dependencies?: {
    code: {
      span: {
        start: { line: number; character: number };
        end: { line: number; character: number };
      };
      specifier: string;
    };
    specifier: string;
  }[];
  emit: string | null;
  kind: 'esm';
  local: string;
  map: string | null;
  mediaType: MediaType;
  size: number;
  specifier: string;
}

export type Module = ESModule | NPMModule;

export interface ModuleInfo {
  modules: Module[];
  npmPackages: Record<
    string,
    { name: string; version: string; dependencies: string[] }
  >;
  redirects: Record<string, string>;
  roots: string[];
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
