export interface NPMModule {
  kind: 'npm';
  specifier: string;
  npmPackage: string;
}

export interface ESModule {
  kind: 'esm';
  specifier: string;
  local: string;
  emit: string;
  map: string | null;
  size: number;
  mediaType: 'TypeScript' | 'JavaScript';
  dependencies: {
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

export interface ModuleInfo {
  roots: string[];
  modules: (NPMModule | ESModule)[];
  npmPackages: Record<
    string,
    { name: string; version: string; dependencies: string[] }
  >;
}
