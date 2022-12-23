import { Module, ModuleInfo, PluginConfig } from './types.ts';

export function createDeno(
  { cacheCache, infoCache, moduleCache, tempDirectory }: PluginConfig,
) {
  async function cache(name: string): Promise<void> {
    if (cacheCache.has(name)) {
      return;
    }

    const p = Deno.run({
      cmd: [Deno.execPath(), 'cache', name],
      cwd: tempDirectory,
      stdout: 'inherit',
    });

    const status = await p.status();
    if (!status.success) {
      throw new Error(`invariant: could not cache ${name}`);
    }

    p.close();

    cacheCache.set(name, true);
  }

  async function module(name: string): Promise<Module | undefined> {
    const foundModule = moduleCache.get(name);
    if (!foundModule) {
      await info(name);
      return moduleCache.get(name);
    }

    return foundModule;
  }

  async function info(name: string): Promise<ModuleInfo> {
    const cachedInfo = infoCache.get(name);
    if (cachedInfo) {
      return cachedInfo;
    }

    const p = Deno.run({
      cmd: [Deno.execPath(), 'info', name, '--json'],
      stdout: 'piped',
      stderr: 'piped',
      cwd: tempDirectory,
    });

    const status = await p.status();
    if (!status.success) {
      throw new Error(`invariant: could not get info on ${name}`);
    }

    const output = await p.output();
    const moduleInfo: ModuleInfo = JSON.parse(new TextDecoder().decode(output));

    infoCache.set(name, moduleInfo);

    for (const module of moduleInfo.modules) {
      moduleCache.set(module.specifier, module);
    }

    p.close();

    return moduleInfo;
  }

  return {
    cache,
    info,
    module,
  };
}
