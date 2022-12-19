import {
  type CacheDirs,
  denoCache,
  denoCacheDirs,
  denoInfo,
  findParentFile,
  npmPkgPaths,
} from './deno.ts';

export default function denoResolve() {
  let dirs: CacheDirs;

  return {
    name: 'vite:deno-resolve',

    enforce: 'pre',

    configResolved(config: any) {
      // Optimizations can't currently work, clear them out.
      config.optimizeDeps.include = [];
    },

    async buildStart() {
      dirs = await denoCacheDirs();
    },

    async resolveId(
      importee: string,
      importer: string,
      resolveOpts: any,
    ): Promise<any> {
      if (/^\/|\0|\./.test(importee)) {
        // Ignore imports starting with [\0, ., /].
        return null;
      }

      const importMapLoc = await findParentFile('import_map.json', importer, {
        followSymlinks: true,
      });

      let resolvedSpecifier = '';

      if (importMapLoc) {
        const importMap = await import(importMapLoc, {
          assert: { type: 'json' },
        }).then((mod) => mod.default.imports);

        if (importMap[importee]) {
          resolvedSpecifier = importMap[importee];
        }
      }

      if (!resolvedSpecifier) {
        resolvedSpecifier = importee.startsWith('npm:')
          ? importee
          : `npm:${importee}`;
      }

      const moduleInfo = await denoInfo(resolvedSpecifier);
      const entryPath = resolvedSpecifier.replace(
        'npm:' + moduleInfo.modules[0].npmPackage,
        '',
      );

      await denoCache(resolvedSpecifier);

      const paths = await npmPkgPaths(moduleInfo, dirs);

      paths.path += entryPath;

      const resolved = await this.resolve(paths.path, importer, {
        ...resolveOpts,
      });

      if (resolved) {
        return resolved;
      }

      return null;
    },
  } as const;
}
