import urlResolve from './src/url-resolve.ts';
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

  return [urlResolve(config), npmResolve(config)];
}
