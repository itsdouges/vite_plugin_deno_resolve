import { dirname } from 'https://deno.land/std@0.103.0/path/mod.ts';
import { CacheDirs, ModuleInfo } from './types.ts';

export async function denoCache(name: string): Promise<void> {
  const p = Deno.run({
    cmd: ['deno', 'cache', name],
  });

  const status = await p.status();
  if (!status.success) {
    throw new Error('could not cache ' + name);
  }
}

export async function denoCacheDirs(): Promise<CacheDirs> {
  const p = Deno.run({
    cmd: ['deno', 'info', '--json'],
    stdout: 'piped',
    stderr: 'piped',
  });

  const status = await p.status();
  if (!status.success) {
    throw new Error('could not read deno cache dirs');
  }

  const output = await p.output();
  const parsed: CacheDirs = JSON.parse(new TextDecoder().decode(output));
  return parsed;
}

export async function denoInfo(name: string): Promise<ModuleInfo> {
  const p = Deno.run({
    cmd: ['deno', 'info', name, '--json'],
    stdout: 'piped',
    stderr: 'piped',
  });

  const status = await p.status();
  if (!status.success) {
    throw new Error('could not read deno cache dirs');
  }

  const output = await p.output();
  const parsed: ModuleInfo = JSON.parse(new TextDecoder().decode(output));
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
