import { dirname, join } from 'https://deno.land/std@0.103.0/path/mod.ts';

export interface CacheDirs {
  'denoDir': string;
  'modulesCache': string;
  'npmCache': string;
  'typescriptCache': string;
  'registryCache': string;
  'originStorage': string;
}

export async function denoCache(name: string): Promise<void> {
  const p = Deno.run({
    cmd: ['deno', 'cache', name],
  });

  const status = await p.status();
  if (!status.success) {
    throw new Error('could not cache ' + name);
  }
}

export async function npmPkgPaths(info: ModuleInfo, dirs: CacheDirs) {
  const specifier = info.modules[0];
  const packages = specifier.npmPackage.split('_');
  const [, packageName] = /(.+)@(\d+.\d+.\d)+/.exec(packages[0])!;

  const path = join(
    dirs.npmCache,
    'registry.npmjs.org',
    packageName,
  );

  for await (const dirEntry of Deno.readDir(path)) {
    if (dirEntry.isDirectory) {
      const pkgJson = await import(join(path, dirEntry.name, 'package.json'), {
        assert: { type: 'json' },
      }).then((mod) => mod.default);

      const pkgPath = join(path, dirEntry.name);

      return {
        path: pkgPath,
        module: pkgJson.module ? join(pkgPath, pkgJson.module) : undefined,
        main: pkgJson.main ? join(pkgPath, pkgJson.main) : undefined,
      };
    }
  }

  throw new Error('not found :-(');
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

interface ModuleInfo {
  roots: string[];
  modules: { kind: 'npm'; specifier: string; npmPackage: string }[];
  npmPackages: Record<
    string,
    { name: string; version: string; dependencies: string[] }
  >;
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

export async function readLink(path: string) {
  const parts: string[] = path.split('/');
  const dropped: string[] = [];
  let levels = 10;

  while (levels) {
    try {
      const link = await Deno.readLink(parts.join('/'));
      dropped.reverse();
      return link + '/' + dropped.join('/');
    } catch (_) {
      //
    }

    levels -= 1;

    const drop = parts.pop();
    if (drop) {
      dropped.push(drop);
    }
  }

  return path;
}

export async function findParentFile(
  fileName: string,
  from: string,
  { followSymlinks }: { followSymlinks?: boolean },
) {
  let actualFrom = from;

  if (followSymlinks) {
    actualFrom = await readLink(from);
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
