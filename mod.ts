import httpsResolve from './src/https-resolve.ts';
import npmResolve from './src/npm-resolve.ts';
import { ModuleInfo } from './src/types.ts';

export default function denoResolve() {
  const cacheCache = new Map<string, true>();
  const infoCache = new Map<string, ModuleInfo>();
  const tempDirectory = Deno.makeTempDirSync();

  const config = {
    cacheCache,
    infoCache,
    tempDirectory,
  };

  return [httpsResolve(config), npmResolve(config)];
}
