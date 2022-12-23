import { createDeno } from './deno.ts';
import { PluginConfig } from './types.ts';

export default function npmResolve(config: PluginConfig) {
  // TODO(bartlomieju): both plugins should use the same instance, or maybe
  // both plugins should be combined.
  const deno = createDeno(config);

  return {
    name: 'vite:deno-npm-resolve',

    enforce: 'pre' as const,

    async resolveId(importee: string, importer: string | undefined) {
      console.log('resolveId npm', importee, importer);

      if (importee.startsWith('npm:')) {
        await deno.cache(importee);
        return importee;
      }

      return null;
    },

    async load(id: string) {
      console.log('load npm', id);

      if (!id.startsWith('npm:')) {
        return null;
      }
      // strip npm: prefix
      id = id.substring(4);

      // TODO(bartlomieju): this shouldn't be called on each load, it can
      // be cached per run
      const cacheInfo = await deno.cacheInfo();
      const npmCache = cacheInfo.npmCache;

      // TODO(bartlomieju): handle subpath
      let specifier, version;

      if (id.startsWith('@')) {
        const versionIndex = id.lastIndexOf('@');
        specifier = id.substring(0, versionIndex);
        version = id.substring(versionIndex + 1);
      } else {
        const parts = id.split('@');
        specifier = parts[0];
        version = parts[1];
      }

      console.log(specifier, version);
      const moduleDirPath =
        `${npmCache}/registry.npmjs.org/${specifier}/${version}`;

      return await Deno.readTextFile(`${moduleDirPath}/index.js`);
    },
  };
}
