import { dirname } from 'https://deno.land/std@0.103.0/path/mod.ts';
import { ModuleInfo } from './types.ts';

const cacheCache = new Map<string, true>();
const infoCache = new Map<string, ModuleInfo>();
const tempDir = Deno.makeTempDirSync();

export async function denoCache(name: string): Promise<void> {
  if (cacheCache.has(name)) {
    return;
  }

  const p = Deno.run({
    cmd: [Deno.execPath(), 'cache', name],
    cwd: tempDir,
  });

  const status = await p.status();
  if (!status.success) {
    throw new Error(`invariant: could not cache ${name}`);
  }

  p.close();

  cacheCache.set(name, true);
}

export async function denoInfo(name: string): Promise<ModuleInfo> {
  const cachedInfo = infoCache.get(name);
  if (cachedInfo) {
    return cachedInfo;
  }

  const p = Deno.run({
    cmd: [Deno.execPath(), 'info', name, '--json'],
    stdout: 'piped',
    stderr: 'piped',
    cwd: tempDir,
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

export async function findParentFile(
  fileName: string,
  from: string,
  { followSymlinks }: { followSymlinks?: boolean },
) {
  let actualFrom = from;

  if (followSymlinks) {
    actualFrom = await Deno.realPath(from);
  }

  let filePath = dirname(actualFrom) + '/';
  let _levels = 5;

  while (_levels) {
    for await (const dirEntry of Deno.readDir(filePath)) {
      if (dirEntry.name === fileName) {
        return filePath + fileName;
      }
    }

    filePath += '../';
    _levels -= 1;
  }

  return undefined;
}
