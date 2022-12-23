import httpsResolve from './src/https-resolve.ts';
import npmResolve from './src/npm-resolve.ts';
import { Module, ModuleInfo } from './src/types.ts';

export default function denoResolve() {
  const cacheCache = new Map<string, true>();
  const moduleCache = new Map<string, Module>();
  const infoCache = new Map<string, ModuleInfo>();
  const tempDirectory = Deno.makeTempDirSync();

  const config = {
    cacheCache,
    infoCache,
    moduleCache,
    tempDirectory,
  };

  return [httpsResolve(config), npmResolve(config)];
}
