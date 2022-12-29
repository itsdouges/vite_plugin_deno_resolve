import { CacheInfo, Module, ModuleInfo, PluginConfig } from './types.ts';

export function createDeno(
  { cacheCache, infoCache, moduleCache, tempDirectory }: PluginConfig,
) {
  async function cache(name: string | URL): Promise<void> {
    const nameStr = name.toString();

    if (
      cacheCache.has(nameStr) ||
      (typeof name !== 'string' && name.protocol === 'file:')
    ) {
      return;
    }

    const p = Deno.run({
      cmd: [Deno.execPath(), 'cache', nameStr],
      cwd: tempDirectory,
      stdout: 'inherit',
    });

    const status = await p.status();
    if (!status.success) {
      throw new Error(`invariant: could not cache ${nameStr}`);
    }

    p.close();

    cacheCache.set(nameStr, true);
  }

  async function module(name: string | URL): Promise<Module | undefined> {
    const nameStr = name.toString();
    const foundModule = moduleCache.get(nameStr);
    if (!foundModule) {
      try {
        await info(nameStr);
        return moduleCache.get(nameStr);
      } catch (_) {
        return undefined;
      }
    }

    return foundModule;
  }

  async function info(name: string | URL): Promise<ModuleInfo> {
    const nameStr = name.toString();
    const cachedInfo = infoCache.get(nameStr);
    if (cachedInfo) {
      return cachedInfo;
    }

    const p = Deno.run({
      cmd: [Deno.execPath(), 'info', nameStr, '--json'],
      stdout: 'piped',
      stderr: 'piped',
      cwd: tempDirectory,
    });

    const status = await p.status();
    if (!status.success) {
      throw new Error(`invariant: could not get info on ${nameStr}`);
    }

    const output = await p.output();
    const moduleInfo: ModuleInfo = JSON.parse(new TextDecoder().decode(output));

    infoCache.set(nameStr, moduleInfo);

    for (const module of moduleInfo.modules) {
      moduleCache.set(module.specifier, module);
    }

    p.close();

    return moduleInfo;
  }

  async function cacheInfo(): Promise<CacheInfo> {
    const p = Deno.run({
      cmd: [Deno.execPath(), 'info', '--json'],
      stdout: 'piped',
      stderr: 'piped',
      cwd: tempDirectory,
    });

    const status = await p.status();
    if (!status.success) {
      throw new Error(`invariant: could not get info on ${name}`);
    }

    const output = await p.output();
    const cacheInfo: CacheInfo = JSON.parse(new TextDecoder().decode(output));
    return cacheInfo;
  }

  return {
    cache,
    info,
    module,
    cacheInfo,
  };
}
