import { ModuleInfo, PluginConfig } from './types.ts';

export function createDeno(
  { cacheCache, infoCache, tempDirectory }: PluginConfig,
) {
  async function cache(name: string): Promise<void> {
    if (cacheCache.has(name)) {
      return;
    }

    const p = Deno.run({
      cmd: [Deno.execPath(), 'cache', name],
      cwd: tempDirectory,
    });

    const status = await p.status();
    if (!status.success) {
      throw new Error(`invariant: could not cache ${name}`);
    }

    p.close();

    cacheCache.set(name, true);
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
    const parsed: ModuleInfo = JSON.parse(new TextDecoder().decode(output));

    infoCache.set(name, parsed);

    p.close();

    return parsed;
  }

  return {
    cache,
    info,
  };
}
